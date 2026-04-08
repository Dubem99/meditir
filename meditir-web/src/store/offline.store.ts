import { create } from 'zustand';

interface OfflineState {
  isOnline: boolean;
  pendingCount: number;
  setOnline: (online: boolean) => void;
  incrementPending: () => void;
  resetPending: () => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  setOnline: (online) => set({ isOnline: online }),
  incrementPending: () => set((s) => ({ pendingCount: s.pendingCount + 1 })),
  resetPending: () => set({ pendingCount: 0 }),
}));
