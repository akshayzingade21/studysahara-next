// components/crm/StageMoveDialog.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { STAGE_LABEL, STAGES } from './StageBadge.js';

const LENDER_OPTIONS = [
  'Credila','Avanse','Auxilo','Incred','Tata Capital','Poonawalla Fincorp',
  'ICICI Bank','IDFC First Bank','Axis Bank','Yes Bank','SBI','PNB','Union Bank',
  'Bank of India','Prodigy','MPOWER','Earnest','Sallie Mae','Ascent'
];

const newId = () =>
  (globalThis.crypto?.randomUUID?.() || `row_${Math.random().toString(36).slice(2)}`);

// ---------- tiny ref registry so inputs stay uncontrolled (caret never jumps) ----------
function useRefMap() {
  const map = useRef(new Map());
  const getRef = (key) => {
    if (!map.current.has(key)) map.current.set(key, { current: null });
    return map.current.get(key);
  };
  const getValue = (key) => map.current.get(key)?.current?.value ?? '';
  const getChecked = (key) => !!map.current.get(key)?.current?.checked;
  const removeKeysByPrefix = (prefix) => {
    for (const k of Array.from(map.current.keys())) {
      if (k.startsWith(prefix)) map.current.delete(k);
    }
  };
  return { get: getRef, getValue, getChecked, removeKeysByPrefix };
}

// --------------------------------------------------------------------------------------

export default function StageMoveDialog({ lead, onMoved }) {
  const fromStage = lead?.stage || 'new';

  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(fromStage);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  // Allowed next stages
    const nextOptions = useMemo(() => {
    switch (fromStage) {
      case 'new':           return ['lod_shared','deferred','lost'];
      case 'lod_shared':    return ['docs_received','deferred','lost'];
      case 'docs_received': return ['logged_in','deferred','lost'];
      case 'logged_in':     return ['sanctioned','deferred','lost'];
      case 'sanctioned':    return ['pf_paid','deferred','lost'];
      case 'pf_paid':       return ['disbursed','deferred','lost'];
      case 'disbursed':     return ['disbursed','success']; // ✅ can mark success after disbursement (optional)
      case 'success':       return ['success'];              // ✅ terminal
      case 'deferred':      return ['lod_shared','lost'];
      case 'lost':          return ['new'];
      default:              return STAGES;                   // STAGES now includes 'success'
    }
  }, [fromStage]);

  // Light UI + rows
  const [docsStatus, setDocsStatus] = useState('partial');
  const [lendersToShare, setLendersToShare] = useState([]);
  const [loginRowIds, setLoginRowIds] = useState([newId()]);
  const [sanctionRowIds, setSanctionRowIds] = useState([newId()]);
  const [coappRowIds, setCoappRowIds] = useState([newId()]);

  const { get: ref, getValue, getChecked, removeKeysByPrefix } = useRefMap();

  // ---------- NEW: lenders lists ----------
  const [allLenders, setAllLenders] = useState([]);      // [{id,name,code}]
  const [leadLenders, setLeadLenders] = useState([]);    // this lead's rows in lead_lenders
  const byId = useMemo(
    () => Object.fromEntries(allLenders.map(l => [l.id, l])),
    [allLenders]
  );

  // computed option sets for dropdowns restricted by this lead's current progress
  const loggedInOptions   = useMemo(
    () => leadLenders.filter(ll => ll.stage === 'logged_in').map(ll => ll.lender_id),
    [leadLenders]
  );
  const sanctionedOptions = useMemo(
    () => leadLenders.filter(ll => ll.stage === 'sanctioned').map(ll => ll.lender_id),
    [leadLenders]
  );
  const pfPaidOptions     = useMemo(
    () => leadLenders.filter(ll => ll.stage === 'pf_paid').map(ll => ll.lender_id),
    [leadLenders]
  );

  // Reset + fetch lists on open
  useEffect(() => {
    if (!open) return;
    (async () => {
      setErr('');
      setTo(nextOptions[0] || fromStage);
      setLoginRowIds([newId()]);
      setSanctionRowIds([newId()]);
      setCoappRowIds([newId()]);

      // master lenders for dropdowns when logging in
      const { data: L, error: eL } = await supabase
        .from('lenders')
        .select('id,name,code')
        .order('name', { ascending: true });
      if (eL) console.error(eL);
      setAllLenders(L || []);

      // per-lead lender statuses for restricted dropdowns later
      const { data: LL, error: eLL } = await supabase
        .from('lead_lenders')
        .select('lender_id, stage, login_id, dates, sanction')
        .eq('lead_id', lead.id);
      if (eLL) console.error(eLL);
      setLeadLenders(LL || []);
    })();
  }, [open, nextOptions, fromStage, lead?.id]);

  // ---------- helpers ----------
  // Collect co-applicants from the current modal's data-coapp inputs (unchanged UI)
  const collectCoapplicants = () => {
    const nodes = Array.from(document.querySelectorAll('[data-coapp]'));
    const byRow = new Map(); // rowId -> obj
    for (const el of nodes) {
      const key = el.getAttribute('data-coapp'); // e.g. "abc123:relation"
      if (!key || !key.includes(':')) continue;
      const [rowId, field] = key.split(':');
      let value;
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        value = !!el.checked;
      } else {
        value = (el.value || '').trim();
      }
      if (!byRow.has(rowId)) byRow.set(rowId, {});
      byRow.get(rowId)[field] = value;
    }

    const rows = [];
    for (const [_id, v] of byRow.entries()) {
      const any = v.relation || v.name || v.age || v.income || v.currloans ||
                  v.cibils || v.issues || v.ownhouse || v.cibilknown;
      if (!any) continue;

      let current_loans = null;
      if (v.currloans) {
        try { current_loans = JSON.parse(v.currloans); }
        catch { current_loans = { note: v.currloans }; }
      }

      rows.push({
        relation: v.relation || null,
        name: v.name || null,
        age: v.age ? Number(v.age) : null,
        income_type: v.income || null,
        own_house: !!v.ownhouse,
        current_loans,
        cibil_known: !!v.cibilknown,
        cibil_score: v.cibils ? Number(v.cibils) : null,
        credit_issues: v.issues || null,
      });
    }
    return rows;
  };

  const upsertStudentProfile = async () => {
    const country = getValue('prof:country').trim() || null;
    const intake = getValue('prof:intake').trim() || null;
    const universities = (getValue('prof:universities').trim() || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    const course = getValue('prof:course').trim() || null;
    const offer = getValue('prof:offer');
    const age = getValue('prof:age');
    const pct10 = getValue('prof:pct10');
    const pct12 = getValue('prof:pct12');
    const gradPct = getValue('prof:gradpct');
    const lastYear = getValue('prof:lastgrad');
    const workMonths = getValue('prof:workex');
    const backlogs = getValue('prof:backlogs');
    const gap = getValue('prof:gap');
    const cibilKnown = getChecked('prof:cibilknown');
    const cibilScore = getValue('prof:cibils');
    const creditIssues = getValue('prof:creditissues');
    const currLoansTxt = getValue('prof:currloans').trim();

    let current_loans = null;
    if (currLoansTxt) {
      try { current_loans = JSON.parse(currLoansTxt); }
      catch { current_loans = { note: currLoansTxt }; }
    }

    // NEW: include co_applicants JSON array in the same row
    const co_applicants = collectCoapplicants();

    const payload = {
      lead_id: lead.id,
      country,
      intake,
      universities: universities.length ? universities : null,
      course,
      offer_letter: (offer || 'unknown'),
      age: age ? Number(age) : null,
      pct_10: pct10 ? Number(pct10) : null,
      pct_12: pct12 ? Number(pct12) : null,
      grad_pct: gradPct ? Number(gradPct) : null,
      last_grad_year: lastYear ? Number(lastYear) : null,
      work_ex_months: workMonths ? Number(workMonths) : null,
      backlogs: backlogs ? Number(backlogs) : null,
      gap_notes: gap || null,
      current_loans,
      cibil_known: !!cibilKnown,
      cibil_score: cibilScore ? Number(cibilScore) : null,
      credit_issues: creditIssues || null,
      co_applicants, // <---- key line
    };

    const { data: existing } = await supabase
      .from('lead_details_student')
      .select('id').eq('lead_id', lead.id).limit(1);

    if (existing?.length) {
      await supabase.from('lead_details_student').update(payload).eq('lead_id', lead.id);
    } else {
      await supabase.from('lead_details_student').insert(payload);
    }

    // Mirror country to leads if you want to show it on cards
    if (country) {
      await supabase.from('leads').update({ country_of_study: country }).eq('id', lead.id);
    }
  };

  // (Kept for compatibility, but no longer used; co-apps now saved with student profile)
  const insertCoapplicants = async () => { return; };

  const addHistory = async (from, to, reason) => {
    await supabase.from('lead_stage_history').insert({
      lead_id: lead.id, from_stage: from, to_stage: to, reason: reason || null
    });
  };

  // --------------------------------- SAVE ---------------------------------
  const save = async () => {
    setErr(''); setSaving(true);
    try {
      const from = fromStage;

      // NEW → LOD SHARED
      if (from === 'new' && to === 'lod_shared') {
        await upsertStudentProfile(); // includes co_applicants JSON now
        // await insertCoapplicants(); // no longer needed
      }

      // LOD SHARED → DOCS RECEIVED
      if (from === 'lod_shared' && to === 'docs_received') {
        if (docsStatus === 'complete' && lendersToShare.length === 0) {
          throw new Error('Select at least one lender to share the file.');
        }
      }

      // DOCS RECEIVED → LOGGED IN (multi) — select from master lenders
      if (from === 'docs_received' && to === 'logged_in') {
        const rows = [];
        for (const id of loginRowIds) {
          const lender_id = getValue(`login:${id}:lenderId`).trim(); // selected ID
          const loginId = getValue(`login:${id}:loginId`).trim();
          const loginDate = getValue(`login:${id}:loginDate`).trim();
          const location = getValue(`login:${id}:location`).trim();
          const rmName = getValue(`login:${id}:rmName`).trim();
          const rmPhone = getValue(`login:${id}:rmPhone`).trim();
          if (lender_id || loginId || loginDate) {
            rows.push({ lender_id, loginId, loginDate, location, rmName, rmPhone });
          }
        }
        if (rows.length === 0) throw new Error('Add at least one lender login row or cancel.');
        for (const r of rows) {
          if (!r.lender_id || !r.loginId || !r.loginDate) {
            throw new Error('Each login row needs Lender, Login ID and Date of Login.');
          }
          // ensure a row exists
          const { data: existing } = await supabase
            .from('lead_lenders')
            .select('id').eq('lead_id', lead.id).eq('lender_id', r.lender_id).limit(1);
          if (!existing?.length) {
            await supabase.from('lead_lenders').insert({ lead_id: lead.id, lender_id: r.lender_id });
          }

          await supabase
            .from('lead_lenders')
            .update({
              stage: 'logged_in',
              login_id: r.loginId,
              location: r.location || null,
              rm_name: r.rmName || null,
              rm_phone: r.rmPhone || null,
              dates: { login: r.loginDate },
            })
            .eq('lead_id', lead.id)
            .eq('lender_id', r.lender_id);
        }
      }

      // LOGGED IN → SANCTIONED (multi) — pick from this lead's Logged In lenders
      if (from === 'logged_in' && to === 'sanctioned') {
        const rows = [];
        for (const id of sanctionRowIds) {
          const lender_id = getValue(`sanction:${id}:lenderId`).trim();
          const date = getValue(`sanction:${id}:date`).trim();
          const expectedPFDate = getValue(`sanction:${id}:expected_pf`).trim();
          const amount = getValue(`sanction:${id}:amount`).trim();
          const rate = getValue(`sanction:${id}:rate`).trim();
          const fees = getValue(`sanction:${id}:processing_fees`).trim();
          const conditions = getValue(`sanction:${id}:conditions`).trim();
          if (lender_id || date || amount || fees) {
            rows.push({ lender_id, date, expectedPFDate, amount, rate, fees, conditions });
          }
        }
        if (rows.length === 0) throw new Error('Add at least one sanction row or cancel.');
        for (const r of rows) {
          if (!r.lender_id || !r.date || !r.amount || !r.fees) {
            throw new Error('Each sanction row needs Lender, Date of Sanction, Amount and Processing Fees.');
          }
          await supabase
            .from('lead_lenders')
            .update({
              stage: 'sanctioned',
              sanction: {
                date: r.date,
                expected_pf_date: r.expectedPFDate || null,
                amount: Number(r.amount),
                rate: r.rate ? Number(r.rate) : null,
                processing_fees: Number(r.fees),
                conditions: r.conditions || null,
              },
            })
            .eq('lead_id', lead.id)
            .eq('lender_id', r.lender_id);
        }
      }

      // SANCTIONED → PF PAID (single) — choose from Sanctioned lenders
      if (from === 'sanctioned' && to === 'pf_paid') {
        const lender_id = getValue('pf:lenderId').trim();
        const pfDate = getValue('pf:date').trim();
        const pfAmount = getValue('pf:amount').trim();
        const expectedDisb = getValue('pf:expected').trim();
        if (!lender_id || !pfDate || !pfAmount) {
          throw new Error('Please fill Lender, Date of PF Paid and PF Amount.');
        }

        const { data: currentLL } = await supabase
          .from('lead_lenders')
          .select('id,dates')
          .eq('lead_id', lead.id)
          .eq('lender_id', lender_id)
          .single();

        const mergedDates = {
          ...(currentLL?.dates || {}),
          pf_paid: pfDate,
          expected_disb: expectedDisb || null,
        };

        await supabase
          .from('lead_lenders')
          .update({ stage: 'pf_paid', dates: mergedDates })
          .eq('lead_id', lead.id)
          .eq('lender_id', lender_id);
      }

      // PF PAID → DISBURSED (single) — choose from PF Paid lenders
      if (from === 'pf_paid' && to === 'disbursed') {
        const lender_id = getValue('disb:lenderId').trim();
        const disbDate = getValue('disb:date').trim();
        const disbAmount = getValue('disb:amount').trim();
        if (!lender_id || !disbDate || !disbAmount) {
          throw new Error('Please fill Lender, Disbursement Date and Amount.');
        }

        const { data: currentLL } = await supabase
          .from('lead_lenders')
          .select('id,dates')
          .eq('lead_id', lead.id)
          .eq('lender_id', lender_id)
          .single();

        const mergedDates = {
          ...(currentLL?.dates || {}),
          disbursed: disbDate,
        };

        await supabase
          .from('lead_lenders')
          .update({ stage: 'disbursed', dates: mergedDates })
          .eq('lead_id', lead.id)
          .eq('lender_id', lender_id);
      }

      await supabase.from('leads').update({ stage: to }).eq('id', lead.id);
      await addHistory(from, to, null);

      setOpen(false);
      onMoved?.(to);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to move stage');
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------- UI bits ---------------------------------
  const Section = ({ title, children }) => (
    <div className="border rounded-md p-3 bg-gray-50">
      {title && <div className="text-xs font-medium mb-2">{title}</div>}
      {children}
    </div>
  );

  const SelectLenders = ({ value, onChange }) => (
    <div className="grid grid-cols-2 gap-2">
      {LENDER_OPTIONS.map((ln) => {
        const checked = value.includes(ln);
        return (
          <label key={ln} className="text-xs flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                if (e.target.checked) onChange([...value, ln]);
                else onChange(value.filter((x) => x !== ln));
              }}
            />
            {ln}
          </label>
        );
      })}
    </div>
  );

  // ---------- renderers ----------
  const renderProfileSection = () => (
    <div className="space-y-3">
      <Section title="Student Details">
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <input ref={ref('prof:country')} className="border rounded px-2 py-1" placeholder="Country" />
          <input ref={ref('prof:intake')} className="border rounded px-2 py-1" placeholder="Intake (e.g. Sep 2026)" />
          <input ref={ref('prof:universities')} className="border rounded px-2 py-1" placeholder="Universities (comma separated)" />
          <input ref={ref('prof:course')} className="border rounded px-2 py-1" placeholder="Course" />
          <select ref={ref('prof:offer')} className="border rounded px-2 py-1">
            <option value="unknown">Offer/Admission: Unknown</option>
            <option value="yes">Offer: Yes</option>
            <option value="no">Offer: No</option>
            <option value="conditional">Offer: Conditional</option>
          </select>
          <input ref={ref('prof:age')} className="border rounded px-2 py-1" placeholder="Age" />
          <input ref={ref('prof:pct10')} className="border rounded px-2 py-1" placeholder="10th %" />
          <input ref={ref('prof:pct12')} className="border rounded px-2 py-1" placeholder="12th %" />
          <input ref={ref('prof:gradpct')} className="border rounded px-2 py-1" placeholder="Graduation %" />
          <input ref={ref('prof:lastgrad')} className="border rounded px-2 py-1" placeholder="Last Graduated Year" />
          <input ref={ref('prof:workex')} className="border rounded px-2 py-1" placeholder="Work Experience (months)" />
          <input ref={ref('prof:backlogs')} className="border rounded px-2 py-1" placeholder="Backlogs (count)" />
        </div>
        <textarea ref={ref('prof:gap')} className="w-full border rounded px-2 py-1 text-sm mt-2" placeholder="Gap in education (if any)" />
        <textarea ref={ref('prof:currloans')} className="w-full border rounded px-2 py-1 text-sm mt-2" placeholder='Current loans (JSON or free text, e.g. {"credit_card": 50000})' />
        <div className="grid md:grid-cols-2 gap-2 text-sm mt-2">
          <label className="flex items-center gap-2 text-xs">
            <input ref={ref('prof:cibilknown')} type="checkbox" />
            CIBIL known?
          </label>
          <input ref={ref('prof:cibils')} className="border rounded px-2 py-1" placeholder="CIBIL score (if known)" />
        </div>
        <textarea ref={ref('prof:creditissues')} className="w-full border rounded px-2 py-1 text-sm mt-2" placeholder="Credit issues / delayed payments / default" />
      </Section>

     <Section title="Co-applicant(s)">
  {coappRowIds.map((id) => (
    <div key={id} className="mb-3 border rounded p-2 bg-white">
      <div className="grid md:grid-cols-2 gap-2 text-sm">
        <input
          data-coapp={`${id}:relation`}
          className="border rounded px-2 py-1"
          placeholder="Relation (e.g. Father/Mother/Spouse)"
        />
        <input
          data-coapp={`${id}:name`}
          className="border rounded px-2 py-1"
          placeholder="Name"
        />
        <input
          data-coapp={`${id}:age`}
          className="border rounded px-2 py-1"
          placeholder="Age"
        />
        <select data-coapp={`${id}:income`} className="border rounded px-2 py-1">
          <option value="">Income Type</option>
          <option value="salaried">Salaried</option>
          <option value="self_employed">Self Employed</option>
          <option value="pensioner">Pensioner</option>
          <option value="rental">Rental</option>
          <option value="agricultural">Agricultural</option>
          <option value="other">Other</option>
        </select>
        <label className="flex items-center gap-2 text-xs">
          <input data-coapp={`${id}:ownhouse`} type="checkbox" />
          Own House?
        </label>
        <input
          data-coapp={`${id}:cibils`}
          className="border rounded px-2 py-1"
          placeholder="CIBIL score (if known)"
        />
        <label className="flex items-center gap-2 text-xs">
          <input data-coapp={`${id}:cibilknown`} type="checkbox" />
          CIBIL known?
        </label>
      </div>

      <textarea
        data-coapp={`${id}:currloans`}
        className="w-full border rounded px-2 py-1 text-sm mt-2"
        placeholder='Outstanding loans (JSON or free text)'
      />
      <textarea
        data-coapp={`${id}:issues`}
        className="w-full border rounded px-2 py-1 text-sm mt-2"
        placeholder="Credit issues / delayed payments / default"
      />

      <div className="flex justify-end">
        {coappRowIds.length > 1 && (
          <button
            type="button"
            className="text-xs text-rose-600 underline"
            onClick={() => {
              setCoappRowIds(ids => ids.filter(x => x !== id));
              removeKeysByPrefix?.(`coapp:${id}:`);
            }}
          >
            Remove co-applicant
          </button>
        )}
      </div>
    </div>
  ))}
  <button
    type="button"
    className="text-xs underline"
    onClick={()=>setCoappRowIds(ids => [...ids, newId()])}
  >
    + Add another co-applicant
  </button>
</Section>
    </div>
  );

  const renderLoginRow = (rowId) => (
    <div key={rowId} className="mb-3 border rounded p-2 bg-white">
      <div className="grid md:grid-cols-2 gap-2 text-sm">
        {/* lender select from master */}
        <select ref={ref(`login:${rowId}:lenderId`)} className="border rounded px-2 py-1">
          <option value="">Select Lender</option>
          {allLenders.map(l => (
            <option key={l.id} value={l.id}>{l.name || l.code}</option>
          ))}
        </select>

        <input ref={ref(`login:${rowId}:loginId`)} className="border rounded px-2 py-1" placeholder="Login ID" />
        <input ref={ref(`login:${rowId}:loginDate`)} type="date" className="border rounded px-2 py-1" aria-label="Date of Login" />
        <input ref={ref(`login:${rowId}:location`)} className="border rounded px-2 py-1" placeholder="Location" />
        <input ref={ref(`login:${rowId}:rmName`)} className="border rounded px-2 py-1" placeholder="RM Name" />
        <input ref={ref(`login:${rowId}:rmPhone`)} className="border rounded px-2 py-1" placeholder="RM Phone" />
      </div>
      <div className="text-[11px] text-gray-500 mt-1">Date of Login</div>
      <div className="flex justify-end">
        {loginRowIds.length > 1 && (
          <button
            type="button"
            className="text-xs text-rose-600 underline"
            onClick={() => {
              setLoginRowIds(ids => ids.filter(x => x !== rowId));
              removeKeysByPrefix(`login:${rowId}:`);
            }}
          >
            Remove this lender
          </button>
        )}
      </div>
    </div>
  );

  const renderSanctionRow = (rowId) => (
    <div key={rowId} className="border rounded-md p-3 bg-white mb-2">
      <div className="grid md:grid-cols-2 gap-2 text-sm">
        {/* lender select from THIS lead's logged_in lenders */}
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600">Lender</label>
          <select ref={ref(`sanction:${rowId}:lenderId`)} className="w-full border rounded px-2 py-1">
            <option value="">Select Logged-in Lender</option>
            {loggedInOptions.map(id => (
              <option key={id} value={id}>{byId[id]?.name || byId[id]?.code || `#${id}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Date of Sanction</label>
          <input ref={ref(`sanction:${rowId}:date`)} type="date" className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="text-xs text-gray-600">Expected Date of PF</label>
          <input ref={ref(`sanction:${rowId}:expected_pf`)} type="date" className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="text-xs text-gray-600">Loan Amount</label>
          <input ref={ref(`sanction:${rowId}:amount`)} className="w-full border rounded px-2 py-1" placeholder="Loan Amount" />
        </div>

        <div>
          <label className="text-xs text-gray-600">Interest Rate (%)</label>
          <input ref={ref(`sanction:${rowId}:rate`)} className="w-full border rounded px-2 py-1" placeholder="Interest Rate (%)" />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-600">Processing Fees</label>
          <input ref={ref(`sanction:${rowId}:processing_fees`)} className="w-full border rounded px-2 py-1" placeholder="Processing Fees" />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-600">Sanction conditions (if any)</label>
          <textarea ref={ref(`sanction:${rowId}:conditions`)} className="w-full border rounded px-2 py-1" placeholder="Conditions" />
        </div>
      </div>
    </div>
  );

  const renderStageSpecific = () => {
    if (fromStage === 'new' && to === 'lod_shared') {
      return renderProfileSection();
    }

    if (fromStage === 'lod_shared' && to === 'docs_received') {
      return (
        <Section title="Docs Received">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="docs" value="partial"
                     checked={docsStatus==='partial'}
                     onChange={()=>setDocsStatus('partial')} />
              Partial
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="docs" value="complete"
                     checked={docsStatus==='complete'}
                     onChange={()=>setDocsStatus('complete')} />
              Complete
            </label>
          </div>
          {docsStatus === 'complete' && (
            <div className="mt-2">
              <div className="text-xs mb-1">Select lenders to share</div>
              <SelectLenders value={lendersToShare} onChange={setLendersToShare} />
            </div>
          )}
        </Section>
      );
    }

    if (fromStage === 'docs_received' && to === 'logged_in') {
      return (
        <Section title="Login Details (you can add multiple lenders)">
          {loginRowIds.map(renderLoginRow)}
          <button
            type="button"
            className="text-xs underline"
            onClick={()=>setLoginRowIds(ids => [...ids, newId()])}
          >
            + Add another lender
          </button>
        </Section>
      );
    }

    if (fromStage === 'logged_in' && to === 'sanctioned') {
      return (
        <Section title="Sanction Details (you can add multiple lenders)">
          {sanctionRowIds.map(renderSanctionRow)}
          <button
            type="button"
            className="text-xs underline"
            onClick={()=>setSanctionRowIds(ids => [...ids, newId()])}
          >
            + Add another lender
          </button>
        </Section>
      );
    }

    if (fromStage === 'sanctioned' && to === 'pf_paid') {
      return (
        <Section title="Processing Fees Paid">
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Lender</label>
              <select ref={ref('pf:lenderId')} className="w-full border rounded px-2 py-1">
                <option value="">Select Sanctioned Lender</option>
                {sanctionedOptions.map(id => (
                  <option key={id} value={id}>{byId[id]?.name || byId[id]?.code || `#${id}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Date of PF Paid</label>
              <input ref={ref('pf:date')} type="date" className="w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Expected Date of Disbursement</label>
              <input ref={ref('pf:expected')} type="date" className="w-full border rounded px-2 py-1" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Processing Fees Amount</label>
              <input ref={ref('pf:amount')} className="w-full border rounded px-2 py-1" placeholder="Processing Fees Amount" />
            </div>
          </div>
        </Section>
      );
    }

    if (fromStage === 'pf_paid' && to === 'disbursed') {
      return (
        <Section title="Disbursement Details">
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Lender</label>
              <select ref={ref('disb:lenderId')} className="w-full border rounded px-2 py-1">
                <option value="">Select PF Paid Lender</option>
                {pfPaidOptions.map(id => (
                  <option key={id} value={id}>{byId[id]?.name || byId[id]?.code || `#${id}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Date of Disbursement</label>
              <input ref={ref('disb:date')} type="date" className="w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Disbursement Amount</label>
              <input ref={ref('disb:amount')} className="w-full border rounded px-2 py-1" placeholder="Disbursement Amount" />
            </div>
          </div>
        </Section>
      );
    }

    return null;
  };

  // --------------------------------- modal ---------------------------------
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-2.5 py-1.5 text-xs rounded-md border bg-white hover:bg-gray-50"
      >
        Move Stage
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          {/* Modal container: scrollable */}
          <div className="w-full max-w-2xl rounded-lg border bg-white shadow-lg max-h-[85vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-sm font-medium">Move Stage — {lead?.name}</div>
              <button onClick={() => setOpen(false)} className="text-xs underline">
                Close
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-3">
              {err && (
                <div className="text-xs text-rose-600 border border-rose-200 bg-rose-50 rounded px-3 py-2">
                  {err}
                </div>
              )}

              <div className="mb-1">
                <div className="text-xs text-gray-600 mb-1">
                  From: <b>{STAGE_LABEL[fromStage]}</b>
                </div>
                <label className="text-xs text-gray-600">To stage</label>
                <div className="text-[11px] text-gray-500 mt-1">
                  Choose a target stage to see the required fields below.
                </div>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                  {nextOptions.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage-specific sections */}
              <div className="space-y-3">{renderStageSpecific()}</div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t bg-white sticky bottom-0">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save & Move'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}