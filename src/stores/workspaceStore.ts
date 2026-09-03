import { create } from 'zustand';
import { FileEntry, RecentItem } from '@/types/fs';
import {
  scanWorkspace,
  startWatchingPath,
} from '@/services/filesystem/fsService';
import {
  loadRecentItems,
  addRecentItem,
  removeRecentItem,
  clearRecentItems,
  loadExpandedFolders,
  saveExpandedFolders,
  saveLastSession,
} from '@/services/settings/settingsService';
import { getBaseName } from '@/utils/paths';
import { useSettingsStore } from './settingsStore';

interface WorkspaceState {
  workspacePath: string | null;
  fileTree: FileEntry | null;
  isLoading: boolean;
  error: string | null;
  expandedFolders: Set<string>;
  filterQuery: string;
  isSidebarOpen: boolean;
  isOutlineOpen: boolean;
  recentItems: RecentItem[];

  // Actions
  openWorkspace: (path: string) => Promise<void>;
  closeWorkspace: () => void;
  refreshWorkspace: () => Promise<void>;
  toggleFolder: (path: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setFilterQuery: (query: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleOutline: () => void;
  setOutlineOpen: (open: boolean) => void;
  addRecent: (path: string, isDirectory: boolean) => void;
  removeRecent: (path: string) => void;
  clearAllRecent: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspacePath: null,
  fileTree: null,
  isLoading: false,
  error: null,
  expandedFolders: new Set<string>(loadExpandedFolders()),
  filterQuery: '',
  isSidebarOpen: true,
  isOutlineOpen: true,
  recentItems: loadRecentItems(),

  openWorkspace: async (path: string) => {
    set({ isLoading: true, error: null, workspacePath: path });
    try {
      const showHidden = useSettingsStore.getState().settings.showHiddenFiles;
      const tree = await scanWorkspace(path, showHidden);
      const newExpanded = new Set(get().expandedFolders);
      newExpanded.add(path);
      saveExpandedFolders(Array.from(newExpanded));

      set({
        fileTree: tree,
        isLoading: false,
        expandedFolders: newExpanded,
      });

      get().addRecent(path, true);
      saveLastSession(path, null);

      // Start watching workspace
      await startWatchingPath(path, true);
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Failed to open workspace directory',
      });
    }
  },

  closeWorkspace: () => {
    set({ workspacePath: null, fileTree: null, error: null });
    saveLastSession(null, null);
  },

  refreshWorkspace: async () => {
    const { workspacePath } = get();
    if (!workspacePath) return;

    try {
      const showHidden = useSettingsStore.getState().settings.showHiddenFiles;
      const tree = await scanWorkspace(workspacePath, showHidden);
      set({ fileTree: tree });
    } catch (err: any) {
      console.warn('Failed to refresh workspace:', err);
    }
  },

  toggleFolder: (path: string) => {
    const { expandedFolders } = get();
    const updated = new Set(expandedFolders);
    if (updated.has(path)) {
      updated.delete(path);
    } else {
      updated.add(path);
    }
    saveExpandedFolders(Array.from(updated));
    set({ expandedFolders: updated });
  },

  expandAll: () => {
    const { fileTree } = get();
    if (!fileTree) return;

    const allDirs = new Set<string>();
    const collectDirs = (node: FileEntry) => {
      if (node.is_dir) {
        allDirs.add(node.path);
        node.children?.forEach(collectDirs);
      }
    };
    collectDirs(fileTree);

    saveExpandedFolders(Array.from(allDirs));
    set({ expandedFolders: allDirs });
  },

  collapseAll: () => {
    const { workspacePath } = get();
    const updated = new Set<string>();
    if (workspacePath) {
      updated.add(workspacePath);
    }
    saveExpandedFolders(Array.from(updated));
    set({ expandedFolders: updated });
  },

  setFilterQuery: (query: string) => {
    set({ filterQuery: query });
  },

  toggleSidebar: () => {
    set({ isSidebarOpen: !get().isSidebarOpen });
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },

  toggleOutline: () => {
    set({ isOutlineOpen: !get().isOutlineOpen });
  },

  setOutlineOpen: (open: boolean) => {
    set({ isOutlineOpen: open });
  },

  addRecent: (path: string, isDirectory: boolean) => {
    const name = getBaseName(path);
    const updated = addRecentItem({
      path,
      name,
      is_directory: isDirectory,
      workspace_path: get().workspacePath || undefined,
    });
    set({ recentItems: updated });
  },

  removeRecent: (path: string) => {
    const updated = removeRecentItem(path);
    set({ recentItems: updated });
  },

  clearAllRecent: () => {
    clearRecentItems();
    set({ recentItems: [] });
  },
}));

// Automatically refresh workspace file tree when showHiddenFiles preference changes
useSettingsStore.subscribe((state, prevState) => {
  if (state.settings.showHiddenFiles !== prevState.settings.showHiddenFiles) {
    useWorkspaceStore.getState().refreshWorkspace();
  }
});
