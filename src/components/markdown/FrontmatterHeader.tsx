import React from 'react';
import { User, Calendar, Tag, Info } from 'lucide-react';
import { FrontmatterData } from '@/types/markdown';

interface FrontmatterHeaderProps {
  frontmatter: FrontmatterData;
}

export const FrontmatterHeader: React.FC<FrontmatterHeaderProps> = ({ frontmatter }) => {
  const keys = Object.keys(frontmatter);
  if (keys.length === 0) return null;

  const { title, description, author, date, tags, ...rest } = frontmatter;
  const formattedDate = date
    ? typeof date === 'string'
      ? date
      : new Date(date).toLocaleDateString()
    : null;

  const tagList = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
    ? [tags]
    : [];

  const extraKeys = Object.entries(rest).filter(([_, val]) => val !== undefined && val !== null);

  return (
    <div className="mb-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-xs">
      {title && (
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2 !mt-0 !border-b-0">
          {title}
        </h1>
      )}

      {description && (
        <p className="text-base text-[var(--text-secondary)] mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {/* Metadata Badges */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
        {author && (
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{author}</span>
          </div>
        )}

        {formattedDate && (
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>{formattedDate}</span>
          </div>
        )}

        {tagList.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            {tagList.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Additional Custom Fields if any */}
      {extraKeys.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {extraKeys.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2">
              <span className="font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                {k}:
              </span>
              <span className="text-[var(--text-primary)] font-mono truncate">
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
