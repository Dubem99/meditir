'use client';

import { useRef, useState, useCallback } from 'react';
import type { Dialect } from '@/types/entities.types';

export interface TranscriptSegment {
  text: string;
  isFinal: boolean;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: (onSegment: (segment: TranscriptSegment) => void) => void;
  stopRecording: () => void;
  error: string | null;
  isSupported: boolean;
}

const dialectToLang: Record<Dialect, string> = {
  NIGERIAN_ENGLISH: 'en-NG',
  YORUBA_ACCENTED: 'yo',
  HAUSA_ACCENTED: 'ha',
  IGBO_ACCENTED: 'ig',
};

// Use any for the Web Speech API since TypeScript lib types vary by version
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

export const useAudioRecorder = (dialect: Dialect = 'NIGERIAN_ENGLISH'): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<AnySpeechRecognition>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startRecording = useCallback(
    (onSegment: (segment: TranscriptSegment) => void) => {
      if (!isSupported) {
        setError('Speech recognition is not supported in this browser. Use Chrome or Edge.');
        return;
      }

      setError(null);

      const win = window as typeof window & {
        webkitSpeechRecognition?: AnySpeechRecognition;
        SpeechRecognition?: AnySpeechRecognition;
      };

      const SpeechRecognitionImpl = win.webkitSpeechRecognition ?? win.SpeechRecognition;
      const recognition: AnySpeechRecognition = new SpeechRecognitionImpl();
      recognitionRef.current = recognition;

      recognition.lang = dialectToLang[dialect] ?? 'en-NG';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: AnySpeechRecognition) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          onSegment({
            text: result[0].transcript.trim(),
            isFinal: result.isFinal,
          });
        }
      };

      recognition.onerror = (event: AnySpeechRecognition) => {
        if (event.error !== 'no-speech') {
          setError(`Recognition error: ${event.error}`);
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still recording
        if (recognitionRef.current) {
          try { recognition.start(); } catch {}
        }
      };

      recognition.start();
      setIsRecording(true);
    },
    [dialect, isSupported]
  );

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording, error, isSupported };
};
