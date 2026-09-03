import React from 'react';
import { FileText, Clock, HardDrive, CheckCircle2, Loader2 } from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatBytes, formatRelativeTime, estimateReadingTime } from '@/utils/format';
import { getBaseName } from '@/utils/paths';

export const StatusBar: React.FC = () => {
  const currentPath = useDocumentStore((s) => s.currentPath);
  const fileSize = useDocumentStore((s) => s.fileSize);
  const modified = useDocumentStore((s) => s.modified);
  const lineCount = useDocumentStore((s) => s.lineCount);
  const wordCount = useDocumentStore((s) => s.wordCount);
  const isLoading = useDocumentStore((s) => s.isLoading);

  const workspacePath = useWorkspaceStore((s) => s.workspacePath);
  const fontSize = useSettingsStore((s) => s.settings.fontSize);

  const readingTime = estimateReadingTime(wordCount);
  const workspaceName = workspacePath ? getBaseName(workspacePath) : null;

  return (
    <footer className="h-6 px-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)] select-none shrink-0 font-mono">
      {/* Left side: Status & Workspace info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium">
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" />
              <span className="text-[var(--text-secondary)]">Reading file...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-[var(--text-secondary)]">Ready</span>
            </>
          )}
        </div>

        <div className="h-3 w-px bg-[var(--border-color)]" />

        {workspaceName && (
          <div className="hidden sm:flex items-center gap-1 truncate max-w-[200px]">
            <span>Workspace:</span>
            <span className="text-[var(--text-secondary)] truncate font-semibold">
              {workspaceName}
            </span>
          </div>
        )}

        <div className="hidden sm:block">UTF-8</div>
      </div>

      {/* Center: Document statistics */}
      {currentPath && (
        <div className="hidden md:flex items-center gap-4 text-[var(--text-secondary)]">
          <span>{lineCount.toLocaleString()} lines</span>
          <span>{wordCount.toLocaleString()} words</span>
          <span>{readingTime}</span>
        </div>
      )}

      {/* Right side: File info & font zoom */}
      <div className="flex items-center gap-3">
        {currentPath && (
          <>
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              <span>{formatBytes(fileSize)}</span>
            </div>

            {modified > 0 && (
              <div className="hidden lg:flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Modified {formatRelativeTime(modified)}</span>
              </div>
            )}
          </>
        )}

        <div className="h-3 w-px bg-[var(--border-color)]" />
        <span className="text-[var(--text-muted)]">{fontSize}px</span>
      </div>
    </footer>
  );
};
