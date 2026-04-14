'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { sendDirectMessage } from '@/hooks/usePresence';
import { useAuthStore } from '@/store/auth.store';
import { usePresenceStore } from '@/store/presence.store';
import { Spinner } from '@/components/ui/Spinner';
import { format, isToday, isYesterday } from 'date-fns';
import type { Colleague, ConversationSummary, DirectMessage, Patient, AttachedPatientSnapshot } from '@/types/entities.types';
import { differenceInYears } from 'date-fns';

const formatMessageTime = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
};

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const isOnline = usePresenceStore((s) => s.onlineUserIds);

  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Colleague | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Patient attachment state
  const [attachedPatient, setAttachedPatient] = useState<AttachedPatientSnapshot | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // Load colleagues + conversations on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get('/messages/colleagues'), api.get('/messages/conversations')])
      .then(([collRes, convRes]) => {
        if (cancelled) return;
        setColleagues(collRes.data.data || []);
        setConversations(convRes.data.data || []);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const conversationForColleague = useCallback(
    (colleagueId: string) => conversations.find((c) => c.otherUser.id === colleagueId) ?? null,
    [conversations]
  );

  const selectColleague = async (c: Colleague) => {
    setSelected(c);
    const conv = conversationForColleague(c.id);
    if (!conv) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/conversations/${conv.id}`);
      setMessages(res.data.data || []);
      // Mark as read
      if (conv.unreadCount > 0) {
        await api.post(`/messages/conversations/${conv.id}/read`);
        setConversations((prev) =>
          prev.map((p) => (p.id === conv.id ? { ...p, unreadCount: 0 } : p))
        );
        usePresenceStore.getState().setUnreadCount(
          Math.max(0, usePresenceStore.getState().unreadCount - conv.unreadCount)
        );
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  // Listen for inbound messages that belong to the currently open conversation
  useEffect(() => {
    const socket = getSocket();
    const handler = (msg: DirectMessage) => {
      const conv = selected ? conversationForColleague(selected.id) : null;
      if (conv && msg.conversationId === conv.id) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        // Auto-mark-read since the conversation is open
        api.post(`/messages/conversations/${conv.id}/read`).catch(() => {});
      } else {
        // Bump unread for other conversations
        setConversations((prev) =>
          prev.map((c) =>
            c.otherUser.id === msg.fromUserId
              ? { ...c, unreadCount: c.unreadCount + 1, lastMessage: msg, lastMessageAt: msg.createdAt }
              : c
          )
        );
      }
    };
    const sentHandler = (msg: DirectMessage) => {
      const conv = selected ? conversationForColleague(selected.id) : null;
      if (conv && msg.conversationId === conv.id) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
    };
    socket.on('dm:new', handler);
    socket.on('dm:sent', sentHandler);
    return () => {
      socket.off('dm:new', handler);
      socket.off('dm:sent', sentHandler);
    };
  }, [selected, conversationForColleague]);

  // Debounced patient search when picker is open
  useEffect(() => {
    if (!pickerOpen) return;
    let cancelled = false;
    setSearchingPatients(true);
    const t = setTimeout(() => {
      api.get(`/patients?limit=20${patientQuery ? `&search=${encodeURIComponent(patientQuery)}` : ''}`)
        .then((r) => {
          if (!cancelled) setPatientResults(r.data.data || []);
        })
        .finally(() => !cancelled && setSearchingPatients(false));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [pickerOpen, patientQuery]);

  const attachPatient = (p: Patient) => {
    setAttachedPatient({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      medicalRecordNo: p.medicalRecordNo ?? null,
      dateOfBirth: p.dateOfBirth ?? null,
      gender: p.gender ?? null,
      bloodGroup: p.bloodGroup ?? null,
      genotype: p.genotype ?? null,
      allergies: p.allergies ?? [],
      chronicConditions: p.chronicConditions ?? [],
    });
    setPickerOpen(false);
    setPatientQuery('');
  };

  const send = async () => {
    if (!selected || sending) return;
    const content = input.trim();
    if (!content && !attachedPatient) return;
    setSending(true);
    setInput('');
    const patientToAttach = attachedPatient;
    setAttachedPatient(null);
    try {
      const msg = await sendDirectMessage({
        toUserId: selected.id,
        content: content || (patientToAttach ? `Sharing patient: ${patientToAttach.firstName} ${patientToAttach.lastName}` : ''),
        attachedPatientId: patientToAttach?.id,
      });
      setMessages((prev) => [...prev, msg]);
      // Ensure conversation appears in the list
      setConversations((prev) => {
        const existing = prev.find((c) => c.otherUser.id === selected.id);
        if (existing) {
          return prev
            .map((c) =>
              c.id === existing.id
                ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                : c
            )
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        }
        return [
          {
            id: msg.conversationId,
            lastMessageAt: msg.createdAt,
            otherUser: selected,
            lastMessage: msg,
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    } catch {
      setInput(content);
      setAttachedPatient(patientToAttach);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-0.5">Chat with other doctors at your hospital</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Colleagues list */}
        <aside className={`md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Colleagues ({colleagues.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {colleagues.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10 px-4">
                No colleagues at your hospital yet.
              </p>
            ) : (
              colleagues.map((c) => {
                const conv = conversationForColleague(c.id);
                const online = isOnline.has(c.id);
                const isActive = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectColleague(c)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${
                      isActive ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {c.firstName[0]}
                        {c.lastName[0]}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          online ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.role === 'DOCTOR' ? `Dr. ${c.firstName} ${c.lastName}` : `${c.firstName} ${c.lastName}`}
                        </p>
                        {conv && conv.unreadCount > 0 && (
                          <span className="shrink-0 text-[10px] font-semibold bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv?.lastMessage?.content ?? (c.specialization || 'Tap to send a message')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat panel */}
        <main className={`flex-1 flex flex-col min-w-0 ${selected ? 'flex' : 'hidden md:flex'}`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Pick a colleague to start chatting</p>
                <p className="text-xs text-gray-400 mt-1">Green dots show who&apos;s online right now</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                <button
                  onClick={() => setSelected(null)}
                  className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  aria-label="Back"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                    {selected.firstName[0]}
                    {selected.lastName[0]}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isOnline.has(selected.id) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selected.role === 'DOCTOR'
                      ? `Dr. ${selected.firstName} ${selected.lastName}`
                      : `${selected.firstName} ${selected.lastName}`}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {isOnline.has(selected.id) ? (
                      <span className="text-green-600">● Online</span>
                    ) : (
                      selected.specialization ?? 'Offline'
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-8">
                    <p className="text-sm text-gray-400">
                      No messages yet. Say hi to{' '}
                      {selected.role === 'DOCTOR' ? `Dr. ${selected.lastName}` : selected.firstName}.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.fromUserId === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMine
                              ? 'bg-primary-600 text-white rounded-br-sm'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed break-words">{m.content}</p>
                          {m.attachedPatient && (
                            <PatientAttachmentCard patient={m.attachedPatient} isMine={isMine} />
                          )}
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? 'text-primary-100/80' : 'text-gray-400'
                            }`}
                          >
                            {formatMessageTime(m.createdAt)}
                            {isMine && m.readAt && ' · Read'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 bg-white">
                {attachedPatient && (
                  <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-100 rounded-xl">
                    <svg className="h-4 w-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary-900 truncate">
                        {attachedPatient.firstName} {attachedPatient.lastName}
                      </p>
                      <p className="text-[10px] text-primary-700 truncate">
                        {attachedPatient.medicalRecordNo ? `MRN ${attachedPatient.medicalRecordNo}` : 'No MRN'}
                        {attachedPatient.bloodGroup && ` · ${attachedPatient.bloodGroup}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setAttachedPatient(null)}
                      className="shrink-0 text-primary-500 hover:text-primary-700 p-1"
                      aria-label="Remove attachment"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => setPickerOpen(true)}
                    disabled={sending}
                    title="Attach patient"
                    aria-label="Attach patient"
                    className="shrink-0 h-[42px] w-[42px] flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors disabled:opacity-40"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={`Message ${selected.role === 'DOCTOR' ? `Dr. ${selected.lastName}` : selected.firstName}…`}
                    rows={1}
                    disabled={sending}
                    className="flex-1 resize-none px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 disabled:opacity-50 max-h-32"
                    style={{ minHeight: '42px' }}
                  />
                  <button
                    onClick={send}
                    disabled={sending || (!input.trim() && !attachedPatient)}
                    className="shrink-0 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors h-[42px]"
                  >
                    Send
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Enter to send · Shift+Enter for new line · Paperclip attaches a patient
                </p>
              </div>
            </>
          )}
        </main>
      </div>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-20"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Attach patient</h3>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                autoFocus
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Search by name or record number…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {searchingPatients ? (
                <div className="flex justify-center py-8"><Spinner size="sm" /></div>
              ) : patientResults.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No patients found.</p>
              ) : (
                patientResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => attachPatient(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.medicalRecordNo ? `MRN ${p.medicalRecordNo}` : 'No MRN'}
                        {p.bloodGroup && ` · ${p.bloodGroup}`}
                        {p.genotype && ` · ${p.genotype}`}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatientAttachmentCard({
  patient,
  isMine,
}: {
  patient: AttachedPatientSnapshot;
  isMine: boolean;
}) {
  const age = patient.dateOfBirth
    ? differenceInYears(new Date(), new Date(patient.dateOfBirth))
    : null;
  const containerClass = isMine
    ? 'bg-primary-700/40 border-primary-400/40'
    : 'bg-gray-50 border-gray-200';
  const labelClass = isMine ? 'text-primary-100/80' : 'text-gray-500';
  const valueClass = isMine ? 'text-white' : 'text-gray-800';
  const chipClass = isMine
    ? 'bg-white/20 text-white border-white/20'
    : 'bg-white text-gray-700 border-gray-200';

  return (
    <div className={`mt-2 rounded-xl border p-3 text-xs ${containerClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <svg className={`h-4 w-4 ${isMine ? 'text-white' : 'text-primary-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p className={`font-semibold ${valueClass}`}>
          {patient.firstName} {patient.lastName}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {patient.medicalRecordNo && (
          <div>
            <p className={labelClass}>MRN</p>
            <p className={`font-mono ${valueClass}`}>{patient.medicalRecordNo}</p>
          </div>
        )}
        {age !== null && (
          <div>
            <p className={labelClass}>Age</p>
            <p className={valueClass}>{age}y {patient.gender ? `· ${patient.gender.charAt(0)}` : ''}</p>
          </div>
        )}
        {patient.bloodGroup && (
          <div>
            <p className={labelClass}>Blood</p>
            <p className={valueClass}>{patient.bloodGroup}</p>
          </div>
        )}
        {patient.genotype && (
          <div>
            <p className={labelClass}>Genotype</p>
            <p className={valueClass}>{patient.genotype}</p>
          </div>
        )}
      </div>
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mt-2">
          <p className={labelClass}>Allergies</p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {patient.allergies.map((a, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded border ${chipClass}`}>{a}</span>
            ))}
          </div>
        </div>
      )}
      {patient.chronicConditions && patient.chronicConditions.length > 0 && (
        <div className="mt-2">
          <p className={labelClass}>Chronic</p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {patient.chronicConditions.map((c, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded border ${chipClass}`}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
