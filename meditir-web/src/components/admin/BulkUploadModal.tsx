'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type EntityType = 'patients' | 'doctors';

interface BulkRowResult {
  row: number;
  email: string;
  status: 'success' | 'error';
  id?: string;
  error?: string;
  generatedPassword?: string;
}

interface BulkResult {
  totalRows: number;
  successful: number;
  failed: number;
  results: BulkRowResult[];
}

interface Props {
  entity: EntityType;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TEMPLATES: Record<EntityType, { columns: string[]; example: string[] }> = {
  patients: {
    columns: [
      'firstName',
      'lastName',
      'email',
      'password',
      'medicalRecordNo',
      'phone',
      'dateOfBirth',
      'gender',
      'bloodGroup',
      'genotype',
      'address',
      'nextOfKin',
      'nextOfKinPhone',
      'allergies',
      'chronicConditions',
    ],
    example: [
      'Adaeze',
      'Okafor',
      'adaeze.okafor@example.com',
      '',
      'MRN-00123',
      '08012345678',
      '1985-04-12',
      'FEMALE',
      'O+',
      'AA',
      '12 Allen Avenue Ikeja',
      'Chinedu Okafor',
      '08087654321',
      'Penicillin;Peanuts',
      'Hypertension',
    ],
  },
  doctors: {
    columns: [
      'firstName',
      'lastName',
      'email',
      'password',
      'specialization',
      'licenseNumber',
      'phone',
      'gender',
      'bio',
      'preferredDialect',
    ],
    example: [
      'Tunde',
      'Bello',
      'tunde.bello@example.com',
      '',
      'General Practitioner',
      'MDCN-12345',
      '08023456789',
      'MALE',
      'GP with 8 years experience',
      'NIGERIAN_ENGLISH',
    ],
  },
};

const labelFor = (e: EntityType) => (e === 'patients' ? 'Patient' : 'Doctor');

export function BulkUploadModal({ entity, open, onClose, onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setRowCount(null);
      setResult(null);
      setError(null);
      setUploading(false);
    }
  }, [open]);

  if (!open) return null;

  const template = TEMPLATES[entity];

  const downloadTemplate = () => {
    const csv = `${template.columns.join(',')}\n${template.example.join(',')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick row count for the preview only — server is the source of truth.
  // Counts non-empty lines after the header; doesn't handle quoted newlines,
  // but that's an acceptable approximation for a "looks roughly right" check.
  const countRowsRoughly = async (f: File) => {
    const text = await f.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return Math.max(0, lines.length - 1);
  };

  const handleFileChange = async (f: File | null) => {
    setError(null);
    setResult(null);
    setFile(f);
    if (!f) {
      setRowCount(null);
      return;
    }
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('File must have a .csv extension');
      setFile(null);
      setRowCount(null);
      return;
    }
    try {
      const n = await countRowsRoughly(f);
      setRowCount(n);
    } catch {
      setRowCount(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/${entity}/bulk`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload = res.data?.data as BulkResult;
      setResult(payload);
      if (payload.successful > 0) onComplete();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Upload failed';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const failedRows = result?.results.filter((r) => r.status === 'error') ?? [];
  const successRows = result?.results.filter((r) => r.status === 'success') ?? [];
  const generated = successRows.filter((r) => r.generatedPassword);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Bulk upload {entity}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload a CSV with one {labelFor(entity).toLowerCase()} per row. Up to 1000 rows per file.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {!result && (
            <>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Need a starting point?</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Download a template with all supported columns and one example row.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                  Download template
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Required columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {(entity === 'patients'
                    ? ['firstName', 'lastName', 'email']
                    : ['firstName', 'lastName', 'email', 'specialization', 'licenseNumber']
                  ).map((c) => (
                    <span
                      key={c}
                      className="text-xs font-mono bg-primary-50 text-primary-700 px-2 py-1 rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave <span className="font-mono">password</span> blank to auto-generate a temporary one (it will be emailed to the recipient and shown to you in the result).
                  {entity === 'patients' && (
                    <>
                      {' '}For <span className="font-mono">allergies</span> and{' '}
                      <span className="font-mono">chronicConditions</span>, separate multiple values with a semicolon.
                    </>
                  )}
                </p>
              </div>

              <div>
                <label
                  htmlFor="bulk-csv-input"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50/40 rounded-xl py-8 cursor-pointer transition-colors"
                >
                  <svg
                    className="h-8 w-8 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">
                    {file ? file.name : 'Choose a CSV file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB${
                          rowCount !== null ? ` · ~${rowCount} row${rowCount === 1 ? '' : 's'}` : ''
                        }`
                      : '.csv up to 5 MB'}
                  </p>
                  <input
                    id="bulk-csv-input"
                    ref={inputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      handleFileChange(null);
                      if (inputRef.current) inputRef.current.value = '';
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </>
          )}

          {result && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.totalRows}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Rows processed</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{result.successful}</p>
                  <p className="text-xs text-emerald-700/70 mt-0.5">Created</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                  <p className="text-xs text-red-700/70 mt-0.5">Failed</p>
                </div>
              </div>

              {failedRows.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Failed rows</p>
                  <div className="border border-red-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-red-700">Row</th>
                          <th className="text-left px-3 py-2 font-semibold text-red-700">Email</th>
                          <th className="text-left px-3 py-2 font-semibold text-red-700">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {failedRows.map((r) => (
                          <tr key={r.row}>
                            <td className="px-3 py-2 font-mono text-gray-700">{r.row}</td>
                            <td className="px-3 py-2 text-gray-700">{r.email || <span className="text-gray-400">—</span>}</td>
                            <td className="px-3 py-2 text-red-700">{r.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {generated.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Auto-generated passwords ({generated.length})
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    These were also emailed to each {labelFor(entity).toLowerCase()}. Save this list — it won't be shown again.
                  </p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">Email</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">Temporary password</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {generated.map((r) => (
                          <tr key={r.row}>
                            <td className="px-3 py-2 text-gray-700">{r.email}</td>
                            <td className="px-3 py-2 font-mono text-gray-900">{r.generatedPassword}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          {!result ? (
            <>
              <Button variant="ghost" onClick={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} loading={uploading} disabled={!file || uploading}>
                Upload {rowCount !== null && rowCount > 0 ? `${rowCount} ${entity}` : entity}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Done</Button>
          )}
        </div>
      </div>
    </div>
  );
}
