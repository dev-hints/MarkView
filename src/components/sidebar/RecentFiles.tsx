import React from 'react';
import { Clock, Trash2, X, FileText, Folder } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDocumentStore } from '@/stores/documentStore';
import { formatRelativeTime } from '@/utils/format';

export const RecentFiles: React.FC = () => {
  const recentItems = useWorkspaceStore((s) => s.recentItems);
  const removeRecent = useWorkspaceStore((s) => s.removeRecent);
  const clearAllRecent = useWorkspaceStore((s) => s.clearAllRecent);
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const openDocument = useDocumentStore((s) => s.openDocument);
  const currentPath = useDocumentStore((s) => s.currentPath);

  const handleOpen = (path: string, isDir: boolean) => {
    if (isDir) {
      openWorkspace(path);
    } else {
      openDocument(path);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Recently Opened</span>
        </div>
        {recentItems.length > 0 && (
          <button
            onClick={clearAllRecent}
            title="Clear History"
            className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {recentItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-muted)]">
            No recent files or folders
          </div>
        ) : (
          recentItems.map((item) => {
            const isSelected =
              !item.is_directory &&
              currentPath?.replace(/\\/g, '/') === item.path.replace(/\\/g, '/');

            return (
              <div
                key={item.path}
                onClick={() => handleOpen(item.path, item.is_directory)}
                className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors text-xs ${
                  isSelected
                    ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {item.is_directory ? (
                    <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-500/70 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium leading-tight">{item.name}</div>
                    <div className="truncate text-[10px] text-[var(--text-muted)] leading-tight">
                      {item.path}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatRelativeTime(item.last_opened)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecent(item.path);
                    }}
                    title="Remove item"
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-tertiary)] transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
