import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { RecentItem } from '@/types/fs';

const SETTINGS_KEY = 'markview_app_settings';
const RECENT_KEY = 'markview_recent_items';
const EXPANDED_FOLDERS_KEY = 'markview_expanded_folders';
const LAST_WORKSPACE_KEY = 'markview_last_workspace';
const LAST_DOCUMENT_KEY = 'markview_last_document';

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings from storage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export function loadRecentItems(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load recent items:', e);
  }
  return [];
}

export function addRecentItem(item: Omit<RecentItem, 'last_opened'>): RecentItem[] {
  const current = loadRecentItems();
  const newItem: RecentItem = {
    ...item,
    last_opened: Math.floor(Date.now() / 1000),
  };

  // Remove duplicate if already present
  const filtered = current.filter((i) => i.path !== item.path);
  const updated = [newItem, ...filtered].slice(0, 20); // Keep max 20 recent items

  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recent items:', e);
  }

  return updated;
}

export function removeRecentItem(path: string): RecentItem[] {
  const current = loadRecentItems();
  const updated = current.filter((i) => i.path !== path);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to remove recent item:', e);
  }
  return updated;
}

export function clearRecentItems(): void {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch (e) {
    console.warn('Failed to clear recent items:', e);
  }
}

export function loadExpandedFolders(): string[] {
  try {
    const raw = localStorage.getItem(EXPANDED_FOLDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveExpandedFolders(folders: string[]): void {
  try {
    localStorage.setItem(EXPANDED_FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {}
}

export function saveLastSession(workspacePath?: string | null, documentPath?: string | null): void {
  try {
    if (workspacePath) {
      localStorage.setItem(LAST_WORKSPACE_KEY, workspacePath);
    } else {
      localStorage.removeItem(LAST_WORKSPACE_KEY);
    }
    if (documentPath) {
      localStorage.setItem(LAST_DOCUMENT_KEY, documentPath);
    } else {
      localStorage.removeItem(LAST_DOCUMENT_KEY);
    }
  } catch (e) {}
}

export function loadLastSession(): { lastWorkspace: string | null; lastDocument: string | null } {
  try {
    return {
      lastWorkspace: localStorage.getItem(LAST_WORKSPACE_KEY),
      lastDocument: localStorage.getItem(LAST_DOCUMENT_KEY),
    };
  } catch (e) {
    return { lastWorkspace: null, lastDocument: null };
  }
}
