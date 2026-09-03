import React from 'react';
import {
  ChevronsDown,
  ChevronsUp,
  RefreshCw,
  Search,
  FolderPlus,
  FolderOpen,
} from 'lucide-react';
import { FileTreeNode } from './FileTreeNode';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { openFolderDialog } from '@/services/filesystem/fsService';
import { Button } from '@/components/common/Button';

export const FileTree: React.FC = () => {
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const workspacePath = useWorkspaceStore((s) => s.workspacePath);
  const isLoading = useWorkspaceStore((s) => s.isLoading);
  const filterQuery = useWorkspaceStore((s) => s.filterQuery);
  const setFilterQuery = useWorkspaceStore((s) => s.setFilterQuery);
  const expandAll = useWorkspaceStore((s) => s.expandAll);
  const collapseAll = useWorkspaceStore((s) => s.collapseAll);
  const refreshWorkspace = useWorkspaceStore((s) => s.refreshWorkspace);
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);

  const handleOpenFolder = async () => {
    try {
      const folder = await openFolderDialog();
      if (folder) await openWorkspace(folder);
    } catch (e) {
      console.error(e);
    }
  };

  if (!workspacePath) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-[var(--text-secondary)] h-64">
        <FolderOpen className="w-8 h-8 text-[var(--text-muted)] mb-3 stroke-[1.5]" />
        <p className="font-medium text-[var(--text-primary)] mb-1">No Folder Open</p>
        <p className="text-[11px] text-[var(--text-muted)] mb-4">
          Open a folder containing markdown documents to view its tree.
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon={<FolderPlus className="w-3.5 h-3.5" />}
          onClick={handleOpenFolder}
        >
          Open Folder
        </Button>
      </div>
    );
  }

  const hasChildren = fileTree?.children && fileTree.children.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Search Filter & Tree Actions */}
      <div className="px-3 pt-2 pb-2 space-y-2 border-b border-[var(--border-color)]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Filter files..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span className="font-semibold uppercase tracking-wider">Explorer</span>
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              title="Expand All"
              aria-label="Expand All"
              className="p-1 rounded hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={collapseAll}
              title="Collapse All"
              aria-label="Collapse All"
              className="p-1 rounded hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={refreshWorkspace}
              title="Refresh Tree"
              aria-label="Refresh Tree"
              className={`p-1 rounded hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors ${
                isLoading ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!hasChildren ? (
          <div className="p-4 text-center text-xs text-[var(--text-muted)]">
            No Markdown files found in folder
          </div>
        ) : (
          fileTree.children!.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={0} />
          ))
        )}
      </div>
    </div>
  );
};
