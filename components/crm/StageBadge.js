// components/crm/StageBadge.js
'use client';

export const STAGES = [
  'new',
  'lod_shared',
  'docs_received',
  'logged_in',
  'sanctioned',
  'pf_paid',
  'disbursed',
  'deferred',
  'lost',
  'success', // ✅ NEW terminal stage
];

export const STAGE_LABEL = {
  new: 'New',
  lod_shared: 'LOD Shared',
  docs_received: 'Docs Received',
  logged_in: 'Logged In',
  sanctioned: 'Sanctioned',
  pf_paid: 'PF Paid',
  disbursed: 'Disbursed',
  deferred: 'Deferred',
  lost: 'Lost',
  success: 'Success', // ✅ label
};

const STAGE_STYLE = {
  new: 'bg-gray-100 text-gray-800',
  lod_shared: 'bg-indigo-100 text-indigo-800',
  docs_received: 'bg-blue-100 text-blue-800',
  logged_in: 'bg-amber-100 text-amber-800',
  sanctioned: 'bg-violet-100 text-violet-800',
  pf_paid: 'bg-sky-100 text-sky-800',
  disbursed: 'bg-emerald-100 text-emerald-800',
  deferred: 'bg-yellow-100 text-yellow-800',
  lost: 'bg-rose-100 text-rose-800',
  success: 'bg-green-200 text-green-900', // ✅ color for success
};

export default function StageBadge({ stage }) {
  const label = STAGE_LABEL[stage] ?? STAGE_LABEL.new;
  const cls = STAGE_STYLE[stage] ?? STAGE_STYLE.new;
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}