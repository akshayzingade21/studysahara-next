// app/crm/admin/page.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import StageBadge, { STAGE_LABEL, STAGES } from '../../../components/crm/StageBadge';

const STAGE_KEYS = [
  'new','lod_shared','docs_received','logged_in','sanctioned','pf_paid','disbursed','deferred','lost'
];

// lead_source enum values
const SOURCE_OPTIONS = [
  { v: 'organic',  label: 'Organic'  },
  { v: 'partner',  label: 'Partner'  },
  { v: 'referral', label: 'Referral' },
];

const nice = (v) => (v === 0 ? 0 : v ?? '-');

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [leads, setLeads] = useState([]);
  const [stageCounts, setStageCounts] = useState({});
  const [managers, setManagers] = useState([]);   // [{ id:<auth_user_id>, email, name }]
  const [partners, setPartners] = useState([]);   // [{ id, name }]
  const [selected, setSelected] = useState(new Set()); // lead ids

  // Bulk UI state
  const [bulkAssignTo, setBulkAssignTo] = useState('');
  const [bulkStage, setBulkStage] = useState('');

  // Create Lead form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSource, setNewSource] = useState('organic');  // enum value
  const [newPartnerId, setNewPartnerId] = useState('');   // existing partner selection
  const [newPartnerName, setNewPartnerName] = useState(''); // quick add
  const [newAssignedTo, setNewAssignedTo] = useState(''); // auth.users.id
  const [createErr, setCreateErr] = useState('');

  // Modals
  const [openNotesLeadId, setOpenNotesLeadId] = useState(null);
  const [openFollowLeadId, setOpenFollowLeadId] = useState(null);

  // Modal data
  const [notesRows, setNotesRows] = useState([]);  // [{id, body, created_at}]
  const [notesSel, setNotesSel]   = useState(new Set());
  const [fupRows, setFupRows]     = useState([]);  // [{id, outcome, due_on, notes}]
  const [fupSel, setFupSel]       = useState(new Set());

  const managerLabelById = useMemo(
    () => Object.fromEntries((managers || []).map(m => [m.id, (m.name?.trim() || m.email)])),
    [managers]
  );
  const partnerNameById = useMemo(
    () => Object.fromEntries((partners || []).map(p => [p.id, p.name])),
    [partners]
  );

  const load = async () => {
    setErr('');
    setLoading(true);
    try {
      // Leads
      const { data: L, error: eL } = await supabase
        .from('leads')
        .select('id,name,phone,email,source,partner_id,stage,loan_manager_id,created_at,updated_at')
        .order('created_at', { ascending: false });
      if (eL) throw eL;
      setLeads(L || []);

      // Stage counts
      const counts = {};
      for (const k of STAGE_KEYS) counts[k] = 0;
      (L || []).forEach(r => { counts[r.stage] = (counts[r.stage] || 0) + 1; });
      setStageCounts(counts);

      // Managers from employees (prefer auth_user_id so it matches auth.users FK)
      const { data: EMPS, error: eEmp } = await supabase
        .from('employees')
        .select('id,auth_user_id,email,name')
        .order('email', { ascending: true });
      if (eEmp) throw eEmp;

      const mgrs = (EMPS || []).map(e => ({
        id: e.auth_user_id || e.id, // if FK aims at auth.users, make sure this is auth_user_id
        email: e.email || e.id,
        name: e.name || ''
      }));
      setManagers(mgrs);

      // Partners dropdown
      const { data: P, error: eP } = await supabase
        .from('partners')
        .select('id,name')
        .order('name', { ascending: true });
      if (eP) throw eP;
      setPartners(P || []);
    } catch (e) {
      setErr(e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const totalLeads = leads.length;
  const closed = stageCounts['disbursed'] || 0;
  const lost = stageCounts['lost'] || 0;
  const active = totalLeads - closed - lost;

  const allSelected = selected.size && selected.size === leads.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(leads.map(l => l.id)));
  };
  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  // ---- Partners (quick add) ----
  const addPartner = async () => {
    const name = (newPartnerName || '').trim();
    if (!name) return;
    const { data, error } = await supabase
      .from('partners')
      .insert({ name })
      .select('id,name')
      .single();
    if (error) return setCreateErr(error.message || 'Failed to add partner');
    setPartners(prev => [...prev, data].sort((a,b)=>a.name.localeCompare(b.name)));
    setNewPartnerId(data.id);
    setNewPartnerName('');
  };

  // ---- Create Lead ----
  const createLead = async () => {
    try {
      setCreateErr('');
      if (!newName.trim()) throw new Error('Name is required');

      const allowed = SOURCE_OPTIONS.map(s=>s.v);
      if (!allowed.includes(newSource)) throw new Error('Invalid source');

      let partner_id = null;
      if (newSource === 'partner') {
        if (newPartnerId) {
          partner_id = newPartnerId;
        } else if (newPartnerName.trim()) {
          const { data, error } = await supabase
            .from('partners')
            .insert({ name: newPartnerName.trim() })
            .select('id')
            .single();
          if (error) throw error;
          partner_id = data.id;
          await load();
        } else {
          throw new Error('Select a partner or add one.');
        }
      }

      const payload = {
        name: newName.trim(),
        phone: newPhone?.trim() || null,
        email: newEmail?.trim() || null,
        source: newSource,
        partner_id,
        loan_manager_id: newAssignedTo || null, // should be auth.users.id
        stage: 'new',
      };

      const { error } = await supabase.from('leads').insert(payload);
      if (error) throw error;

      setNewName(''); setNewPhone(''); setNewEmail('');
      setNewSource('organic'); setNewPartnerId(''); setNewPartnerName('');
      setNewAssignedTo('');
      await load();
      alert('Lead created.');
    } catch (e) {
      setCreateErr(e.message || 'Failed to create lead');
    }
  };

  // ---- Admin actions ----
  const setStage = async (leadId, stage) => {
    try {
      const prev = leads.find(x => x.id === leadId)?.stage || null;
      const { error } = await supabase.from('leads').update({ stage }).eq('id', leadId);
      if (error) throw error;
      await supabase.from('lead_stage_history').insert({
        lead_id: leadId, from_stage: prev, to_stage: stage, reason: 'admin-change',
      });
      await load();
    } catch (e) {
      alert(e.message || 'Failed to update stage');
    }
  };

  const rollBackOne = async (leadId) => {
    try {
      const { data: H, error: eH } = await supabase
        .from('lead_stage_history')
        .select('from_stage,to_stage,changed_at')
        .eq('lead_id', leadId)
        .order('changed_at', { ascending: false })
        .limit(1);
      if (eH) throw eH;
      const prev = H?.[0]?.from_stage;
      if (!prev) return alert('No previous stage found for rollback.');
      await setStage(leadId, prev);
    } catch (e) {
      alert(e.message || 'Failed to roll back');
    }
  };

  // ---- Notes ----
  const openNotesModal = async (leadId) => {
    setOpenNotesLeadId(leadId);
    setNotesSel(new Set());
    const { data, error } = await supabase
      .from('notes')
      .select('id, body, created_at')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (!error) setNotesRows(data || []);
  };
  const deleteSelectedNotes = async () => {
    if (!notesSel.size) return;
    const ids = Array.from(notesSel);
    const { error } = await supabase.from('notes').delete().in('id', ids);
    if (error) return alert(error.message || 'Delete failed');
    await openNotesModal(openNotesLeadId);
    await load();
  };

  // ---- Follow-ups ----
  const openFollowModal = async (leadId) => {
    setOpenFollowLeadId(leadId);
    setFupSel(new Set());
    const { data, error } = await supabase
      .from('followups')
      .select('id, outcome, due_on, notes, created_at')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (!error) setFupRows(data || []);
  };
  const deleteSelectedFollowups = async () => {
    if (!fupSel.size) return;
    const ids = Array.from(fupSel);
    const { error } = await supabase.from('followups').delete().in('id', ids);
    if (error) return alert(error.message || 'Delete failed');
    await openFollowModal(openFollowLeadId);
    await load();
  };

  // ---- Bulk actions ----
  const doBulkAssign = async () => {
    if (!selected.size || !bulkAssignTo) return;
    try {
      const ids = Array.from(selected);
      const { error } = await supabase
        .from('leads')
        .update({ loan_manager_id: bulkAssignTo }) // auth.users.id
        .in('id', ids);
      if (error) throw error;
      setSelected(new Set());
      setBulkAssignTo('');
      await load();
    } catch (e) {
      alert(e.message || 'Bulk assign failed');
    }
  };

  const doBulkStage = async () => {
    if (!selected.size || !bulkStage) return;
    try {
      const ids = Array.from(selected);
      const prevById = Object.fromEntries(leads.map(l => [l.id, l.stage]));
      const { error } = await supabase
        .from('leads')
        .update({ stage: bulkStage })
        .in('id', ids);
      if (error) throw error;
      await supabase.from('lead_stage_history').insert(
        ids.map(id => ({
          lead_id: id,
          from_stage: prevById[id] || null,
          to_stage: bulkStage,
          reason: 'admin-bulk-change',
        }))
      );
      setSelected(new Set());
      setBulkStage('');
      await load();
    } catch (e) {
      alert(e.message || 'Bulk stage change failed');
    }
  };

  const doBulkCloseLost = async () => {
    if (!selected.size) return;
    try {
      const ids = Array.from(selected);
      const prevById = Object.fromEntries(leads.map(l => [l.id, l.stage]));
      const { error } = await supabase.from('leads').update({ stage: 'lost' }).in('id', ids);
      if (error) throw error;
      await supabase.from('lead_stage_history').insert(
        ids.map(id => ({
          lead_id: id, from_stage: prevById[id] || null, to_stage: 'lost', reason: 'admin-bulk-close'
        }))
      );
      await load();
      setSelected(new Set());
    } catch (e) {
      alert(e.message || 'Bulk close failed');
    }
  };

  const doBulkReopenNew = async () => {
    if (!selected.size) return;
    try {
      const ids = Array.from(selected);
      const prevById = Object.fromEntries(leads.map(l => [l.id, l.stage]));
      const { error } = await supabase.from('leads').update({ stage: 'new' }).in('id', ids);
      if (error) throw error;
      await supabase.from('lead_stage_history').insert(
        ids.map(id => ({
          lead_id: id, from_stage: prevById[id] || null, to_stage: 'new', reason: 'admin-bulk-reopen'
        }))
      );
      await load();
      setSelected(new Set());
    } catch (e) {
      alert(e.message || 'Bulk reopen failed');
    }
  };

  // Reports
  const openReport = (slug) => {
    window.open(`/api/reports/${slug}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Admin Dashboard</div>
        <div className="flex gap-2">
          <button onClick={() => openReport('stage')}
                  className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
            Stage Report CSV
          </button>
          <button onClick={() => openReport('lender')}
                  className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
            Lender Report CSV
          </button>
          <button onClick={() => openReport('timeline')}
                  className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
            Timeline Report CSV
          </button>
        </div>
      </div>

      {err && (
        <div className="text-sm text-rose-700 border border-rose-200 bg-rose-50 rounded px-3 py-2">
          {err}
        </div>
      )}

      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-3">
        <Kpi title="Total Leads" value={totalLeads} />
        <Kpi title="Active" value={active} />
        <Kpi title="Closed (Disbursed)" value={closed} />
        <Kpi title="Lost" value={lost} />
      </div>

      {/* Create Lead */}
      <div className="border rounded p-4 bg-white">
        <div className="font-medium mb-3">Create Lead</div>
        {createErr && (
          <div className="text-xs text-rose-700 border border-rose-200 bg-rose-50 rounded px-3 py-2 mb-2">
            {createErr}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-2 text-sm">
          <input className="border rounded px-2 py-1" placeholder="Name"
                 value={newName} onChange={e=>setNewName(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Phone"
                 value={newPhone} onChange={e=>setNewPhone(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Email"
                 value={newEmail} onChange={e=>setNewEmail(e.target.value)} />

          {/* Source */}
          <select className="border rounded px-2 py-1"
                  value={newSource}
                  onChange={e=>{
                    setNewSource(e.target.value);
                    if (e.target.value !== 'partner') {
                      setNewPartnerId('');
                      setNewPartnerName('');
                    }
                  }}>
            {SOURCE_OPTIONS.map(o => (
              <option key={o.v} value={o.v}>{o.label}</option>
            ))}
          </select>

          {/* Assign to (auth.users.id) */}
          <select className="border rounded px-2 py-1"
                  value={newAssignedTo}
                  onChange={e=>setNewAssignedTo(e.target.value)}>
            <option value="">Assign to (optional)</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>{m.name?.trim() || m.email}</option>
            ))}
          </select>

          <div className="flex items-center">
            <button onClick={createLead} className="px-3 py-2 text-sm rounded bg-black text-white">
              Create
            </button>
          </div>
        </div>

        {/* Partner controls */}
        {newSource === 'partner' && (
          <div className="mt-3 grid md:grid-cols-3 gap-2 text-sm">
            <select className="border rounded px-2 py-1"
                    value={newPartnerId}
                    onChange={e=>setNewPartnerId(e.target.value)}>
              <option value="">Select partner…</option>
              {partners.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 w-full"
                     placeholder="Or add new partner name"
                     value={newPartnerName}
                     onChange={e=>setNewPartnerName(e.target.value)} />
              <button type="button" onClick={addPartner}
                      className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50">
                Add
              </button>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              Choose existing or add a new partner
            </div>
          </div>
        )}
      </div>

      {/* Stage distribution */}
      <div className="border rounded p-4">
        <div className="font-medium mb-3">Stage Distribution</div>
        <div className="grid md:grid-cols-3 gap-2">
          {STAGE_KEYS.map(k => (
            <div key={k} className="flex items-center justify-between border rounded px-3 py-2 bg-white">
              <div>{STAGE_LABEL[k] || k}</div>
              <div className="font-semibold">{stageCounts[k] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="border rounded p-3 bg-yellow-50 flex flex-wrap gap-2 items-center">
          <div className="text-sm font-medium">{selected.size} selected</div>
          <span className="text-gray-400">•</span>

          <select className="border rounded px-2 py-1 text-sm"
                  value={bulkAssignTo}
                  onChange={e => setBulkAssignTo(e.target.value)}>
            <option value="">Assign to…</option>
            {managers.map(m => (<option key={m.id} value={m.id}>{m.name?.trim() || m.email}</option>))}
          </select>
          <button onClick={doBulkAssign} className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-50">
            Apply
          </button>

          <span className="text-gray-400">•</span>

          <select className="border rounded px-2 py-1 text-sm"
                  value={bulkStage}
                  onChange={e => setBulkStage(e.target.value)}>
            <option value="">Set stage…</option>
            {STAGES.map(s => (<option key={s} value={s}>{STAGE_LABEL[s]}</option>))}
          </select>
          <button onClick={doBulkStage} className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-50">
            Apply
          </button>

          <span className="text-gray-400">•</span>

          <button onClick={doBulkCloseLost} className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-50">
            Close as Lost
          </button>
          <button onClick={() => doBulkStage('disbursed')} className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-50">
            Mark Disbursed
          </button>
          <button onClick={doBulkReopenNew} className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-50">
            Reopen (New)
          </button>
        </div>
      )}

      {/* Leads list */}
      <div className="border rounded">
        <div className="flex items-center justify-between p-3">
          <div className="font-medium">All Leads</div>
          <div className="text-xs text-gray-500">{leads.length} rows</div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-t">
              <tr>
                <th className="py-2 px-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
                </th>
                <th className="py-2 px-3">Lead</th>
                <th className="py-2 px-3">Contact</th>
                <th className="py-2 px-3">Source</th>
                <th className="py-2 px-3">Stage</th>
                <th className="py-2 px-3">Assigned To</th>
                <th className="py-2 px-3">Created</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 px-3 text-sm text-gray-500" colSpan={8}>Loading…</td></tr>
              ) : !leads.length ? (
                <tr><td className="py-6 px-3 text-sm text-gray-500" colSpan={8}>No leads.</td></tr>
              ) : leads.map(l => {
                const sourceLabel = SOURCE_OPTIONS.find(s=>s.v===l.source)?.label || l.source;
                const sourceDisplay = l.source === 'partner'
                  ? `${sourceLabel}${partnerNameById[l.partner_id] ? ` — ${partnerNameById[l.partner_id]}` : ''}`
                  : sourceLabel;

                return (
                  <tr key={l.id} className="border-t">
                    <td className="py-2 px-3 align-top">
                      <input type="checkbox" checked={selected.has(l.id)}
                             onChange={() => toggleSelect(l.id)} aria-label={`Select ${l.name}`} />
                    </td>
                    <td className="py-2 px-3 align-top">
                      <div className="font-medium">{nice(l.name)}</div>
                      <div className="text-[11px] text-gray-500 break-all">{l.id}</div>
                    </td>
                    <td className="py-2 px-3 align-top">
                      <div>{nice(l.phone)}</div>
                      <div className="text-[11px] text-gray-500">{nice(l.email)}</div>
                    </td>
                    <td className="py-2 px-3 align-top">{nice(sourceDisplay)}</td>
                    <td className="py-2 px-3 align-top"><StageBadge stage={l.stage} /></td>
                    <td className="py-2 px-3 text-[12px] align-top">
                      {managerLabelById[l.loan_manager_id] || '-'}
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-500 align-top">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-[12px] align-top">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/crm/loanmanager/leads/${l.id}`} className="underline">Open</Link>
                        <button className="underline" onClick={() => setStage(l.id, 'lost')}>Close (Lost)</button>
                        <button className="underline" onClick={() => setStage(l.id, 'new')}>Reopen (New)</button>
                        <button className="underline" onClick={() => rollBackOne(l.id)}>Roll Back</button>
                        <button className="underline" onClick={() => openNotesModal(l.id)}>Manage Notes</button>
                        <button className="underline" onClick={() => openFollowModal(l.id)}>Manage Follow-ups</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="flex gap-2">
        <Link href="/crm/loanmanager" className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
          Go to Loan Manager View
        </Link>
      </div>

      {/* Notes modal */}
      {openNotesLeadId && (
        <Modal title="Manage Notes" onClose={() => setOpenNotesLeadId(null)}>
          {!notesRows.length ? (
            <div className="text-sm text-gray-500">No notes.</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {notesRows.map(n => (
                <label key={n.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={notesSel.has(n.id)}
                    onChange={() => {
                      setNotesSel(prev => {
                        const s = new Set(prev);
                        if (s.has(n.id)) s.delete(n.id); else s.add(n.id);
                        return s;
                      });
                    }}
                  />
                  <div className="text-sm">
                    <div className="text-[11px] text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                    <div>{n.body}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <button className="px-3 py-1.5 text-sm border rounded bg-white" onClick={() => setOpenNotesLeadId(null)}>Close</button>
            <button className="px-3 py-1.5 text-sm rounded bg-black text-white"
                    onClick={deleteSelectedNotes}
                    disabled={!notesSel.size}>
              Delete Selected
            </button>
          </div>
        </Modal>
      )}

      {/* Follow-ups modal */}
      {openFollowLeadId && (
        <Modal title="Manage Follow-ups" onClose={() => setOpenFollowLeadId(null)}>
          {!fupRows.length ? (
            <div className="text-sm text-gray-500">No follow-ups.</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {fupRows.map(f => (
                <label key={f.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={fupSel.has(f.id)}
                    onChange={() => {
                      setFupSel(prev => {
                        const s = new Set(prev);
                        if (s.has(f.id)) s.delete(f.id); else s.add(f.id);
                        return s;
                      });
                    }}
                  />
                  <div className="text-sm">
                    <div className="text-[11px] text-gray-500">
                      {new Date(f.created_at).toLocaleString()}
                      {f.due_on ? ` • Next: ${new Date(f.due_on).toLocaleString()}` : ''}
                    </div>
                    <div>Outcome: <b>{f.outcome}</b></div>
                    {f.notes && <div>{f.notes}</div>}
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <button className="px-3 py-1.5 text-sm border rounded bg-white" onClick={() => setOpenFollowLeadId(null)}>Close</button>
            <button className="px-3 py-1.5 text-sm rounded bg-black text-white"
                    onClick={deleteSelectedFollowups}
                    disabled={!fupSel.size}>
              Delete Selected
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="border rounded p-4 bg-white">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-lg border bg-white shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm font-medium">{title}</div>
          <button onClick={onClose} className="text-xs underline">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}