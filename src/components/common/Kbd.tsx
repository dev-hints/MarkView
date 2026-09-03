import React from 'react';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[11px] font-mono font-medium rounded border shadow-xs bg-[var(--kbd-bg)] border-[var(--kbd-border)] text-[var(--text-secondary)] select-none ${className}`}
    >
      {children}
    </kbd>
  );
};
