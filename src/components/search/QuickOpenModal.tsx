import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, X } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDocumentStore } from '@/stores/documentStore';
import { quickSearchFiles } from '@/services/filesystem/fsService';
import { FileEntry } from '@/types/fs';
import { Kbd } from '@/components/common/Kbd';

export const QuickOpenModal: React.FC = () => {
  const isQuickOpenOpen = useSearchStore((s) => s.isQuickOpenOpen);
  const closeQuickOpen = useSearchStore((s) => s.closeQuickOpen);
  const workspacePath = useWorkspaceStore((s) => s.workspacePath);
  const openDocument = useDocumentStore((s) => s.openDocument);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isQuickOpenOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Initial list of files
      if (workspacePath) {
        setIsLoading(true);
        quickSearchFiles(workspacePath, '', 30).then((res) => {
          setResults(res);
          setIsLoading(false);
        });
      }
    }
  }, [isQuickOpenOpen, workspacePath]);

  useEffect(() => {
    if (!isQuickOpenOpen || !workspacePath) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await quickSearchFiles(workspacePath, query, 30);
        setResults(res);
        setSelectedIndex(0);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [query, isQuickOpenOpen, workspacePath]);

  const handleSelect = (file: FileEntry) => {
    openDocument(file.path);
    closeQuickOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      closeQuickOpen();
    }
  };

  if (!isQuickOpenOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeQuickOpen();
      }}
    >
      <div className="w-full max-w-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={
              workspacePath
                ? 'Type a file name to open...'
                : 'Open a workspace first to search files...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!workspacePath}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Kbd>ESC</Kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {!workspacePath ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              No folder is currently open. Open a folder to use Quick Search.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              {isLoading ? 'Searching...' : `No matching files found for "${query}"`}
            </div>
          ) : (
            results.map((file, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={file.path}
                  onClick={() => handleSelect(file)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-[var(--accent)]' : 'text-blue-500/70'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--text-primary)] truncate">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate">
                        {file.relative_path}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-[var(--accent)] font-medium font-mono">
                      Enter ↵
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>{results.length} files</span>
          <div className="flex items-center gap-3">
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> Navigate
            </span>
            <span>
              <Kbd>↵</Kbd> Open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
