'use client';

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinSession = (roomToken: string) => {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');
  getSocket().emit('join:session', { roomToken, accessToken: token });
};

export const leaveSession = (roomToken: string) => {
  getSocket().emit('leave:session', roomToken);
};

export const sendTextSegment = (payload: {
  sessionId: string;
  text: string;
  dialect: string;
  speakerTag?: string;
  startMs?: number;
}) => {
  getSocket().emit('transcription:text_segment', payload);
};
