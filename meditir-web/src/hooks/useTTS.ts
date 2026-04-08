'use client';

import { useState, useRef } from 'react';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = async (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsLoading(true);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.oncanplay = () => setIsLoading(false);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsLoading(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return { play, pause, stop, isPlaying, isLoading };
};
