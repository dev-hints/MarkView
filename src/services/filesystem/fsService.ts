import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import { FileEntry, ReadFileResult } from '@/types/fs';
import { SearchMatch } from '@/types/search';

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Web / fallback in-memory registry for local files and folders opened in browser mode
interface WebFileRecord {
  file: File;
  name: string;
  path: string;
  relative_path: string;
  content?: string;
  size: number;
  modified: number;
}

const webFileRegistry = new Map<string, WebFileRecord>();
let webWorkspaceRootEntry: FileEntry | null = null;
let currentWebWorkspacePath: string | null = null;

export async function openMarkdownFileDialog(): Promise<string | null> {
  if (!isTauri()) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.mdx,.mdown,.mkd';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const content = await file.text();
          const path = file.name;
          webFileRegistry.set(path, {
            file,
            name: file.name,
            path,
            relative_path: file.name,
            content,
            size: file.size,
            modified: Math.floor(file.lastModified / 1000),
          });
          resolve(path);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }

  try {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: 'Markdown Files',
          extensions: ['md', 'markdown', 'mdx', 'mdown', 'mkd'],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
    });

    if (typeof selected === 'string') {
      return selected;
    }
    return null;
  } catch (error) {
    console.error('Error in openMarkdownFileDialog:', error);
    throw error;
  }
}

export async function openFolderDialog(): Promise<string | null> {
  if (!isTauri()) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      (input as any).webkitdirectory = true;
      (input as any).directory = true;
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length === 0) {
          resolve(null);
          return;
        }

        const mdFiles = files.filter((f) => {
          const name = f.name.toLowerCase();
          return (
            name.endsWith('.md') ||
            name.endsWith('.markdown') ||
            name.endsWith('.mdx') ||
            name.endsWith('.mdown') ||
            name.endsWith('.mkd')
          );
        });

        if (mdFiles.length === 0) {
          alert('No Markdown files found in selected folder.');
          resolve(null);
          return;
        }

        const firstRel = (mdFiles[0] as any).webkitRelativePath || mdFiles[0].name;
        const rootName = firstRel.split('/')[0] || 'Workspace';
        currentWebWorkspacePath = rootName;

        const rootEntry: FileEntry = {
          name: rootName,
          path: rootName,
          relative_path: '',
          is_dir: true,
          children: [],
        };

        for (const file of mdFiles) {
          const relPath = (file as any).webkitRelativePath || file.name;
          const content = await file.text();
          webFileRegistry.set(relPath, {
            file,
            name: file.name,
            path: relPath,
            relative_path: relPath,
            content,
            size: file.size,
            modified: Math.floor(file.lastModified / 1000),
          });

          // Insert into directory tree hierarchy
          const segments = relPath.split('/');
          let currentDir = rootEntry;
          for (let i = 1; i < segments.length - 1; i++) {
            const seg = segments[i];
            let child = currentDir.children?.find((c) => c.is_dir && c.name === seg);
            if (!child) {
              child = {
                name: seg,
                path: segments.slice(0, i + 1).join('/'),
                relative_path: segments.slice(1, i + 1).join('/'),
                is_dir: true,
                children: [],
              };
              currentDir.children = currentDir.children || [];
              currentDir.children.push(child);
            }
            currentDir = child;
          }

          currentDir.children = currentDir.children || [];
          currentDir.children.push({
            name: file.name,
            path: relPath,
            relative_path: relPath,
            is_dir: false,
            size: file.size,
            modified: Math.floor(file.lastModified / 1000),
            extension: file.name.split('.').pop()?.toLowerCase(),
          });
        }

        webWorkspaceRootEntry = rootEntry;
        resolve(rootName);
      };
      input.click();
    });
  }

  try {
    const selected = await open({
      multiple: false,
      directory: true,
    });

    if (typeof selected === 'string') {
      return selected;
    }
    return null;
  } catch (error) {
    console.error('Error in openFolderDialog:', error);
    throw error;
  }
}

export async function scanWorkspace(
  path: string,
  showHidden: boolean = false
): Promise<FileEntry> {
  if (!isTauri()) {
    if (webWorkspaceRootEntry && currentWebWorkspacePath === path) {
      return webWorkspaceRootEntry;
    }
    return {
      name: path,
      path: path,
      relative_path: '',
      is_dir: true,
      children: [],
    };
  }

  return await invoke<FileEntry>('scan_workspace', {
    path,
    showHidden,
  });
}

export async function readMarkdownFile(path: string): Promise<ReadFileResult> {
  if (!isTauri()) {
    const entry = webFileRegistry.get(path);
    if (entry) {
      const content = entry.content ?? (await entry.file.text());
      entry.content = content;
      const lines = content.split('\n');
      const words = content.split(/\s+/).filter(Boolean);
      return {
        path,
        name: entry.name,
        content,
        size: entry.size,
        modified: entry.modified,
        line_count: lines.length,
        word_count: words.length,
      };
    }

    return {
      path,
      name: path,
      content: '# Document\n\nOpened in web fallback mode.',
      size: 100,
      modified: Math.floor(Date.now() / 1000),
      line_count: 3,
      word_count: 5,
    };
  }

  return await invoke<ReadFileResult>('read_markdown_file', {
    path,
  });
}

export async function searchWorkspaceContent(
  workspacePath: string,
  query: string,
  caseSensitive: boolean = false,
  isRegex: boolean = false,
  maxResults: number = 100
): Promise<SearchMatch[]> {
  if (!isTauri()) {
    if (!query.trim()) return [];
    const results: SearchMatch[] = [];
    const regex = isRegex
      ? new RegExp(query, caseSensitive ? 'g' : 'gi')
      : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');

    for (const [filePath, record] of webFileRegistry.entries()) {
      if (results.length >= maxResults) break;
      const text = record.content || '';
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (results.length >= maxResults) break;
        const line = lines[i];
        regex.lastIndex = 0;
        const match = regex.exec(line);
        if (match) {
          results.push({
            path: filePath,
            relative_path: record.relative_path,
            file_name: record.name,
            line_number: i + 1,
            line_content: line.trim(),
            match_start: match.index,
            match_end: match.index + match[0].length,
          });
        }
      }
    }
    return results;
  }

  return await invoke<SearchMatch[]>('search_workspace_content', {
    workspacePath,
    query,
    caseSensitive,
    isRegex,
    maxResults,
  });
}

export async function quickSearchFiles(
  workspacePath: string,
  query: string,
  maxResults: number = 50
): Promise<FileEntry[]> {
  if (!isTauri()) {
    const q = query.toLowerCase().trim();
    const matches: FileEntry[] = [];
    for (const record of webFileRegistry.values()) {
      if (matches.length >= maxResults) break;
      if (!q || record.name.toLowerCase().includes(q) || record.relative_path.toLowerCase().includes(q)) {
        matches.push({
          name: record.name,
          path: record.path,
          relative_path: record.relative_path,
          is_dir: false,
          size: record.size,
          modified: record.modified,
        });
      }
    }
    return matches;
  }

  return await invoke<FileEntry[]>('quick_search_files', {
    workspacePath,
    query,
    maxResults,
  });
}

export async function startWatchingPath(
  path: string,
  recursive: boolean = false
): Promise<void> {
  if (!isTauri()) return;

  await invoke('start_watching', {
    path,
    recursive,
  });
}

export async function stopWatchingCurrent(): Promise<void> {
  if (!isTauri()) return;

  await invoke('stop_watching_current');
}

export async function openExternalLink(url: string): Promise<void> {
  if (isTauri()) {
    try {
      await openUrl(url);
    } catch (e) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
