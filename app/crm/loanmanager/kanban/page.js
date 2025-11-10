// app/crm/loanmanager/kanban/page.js
'use client';
import { useEffect, useState } from 'react';
import { DndContext, PointerSensor, useSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '../../../../lib/supabase';
import StageBadge from '../../../../components/crm/StageBadge.js';

const STAGES = [
  { key: 'new', label: 'New' },
  { key: 'lod_shared', label: 'LOD Shared' },
  { key: 'docs_received', label: 'Docs Received' },
  { key: 'logged_in', label: 'Logged In' },
  { key: 'sanctioned', label: 'Sanctioned' },
  { key: 'pf_paid', label: 'PF Paid' },
  { key: 'disbursed', label: 'Disbursed' },
  { key: 'deferred', label: 'Deferred' },
  { key: 'lost', label: 'Lost' },
];

export default function Kanban(){
  const [cols, setCols] = useState({});
  const sensor = useSensor(PointerSensor);

  useEffect(()=>{ (async()=>{
    const init = {}; STAGES.forEach(s=>init[s.key]=[]);
    const { data } = await supabase.from('leads').select('*');
    (data||[]).forEach((r)=> {
      const s = r.stage || 'new';
      (init[s] ||= []).push(r);
    });
    setCols(init);
  })(); }, []);

  const onDragEnd = async (event) => {
    const { active, over } = event; if (!over) return;
    const [from, id] = (active?.id||'').split(':'); const to = over.id;
    if (!id || from === to) return;
    const card = (cols[from]||[]).find((x)=>x.id===id); if (!card) return;

    await supabase.from('leads').update({ stage: to }).eq('id', id);
    await supabase.from('lead_stage_history').insert({ lead_id:id, from_stage:from, to_stage:to });

    setCols(prev=>{
      const next = { ...prev };
      next[from] = (next[from]||[]).filter((x)=>x.id!==id);
      next[to] = [card, ...(next[to]||[])];
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <DndContext sensors={[sensor]} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {STAGES.map(({ key, label }) => (
          <div key={key} id={key} className="bg-white border border-gray-300 rounded-xl p-2 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase text-gray-600">{label}</div>
              <span className="text-xs text-gray-400">{(cols[key]||[]).length||0}</span>
            </div>
            <SortableContext items={(cols[key]||[]).map((r)=>`${key}:${r.id}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 min-h-24">
                {(cols[key]||[]).map((r)=> (
                  <div key={r.id} id={`${key}:${r.id}`} className="border rounded-lg p-2 text-sm bg-white hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium leading-tight">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.phone || '-'} • {r.source || '-'}</div>
                      </div>
                      <StageBadge stage={r.stage} />
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </DndContext>
    </div>
  );
}