import { create } from 'zustand';
import type { Transcription } from '@/types/entities.types';

interface SessionState {
  activeSessionId: string | null;
  roomToken: string | null;
  isRecording: boolean;
  transcriptions: Transcription[];
  setActiveSession: (sessionId: string, roomToken: string) => void;
  addTranscription: (t: Transcription) => void;
  updateTranscription: (id: string, text: string) => void;
  setRecording: (isRecording: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  roomToken: null,
  isRecording: false,
  transcriptions: [],

  setActiveSession: (sessionId, roomToken) =>
    set({ activeSessionId: sessionId, roomToken, transcriptions: [] }),

  addTranscription: (t) =>
    set((state) => ({ transcriptions: [...state.transcriptions, t] })),

  updateTranscription: (id, text) =>
    set((state) => ({
      transcriptions: state.transcriptions.map((t) => (t.id === id ? { ...t, text } : t)),
    })),

  setRecording: (isRecording) => set({ isRecording }),

  clearSession: () =>
    set({ activeSessionId: null, roomToken: null, isRecording: false, transcriptions: [] }),
}));
