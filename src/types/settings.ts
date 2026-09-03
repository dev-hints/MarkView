export type ThemeMode = 'system' | 'light' | 'dark';

export type ReadingWidth = 'narrow' | 'medium' | 'wide' | 'full';

export type CodeTheme =
  | 'github-dark'
  | 'github-light'
  | 'nord'
  | 'dracula'
  | 'one-dark-pro'
  | 'vitesse-dark'
  | 'vitesse-light';

export interface AppSettings {
  // Appearance
  theme: ThemeMode;
  fontSize: number; // in pixels, e.g. 16
  readingWidth: ReadingWidth;
  codeTheme: CodeTheme;
  showLineNumbers: boolean;

  // Markdown Features
  enableMermaid: boolean;
  enableKaTeX: boolean;
  renderRawHtml: boolean;
  openExternalLinksInBrowser: boolean;

  // Files
  showHiddenFiles: boolean;
  autoReloadOnChange: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  fontSize: 16,
  readingWidth: 'medium',
  codeTheme: 'github-dark',
  showLineNumbers: true,
  enableMermaid: true,
  enableKaTeX: true,
  renderRawHtml: false,
  openExternalLinksInBrowser: true,
  showHiddenFiles: false,
  autoReloadOnChange: true,
};
