import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Search,
  ListTree,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  FileText,
  PanelLeft,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSearchStore } from '@/stores/searchStore';
import { ReadingWidth } from '@/types/settings';

export const DocumentToolbar: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const currentPath = useDocumentStore((s) => s.currentPath);
  const fileName = useDocumentStore((s) => s.fileName);
  const reloadDocument = useDocumentStore((s) => s.reloadDocument);
  const navigateBack = useDocumentStore((s) => s.navigateBack);
  const navigateForward = useDocumentStore((s) => s.navigateForward);
  const canBack = useDocumentStore((s) => s.canNavigateBack());
  const canForward = useDocumentStore((s) => s.canNavigateForward());

  const isSidebarOpen = useWorkspaceStore((s) => s.isSidebarOpen);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const isOutlineOpen = useWorkspaceStore((s) => s.isOutlineOpen);
  const toggleOutline = useWorkspaceStore((s) => s.toggleOutline);

  const readingWidth = useSettingsStore((s) => s.settings.readingWidth);
  const setReadingWidth = useSettingsStore((s) => s.setReadingWidth);
  const fontSize = useSettingsStore((s) => s.settings.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);

  const toggleInDocSearch = useSearchStore((s) => s.toggleInDocSearch);

  const handleCopyPath = async () => {
    if (!currentPath) return;
    try {
      await navigator.clipboard.writeText(currentPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const widths: { id: ReadingWidth; label: string }[] = [
    { id: 'narrow', label: 'Narrow' },
    { id: 'medium', label: 'Medium' },
    { id: 'wide', label: 'Wide' },
    { id: 'full', label: 'Full' },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] select-none text-xs">
      {/* Left section: Sidebar toggle, History buttons & Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            title="Open Sidebar (Ctrl+B)"
            aria-label="Open Sidebar"
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-0.5">
          <button
            disabled={!canBack}
            onClick={navigateBack}
            title="Back (Ctrl+[)"
            aria-label="Back"
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={!canForward}
            onClick={navigateForward}
            title="Forward (Ctrl+])"
            aria-label="Forward"
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {currentPath && (
          <div className="flex items-center gap-1.5 min-w-0 pl-1">
            <FileText className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="font-semibold text-[var(--text-primary)] truncate">
              {fileName}
            </span>
            <button
              onClick={handleCopyPath}
              title="Copy full path"
              aria-label="Copy full path"
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Right section: Search in doc, reading width, zoom, outline toggle, reload */}
      {currentPath && (
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <button
            onClick={toggleInDocSearch}
            title="Find in document (Ctrl+F)"
            aria-label="Find in document"
            className="p-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Reading Width Selector */}
          <div className="hidden sm:flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md p-0.5 text-[11px]">
            {widths.map((w) => (
              <button
                key={w.id}
                onClick={() => setReadingWidth(w.id)}
                className={`px-2 py-0.5 rounded transition-all ${
                  readingWidth === w.id
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Font Size Adjusters */}
          <div className="hidden md:flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md p-0.5 text-[11px]">
            <button
              onClick={() => setFontSize(fontSize - 1)}
              title="Decrease font size"
              aria-label="Decrease font size"
              className="p-1 rounded hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1 text-[10px] font-mono text-[var(--text-muted)]">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(fontSize + 1)}
              title="Increase font size"
              aria-label="Increase font size"
              className="p-1 rounded hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={reloadDocument}
            title="Reload Document (Ctrl+R)"
            aria-label="Reload Document"
            className="p-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleOutline}
            title="Toggle Outline / Table of Contents"
            aria-label="Toggle Outline"
            className={`p-1.5 rounded transition-colors ${
              isOutlineOpen
                ? 'bg-[var(--sidebar-active)] text-[var(--accent)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
