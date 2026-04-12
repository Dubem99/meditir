'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import type { PatientSummary, SummaryLanguage, DeliveryChannel, SendSummaryResult } from '@/types/entities.types';

interface Props {
  soapNoteId: string;
  sessionId: string;
  readOnly?: boolean;
}

const LANGUAGES: { value: SummaryLanguage; label: string }[] = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'PIDGIN', label: 'Pidgin' },
  { value: 'YORUBA', label: 'Yoruba' },
  { value: 'HAUSA', label: 'Hausa' },
  { value: 'IGBO', label: 'Igbo' },
];

const renderMarkdown = (md: string): string => {
  // Lightweight client-side markdown → HTML. Input is trusted Claude output.
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = escape(md).split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line)) {
      flushList();
      out.push(`<h3 class="text-sm font-semibold text-gray-900 mt-5 mb-2">${line.replace(/^##\s+/, '')}</h3>`);
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul class="list-disc pl-5 space-y-1 text-sm text-gray-700">');
        inList = true;
      }
      out.push(`<li>${line.replace(/^[-*]\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`);
    } else if (line.length === 0) {
      flushList();
    } else {
      flushList();
      out.push(`<p class="text-sm text-gray-700 leading-relaxed my-2">${line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`);
    }
  }
  flushList();
  return out.join('\n');
};

export const PatientSummaryPanel = ({ soapNoteId, sessionId, readOnly }: Props) => {
  const [summaries, setSummaries] = useState<PatientSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState<DeliveryChannel | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState('');
  const [language, setLanguage] = useState<SummaryLanguage>('ENGLISH');
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/patient-summaries/session/${sessionId}`)
      .then((res) => {
        if (cancelled) return;
        const data: PatientSummary[] = res.data.data || [];
        setSummaries(data);
        if (data.length > 0) setActiveId(data[0].id);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        const status = e?.response?.status;
        const msg = e?.response?.data?.message || e?.message || 'Unknown error';
        setLoadError(
          status === 404
            ? 'Patient summary endpoint not found — the server may still be deploying. Please try again in a minute.'
            : `Failed to load summaries (${status ?? 'network'}): ${msg}`
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const active = summaries.find((s) => s.id === activeId) || null;

  const flashToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const generate = async () => {
    setGenerating(true);
    setLoadError(null);
    try {
      const res = await api.post('/patient-summaries/generate', { soapNoteId, language });
      const created: PatientSummary = res.data.data;
      setSummaries((prev) => [created, ...prev]);
      setActiveId(created.id);
      setEditMode(false);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || 'Unknown error';
      const detail =
        status === 404
          ? 'Patient summary endpoint not found — the server may still be deploying.'
          : `Generate failed (${status ?? 'network'}): ${msg}`;
      setLoadError(detail);
      flashToast(detail);
    } finally {
      setGenerating(false);
    }
  };

  const startEdit = () => {
    if (!active) return;
    setDraft(active.content);
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!active) return;
    try {
      const res = await api.patch(`/patient-summaries/${active.id}`, { content: draft });
      setSummaries((prev) => prev.map((s) => (s.id === active.id ? res.data.data : s)));
      setEditMode(false);
      flashToast('Saved');
    } catch {
      flashToast('Save failed');
    }
  };

  const sendVia = async (channel: DeliveryChannel) => {
    if (!active) return;
    setSending(channel);
    try {
      const res = await api.post(`/patient-summaries/${active.id}/send`, { channels: [channel] });
      const data: SendSummaryResult = res.data.data;
      setSummaries((prev) => prev.map((s) => (s.id === active.id ? data.summary : s)));

      const result = data.results[channel];
      if (!result) {
        flashToast('No result from server');
      } else if (!result.ok) {
        flashToast(result.detail || `${channel} failed`);
      } else if (channel === 'WHATSAPP' && result.link) {
        window.open(result.link, '_blank', 'noopener');
      } else if (channel === 'EMAIL') {
        flashToast('Email sent');
      } else if (channel === 'PRINT') {
        window.print();
      }
    } catch {
      flashToast(`${channel} failed`);
    } finally {
      setSending(null);
    }
  };

  const copyToClipboard = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.content);
    flashToast('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Something went wrong</p>
          <p className="text-xs text-red-700">{loadError}</p>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Patient After-Visit Summary</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Plain-language summary for the patient. Generate in any supported language.
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2 print:hidden">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SummaryLanguage)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={generate}
              disabled={generating}
              className="text-xs bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              {generating ? 'Generating…' : summaries.length > 0 ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        )}
      </div>

      {/* Existing summaries tabs (if multiple languages generated) */}
      {summaries.length > 1 && (
        <div className="flex flex-wrap gap-1.5 print:hidden">
          {summaries.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveId(s.id);
                setEditMode(false);
              }}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                s.id === activeId
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {LANGUAGES.find((l) => l.value === s.language)?.label ?? s.language}
              {s.edited && <span className="ml-1 text-[10px] opacity-60">edited</span>}
            </button>
          ))}
        </div>
      )}

      {!active ? (
        <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
          <svg className="h-10 w-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-400">No summary generated yet.</p>
          <p className="text-xs text-gray-400 mt-1">Select a language and click Generate.</p>
        </div>
      ) : editMode ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={18}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-200 resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-h-[500px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(active.content) }}
          />

          {active.sentVia.length > 0 && (
            <p className="text-xs text-gray-400">
              Sent via {active.sentVia.join(', ')}
              {active.sentAt && ` · ${new Date(active.sentAt).toLocaleString()}`}
            </p>
          )}

          {!readOnly && (
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                onClick={() => sendVia('EMAIL')}
                disabled={sending !== null}
                className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {sending === 'EMAIL' ? 'Sending…' : 'Email to patient'}
              </button>
              <button
                onClick={() => sendVia('WHATSAPP')}
                disabled={sending !== null}
                className="flex items-center gap-1.5 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {sending === 'WHATSAPP' ? 'Opening…' : 'Send via WhatsApp'}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => sendVia('PRINT')}
                className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Print
              </button>
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto"
              >
                Edit
              </button>
            </div>
          )}
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 print:hidden">
          {toast}
        </div>
      )}
    </div>
  );
};
