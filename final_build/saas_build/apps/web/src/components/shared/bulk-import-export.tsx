'use client';
import React, { useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Modal } from './modal';

interface ImportResult {
  successCount: number;
  failedCount: number;
  errors: { row: number; message: string }[];
}

interface Props {
  /** e.g. 'students', 'teachers', 'fees' — matches the API route prefix */
  entity: string;
  /** Human label used in buttons/messages, e.g. 'Students' */
  label: string;
  onImported: () => void; // called after a successful import so the page can refetch its list
}

export function BulkImportExport({ entity, label, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadTemplate = async () => {
    try {
      await apiClient.download(`/${entity}/bulk-import/template`, `${entity}-import-template.xlsx`);
    } catch {
      setError('Could not download template. Please try again.');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      await apiClient.download(`/${entity}/export/excel`, `${entity}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const res = await apiClient.upload<ImportResult>(`/${entity}/bulk-import`, file);
      setResult(res);
      setShowResult(true);
      if (res.successCount > 0) onImported();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Import failed. Please check your file matches the template and try again.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChosen} />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 flex items-center gap-1.5"
      >
        {importing ? 'Importing…' : `📥 Import ${label}`}
      </button>
      <button onClick={handleDownloadTemplate} className="px-3 py-2 text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50">
        Download template
      </button>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
      >
        {exporting ? 'Exporting…' : `📤 Export ${label}`}
      </button>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}

      {showResult && result && (
        <Modal isOpen={showResult} onClose={() => setShowResult(false)} title="Import Results">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-green-700">{result.successCount}</p>
                <p className="text-xs text-green-600 font-medium">Imported successfully</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-red-600">{result.failedCount}</p>
                <p className="text-xs text-red-500 font-medium">Failed rows</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                {result.errors.map((e, i) => (
                  <div key={i} className="px-3 py-2 text-xs flex gap-2">
                    <span className="font-bold text-gray-400 shrink-0">Row {e.row}</span>
                    <span className="text-red-600">{e.message}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowResult(false)} className="w-full py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold">
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
