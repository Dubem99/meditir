'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AdditionalNote {
  id: string;
  text: string;
  createdAt: string;
}

interface Props {
  sessionId: string;
  onCountChange?: (count: number) => void;
}

const MAX_LENGTH = 5000;

export const AdditionalNotesPanel = ({ sessionId, onCountChange }: Props) => {
  const [notes, setNotes] = useState<AdditionalNote[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/additional-notes/session/${sessionId}`)
      .then((r) => {
        if (cancelled) return;
        const list: AdditionalNote[] = r.data.data ?? [];
        setNotes(list);
        onCountChange?.(list.length);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load notes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, onCountChange]);

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Note cannot be empty');
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Notes are capped at ${MAX_LENGTH} characters`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const r = await api.post(`/additional-notes/session/${sessionId}`, { text: trimmed });
      const next = [...notes, r.data.data as AdditionalNote];
      setNotes(next);
      onCountChange?.(next.length);
      setDraft('');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (noteId: string) => {
    setDeletingId(noteId);
    setError(null);
    try {
      await api.delete(`/additional-notes/${noteId}`);
      const next = notes.filter((n) => n.id !== noteId);
      setNotes(next);
      onCountChange?.(next.length);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const charCount = draft.length;
  const overLimit = charCount > MAX_LENGTH;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Doctor&apos;s notes</span>
        <span className="text-xs text-gray-400">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <p className="text-xs text-gray-500 mb-3">
          Add context that isn&apos;t in the audio — observations, things mentioned offhand,
          relevant history. These are fed into the SOAP note when you generate it.
        </p>

        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
          }}
          placeholder="e.g. Patient seemed anxious. Mentioned father has T2DM."
          className="w-full text-sm text-gray-800 leading-relaxed bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 resize-y min-h-[80px]"
          rows={3}
        />

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <button
            onClick={save}
            disabled={saving || !draft.trim() || overLimit}
            className="text-xs font-medium px-4 py-1.5 rounded-full bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white transition-colors"
          >
            {saving ? 'Saving…' : 'Save note'}
          </button>
          {draft && (
            <button
              onClick={() => {
                setDraft('');
                setError(null);
              }}
              disabled={saving}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
          <span
            className={[
              'text-[11px] ml-auto',
              overLimit ? 'text-red-600 font-semibold' : 'text-gray-400',
            ].join(' ')}
          >
            {charCount}/{MAX_LENGTH}
          </span>
        </div>

        <span className="hidden sm:block text-[10px] text-gray-300 mt-1">
          ⌘/Ctrl+Enter to save
        </span>

        {error && <p className="text-[11px] text-red-600 mt-2">{error}</p>}
      </div>

      {(loading || notes.length > 0) && (
        <div className="border-t border-gray-100 px-3 sm:px-4 py-3 max-h-[260px] overflow-y-auto">
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading notes…</p>
          ) : (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="group flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <p className="text-sm text-gray-800 leading-relaxed flex-1 whitespace-pre-wrap break-words">
                    {note.text}
                  </p>
                  <button
                    onClick={() => remove(note.id)}
                    disabled={deletingId === note.id}
                    aria-label="Delete note"
                    title="Delete note"
                    className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity shrink-0 disabled:opacity-100 disabled:cursor-wait"
                  >
                    {deletingId === note.id ? (
                      <span className="text-[10px]">…</span>
                    ) : (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
