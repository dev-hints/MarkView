import React from 'react';
import {
  FileCode,
  FolderOpen,
  FileText,
  Search,
  Settings,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useSearchStore } from '@/stores/searchStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  openMarkdownFileDialog,
  openFolderDialog,
} from '@/services/filesystem/fsService';
import { Kbd } from '@/components/common/Kbd';

export const Titlebar: React.FC = () => {
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const openDocument = useDocumentStore((s) => s.openDocument);
  const openQuickOpen = useSearchStore((s) => s.openQuickOpen);
  const openWorkspaceSearch = useSearchStore((s) => s.openWorkspaceSearch);
  const openSettings = useSearchStore((s) => s.openSettings);

  const theme = useSettingsStore((s) => s.settings.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const handleOpenFile = async () => {
    try {
      const file = await openMarkdownFileDialog();
      if (file) await openDocument(file);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const folder = await openFolderDialog();
      if (folder) await openWorkspace(folder);
    } catch (e) {
      console.error(e);
    }
  };

  const cycleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <header className="h-10 px-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between select-none text-xs">
      {/* Brand & File Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)]">
          <FileCode className="w-4 h-4 text-[var(--accent)]" />
          <span>MarkView</span>
        </div>

        <div className="h-4 w-px bg-[var(--border-color)]" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenFile}
            title="Open File (Ctrl+O)"
            aria-label="Open File"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open File</span>
          </button>

          <button
            onClick={handleOpenFolder}
            title="Open Folder (Ctrl+Shift+O)"
            aria-label="Open Folder"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors font-medium"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open Folder</span>
          </button>
        </div>
      </div>

      {/* Center Search Input Trigger */}
      <div className="flex items-center gap-2 max-w-sm w-full mx-4">
        <button
          onClick={openQuickOpen}
          aria-label="Quick search files"
          className="flex items-center justify-between w-full px-3 py-1 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px]">Quick search...</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd>{modKey}</Kbd>
            <Kbd>P</Kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: Workspace Search, Theme Switcher, Settings */}
      <div className="flex items-center gap-1">
        <button
          onClick={openWorkspaceSearch}
          title="Search Workspace (Ctrl+Shift+F)"
          aria-label="Search Workspace"
          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={cycleTheme}
          title={`Theme: ${theme.toUpperCase()} (Ctrl+Shift+T)`}
          aria-label="Toggle Theme"
          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-blue-400" />
          ) : theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Laptop className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={openSettings}
          title="Settings"
          aria-label="Settings"
          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
