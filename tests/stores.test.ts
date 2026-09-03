import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useWorkspaceStore } from '../src/stores/workspaceStore';
import { useDocumentStore } from '../src/stores/documentStore';
import { useSearchStore } from '../src/stores/searchStore';

describe('Zustand Stores', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates settings and persists them', () => {
    const { setTheme, setFontSize, setReadingWidth } = useSettingsStore.getState();

    setTheme('dark');
    expect(useSettingsStore.getState().settings.theme).toBe('dark');

    setFontSize(20);
    expect(useSettingsStore.getState().settings.fontSize).toBe(20);

    setReadingWidth('wide');
    expect(useSettingsStore.getState().settings.readingWidth).toBe('wide');
  });

  it('manages recent files list in workspaceStore', () => {
    const { addRecent, removeRecent, clearAllRecent } = useWorkspaceStore.getState();

    addRecent('/docs/readme.md', false);
    addRecent('/docs/guide.md', false);
    expect(useWorkspaceStore.getState().recentItems).toHaveLength(2);

    removeRecent('/docs/readme.md');
    expect(useWorkspaceStore.getState().recentItems).toHaveLength(1);
    expect(useWorkspaceStore.getState().recentItems[0].path).toBe('/docs/guide.md');

    clearAllRecent();
    expect(useWorkspaceStore.getState().recentItems).toHaveLength(0);
  });

  it('manages search store open/close states', () => {
    const { openQuickOpen, closeQuickOpen, openWorkspaceSearch, closeWorkspaceSearch } =
      useSearchStore.getState();

    openQuickOpen();
    expect(useSearchStore.getState().isQuickOpenOpen).toBe(true);
    closeQuickOpen();
    expect(useSearchStore.getState().isQuickOpenOpen).toBe(false);

    openWorkspaceSearch();
    expect(useSearchStore.getState().isWorkspaceSearchOpen).toBe(true);
    closeWorkspaceSearch();
    expect(useSearchStore.getState().isWorkspaceSearchOpen).toBe(false);
  });
});
