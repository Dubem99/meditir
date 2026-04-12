import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import { logger } from '../../utils/logger';
import { hospitalRoom, userRoom } from '../../socket';

// In-memory presence map — userId → Set of connected socket IDs.
// A user is "online" if at least one socket is connected for them.
// Reset on server restart which is fine for presence (no cross-instance
// coordination needed for a single Railway container).
const onlineSockets = new Map<string, Set<string>>();
// Track which hospital each user belongs to so we can broadcast on disconnect
// without another DB lookup.
const userHospital = new Map<string, string>();

const isOnline = (userId: string): boolean => {
  const s = onlineSockets.get(userId);
  return !!s && s.size > 0;
};

export const getOnlineUserIds = (hospitalId: string): string[] => {
  return Array.from(onlineSockets.keys()).filter((uid) => userHospital.get(uid) === hospitalId);
};

export const registerPresenceHandlers = (io: Server, socket: Socket): void => {
  /**
   * Client calls this right after connecting to announce their presence.
   * Payload: { accessToken: string }
   */
  socket.on('presence:identify', (data: { accessToken?: string }) => {
    try {
      if (!data?.accessToken) return;
      const payload = verifyAccessToken(data.accessToken);
      if (!payload.hospitalId) return;

      const userId = payload.userId;
      const hospitalId = payload.hospitalId;

      // Join personal + hospital rooms so targeted emits work
      socket.join(userRoom(userId));
      socket.join(hospitalRoom(hospitalId));

      // Track the socket
      if (!onlineSockets.has(userId)) onlineSockets.set(userId, new Set());
      onlineSockets.get(userId)!.add(socket.id);
      userHospital.set(userId, hospitalId);

      // Attach identity to the socket for disconnect cleanup
      (socket.data as { userId?: string; hospitalId?: string }).userId = userId;
      (socket.data as { userId?: string; hospitalId?: string }).hospitalId = hospitalId;

      // Let this socket know the current online colleagues
      const onlineInHospital = getOnlineUserIds(hospitalId);
      socket.emit('presence:snapshot', { onlineUserIds: onlineInHospital });

      // Broadcast to the hospital that this user is now online
      io.to(hospitalRoom(hospitalId)).emit('presence:online', { userId });
    } catch (err) {
      logger.debug('presence:identify failed', { error: err });
    }
  });

  socket.on('presence:who', () => {
    const d = socket.data as { hospitalId?: string };
    if (!d.hospitalId) return;
    socket.emit('presence:snapshot', { onlineUserIds: getOnlineUserIds(d.hospitalId) });
  });

  socket.on('disconnect', () => {
    const d = socket.data as { userId?: string; hospitalId?: string };
    if (!d.userId || !d.hospitalId) return;

    const set = onlineSockets.get(d.userId);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        onlineSockets.delete(d.userId);
        userHospital.delete(d.userId);
        // Last socket closed — broadcast offline
        io.to(hospitalRoom(d.hospitalId)).emit('presence:offline', { userId: d.userId });
      }
    }
  });
};

// Re-export for use in controllers
export { isOnline };
