'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { SOAPNote } from '@/types/entities.types';

interface Props {
  note: SOAPNote;
  showActions?: boolean;
  onFinalize?: () => void;
}

const SECTIONS = [
  { key: 'subjective', label: 'S — Subjective', description: 'Patient-reported symptoms & history' },
  { key: 'objective', label: 'O — Objective', description: 'Clinical findings & observations' },
  { key: 'assessment', label: 'A — Assessment', description: 'Diagnosis & clinical impression' },
  { key: 'plan', label: 'P — Plan', description: 'Treatment & follow-up plan' },
] as const;

type TransferState = 'idle' | 'transferring' | 'sent' | 'error';

export const SOAPNoteCard = ({ note, showActions, onFinalize }: Props) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [values, setValues] = useState({
    subjective: note.subjective,
    objective: note.objective,
    assessment: note.assessment,
    plan: note.plan,
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transferState, setTransferState] = useState<TransferState>('idle');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<string | null>(null);

  const handleTransfer = async () => {
    setTransferState('transferring');
    setTransferError(null);
    try {
      const res = await api.post(`/soap-notes/${note.id}/transfer`);
      setTransferTarget(res.data.data?.transferredTo ?? null);
      setTransferState('sent');
      setTimeout(() => setTransferState('idle'), 4000);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setTransferError(e?.response?.data?.message || e?.message || 'Transfer failed');
      setTransferState('error');
      setTimeout(() => setTransferState('idle'), 6000);
    }
  };

  const handleDownloadPdf = () => {
    // Browser's "Save as PDF" via the print dialog — the print stylesheet
    // already hides action buttons via `print:hidden` on the relevant elements.
    if (typeof window !== 'undefined') window.print();
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      await api.patch(`/soap-notes/${note.id}`, { [key]: values[key as keyof typeof values] });
    } finally {
      setSaving(false);
      setEditing(null);
    }
  };

  const handleCopyAll = () => {
    const text = SECTIONS.map(
      (s) => `${s.label}\n${values[s.key]}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Clinical Note</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-generated · {new Date(note.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
            {note.doctorSignedAt && ' · Signed'}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy all
              </>
            )}
          </button>
          {note.status !== 'FINALIZED' && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              Draft
            </span>
          )}
          {note.status === 'FINALIZED' && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              Finalized
            </span>
          )}
        </div>
      </div>

      {/* SOAP Sections */}
      {SECTIONS.map(({ key, label, description }) => (
        <div key={key} className="bg-gray-50 rounded-xl p-5 group">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            {showActions && note.status !== 'FINALIZED' && editing !== key && (
              <button
                onClick={() => setEditing(key)}
                className="text-xs text-primary-600 hover:text-primary-800 opacity-0 group-hover:opacity-100 transition-opacity font-medium print:hidden"
              >
                Edit
              </button>
            )}
          </div>

          {editing === key ? (
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full text-sm text-gray-800 bg-white border border-primary-300 rounded-lg p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                rows={5}
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditing(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(key)}
                  disabled={saving}
                  className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {values[key] || <span className="text-gray-400 italic">No data</span>}
            </p>
          )}
        </div>
      ))}

      {/* Finalize */}
      {showActions && note.status !== 'FINALIZED' && onFinalize && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 print:hidden">
          <p className="text-sm text-gray-500">Review the note above before signing.</p>
          <button
            onClick={onFinalize}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Finalize & Sign Note
          </button>
        </div>
      )}

      {note.status === 'FINALIZED' && note.doctorSignedAt && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Signed on {new Date(note.doctorSignedAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}
          </div>

          {showActions && (
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                onClick={handleTransfer}
                disabled={transferState === 'transferring' || transferState === 'sent'}
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  transferState === 'sent'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : transferState === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60',
                ].join(' ')}
              >
                {transferState === 'transferring' && (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Transferring note…
                  </>
                )}
                {transferState === 'sent' && (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {transferTarget ? `Sent to ${transferTarget}` : 'Sent to records'}
                  </>
                )}
                {transferState === 'error' && (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
                    </svg>
                    Transfer failed — retry
                  </>
                )}
                {transferState === 'idle' && (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Transfer to records
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 8l-4-4m4 4l4-4" />
                </svg>
                Download PDF
              </button>

              {transferState === 'error' && transferError && (
                <p className="w-full text-xs text-red-600 mt-1">{transferError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
