// app/crm/loanmanager/leads/[id]/page.js
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import StageBadge from '../../../../../components/crm/StageBadge';
import StageMoveDialog from '../../../../../components/crm/StageMoveDialog';
import CallAttempt from '../../../../../components/crm/CallAttempt';

const OUTCOME_LABEL = {
  connected: 'Connected',
  rnr: 'RNR',
  switched_off: 'Switched Off',
  not_reachable: 'Not Reachable',
  wrong_number: 'Wrong Number',
  not_interested: 'Not Interested',
};

// ---------------- small helpers ----------------
const first = (obj, keys, fallback = undefined) => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
};
const tryParse = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try { const x = JSON.parse(v); return Array.isArray(x) ? x : null; } catch { return null; }
  }
  return null;
};
// Extract co-applicants from student row using common key patterns.
const coappsFromStudent = (studentRow) => {
  if (!studentRow) return null;
  const raw =
    first(studentRow, ['co_applicants', 'coapplicants', 'coApplicants', 'co_apps', 'coapps']) ??
    null;
  const arr = Array.isArray(raw) ? raw : tryParse(raw);
  if (!arr || !arr.length) return null;

  // Normalize each coapp object so the UI can read consistent keys.
  return arr.map((c = {}) => ({
    id: first(c, ['id']),
    relation: first(c, ['relation', 'relation_to_student', 'relationToStudent']) || '',
    name: first(c, ['name', 'full_name', 'fullName']) || '',
    age: first(c, ['age']),
    income_type: first(c, ['income_type', 'incomeType']) || '',
    own_house: first(c, ['own_house', 'ownHouse']),
    current_loans: first(c, ['current_loans', 'currentLoans']) ?? null,
    cibil_known: first(c, ['cibil_known', 'cibilKnown']),
    cibil_score: first(c, ['cibil_score', 'cibilScore']),
    credit_issues: first(c, ['credit_issues', 'creditIssues']) || '',
  }));
};

export default function LeadDetail(){
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [coapps, setCoapps] = useState([]);
  const [lenders, setLenders] = useState([]);      // joined with lender name
  const [attempts, setAttempts] = useState([]);    // followups rows
  const [history, setHistory]  = useState([]);     // lead_stage_history rows
  const [newNote, setNewNote] = useState('');

  // Master lenders for dropdowns
  const [allLenders, setAllLenders] = useState([]);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [managers, setManagers] = useState([]);             // [{id,email}]
  const [assignManagerId, setAssignManagerId] = useState(''); // selected manager id
  const [adminErr, setAdminErr] = useState('');

  // Quick add forms state (Login)
  const [loginLenderId, setLoginLenderId] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginDate, setLoginDate] = useState('');
  const [loginLocation, setLoginLocation] = useState('');
  const [rmName, setRmName] = useState('');
  const [rmPhone, setRmPhone] = useState('');
  const [loginErr, setLoginErr] = useState('');

  // Add/Update Sanction
  const [sLenderId, setSLenderId] = useState('');
  const [sDate, setSDate] = useState('');
  const [sExpectedPF, setSExpectedPF] = useState('');
  const [sAmt, setSAmt] = useState('');
  const [sRate, setSRate] = useState('');
  const [sFees, setSFees] = useState('');
  const [sCond, setSCond] = useState('');
  const [sErr, setSErr] = useState('');

  // ---- NEW: simple country editor state ----
  const [editCountry, setEditCountry] = useState('');

  const load = async()=>{
    // lead
    const { data: l } = await supabase.from('leads').select('*').eq('id', id).single();
    setLead(l);
    setAssignManagerId(l?.loan_manager_id || '');

    // notes
    const { data: n } = await supabase
      .from('notes').select('*').eq('lead_id', id)
      .order('created_at', { ascending: false });
    setNotes(n || []);

    // student profile
    let s = null;
    try {
      const { data } = await supabase
        .from('lead_details_student').select('*').eq('lead_id', id).single();
      s = data;
    } catch {
      const { data } = await supabase
        .from('lead_details_student').select('*').eq('lead_id', id).limit(1);
      s = (data || [])[0] || null;
    }
    setProfile(s || null);
    // keep editor in sync with DB
    setEditCountry(s?.country || '');

    // co-applicants: prefer student JSON; fall back to table if absent
    const fromStudent = coappsFromStudent(s);
    if (fromStudent && fromStudent.length) {
      setCoapps(fromStudent);
    } else {
      const { data: c } = await supabase
        .from('lead_details_coapplicants')
        .select('*').eq('lead_id', id).order('created_at', { ascending: true });
      setCoapps(c || []);
    }

    // lenders (and names)
    const { data: ll } = await supabase
      .from('lead_lenders')
      .select('lead_id,lender_id,stage,login_id,location,rm_name,rm_phone,dates,sanction')
      .eq('lead_id', id);

    const { data: lendersTbl } = await supabase
      .from('lenders').select('id,name,code').order('name',{ascending:true});
    setAllLenders(lendersTbl || []);
    const byId = Object.fromEntries((lendersTbl || []).map(x => [x.id, x]));
    setLenders((ll || []).map(x => ({
      ...x,
      lender_name: byId[x.lender_id]?.name || byId[x.lender_id]?.code || '',
    })));

    // followups
    const { data: f } = await supabase
      .from('followups')
      .select('id, outcome, notes, due_on, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false });
    setAttempts(f || []);

    // stage history
    const { data: h } = await supabase
      .from('lead_stage_history')
      .select('id, from_stage, to_stage, changed_at, reason')
      .eq('lead_id', id)
      .order('changed_at', { ascending: false });
    setHistory(h || []);
  };

  // role + managers list
  const loadRoleAndManagers = async () => {
    try {
      setAdminErr('');
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;

      const { data: r } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', uid)
        .limit(1);

      const role = r?.[0]?.role || 'manager';
      setIsAdmin(role === 'admin');

      if (role === 'admin') {
        const { data: mgrs } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('role', 'manager');

        const ids = (mgrs || []).map(m => m.user_id);
        let profiles = [];
        if (ids.length) {
          // using your profiles table for email/name
          const { data: p } = await supabase
            .from('profiles')
            .select('id,email,name')
            .in('id', ids);
          profiles = p || [];
        }
        const by = Object.fromEntries((profiles || []).map(p => [p.id, { email: p.email, name: p.name }]));
        setManagers((mgrs || []).map(m => ({
          id: m.user_id,
          label: (by[m.user_id]?.name?.trim() || by[m.user_id]?.email || m.user_id)
        })));
      }
    } catch (e) {
      setAdminErr(e.message || 'Failed to resolve admin/manager lists');
    }
  };

  useEffect(()=>{ load(); }, [id]);
  useEffect(()=>{ loadRoleAndManagers(); }, [id]);

  const addNote = async()=>{
    if (!newNote.trim()) return;
    await supabase.from('notes').insert({ lead_id: id, body: newNote.trim() });
    setNewNote('');
    load();
  };

  // CSV helpers
  const csv = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const downloadLendersCsv = () => {
    const headers = [
      'lead_id','lead_name','phone','email',
      'lender','current_stage','login_id','location','rm_name','rm_phone',
      'login_date','sanction_date','pf_paid_date','disbursed_date'
    ];
    const lines = [headers.join(',')];

    (lenders || []).forEach((x) => {
      lines.push([
        lead?.id || '',
        csv(lead?.name || ''),
        csv(lead?.phone || ''),
        csv(lead?.email || ''),
        csv(x.lender_name || ''),
        csv(x.stage || ''),
        csv(x.login_id || ''),
        csv(x.location || ''),
        csv(x.rm_name || ''),
        csv(x.rm_phone || ''),
        x.dates?.login || '',
        x.sanction?.date || '',
        x.dates?.pf_paid || '',
        x.dates?.disbursed || ''
      ].join(','));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-${(lead?.name || 'profile').replace(/\s+/g,'-').toLowerCase()}-lenders.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Derived option sets
  const loggedInLenderIds = useMemo(
    () => lenders.filter(x => x.stage === 'logged_in').map(x => x.lender_id),
    [lenders]
  );
  const loggedInOptions = useMemo(
    () => loggedInLenderIds.map(id => ({ id, label: (allLenders.find(L => L.id===id)?.name || allLenders.find(L=>L.id===id)?.code || `#${id}`) })),
    [loggedInLenderIds, allLenders]
  );

  // Quick add handlers
  const addLoginRow = async () => {
    try {
      setLoginErr('');
      if (!loginLenderId || !loginId || !loginDate) {
        throw new Error('Pick lender, enter Login ID and Date of Login.');
      }

      const { data: existing } = await supabase
        .from('lead_lenders')
        .select('id')
        .eq('lead_id', id)
        .eq('lender_id', loginLenderId)
        .limit(1);

      if (!existing?.length) {
        await supabase.from('lead_lenders').insert({ lead_id: id, lender_id: loginLenderId });
      }

      await supabase
        .from('lead_lenders')
        .update({
          stage: 'logged_in',
          login_id: loginId,
          location: loginLocation || null,
          rm_name: rmName || null,
          rm_phone: rmPhone || null,
          dates: { login: loginDate },
        })
        .eq('lead_id', id)
        .eq('lender_id', loginLenderId);

      setLoginLenderId('');
      setLoginId('');
      setLoginDate('');
      setLoginLocation('');
      setRmName('');
      setRmPhone('');
      await load();
    } catch (e) {
      setLoginErr(e.message || 'Failed to add login row');
    }
  };

  const addOrUpdateSanction = async () => {
    try {
      setSErr('');
      if (!sLenderId || !sDate || !sAmt || !sFees) {
        throw new Error('Pick lender and fill Date, Amount, Processing Fees.');
      }

      await supabase
        .from('lead_lenders')
        .update({
          stage: 'sanctioned',
          sanction: {
            date: sDate,
            expected_pf_date: sExpectedPF || null,
            amount: Number(sAmt),
            rate: sRate ? Number(sRate) : null,
            processing_fees: Number(sFees),
            conditions: sCond || null,
          },
        })
        .eq('lead_id', id)
        .eq('lender_id', sLenderId);

      setSLenderId('');
      setSDate('');
      setSExpectedPF('');
      setSAmt('');
      setSRate('');
      setSFees('');
      setSCond('');
      await load();
    } catch (e) {
      setSErr(e.message || 'Failed to save sanction');
    }
  };

  // ---- NEW: save student country (upsert by lead_id) ----
  const saveStudentCountry = async () => {
    try {
      const payload = { lead_id: id, country: editCountry || null };
      const { error } = await supabase
        .from('lead_details_student')
        .upsert(payload, { onConflict: 'lead_id' });
      if (error) throw error;
      await load();
      alert('Country saved.');
    } catch (e) {
      alert(e.message || 'Failed to save country');
    }
  };

  // Admin actions
  const assignManager = async () => {
    try {
      if (!assignManagerId) throw new Error('Pick a manager');
      await supabase.from('leads').update({ loan_manager_id: assignManagerId }).eq('id', id);
      await load();
      alert('Manager assigned.');
    } catch (e) {
      alert(e.message || 'Failed to assign manager');
    }
  };
  const purgeNotes = async () => {
    if (!confirm('Delete ALL notes for this lead?')) return;
    const { error } = await supabase.from('notes').delete().eq('lead_id', id);
    if (error) return alert(error.message);
    await load();
    alert('Notes purged.');
  };
  const purgeFollowups = async () => {
    if (!confirm('Delete ALL follow-ups for this lead?')) return;
    const { error } = await supabase.from('followups').delete().eq('lead_id', id);
    if (error) return alert(error.message);
    await load();
    alert('Follow-ups purged.');
  };
  const rollbackStage = async () => {
    try {
      if (!confirm('Roll stage back to the previous stage?')) return;

      const { data: last } = await supabase
        .from('lead_stage_history')
        .select('id, from_stage, to_stage, changed_at')
        .eq('lead_id', id)
        .order('changed_at', { ascending: false })
        .limit(1);

      const latest = last?.[0];
      if (!latest) return alert('No stage history found to roll back.');

      const prev = latest.from_stage;
      const curr = latest.to_stage;

      await supabase.from('leads').update({ stage: prev }).eq('id', id);
      await supabase.from('lead_stage_history').insert({
        lead_id: id,
        from_stage: curr,
        to_stage: prev,
        reason: 'admin rollback'
      });

      await load();
      alert(`Rolled back to: ${prev}`);
    } catch (e) {
      alert(e.message || 'Rollback failed');
    }
  };

  if (!lead) return <div className="text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">{lead.name}</div>
            <div className="text-sm text-gray-500">
              {lead.phone || '-'} • {lead.email || '-'} • {lead.source || '-'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StageBadge stage={lead.stage} />
            <StageMoveDialog lead={lead} onMoved={load} />
          </div>
        </div>

        <div className="mt-3 flex gap-2 print:hidden">
          <button onClick={downloadLendersCsv} className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
            Download Lenders CSV
          </button>
          <button onClick={() => window.print()} className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
            Print Profile
          </button>
        </div>

        {isAdmin && (
          <div className="mt-4 border-t pt-4">
            <div className="text-sm font-medium mb-2">Admin Tools</div>
            {adminErr && <div className="text-xs text-rose-600 mb-2">{adminErr}</div>}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="border rounded p-3 bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">Assign/Change Manager</div>
                <div className="flex gap-2">
                  <select
                    className="border rounded px-2 py-1 text-sm flex-1"
                    value={assignManagerId}
                    onChange={(e)=>setAssignManagerId(e.target.value)}
                  >
                    <option value="">Select a manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                  <button onClick={assignManager} className="px-3 py-1.5 text-sm rounded bg-black text-white">
                    Save
                  </button>
                </div>
              </div>

              <div className="border rounded p-3 bg-gray-50 space-y-2">
                <div className="text-xs text-gray-600">Maintenance</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={purgeNotes} className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50">
                    Purge Notes
                  </button>
                  <button onClick={purgeFollowups} className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50">
                    Purge Follow-ups
                  </button>
                  <button onClick={rollbackStage} className="px-3 py-1.5 text-xs rounded bg-amber-600 text-white">
                    Roll Stage Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick add cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-2">Add Logged In Lender</div>
          {loginErr && <div className="text-xs text-rose-600 mb-2">{loginErr}</div>}
          <div className="grid gap-2 text-sm">
            <select className="border rounded px-2 py-1" value={loginLenderId} onChange={(e)=>setLoginLenderId(e.target.value)}>
              <option value="">Select Lender</option>
              {allLenders.map(l => (
                <option key={l.id} value={l.id}>{l.name || l.code}</option>
              ))}
            </select>
            <input className="border rounded px-2 py-1" placeholder="Login ID" value={loginId} onChange={e=>setLoginId(e.target.value)} />
            <input type="date" className="border rounded px-2 py-1" value={loginDate} onChange={e=>setLoginDate(e.target.value)} />
            <input className="border rounded px-2 py-1" placeholder="Location" value={loginLocation} onChange={e=>setLoginLocation(e.target.value)} />
            <input className="border rounded px-2 py-1" placeholder="RM Name" value={rmName} onChange={e=>setRmName(e.target.value)} />
            <input className="border rounded px-2 py-1" placeholder="RM Phone" value={rmPhone} onChange={e=>setRmPhone(e.target.value)} />
            <div className="flex justify-end">
              <button onClick={addLoginRow} className="px-3 py-2 text-sm rounded bg-black text-white">
                Add Login Row
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-2">Add/Update Sanction</div>
          {sErr && <div className="text-xs text-rose-600 mb-2">{sErr}</div>}
          <div className="grid gap-2 text-sm">
            <select className="border rounded px-2 py-1" value={sLenderId} onChange={(e)=>setSLenderId(e.target.value)}>
              <option value="">Select Logged-in Lender</option>
              {loggedInOptions.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <label className="text-xs text-gray-600 mt-1">Date of Sanction</label>
            <input type="date" className="border rounded px-2 py-1" value={sDate} onChange={e=>setSDate(e.target.value)} />
            <label className="text-xs text-gray-600">Expected Date of PF</label>
            <input type="date" className="border rounded px-2 py-1" value={sExpectedPF} onChange={e=>setSExpectedPF(e.target.value)} />
            <input className="border rounded px-2 py-1" placeholder="Loan Amount" value={sAmt} onChange={e=>setSAmt(e.target.value)} />
            <input className="border rounded px-2 py-1" placeholder="Interest Rate (%)" value={sRate} onChange={e=>setSRate(e.target.value)} />
            <input className="border rounded px-2 py-1" placeholder="Processing Fees" value={sFees} onChange={e=>setSFees(e.target.value)} />
            <textarea className="border rounded px-2 py-1" placeholder="Sanction conditions (if any)" value={sCond} onChange={e=>setSCond(e.target.value)} />
            <div className="flex justify-end">
              <button onClick={addOrUpdateSanction} className="px-3 py-2 text-sm rounded bg-black text-white">
                Save Sanction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Call Attempt entry */}
      <CallAttempt lead={lead} onSaved={load} />

      {/* Call Attempts & Follow-ups */}
      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Call Attempts & Follow-ups</div>
        {!attempts.length ? (
          <div className="text-sm text-gray-500">No call attempts yet.</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-auto">
            {attempts.map(a => (
              <div key={a.id} className="border rounded p-2 bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">
                  Created: {new Date(a.created_at).toLocaleString()}
                  {' · '}Next call: {a.due_on ? new Date(a.due_on).toLocaleString() : '-'}
                </div>
                <div className="text-xs mb-1">
                  Outcome: <span className="font-medium">{OUTCOME_LABEL[a.outcome] || a.outcome || '-'}</span>
                </div>
                {a.notes && <div className="text-sm">{a.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage History */}
      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Stage History</div>
        {!history.length ? (
          <div className="text-sm text-gray-500">No stage changes yet.</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-auto">
            {history.map(h => (
              <div key={h.id} className="border rounded p-2 bg-gray-50 text-sm">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(h.changed_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <StageBadge stage={h.from_stage} />
                  <span className="text-xs text-gray-500">→</span>
                  <StageBadge stage={h.to_stage} />
                </div>
                {h.reason && <div className="mt-1 text-xs">Reason: {h.reason}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Profile */}
      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Student Profile</div>

        {!profile ? (
          <div className="text-sm text-gray-500">No student profile saved yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Field label="Country">{profile.country || '-'}</Field>
            <Field label="Intake">{profile.intake || '-'}</Field>
            <Field label="Universities">{(profile.universities || []).join?.(', ') || profile.universities || '-'}</Field>
            <Field label="Course">{profile.course || '-'}</Field>
            <Field label="Offer/Admission">{profile.offer_letter || profile.offerAdmission || 'unknown'}</Field>
            <Field label="Age">{profile.age ?? '-'}</Field>
            <Field label="10th %">{profile.pct_10 ?? '-'}</Field>
            <Field label="12th %">{profile.pct_12 ?? '-'}</Field>
            <Field label="Graduation %">{profile.grad_pct ?? '-'}</Field>
            <Field label="Last Graduated Year">{profile.last_grad_year ?? '-'}</Field>
            <Field label="Work Experience (months)">{profile.work_ex_months ?? '-'}</Field>
            <Field label="Backlogs">{profile.backlogs ?? '-'}</Field>
            <Field label="Education Gap">{profile.gap_notes || '-'}</Field>
            <Field label="Current Loans">{profile.current_loans ? JSON.stringify(profile.current_loans) : '-'}</Field>
            <Field label="CIBIL Known?">{String(profile.cibil_known ?? '')}</Field>
            <Field label="CIBIL Score">{profile.cibil_score ?? '-'}</Field>
            <Field label="Credit Issues">{profile.credit_issues || '-'}</Field>
          </div>
        )}
      </div>

      {/* Co-applicants */}
      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Co-applicant(s)</div>
        {!coapps.length ? (
          <div className="text-sm text-gray-500">No co-applicants saved yet.</div>
        ) : (
          <div className="space-y-3">
            {coapps.map((c, idx) => (
              <div key={c.id || idx} className="border rounded p-3 text-sm">
                <div className="grid md:grid-cols-2 gap-2">
                  <Field label="Relation">{c.relation || '-'}</Field>
                  <Field label="Name">{c.name || '-'}</Field>
                  <Field label="Age">{c.age ?? '-'}</Field>
                  <Field label="Income Type">{c.income_type || '-'}</Field>
                  <Field label="Own House?">{String(c.own_house ?? '')}</Field>
                  <Field label="Current Loans">{c.current_loans ? JSON.stringify(c.current_loans) : '-'}</Field>
                  <Field label="CIBIL Known?">{String(c.cibil_known ?? '')}</Field>
                  <Field label="CIBIL Score">{c.cibil_score ?? '-'}</Field>
                  <Field label="Credit Issues">{c.credit_issues || '-'}</Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lenders progress */}
      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Lenders</div>
        {!lenders.length ? (
          <div className="text-sm text-gray-500">No lender activity yet.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="py-2 pr-3">Lender</th>
                  <th className="py-2 pr-3">Stage</th>
                  <th className="py-2 pr-3">Login ID</th>
                  <th className="py-2 pr-3">Login Date</th>
                  <th className="py-2 pr-3">Sanction Date</th>
                  <th className="py-2 pr-3">PF Paid</th>
                  <th className="py-2 pr-3">Disbursed</th>
                  <th className="py-2 pr-3">RM</th>
                  <th className="py-2 pr-3">RM Phone</th>
                </tr>
              </thead>
              <tbody>
                {lenders.map((x, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3">{x.lender_name}</td>
                    <td className="py-2 pr-3">{x.stage}</td>
                    <td className="py-2 pr-3">{x.login_id || '-'}</td>
                    <td className="py-2 pr-3">{x.dates?.login || '-'}</td>
                    <td className="py-2 pr-3">{x.sanction?.date || '-'}</td>
                    <td className="py-2 pr-3">{x.dates?.pf_paid || '-'}</td>
                    <td className="py-2 pr-3">{x.dates?.disbursed || '-'}</td>
                    <td className="py-2 pr-3">{x.rm_name || '-'}</td>
                    <td className="py-2 pr-3">{x.rm_phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Notes</div>
        <div className="space-y-2 mb-3 max-h-64 overflow-auto">
          {notes.map((n) => (
            <div key={n.id} className="text-sm border rounded p-2 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(n.created_at).toLocaleString()}
              </div>
              {n.body}
            </div>
          ))}
          {!notes.length && (
            <div className="text-sm text-gray-500">No notes yet.</div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={newNote}
            onChange={(e)=>setNewNote(e.target.value)}
            placeholder="Write a note…"
            className="flex-1 px-3 py-2 text-sm border rounded"
          />
          <button
            onClick={async()=>{ await addNote(); }}
            className="px-3 py-2 text-sm border rounded bg-black text-white"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="font-medium break-words">{children}</div>
    </div>
  );
}