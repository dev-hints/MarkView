import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', icon, children, className = '', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1 gap-1.5',
      md: 'text-sm px-3 py-1.5 gap-2',
      lg: 'text-base px-4 py-2 gap-2.5',
      icon: 'p-1.5 text-sm w-8 h-8',
    };

    const variantStyles = {
      primary:
        'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:opacity-90 shadow-xs',
      secondary:
        'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] active:opacity-90 border border-[var(--border-color)]',
      outline:
        'bg-transparent text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:opacity-90 shadow-xs',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
