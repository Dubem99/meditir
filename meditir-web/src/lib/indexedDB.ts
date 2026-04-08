import Dexie, { Table } from 'dexie';
import type { Dialect } from '@/types/entities.types';

interface OfflineAudioChunk {
  id?: number;
  sessionId: string;
  blob: Blob;
  dialect: Dialect;
  speakerTag?: string;
  startMs: number;
  createdAt: number;
}

interface OfflineTranscription {
  id?: number;
  sessionId: string;
  text: string;
  dialect: Dialect;
  speakerTag?: string;
  startMs?: number;
  endMs?: number;
  createdAt: number;
  synced: boolean;
}

class MeditirDB extends Dexie {
  offlineAudioChunks!: Table<OfflineAudioChunk>;
  offlineTranscriptions!: Table<OfflineTranscription>;

  constructor() {
    super('MeditirDB');
    this.version(1).stores({
      offlineAudioChunks: '++id, sessionId, createdAt',
      offlineTranscriptions: '++id, sessionId, synced, createdAt',
    });
  }
}

export const db = new MeditirDB();

export const storeOfflineChunk = (chunk: Omit<OfflineAudioChunk, 'id'>) =>
  db.offlineAudioChunks.add(chunk);

export const storeOfflineTranscription = (t: Omit<OfflineTranscription, 'id'>) =>
  db.offlineTranscriptions.add(t);

export const getPendingTranscriptions = (sessionId: string) =>
  db.offlineTranscriptions.where({ sessionId, synced: false }).toArray();

export const markTranscriptionsSynced = (ids: number[]) =>
  db.offlineTranscriptions.where('id').anyOf(ids).modify({ synced: true });

export const clearSessionData = (sessionId: string) =>
  Promise.all([
    db.offlineAudioChunks.where({ sessionId }).delete(),
    db.offlineTranscriptions.where({ sessionId }).delete(),
  ]);
