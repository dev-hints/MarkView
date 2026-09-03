import React, { useRef, useMemo } from 'react';
import { Titlebar } from './Titlebar';
import { StatusBar } from './StatusBar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { DocumentToolbar } from '@/components/toolbar/DocumentToolbar';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { FrontmatterHeader } from '@/components/markdown/FrontmatterHeader';
import { TableOfContents } from '@/components/markdown/TableOfContents';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { QuickOpenModal } from '@/components/search/QuickOpenModal';
import { WorkspaceSearchModal } from '@/components/search/WorkspaceSearchModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { InDocSearchBar } from '@/components/search/InDocSearchBar';

import { useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFileWatcher } from '@/hooks/useFileWatcher';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useInDocSearch } from '@/hooks/useInDocSearch';
import { extractTableOfContents } from '@/utils/toc';
import { AlertCircle, FileX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const AppLayout: React.FC = () => {
  // Initialize hooks
  useTheme();
  useKeyboardShortcuts();
  useFileWatcher();

  const currentPath = useDocumentStore((s) => s.currentPath);
  const content = useDocumentStore((s) => s.content);
  const frontmatter = useDocumentStore((s) => s.frontmatter);
  const isLoading = useDocumentStore((s) => s.isLoading);
  const error = useDocumentStore((s) => s.error);
  const reloadDocument = useDocumentStore((s) => s.reloadDocument);

  const isOutlineOpen = useWorkspaceStore((s) => s.isOutlineOpen);
  const readingWidth = useSettingsStore((s) => s.settings.readingWidth);
  const fontSize = useSettingsStore((s) => s.settings.fontSize);

  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Extract headings for Table of Contents
  const tocItems = useMemo(() => {
    return extractTableOfContents(content);
  }, [content]);

  // Track active heading with ScrollSpy
  const activeHeadingId = useScrollSpy(tocItems, contentContainerRef);

  // In-document text highlight and navigation
  useInDocSearch(contentContainerRef);

  // Reading width container styles
  const widthContainerClass = {
    narrow: 'max-w-2xl',
    medium: 'max-w-3xl',
    wide: 'max-w-5xl',
    full: 'max-w-full px-6',
  }[readingWidth];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Application Bar */}
      <Titlebar />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Center Document Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-primary)] relative">
          <DocumentToolbar />
          <InDocSearchBar />

          {/* Document Content Scroll Container */}
          <div
            ref={contentContainerRef}
            className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth"
          >
            {error ? (
              <div className="max-w-xl mx-auto my-12 p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-3">
                  <FileX className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-[var(--text-primary)] mb-1">
                  Unable to Open Document
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-mono mb-4 p-2 bg-[var(--code-bg)] rounded border border-[var(--border-color)]">
                  {error}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={reloadDocument}
                >
                  Retry
                </Button>
              </div>
            ) : !currentPath ? (
              <EmptyState />
            ) : (
              <div
                className={`mx-auto transition-all duration-150 ${widthContainerClass}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                <ErrorBoundary fallbackTitle="Error rendering Markdown content">
                  {/* Frontmatter metadata card */}
                  {Object.keys(frontmatter).length > 0 && (
                    <FrontmatterHeader frontmatter={frontmatter} />
                  )}

                  {/* Main Markdown document */}
                  <MarkdownRenderer content={content} />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </main>

        {/* Document Outline / Table of Contents Panel */}
        {currentPath && isOutlineOpen && tocItems.length > 0 && (
          <aside
            aria-label="Table of contents"
            className="hidden lg:block w-64 shrink-0 border-l border-[var(--border-color)] bg-[var(--sidebar-bg)] overflow-hidden transition-all duration-200"
          >
            <TableOfContents items={tocItems} activeId={activeHeadingId} />
          </aside>
        )}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Overlay Modals */}
      <QuickOpenModal />
      <WorkspaceSearchModal />
      <SettingsModal />
    </div>
  );
};
