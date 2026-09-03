import React, { useState } from 'react';
import {
  FolderTree,
  Clock,
  PanelLeftClose,
  FolderX,
  Plus,
  FolderOpen,
} from 'lucide-react';
import { FileTree } from './FileTree';
import { RecentFiles } from './RecentFiles';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { getBaseName } from '@/utils/paths';
import { openFolderDialog } from '@/services/filesystem/fsService';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'recent'>('explorer');
  const isSidebarOpen = useWorkspaceStore((s) => s.isSidebarOpen);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const workspacePath = useWorkspaceStore((s) => s.workspacePath);
  const closeWorkspace = useWorkspaceStore((s) => s.closeWorkspace);
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);

  if (!isSidebarOpen) return null;

  const handleOpenFolder = async () => {
    try {
      const folder = await openFolderDialog();
      if (folder) await openWorkspace(folder);
    } catch (e) {
      console.error(e);
    }
  };

  const folderName = workspacePath ? getBaseName(workspacePath) : 'WORKSPACE';

  return (
    <aside
      aria-label="File navigation sidebar"
      className="w-72 shrink-0 border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] flex flex-col h-full overflow-hidden select-none transition-all duration-200"
    >
      {/* Top Workspace Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span className="font-semibold text-xs tracking-tight text-[var(--text-primary)] truncate">
            {folderName}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {workspacePath ? (
            <button
              onClick={closeWorkspace}
              title="Close Folder"
              aria-label="Close Folder"
              className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <FolderX className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleOpenFolder}
              title="Open Folder"
              aria-label="Open Folder"
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={toggleSidebar}
            title="Toggle Sidebar (Ctrl+B)"
            aria-label="Toggle Sidebar"
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-2 pt-1 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md font-medium border-b-2 transition-colors ${
            activeTab === 'explorer'
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--sidebar-bg)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Files</span>
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md font-medium border-b-2 transition-colors ${
            activeTab === 'recent'
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--sidebar-bg)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'explorer' ? <FileTree /> : <RecentFiles />}
      </div>
    </aside>
  );
};
