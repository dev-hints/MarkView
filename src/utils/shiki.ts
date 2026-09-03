import { createHighlighter, Highlighter } from 'shiki';
import { CodeTheme } from '@/types/settings';

let highlighterPromise: Promise<Highlighter> | null = null;

const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'json',
  'yaml',
  'markdown',
  'bash',
  'shell',
  'sh',
  'html',
  'css',
  'rust',
  'go',
  'python',
  'c',
  'cpp',
  'java',
  'sql',
  'toml',
  'xml',
  'dockerfile',
  'diff',
];

const SUPPORTED_THEMES = [
  'github-dark',
  'github-light',
  'nord',
  'dracula',
  'one-dark-pro',
  'vitesse-dark',
  'vitesse-light',
];

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: SUPPORTED_THEMES,
      langs: SUPPORTED_LANGUAGES,
    });
  }
  return highlighterPromise;
}

export function normalizeLanguage(lang?: string): string {
  if (!lang) return 'text';
  const clean = lang.trim().toLowerCase();
  const aliasMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    golang: 'go',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    md: 'markdown',
  };
  return aliasMap[clean] || clean;
}

export async function highlightCode(
  code: string,
  lang: string,
  theme: CodeTheme = 'github-dark'
): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    const normalizedLang = normalizeLanguage(lang);
    const validLang = SUPPORTED_LANGUAGES.includes(normalizedLang) ? normalizedLang : 'text';
    const validTheme = SUPPORTED_THEMES.includes(theme) ? theme : 'github-dark';

    return highlighter.codeToHtml(code, {
      lang: validLang,
      theme: validTheme,
    });
  } catch (err) {
    console.warn('Failed to highlight code with Shiki:', err);
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
