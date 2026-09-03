import React, { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X, Search } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';

export const InDocSearchBar: React.FC = () => {
  const isInDocSearchOpen = useSearchStore((s) => s.isInDocSearchOpen);
  const closeInDocSearch = useSearchStore((s) => s.closeInDocSearch);
  const inDocSearchQuery = useSearchStore((s) => s.inDocSearchQuery);
  const setInDocSearchQuery = useSearchStore((s) => s.setInDocSearchQuery);
  const inDocActiveMatch = useSearchStore((s) => s.inDocActiveMatch);
  const inDocTotalMatches = useSearchStore((s) => s.inDocTotalMatches);
  const nextInDocMatch = useSearchStore((s) => s.nextInDocMatch);
  const prevInDocMatch = useSearchStore((s) => s.prevInDocMatch);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInDocSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isInDocSearchOpen]);

  if (!isInDocSearchOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        prevInDocMatch();
      } else {
        nextInDocMatch();
      }
    } else if (e.key === 'Escape') {
      closeInDocSearch();
    }
  };

  return (
    <div className="absolute top-12 right-6 z-40 flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-lg px-2.5 py-1.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
      <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Find in page..."
        value={inDocSearchQuery}
        onChange={(e) => setInDocSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-48 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden text-xs"
      />

      <span className="text-[11px] font-mono text-[var(--text-muted)] px-1">
        {inDocSearchQuery
          ? inDocTotalMatches > 0
            ? `${inDocActiveMatch + 1}/${inDocTotalMatches}`
            : '0/0'
          : ''}
      </span>

      <button
        onClick={prevInDocMatch}
        disabled={inDocTotalMatches === 0}
        title="Previous Match (Shift+Enter)"
        aria-label="Previous Match"
        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 transition-colors"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={nextInDocMatch}
        disabled={inDocTotalMatches === 0}
        title="Next Match (Enter)"
        aria-label="Next Match"
        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 transition-colors"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={closeInDocSearch}
        title="Close (Esc)"
        aria-label="Close"
        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
