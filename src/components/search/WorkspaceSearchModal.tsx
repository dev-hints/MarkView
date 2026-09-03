import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, CaseSensitive, Regex, X } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDocumentStore } from '@/stores/documentStore';
import { searchWorkspaceContent } from '@/services/filesystem/fsService';
import { SearchMatch } from '@/types/search';
import { Kbd } from '@/components/common/Kbd';

export const WorkspaceSearchModal: React.FC = () => {
  const isWorkspaceSearchOpen = useSearchStore((s) => s.isWorkspaceSearchOpen);
  const closeWorkspaceSearch = useSearchStore((s) => s.closeWorkspaceSearch);
  const workspacePath = useWorkspaceStore((s) => s.workspacePath);
  const openDocument = useDocumentStore((s) => s.openDocument);

  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isWorkspaceSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isWorkspaceSearchOpen]);

  useEffect(() => {
    if (!isWorkspaceSearchOpen || !workspacePath || !query.trim()) {
      setMatches([]);
      setErrorMessage(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await searchWorkspaceContent(
          workspacePath,
          query,
          caseSensitive,
          isRegex,
          100
        );
        setMatches(res);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Search failed');
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, caseSensitive, isRegex, isWorkspaceSearchOpen, workspacePath]);

  const handleSelectMatch = (match: SearchMatch) => {
    openDocument(match.path);
    closeWorkspaceSearch();
  };

  if (!isWorkspaceSearchOpen) return null;

  // Group matches by file
  const groupedMatches = matches.reduce<Record<string, { file_name: string; relative_path: string; path: string; items: SearchMatch[] }>>(
    (acc, item) => {
      if (!acc[item.path]) {
        acc[item.path] = {
          file_name: item.file_name,
          relative_path: item.relative_path,
          path: item.path,
          items: [],
        };
      }
      acc[item.path].items.push(item);
      return acc;
    },
    {}
  );

  const fileGroups = Object.values(groupedMatches);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWorkspaceSearch();
      }}
    >
      <div className="w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={
              workspacePath
                ? 'Search text across all markdown files...'
                : 'Open a workspace first to search contents...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!workspacePath}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />

          {/* Search Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              title="Match Case"
              aria-label="Match Case"
              className={`p-1.5 rounded transition-colors ${
                caseSensitive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <CaseSensitive className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRegex(!isRegex)}
              title="Use Regular Expression"
              aria-label="Use Regular Expression"
              className={`p-1.5 rounded transition-colors ${
                isRegex
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <Regex className="w-4 h-4" />
            </button>
          </div>

          <Kbd>ESC</Kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!workspacePath ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              No folder is open. Please open a folder to search its files.
            </div>
          ) : errorMessage ? (
            <div className="p-4 text-xs font-mono text-red-500 bg-red-500/10 rounded-md">
              {errorMessage}
            </div>
          ) : !query.trim() ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              Type keywords to search across markdown files in this workspace.
            </div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              {isLoading ? 'Searching...' : `No results found for "${query}"`}
            </div>
          ) : (
            fileGroups.map((group) => (
              <div
                key={group.path}
                className="rounded-lg border border-[var(--border-color)] overflow-hidden bg-[var(--card-bg)]"
              >
                {/* Group File Header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs">
                  <FileText className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span className="font-semibold text-[var(--text-primary)]">
                    {group.file_name}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] truncate">
                    {group.relative_path}
                  </span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-mono">
                    {group.items.length} {group.items.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {/* Match Line Items */}
                <div className="divide-y divide-[var(--border-subtle)]">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectMatch(item)}
                      className="flex items-start gap-2.5 px-3 py-2 hover:bg-[var(--sidebar-hover)] cursor-pointer transition-colors text-xs"
                    >
                      <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0 w-8 text-right">
                        L{item.line_number}:
                      </span>
                      <div className="flex-1 font-mono text-[11px] text-[var(--text-secondary)] truncate">
                        {item.match_start > 0 && (
                          <span>{item.line_content.slice(0, item.match_start)}</span>
                        )}
                        <span className="bg-amber-400/30 text-amber-700 dark:text-amber-300 font-semibold px-0.5 rounded">
                          {item.line_content.slice(item.match_start, item.match_end)}
                        </span>
                        <span>{item.line_content.slice(item.match_end)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>
            {matches.length} matches in {fileGroups.length} files
          </span>
          <span>Click a match to open document</span>
        </div>
      </div>
    </div>
  );
};
