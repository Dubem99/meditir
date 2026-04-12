'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import type { NoteChatMessage } from '@/types/entities.types';

interface Props {
  sessionId: string;
  readOnly?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Summarize this visit in 3 bullet points',
  'What are the key differentials I should rule out?',
  'How does this compare to the last visit?',
  'Are there any drug interactions I should worry about?',
  'What red-flag symptoms should trigger a return visit?',
];

// Lightweight markdown renderer for assistant responses (trusted Claude output)
const renderMarkdown = (md: string): string => {
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
    if (/^#{1,3}\s+/.test(line)) {
      flushList();
      out.push(
        `<p class="text-xs font-semibold uppercase tracking-wider text-gray-600 mt-3 mb-1">${line.replace(/^#{1,3}\s+/, '')}</p>`
      );
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul class="list-disc pl-4 space-y-1 my-1">');
        inList = true;
      }
      out.push(
        `<li>${line.replace(/^[-*]\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs">$1</code>')}</li>`
      );
    } else if (line.length === 0) {
      flushList();
      out.push('<br />');
    } else {
      flushList();
      out.push(
        `<p class="my-1">${line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs">$1</code>')}</p>`
      );
    }
  }
  flushList();
  return out.join('');
};

export const NoteChatPanel = ({ sessionId, readOnly }: Props) => {
  const [messages, setMessages] = useState<NoteChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/note-chat/session/${sessionId}`)
      .then((res) => {
        if (!cancelled) setMessages(res.data.data || []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        const status = e?.response?.status;
        const msg = e?.response?.data?.message || e?.message || 'Unknown error';
        setError(
          status === 404
            ? 'Chat endpoint not found — the server may still be deploying.'
            : `Failed to load chat history (${status ?? 'network'}): ${msg}`
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    setSending(true);

    // Optimistic user message
    const optimisticUser: NoteChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'USER',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setInput('');

    try {
      const res = await api.post(`/note-chat/session/${sessionId}`, { message: trimmed });
      const { userMessage, assistantMessage } = res.data.data as {
        userMessage: NoteChatMessage;
        assistantMessage: NoteChatMessage;
      };
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== optimisticUser.id);
        return [...withoutTemp, userMessage, assistantMessage];
      });
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const msg = e?.response?.data?.message || e?.message || 'Failed to send message';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    if (!confirm('Clear this chat history? This cannot be undone.')) return;
    try {
      await api.delete(`/note-chat/session/${sessionId}`);
      setMessages([]);
    } catch {
      setError('Failed to clear chat');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Chat with this note</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Ask questions about this visit, compare to previous ones, or explore clinical reasoning.
          </p>
        </div>
        {messages.length > 0 && !readOnly && (
          <button
            onClick={clearChat}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-200 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Ask anything about this visit</p>
            <p className="text-xs text-gray-400 max-w-sm">
              The chat has access to this session&apos;s note, transcript, and the patient&apos;s last 5 finalized visits.
            </p>
            {!readOnly && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    disabled={sending}
                    className="text-xs bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-600 hover:text-primary-700 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'USER'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {m.role === 'USER' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <div
                      className="leading-relaxed [&_p]:my-1 [&_ul]:my-1"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                    />
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      {!readOnly && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a question about this note…"
              rows={1}
              disabled={sending}
              className="flex-1 resize-none px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 disabled:opacity-50 max-h-32"
              style={{ minHeight: '42px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              className="shrink-0 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors h-[42px]"
            >
              Send
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
};
