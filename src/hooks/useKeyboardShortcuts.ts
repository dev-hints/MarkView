import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useSearchStore } from '@/stores/searchStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  openMarkdownFileDialog,
  openFolderDialog,
} from '@/services/filesystem/fsService';

export function useKeyboardShortcuts() {
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const refreshWorkspace = useWorkspaceStore((s) => s.refreshWorkspace);

  const openDocument = useDocumentStore((s) => s.openDocument);
  const reloadDocument = useDocumentStore((s) => s.reloadDocument);
  const navigateBack = useDocumentStore((s) => s.navigateBack);
  const navigateForward = useDocumentStore((s) => s.navigateForward);

  const toggleQuickOpen = useSearchStore((s) => s.toggleQuickOpen);
  const toggleWorkspaceSearch = useSearchStore((s) => s.toggleWorkspaceSearch);
  const toggleInDocSearch = useSearchStore((s) => s.toggleInDocSearch);
  const closeInDocSearch = useSearchStore((s) => s.closeInDocSearch);
  const closeQuickOpen = useSearchStore((s) => s.closeQuickOpen);
  const closeWorkspaceSearch = useSearchStore((s) => s.closeWorkspaceSearch);
  const closeSettings = useSearchStore((s) => s.closeSettings);

  const fontSize = useSettingsStore((s) => s.settings.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const theme = useSettingsStore((s) => s.settings.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Handle Escape key
      if (e.key === 'Escape') {
        const { isQuickOpenOpen, isWorkspaceSearchOpen, isInDocSearchOpen, isSettingsOpen } =
          useSearchStore.getState();
        if (isQuickOpenOpen) closeQuickOpen();
        if (isWorkspaceSearchOpen) closeWorkspaceSearch();
        if (isInDocSearchOpen) closeInDocSearch();
        if (isSettingsOpen) closeSettings();
        return;
      }

      if (!modKey) return;

      // Ctrl/Cmd + Shift + O: Open Folder
      if (e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        try {
          const folder = await openFolderDialog();
          if (folder) await openWorkspace(folder);
        } catch (err) {
          console.error(err);
        }
        return;
      }

      // Ctrl/Cmd + O: Open File
      if (!e.shiftKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        try {
          const file = await openMarkdownFileDialog();
          if (file) await openDocument(file);
        } catch (err) {
          console.error(err);
        }
        return;
      }

      // Ctrl/Cmd + P: Quick Open
      if (!e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toggleQuickOpen();
        return;
      }

      // Ctrl/Cmd + Shift + F: Search Workspace
      if (e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        toggleWorkspaceSearch();
        return;
      }

      // Ctrl/Cmd + F: Search in Document
      if (!e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        toggleInDocSearch();
        return;
      }

      // Ctrl/Cmd + B: Toggle Sidebar
      if (!e.shiftKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl/Cmd + Shift + T: Toggle Theme (System -> Light -> Dark)
      if (e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
        setTheme(nextTheme);
        return;
      }

      // Ctrl/Cmd + R: Refresh
      if (!e.shiftKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        await reloadDocument();
        await refreshWorkspace();
        return;
      }

      // Ctrl/Cmd + Plus / Equals: Increase font size
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setFontSize(fontSize + 1);
        return;
      }

      // Ctrl/Cmd + Minus: Decrease font size
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setFontSize(fontSize - 1);
        return;
      }

      // Ctrl/Cmd + 0: Reset font size
      if (e.key === '0') {
        e.preventDefault();
        setFontSize(16);
        return;
      }

      // Ctrl/Cmd + [: Navigate back
      if (e.key === '[') {
        e.preventDefault();
        navigateBack();
        return;
      }

      // Ctrl/Cmd + ]: Navigate forward
      if (e.key === ']') {
        e.preventDefault();
        navigateForward();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    fontSize,
    theme,
    toggleSidebar,
    openWorkspace,
    refreshWorkspace,
    openDocument,
    reloadDocument,
    navigateBack,
    navigateForward,
    toggleQuickOpen,
    toggleWorkspaceSearch,
    toggleInDocSearch,
    closeInDocSearch,
    closeQuickOpen,
    closeWorkspaceSearch,
    closeSettings,
    setFontSize,
    setTheme,
  ]);
}
