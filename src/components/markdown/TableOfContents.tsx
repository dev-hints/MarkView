import React from 'react';
import { ListTree, ChevronRight } from 'lucide-react';
import { TableOfContentsItem } from '@/types/markdown';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  activeId,
  onItemClick,
}) => {
  if (items.length === 0) {
    return (
      <div className="p-4 text-xs text-[var(--text-muted)] text-center select-none">
        No headings in this document
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (onItemClick) {
      onItemClick(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="space-y-1 text-xs select-none">
      <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
        <ListTree className="w-3.5 h-3.5 text-[var(--accent)]" /> Table of Contents
      </div>
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-2 space-y-0.5">
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          const indentClass = {
            1: 'pl-2 font-medium',
            2: 'pl-4',
            3: 'pl-6 text-[11px]',
            4: 'pl-8 text-[11px]',
            5: 'pl-10 text-[11px]',
            6: 'pl-12 text-[11px]',
          }[item.level] || 'pl-2';

          return (
            <a
              key={`${item.id}-${index}`}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`flex items-center gap-1.5 py-1.5 pr-2 rounded-md transition-colors leading-snug ${indentClass} ${
                isActive
                  ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {isActive && <ChevronRight className="w-3 h-3 shrink-0 text-[var(--accent)]" />}
              <span className="truncate">{item.title}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
