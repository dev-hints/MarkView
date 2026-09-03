import React, { useState, useEffect } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { highlightCode, normalizeLanguage } from '@/utils/shiki';
import { useSettingsStore } from '@/stores/settingsStore';
import { MermaidDiagram } from './MermaidDiagram';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  node?: any;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const codeTheme = useSettingsStore((s) => s.settings.codeTheme);
  const enableMermaid = useSettingsStore((s) => s.settings.enableMermaid);
  const showLineNumbers = useSettingsStore((s) => s.settings.showLineNumbers);

  const rawCode = String(children || '').replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // If this is a Mermaid diagram
  if (language.toLowerCase() === 'mermaid' && enableMermaid) {
    return <MermaidDiagram chart={rawCode} />;
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    highlightCode(rawCode, language, codeTheme).then((html) => {
      if (isMounted) {
        setHighlightedHtml(html);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [rawCode, language, codeTheme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const displayLang = language ? language.toUpperCase() : 'TEXT';

  return (
    <div className="group relative my-5 rounded-lg border border-[var(--border-color)] overflow-hidden bg-[var(--code-bg)] shadow-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--code-header-bg)] border-b border-[var(--border-color)] text-xs font-mono text-[var(--text-muted)] select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="font-semibold text-[var(--text-secondary)]">{displayLang}</span>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500 font-sans font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        {isLoading && !highlightedHtml ? (
          <pre className="m-0 text-[var(--text-primary)]">
            <code>{rawCode}</code>
          </pre>
        ) : (
          <div
            className={`shiki-container [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0 [&>pre]:!border-none ${
              showLineNumbers ? 'show-line-numbers' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </div>
    </div>
  );
};
