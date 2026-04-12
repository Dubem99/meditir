'use client';

import { useEffect } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { getAccessToken, api } from '@/lib/api';
import { usePresenceStore } from '@/store/presence.store';
import { useAuthStore } from '@/store/auth.store';
import type { DirectMessage } from '@/types/entities.types';

/**
 * Initializes the socket connection, identifies the user for presence tracking,
 * and wires up global events for online/offline + incoming DMs.
 * Call this once from the dashboard layout so it runs for the whole session.
 */
export const usePresence = (onIncomingMessage?: (msg: DirectMessage) => void) => {
  const user = useAuthStore((s) => s.user);
  const setSnapshot = usePresenceStore((s) => s.setSnapshot);
  const addOnline = usePresenceStore((s) => s.addOnline);
  const removeOnline = usePresenceStore((s) => s.removeOnline);
  const setUnreadCount = usePresenceStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!user) return;
    const token = getAccessToken();
    if (!token) return;

    const socket = connectSocket();

    const identify = () => {
      socket.emit('presence:identify', { accessToken: token });
    };

    // If already connected, identify now; otherwise wait for connect
    if (socket.connected) identify();
    else socket.once('connect', identify);

    const handleSnapshot = (p: { onlineUserIds: string[] }) => setSnapshot(p.onlineUserIds);
    const handleOnline = (p: { userId: string }) => addOnline(p.userId);
    const handleOffline = (p: { userId: string }) => removeOnline(p.userId);
    const handleNewDm = (msg: DirectMessage) => {
      // Bump unread count
      setUnreadCount(usePresenceStore.getState().unreadCount + 1);
      onIncomingMessage?.(msg);
    };

    socket.on('presence:snapshot', handleSnapshot);
    socket.on('presence:online', handleOnline);
    socket.on('presence:offline', handleOffline);
    socket.on('dm:new', handleNewDm);

    // Initial unread fetch
    api
      .get('/messages/unread-count')
      .then((res) => setUnreadCount(res.data.data?.count ?? 0))
      .catch(() => {});

    return () => {
      socket.off('presence:snapshot', handleSnapshot);
      socket.off('presence:online', handleOnline);
      socket.off('presence:offline', handleOffline);
      socket.off('dm:new', handleNewDm);
    };
  }, [user, setSnapshot, addOnline, removeOnline, setUnreadCount, onIncomingMessage]);
};

/**
 * Helper exposed to components that want to send a DM via the REST endpoint.
 * The server handles fan-out via socket.
 */
export const sendDirectMessage = async (args: {
  toUserId: string;
  content: string;
  attachedPatientId?: string;
  attachedSessionId?: string;
}): Promise<DirectMessage> => {
  const res = await api.post('/messages', args);
  return res.data.data as DirectMessage;
};

/**
 * Fire this so the socket is listening even on pages that don't otherwise use it.
 * Intended to be called once from the dashboard layout.
 */
export const ensureSocketConnected = () => {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
};
