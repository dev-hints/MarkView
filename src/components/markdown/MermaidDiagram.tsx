import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, Maximize2, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    let isMounted = true;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    const renderChart = async () => {
      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to render Mermaid diagram');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-500">
        <div className="flex items-center gap-1.5 font-sans font-semibold mb-1 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" /> Mermaid Syntax Error
        </div>
        <div className="overflow-x-auto p-2 bg-[var(--code-bg)] rounded text-[var(--text-secondary)] mt-2">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 flex flex-col items-center justify-center overflow-x-auto shadow-xs">
      <div
        ref={containerRef}
        className="w-full flex justify-center py-2 select-none [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
