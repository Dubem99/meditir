'use client';

import { useState } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useSessionStore } from '@/store/session.store';
import { TranscriptFeed } from './TranscriptFeed';
import { DialectSelector } from './DialectSelector';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, sessionStatusBadge } from '@/components/ui/Badge';
import type { ConsultationSession, Dialect } from '@/types/entities.types';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

interface Props {
  session: ConsultationSession;
  onSessionEnd: (sessionId: string) => void;
}

export const TranscriptionRoom = ({ session, onSessionEnd }: Props) => {
  const [dialect, setDialect] = useState<Dialect>(session.dialect);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);

  const transcriptions = useSessionStore((s) => s.transcriptions);
  const { isOnline } = useOfflineSync(session.id);

  const { isRecording, startTranscription, stopTranscription, error, isSupported } = useTranscription(
    session.id,
    session.roomToken!,
    dialect
  );

  const handleEndSession = async () => {
    setIsEndingSession(true);
    if (isRecording) stopTranscription();
    try {
      await api.post(`/sessions/${session.id}/end`);
      setIsGeneratingSOAP(true);
      // SOAP note generation is triggered server-side
      setTimeout(() => {
        setIsGeneratingSOAP(false);
        onSessionEnd(session.id);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEndingSession(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Consultation with {session.patient.firstName} {session.patient.lastName}
          </h2>
          <p className="text-sm text-gray-500">
            MRN: {session.patient.medicalRecordNo || '—'} · Session #{session.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Offline Mode
            </span>
          )}
          <Badge variant={sessionStatusBadge(session.status)}>
            {session.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Controls panel */}
        <Card className="lg:col-span-1 flex flex-col gap-4">
          <CardHeader>
            <h3 className="font-medium text-gray-900">Recording Controls</h3>
          </CardHeader>

          <DialectSelector value={dialect} onChange={setDialect} disabled={isRecording} />

          <div className="flex flex-col gap-3">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startTranscription}
                className="w-full"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                Start Recording
              </Button>
            ) : (
              <Button
                size="lg"
                variant="danger"
                onClick={stopTranscription}
                className="w-full"
              >
                <span className="w-3 h-3 bg-white rounded-sm" />
                Stop Recording
              </Button>
            )}

            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-sm text-success">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Recording in progress
              </div>
            )}

            {!isSupported && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                Use <strong>Chrome</strong> or <strong>Edge</strong> for live transcription.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <Button
              variant="danger"
              size="lg"
              className="w-full"
              loading={isEndingSession}
              onClick={handleEndSession}
            >
              End Session & Generate SOAP
            </Button>
            {isGeneratingSOAP && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Generating SOAP note via AI...
              </p>
            )}
          </div>
        </Card>

        {/* Live transcript */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Live Transcript</h3>
              <span className="text-xs text-gray-500">
                {transcriptions.length} segment{transcriptions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardHeader>
          <TranscriptFeed transcriptions={transcriptions} isLive={isRecording} />
        </Card>
      </div>
    </div>
  );
};
