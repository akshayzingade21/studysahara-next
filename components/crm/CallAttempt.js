// components/crm/CallAttempt.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

const OUTCOMES = [
  { v: 'connected',      label: 'Connected' },
  { v: 'rnr',            label: 'RNR' },
  { v: 'switched_off',   label: 'Switched Off' },
  { v: 'not_reachable',  label: 'Not Reachable' },
  { v: 'wrong_number',   label: 'Wrong Number' },
  { v: 'not_interested', label: 'Not Interested' },
  { v: 'success',        label: 'Success' }, // terminal
];

const TERMINAL_OUTCOMES = new Set(['success', 'wrong_number', 'not_interested']);

export default function CallAttempt({ lead, onSaved }) {
  const [outcome, setOutcome] = useState('connected');
  const [notes, setNotes]   = useState('');
  const [when, setWhen]     = useState('');
  const [banner, setBanner] = useState('');

  useEffect(() => {
    setOutcome('connected');
    setNotes('');
    setWhen('');
    setBanner('');
  }, [lead?.id]);

  const leadPhone = lead?.phone || '';
  const leadEmail = lead?.email || '';

  const whatsappText = useMemo(() => {
    const l1 = `Hi ${lead?.name || 'there'}, this is StudySahara regarding your education loan.`;
    const l2 = `Let me know a convenient time to speak.`;
    return encodeURIComponent(`${l1}\n${l2}`);
  }, [lead?.name]);

  const emailSubject = useMemo(
    () => encodeURIComponent('StudySahara – Education Loan Assistance'),
    []
  );

  const emailBody = useMemo(() => {
    const body = `Hi ${lead?.name || ''},

Thanks for speaking with StudySahara. I’m sharing this note to continue our conversation on your education loan.

Please reply with a good time to connect, and any documents you’re ready to share.

Best regards,
StudySahara Loan Desk`;
    return encodeURIComponent(body);
  }, [lead?.name]);

  const openWhatsApp = () => {
    if (!leadPhone) return alert('No phone number on this lead.');
    const url = `https://wa.me/${leadPhone.replace(/\D/g, '')}?text=${whatsappText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openEmail = () => {
    if (!leadEmail) return alert('No email on this lead.');
    const url = `mailto:${leadEmail}?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = url;
  };

  const setQuickDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(10, 0, 0, 0);
    const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setWhen(isoLocal);
  };

  const saveAttempt = async () => {
    try {
      setBanner('');

      // Overwrite any pending followups
      const { error: delErr } = await supabase
        .from('followups')
        .delete()
        .eq('lead_id', lead.id);
      if (delErr) throw delErr;

      if (TERMINAL_OUTCOMES.has(outcome)) {
        // Add a note for audit
        const label = OUTCOMES.find(o => o.v === outcome)?.label || outcome;
        const body = `[${label}] ${notes?.trim() || ''}`.trim();
        if (body) {
          const { error: noteErr } = await supabase
            .from('notes')
            .insert({ lead_id: lead.id, body });
          if (noteErr) throw noteErr;
        }

        // ✅ FIXED: removed extra ')'
        if (outcome === 'wrong_number' || outcome === 'not_interested') {
          const { error: updErr } = await supabase
            .from('leads')
            .update({ stage: 'lost' })
            .eq('id', lead.id);
          if (updErr) throw updErr;
          setBanner('Lead marked as Lost.');
        } else if (outcome === 'success') {
          const { error: updErr2 } = await supabase
            .from('leads')
            .update({ stage: 'success' })
            .eq('id', lead.id);
          if (updErr2) throw updErr2;
          setBanner('Lead marked as Success.');
        }

        setNotes('');
        setWhen('');
        onSaved?.();
        return;
      }

      // Non-terminal → require a next follow-up time
      if (!when) {
        alert('Please select Next Follow-up date/time.');
        return;
      }

      const due = new Date(when);
      const payload = {
        lead_id: lead.id,
        due_on: due.toISOString(),
        outcome,
        notes: notes?.trim() || null,
      };

      const { error } = await supabase.from('followups').insert(payload);
      if (error) throw error;

      setNotes('');
      setWhen('');
      setBanner('Follow-up scheduled.');
      onSaved?.();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Could not save call attempt.');
    }
  };

  const isTerminal = TERMINAL_OUTCOMES.has(outcome);

  return (
    <div className="bg-white border rounded p-4 space-y-3">
      <div className="font-medium">Call Attempt</div>

      {!!banner && (
        <div className="text-xs border rounded px-3 py-2 bg-emerald-50 border-emerald-200 text-emerald-700">
          {banner}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {OUTCOMES.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setOutcome(o.v)}
            className={`px-2.5 py-1.5 text-xs rounded border ${
              outcome === o.v
                ? 'bg-gray-900 text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
            aria-pressed={outcome === o.v}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Add call notes (what was discussed, documents promised, etc.)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openWhatsApp}
          className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
          title="Send a WhatsApp message"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={openEmail}
          className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
          title="Send an email"
        >
          Email
        </button>
      </div>

      {!isTerminal && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Next follow-up</div>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              className="px-3 py-2 text-sm border rounded"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="text-xs underline"
                onClick={() => setQuickDate(1)}
              >
                Tomorrow
              </button>
              <span className="text-gray-400 text-xs">•</span>
              <button
                type="button"
                className="text-xs underline"
                onClick={() => setQuickDate(2)}
              >
                Day after
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={saveAttempt}
          disabled={!isTerminal && !when}
          className="px-3 py-2 text-sm rounded bg-black text-white disabled:opacity-60"
        >
          {isTerminal ? 'Close Lead' : 'Schedule'}
        </button>
      </div>
    </div>
  );
}