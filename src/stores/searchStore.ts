import { create } from 'zustand';

interface SearchState {
  isQuickOpenOpen: boolean;
  isWorkspaceSearchOpen: boolean;
  isInDocSearchOpen: boolean;
  isSettingsOpen: boolean;

  inDocSearchQuery: string;
  inDocActiveMatch: number;
  inDocTotalMatches: number;

  openQuickOpen: () => void;
  closeQuickOpen: () => void;
  toggleQuickOpen: () => void;

  openWorkspaceSearch: () => void;
  closeWorkspaceSearch: () => void;
  toggleWorkspaceSearch: () => void;

  openInDocSearch: () => void;
  closeInDocSearch: () => void;
  toggleInDocSearch: () => void;

  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;

  setInDocSearchQuery: (query: string) => void;
  setInDocActiveMatch: (index: number) => void;
  setInDocTotalMatches: (count: number) => void;
  nextInDocMatch: () => void;
  prevInDocMatch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  isQuickOpenOpen: false,
  isWorkspaceSearchOpen: false,
  isInDocSearchOpen: false,
  isSettingsOpen: false,

  inDocSearchQuery: '',
  inDocActiveMatch: 0,
  inDocTotalMatches: 0,

  openQuickOpen: () => set({ isQuickOpenOpen: true, isWorkspaceSearchOpen: false }),
  closeQuickOpen: () => set({ isQuickOpenOpen: false }),
  toggleQuickOpen: () => set({ isQuickOpenOpen: !get().isQuickOpenOpen }),

  openWorkspaceSearch: () => set({ isWorkspaceSearchOpen: true, isQuickOpenOpen: false }),
  closeWorkspaceSearch: () => set({ isWorkspaceSearchOpen: false }),
  toggleWorkspaceSearch: () => set({ isWorkspaceSearchOpen: !get().isWorkspaceSearchOpen }),

  openInDocSearch: () => set({ isInDocSearchOpen: true }),
  closeInDocSearch: () => set({ isInDocSearchOpen: false, inDocSearchQuery: '', inDocTotalMatches: 0, inDocActiveMatch: 0 }),
  toggleInDocSearch: () => {
    const next = !get().isInDocSearchOpen;
    if (!next) {
      get().closeInDocSearch();
    } else {
      set({ isInDocSearchOpen: true });
    }
  },

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleSettings: () => set({ isSettingsOpen: !get().isSettingsOpen }),

  setInDocSearchQuery: (query: string) => {
    set({ inDocSearchQuery: query, inDocActiveMatch: 0 });
  },

  setInDocActiveMatch: (index: number) => {
    set({ inDocActiveMatch: index });
  },

  setInDocTotalMatches: (count: number) => {
    set({ inDocTotalMatches: count });
  },

  nextInDocMatch: () => {
    const { inDocTotalMatches, inDocActiveMatch } = get();
    if (inDocTotalMatches === 0) return;
    set({ inDocActiveMatch: (inDocActiveMatch + 1) % inDocTotalMatches });
  },

  prevInDocMatch: () => {
    const { inDocTotalMatches, inDocActiveMatch } = get();
    if (inDocTotalMatches === 0) return;
    set({ inDocActiveMatch: (inDocActiveMatch - 1 + inDocTotalMatches) % inDocTotalMatches });
  },
}));
