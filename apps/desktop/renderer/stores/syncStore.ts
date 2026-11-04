import { create } from 'zustand';
import { OperatingMode } from '@bitechez/config';

interface SyncState {
  operatingMode: OperatingMode;
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncedAt?: string;
  setMode: (mode: OperatingMode) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncedAt: (date: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  operatingMode: 'standalone-offline',
  isOnline: false,
  pendingSyncCount: 0,
  setMode: (operatingMode) => set({ operatingMode }),
  setOnlineStatus: (isOnline) => set({ isOnline }),
  setPendingCount: (pendingSyncCount) => set({ pendingSyncCount }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
}));

