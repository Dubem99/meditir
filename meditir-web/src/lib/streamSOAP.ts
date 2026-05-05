// Client for the API's NDJSON streaming SOAP endpoint
// (POST /soap-notes/stream/:sessionId).
//
// Each line of the response body is a single JSON event:
//   {"type":"delta","text":"..."}      Claude text chunk (may split tags)
//   {"type":"done","note":{...}}       final persisted SOAPNote
//   {"type":"error","message":"..."}   mid-stream failure
//
// Pre-stream failures (auth, missing session, empty transcript, finalized
// note) come back as a normal HTTP error and are thrown — handle in catch.

import { getAccessToken } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type SOAPSections = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

type Note = {
  id: string;
  sessionId: string;
  hospitalId: string;
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: string;
  aiModel?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StreamCallbacks = {
  // Called every time the running text buffer changes. Sections are
  // re-extracted from the buffer using the same XML tags the server emits;
  // partially-arrived sections (open tag, no close yet) get the content up to
  // the current point, so the UI fills character-by-character.
  onSections: (sections: SOAPSections) => void;
  onDone: (note: Note) => void;
  onError: (message: string) => void;
};

// Pull complete + in-progress section content out of a partial Claude
// response. Closed sections use the inner text between tags; an open-but-not-
// yet-closed section uses everything from the opening tag onward, with any
// trailing partial closing tag stripped so the UI doesn't flash "<" "</" etc.
const TAGS = ['subjective', 'objective', 'assessment', 'plan'] as const;
export const extractSections = (buffer: string): SOAPSections => {
  const out: SOAPSections = { subjective: '', objective: '', assessment: '', plan: '' };
  for (const tag of TAGS) {
    const closed = buffer.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
    if (closed) {
      out[tag] = closed[1].trim();
      continue;
    }
    const open = buffer.match(new RegExp(`<${tag}>([\\s\\S]*)$`, 'i'));
    if (open) {
      // Strip a partial closing-tag prefix at the very end so we don't render
      // "Patient reports fever <" while the next chunk is in flight.
      const trimmed = open[1].replace(/<\/?[a-z]*$/i, '');
      out[tag] = trimmed.trimStart();
    }
  }
  return out;
};

export const streamSOAPNote = async (
  sessionId: string,
  callbacks: StreamCallbacks,
): Promise<void> => {
  const token = getAccessToken();
  const slug = typeof window !== 'undefined' ? localStorage.getItem('hospitalSlug') : null;

  const res = await fetch(`${API_URL}/soap-notes/stream/${sessionId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(slug ? { 'X-Hospital-Slug': slug } : {}),
    },
  });

  if (!res.ok || !res.body) {
    let message = `Failed to start generation (${res.status})`;
    try {
      const body = await res.json();
      message = body?.message || body?.error || message;
    } catch {}
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lineBuffer = '';

  // Single read loop. Each NDJSON line gets parsed; deltas concatenate into
  // `buffer`, which we re-section after every chunk so the UI sees progressive
  // fill. `done` and `error` events terminate.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    lineBuffer += decoder.decode(value, { stream: true });

    let nl;
    while ((nl = lineBuffer.indexOf('\n')) !== -1) {
      const line = lineBuffer.slice(0, nl).trim();
      lineBuffer = lineBuffer.slice(nl + 1);
      if (!line) continue;

      let event: { type: string; text?: string; note?: Note; message?: string };
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }

      if (event.type === 'delta' && typeof event.text === 'string') {
        buffer += event.text;
        callbacks.onSections(extractSections(buffer));
      } else if (event.type === 'done' && event.note) {
        callbacks.onDone(event.note);
        return;
      } else if (event.type === 'error') {
        callbacks.onError(event.message || 'Note generation failed');
        return;
      }
    }
  }
};
