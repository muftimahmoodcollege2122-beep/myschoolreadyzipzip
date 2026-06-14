'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Topbar } from '../../../../components/layout/topbar';

const CORE_FIELDS = [
  { key: 'appName',          label: 'App / Platform Name',      placeholder: 'MySchool' },
  { key: 'studentLabel',     label: 'Student (singular)',        placeholder: 'Student' },
  { key: 'teacherLabel',     label: 'Teacher (singular)',        placeholder: 'Teacher' },
  { key: 'parentLabel',      label: 'Parent (singular)',         placeholder: 'Parent' },
  { key: 'classLabel',       label: 'Class (singular)',          placeholder: 'Class' },
  { key: 'sectionLabel',     label: 'Section (singular)',        placeholder: 'Section' },
  { key: 'feeLabel',         label: 'Fee / Finance label',       placeholder: 'Fee' },
  { key: 'attendanceLabel',  label: 'Attendance label',          placeholder: 'Attendance' },
  { key: 'gradesLabel',      label: 'Grades label',              placeholder: 'Grades' },
  { key: 'admissionsLabel',  label: 'Admissions label',          placeholder: 'Admissions' },
];

export default function LabelsPage() {
  const qc = useQueryClient();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['label-overrides'],
    queryFn: () => apiClient.get('/themes/labels'),
    staleTime: 60000,
  });

  useEffect(() => {
    if (!data) return;
    const d = data as any;
    const { custom: c = {}, ...rest } = d;
    setLabels(rest);
    setCustom(c);
  }, [data]);

  const mut = useMutation({
    mutationFn: (payload: any) => apiClient.put('/themes/labels', payload),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: ['label-overrides'] }); },
  });

  const save = () => mut.mutate({ ...labels, custom });

  const addCustom = () => {
    if (!customKey.trim()) return;
    setCustom(p => ({ ...p, [customKey.trim()]: customVal }));
    setCustomKey(''); setCustomVal('');
  };

  const removeCustom = (k: string) => setCustom(p => { const n = { ...p }; delete n[k]; return n; });

  return (
    <>
      <Topbar title="Label Overrides" subtitle="Rename default system labels for your school" />
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Label Overrides</h1>
            <p className="text-gray-500 text-sm mt-1">Rename default labels — e.g. call "Student" → "Learner" or "Class" → "Grade"</p>
          </div>
          <button onClick={save}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">
            {mut.isPending ? 'Saving…' : saved ? '✅ Saved!' : 'Save Labels'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Core Labels</h3>
          {isLoading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {CORE_FIELDS.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{f.label}</label>
                  <input value={labels[f.key] || ''} placeholder={f.placeholder}
                    onChange={e => setLabels(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-1">Custom Labels</h3>
          <p className="text-sm text-gray-400 mb-4">Add any additional label overrides specific to your school</p>

          <div className="flex gap-3 mb-4">
            <input value={customKey} onChange={e => setCustomKey(e.target.value)}
              placeholder="Label key (e.g. libraryLabel)"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input value={customVal} onChange={e => setCustomVal(e.target.value)}
              placeholder="Value (e.g. Resource Center)"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button onClick={addCustom}
              className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800">Add</button>
          </div>

          {Object.keys(custom).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No custom labels added yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(custom).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                  <span className="font-mono text-xs text-gray-500 w-40 flex-shrink-0">{k}</span>
                  <input value={v} onChange={e => setCustom(p => ({ ...p, [k]: e.target.value }))}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button onClick={() => removeCustom(k)}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center text-xs transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
