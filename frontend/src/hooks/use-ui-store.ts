import { create } from "zustand";

interface UiState {
  // Audio state
  isAudioMuted: boolean;
  audioVolume: number;
  toggleAudioMute: () => void;
  setAudioVolume: (volume: number) => void;

  // Level-up celebration modal state
  isLevelUpModalOpen: boolean;
  celebrationLevel: number | null;
  triggerLevelUpCelebration: (level: number) => void;
  closeLevelUpModal: () => void;

  // Mobile sidebar navigation
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isAudioMuted: false,
  audioVolume: 0.7,
  toggleAudioMute: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
  setAudioVolume: (volume: number) => set({ audioVolume: Math.max(0, Math.min(1, volume)) }),

  isLevelUpModalOpen: false,
  celebrationLevel: null,
  triggerLevelUpCelebration: (level: number) =>
    set({ isLevelUpModalOpen: true, celebrationLevel: level }),
  closeLevelUpModal: () => set({ isLevelUpModalOpen: false, celebrationLevel: null }),

  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open: boolean) => set({ isMobileSidebarOpen: open }),
}));
