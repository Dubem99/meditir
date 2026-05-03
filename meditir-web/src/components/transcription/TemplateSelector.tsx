'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { NoteTemplate } from '@/types/entities.types';

interface Props {
  sessionId: string;
  value: string | null | undefined;
  onChange: (templateId: string) => void;
  disabled?: boolean;
}

export const TemplateSelector = ({ sessionId, value, onChange, disabled }: Props) => {
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/sessions/templates')
      .then((r) => setTemplates(r.data.data ?? []))
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (templateId: string) => {
    if (disabled || saving) return;
    if (templateId === value) return;
    setSaving(templateId);
    setError(null);
    try {
      await api.patch(`/sessions/${sessionId}/template`, { templateId });
      onChange(templateId);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to set template');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Note template</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Pick the format Meditir should use when generating this visit&apos;s note.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading templates…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {templates.map((t) => {
            const active = value === t.id;
            const isSaving = saving === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                disabled={disabled || isSaving}
                className={[
                  'flex items-start gap-3 text-left p-3 rounded-xl border transition-colors',
                  active
                    ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-200'
                    : 'bg-white border-gray-200 hover:border-gray-300',
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <span className="text-xl shrink-0 mt-0.5" aria-hidden>
                  {t.emoji ?? '📝'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={[
                        'text-sm font-medium',
                        active ? 'text-primary-900' : 'text-gray-900',
                      ].join(' ')}
                    >
                      {t.name}
                    </p>
                    {active && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-700 bg-primary-100 rounded-full px-1.5 py-0.5">
                        Active
                      </span>
                    )}
                    {isSaving && (
                      <span className="text-[10px] text-gray-400">saving…</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
