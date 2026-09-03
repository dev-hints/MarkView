import { create } from 'zustand';
import { FrontmatterData } from '@/types/markdown';
import { readMarkdownFile, startWatchingPath } from '@/services/filesystem/fsService';
import { parseFrontmatter } from '@/utils/frontmatter';
import { getBaseName } from '@/utils/paths';
import { useWorkspaceStore } from './workspaceStore';
import { saveLastSession } from '@/services/settings/settingsService';

interface DocumentState {
  currentPath: string | null;
  rawContent: string;
  content: string;
  frontmatter: FrontmatterData;
  fileName: string;
  fileSize: number;
  modified: number;
  lineCount: number;
  wordCount: number;
  isLoading: boolean;
  error: string | null;
  scrollPosition: number;

  // Navigation history
  history: string[];
  historyIndex: number;

  // Actions
  openDocument: (path: string, addToHistory?: boolean) => Promise<void>;
  reloadDocument: () => Promise<void>;
  closeDocument: () => void;
  navigateBack: () => Promise<void>;
  navigateForward: () => Promise<void>;
  canNavigateBack: () => boolean;
  canNavigateForward: () => boolean;
  setScrollPosition: (pos: number) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  currentPath: null,
  rawContent: '',
  content: '',
  frontmatter: {},
  fileName: '',
  fileSize: 0,
  modified: 0,
  lineCount: 0,
  wordCount: 0,
  isLoading: false,
  error: null,
  scrollPosition: 0,
  history: [],
  historyIndex: -1,

  openDocument: async (path: string, addToHistory = true) => {
    if (!path) return;
    const isSamePath = get().currentPath === path;
    if (isSamePath && get().content) {
      return; // already open
    }

    set({ isLoading: true, error: null });

    try {
      const res = await readMarkdownFile(path);
      const parsed = parseFrontmatter(res.content);

      let history = get().history;
      let historyIndex = get().historyIndex;

      if (addToHistory) {
        // Truncate any forward history and push new path
        history = [...history.slice(0, historyIndex + 1), path];
        historyIndex = history.length - 1;
      }

      set({
        currentPath: path,
        fileName: res.name || getBaseName(path),
        rawContent: res.content,
        content: parsed.content,
        frontmatter: parsed.frontmatter,
        fileSize: res.size,
        modified: res.modified,
        lineCount: res.line_count,
        wordCount: res.word_count,
        isLoading: false,
        error: null,
        history,
        historyIndex,
      });

      // Add to recent items in workspace store
      useWorkspaceStore.getState().addRecent(path, false);

      // Save last session
      const ws = useWorkspaceStore.getState().workspacePath;
      saveLastSession(ws, path);

      // Start watching this file if not inside a watched workspace
      if (!ws) {
        await startWatchingPath(path, false);
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || `Failed to read markdown file: ${path}`,
      });
    }
  },

  reloadDocument: async () => {
    const { currentPath } = get();
    if (!currentPath) return;

    try {
      const res = await readMarkdownFile(currentPath);
      const parsed = parseFrontmatter(res.content);

      set({
        rawContent: res.content,
        content: parsed.content,
        frontmatter: parsed.frontmatter,
        fileSize: res.size,
        modified: res.modified,
        lineCount: res.line_count,
        wordCount: res.word_count,
        error: null,
      });
    } catch (err: any) {
      console.warn('Failed to reload document:', err);
    }
  },

  closeDocument: () => {
    set({
      currentPath: null,
      rawContent: '',
      content: '',
      frontmatter: {},
      fileName: '',
      fileSize: 0,
      modified: 0,
      lineCount: 0,
      wordCount: 0,
      error: null,
    });
    const ws = useWorkspaceStore.getState().workspacePath;
    saveLastSession(ws, null);
  },

  navigateBack: async () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevPath = history[historyIndex - 1];
      set({ historyIndex: historyIndex - 1 });
      await get().openDocument(prevPath, false);
    }
  },

  navigateForward: async () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextPath = history[historyIndex + 1];
      set({ historyIndex: historyIndex + 1 });
      await get().openDocument(nextPath, false);
    }
  },

  canNavigateBack: () => get().historyIndex > 0,
  canNavigateForward: () => get().historyIndex < get().history.length - 1,

  setScrollPosition: (pos: number) => {
    set({ scrollPosition: pos });
  },
}));
