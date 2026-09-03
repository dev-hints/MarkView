import { create } from 'zustand';
import { AppSettings, DEFAULT_SETTINGS, ReadingWidth, ThemeMode, CodeTheme } from '@/types/settings';
import { loadStoredSettings, saveStoredSettings } from '@/services/settings/settingsService';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setReadingWidth: (width: ReadingWidth) => void;
  setCodeTheme: (codeTheme: CodeTheme) => void;
  toggleMermaid: () => void;
  toggleKaTeX: () => void;
  toggleRawHtml: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadStoredSettings(),

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    saveStoredSettings(updated);
    set({ settings: updated });
  },

  setTheme: (theme) => {
    get().updateSettings({ theme });
  },

  setFontSize: (fontSize) => {
    const clamped = Math.max(12, Math.min(32, fontSize));
    get().updateSettings({ fontSize: clamped });
  },

  setReadingWidth: (readingWidth) => {
    get().updateSettings({ readingWidth });
  },

  setCodeTheme: (codeTheme) => {
    get().updateSettings({ codeTheme });
  },

  toggleMermaid: () => {
    get().updateSettings({ enableMermaid: !get().settings.enableMermaid });
  },

  toggleKaTeX: () => {
    get().updateSettings({ enableKaTeX: !get().settings.enableKaTeX });
  },

  toggleRawHtml: () => {
    get().updateSettings({ renderRawHtml: !get().settings.renderRawHtml });
  },

  resetSettings: () => {
    saveStoredSettings(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },
}));
