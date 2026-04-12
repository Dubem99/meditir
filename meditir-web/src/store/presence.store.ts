import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: Set<string>;
  unreadCount: number;
  setSnapshot: (userIds: string[]) => void;
  addOnline: (userId: string) => void;
  removeOnline: (userId: string) => void;
  setUnreadCount: (n: number) => void;
  isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(),
  unreadCount: 0,

  setSnapshot: (userIds) => set({ onlineUserIds: new Set(userIds) }),

  addOnline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.add(userId);
      return { onlineUserIds: next };
    }),

  removeOnline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return { onlineUserIds: next };
    }),

  setUnreadCount: (n) => set({ unreadCount: n }),

  isOnline: (userId) => get().onlineUserIds.has(userId),
}));
