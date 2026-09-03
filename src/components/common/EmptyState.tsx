import React from 'react';
import { FileText, FolderOpen, FileCode, Search, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Kbd } from './Kbd';
import { openMarkdownFileDialog, openFolderDialog } from '@/services/filesystem/fsService';
import { useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSearchStore } from '@/stores/searchStore';

export const EmptyState: React.FC = () => {
  const openDocument = useDocumentStore((s) => s.openDocument);
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const openQuickOpen = useSearchStore((s) => s.openQuickOpen);

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

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modLabel = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none min-h-[400px]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center mb-6 shadow-sm">
        <FileCode className="w-8 h-8 text-[var(--accent)]" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
        MarkView
      </h2>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-8">
        A fast, modern desktop Markdown reader with Shiki syntax highlighting, KaTeX math, Mermaid diagrams, and instant search.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <Button
          variant="primary"
          size="md"
          icon={<FileText className="w-4 h-4" />}
          onClick={handleOpenFile}
        >
          Open File
        </Button>
        <Button
          variant="secondary"
          size="md"
          icon={<FolderOpen className="w-4 h-4" />}
          onClick={handleOpenFolder}
        >
          Open Folder
        </Button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 max-w-sm w-full text-left">
        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Quick Shortcuts
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span>Open File</span>
            <div className="flex gap-1">
              <Kbd>{modLabel}</Kbd>
              <Kbd>O</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span>Open Folder</span>
            <div className="flex gap-1">
              <Kbd>{modLabel}</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>O</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span>Quick Search</span>
            <div className="flex gap-1">
              <Kbd>{modLabel}</Kbd>
              <Kbd>P</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span>Workspace Search</span>
            <div className="flex gap-1">
              <Kbd>{modLabel}</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>F</Kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
