import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  FileCode2,
  FolderCog,
  Info,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Kbd } from '@/components/common/Kbd';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSearchStore } from '@/stores/searchStore';
import { openExternalLink } from '@/services/filesystem/fsService';
import { CodeTheme, ReadingWidth, ThemeMode } from '@/types/settings';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useSearchStore((s) => s.isSettingsOpen);
  const closeSettings = useSearchStore((s) => s.closeSettings);

  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const [activeTab, setActiveTab] = useState<'appearance' | 'markdown' | 'files' | 'about'>('appearance');

  const themes: { id: ThemeMode; label: string; desc: string }[] = [
    { id: 'system', label: 'System', desc: 'Sync with operating system' },
    { id: 'light', label: 'Light', desc: 'Clean paper documentation' },
    { id: 'dark', label: 'Dark', desc: 'Developer high-contrast dark' },
  ];

  const codeThemes: { id: CodeTheme; label: string; mode: 'dark' | 'light'; bg: string }[] = [
    { id: 'github-dark', label: 'GitHub Dark', mode: 'dark', bg: '#24292e' },
    { id: 'github-light', label: 'GitHub Light', mode: 'light', bg: '#f6f8fa' },
    { id: 'nord', label: 'Nord', mode: 'dark', bg: '#2e3440' },
    { id: 'dracula', label: 'Dracula', mode: 'dark', bg: '#282a36' },
    { id: 'one-dark-pro', label: 'One Dark Pro', mode: 'dark', bg: '#282c34' },
    { id: 'vitesse-dark', label: 'Vitesse Dark', mode: 'dark', bg: '#121212' },
    { id: 'vitesse-light', label: 'Vitesse Light', mode: 'light', bg: '#ffffff' },
  ];

  const [isCodeThemeOpen, setIsCodeThemeOpen] = useState(false);
  const codeThemeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (codeThemeRef.current && !codeThemeRef.current.contains(e.target as Node)) {
        setIsCodeThemeOpen(false);
      }
    };
    if (isCodeThemeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCodeThemeOpen]);

  const selectedCodeTheme = codeThemes.find((ct) => ct.id === settings.codeTheme) || codeThemes[0];

  const widths: { id: ReadingWidth; label: string; max: string }[] = [
    { id: 'narrow', label: 'Narrow', max: '640px' },
    { id: 'medium', label: 'Medium', max: '768px' },
    { id: 'wide', label: 'Wide', max: '1024px' },
    { id: 'full', label: 'Full', max: '100%' },
  ];

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { label: 'Open File', keys: [modKey, 'O'] },
    { label: 'Open Folder', keys: [modKey, 'Shift', 'O'] },
    { label: 'Quick Search File', keys: [modKey, 'P'] },
    { label: 'Search Workspace Content', keys: [modKey, 'Shift', 'F'] },
    { label: 'Find in Page', keys: [modKey, 'F'] },
    { label: 'Toggle Sidebar', keys: [modKey, 'B'] },
    { label: 'Toggle Theme Mode', keys: [modKey, 'Shift', 'T'] },
    { label: 'Reload Document', keys: [modKey, 'R'] },
    { label: 'Increase Text Size', keys: [modKey, '+'] },
    { label: 'Decrease Text Size', keys: [modKey, '-'] },
    { label: 'Navigate Back in History', keys: [modKey, '['] },
    { label: 'Navigate Forward in History', keys: [modKey, ']'] },
  ];

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      title={
        <div className="flex items-center gap-2">
          <span>Settings</span>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="flex flex-col md:flex-row gap-6 min-h-[380px]">
        {/* Left Navigation Tabs */}
        <div className="w-full md:w-44 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-[var(--border-color)] pb-3 md:pb-0 md:pr-3 text-xs">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'appearance'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'markdown'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Markdown</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'files'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <FolderCog className="w-4 h-4" />
            <span>Files & Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Shortcuts & About</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 space-y-6 text-xs text-[var(--text-primary)]">
          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <label className="block font-semibold mb-2 text-sm">Theme Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((t) => {
                    const isSelected = settings.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateSettings({ theme: t.id })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] ring-1 ring-[var(--accent)] font-semibold shadow-xs'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}>
                            {t.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                        </div>
                        <p className={`text-[10px] font-normal ${isSelected ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-[var(--text-primary)]">Reading Font Size</label>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="28"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-[var(--text-primary)]">Reading Width</label>
                <div className="grid grid-cols-4 gap-2">
                  {widths.map((w) => {
                    const isSelected = settings.readingWidth === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => updateSettings({ readingWidth: w.id })}
                        className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] ring-1 ring-[var(--accent)] font-semibold shadow-xs'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}>
                          {w.label}
                        </div>
                        <div className={`text-[10px] ${isSelected ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
                          {w.max}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Syntax Theme Custom Dropdown */}
              <div className="relative" ref={codeThemeRef}>
                <label className="block font-semibold mb-2 text-[var(--text-primary)]">
                  Code Syntax Theme (Shiki)
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsCodeThemeOpen(!isCodeThemeOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={isCodeThemeOpen}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shadow-2xs shrink-0"
                      style={{ backgroundColor: selectedCodeTheme.bg }}
                    />
                    <span className="font-medium text-[var(--text-primary)] truncate">
                      {selectedCodeTheme.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      {selectedCodeTheme.mode}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-150 shrink-0 ${
                      isCodeThemeOpen ? 'rotate-180 text-[var(--accent)]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isCodeThemeOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {codeThemes.map((ct) => {
                      const isSelected = settings.codeTheme === ct.id;
                      return (
                        <button
                          key={ct.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            updateSettings({ codeTheme: ct.id });
                            setIsCodeThemeOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--accent)] text-white font-semibold shadow-xs'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full border border-black/20 dark:border-white/20 shadow-2xs shrink-0"
                              style={{ backgroundColor: ct.bg }}
                            />
                            <span className={isSelected ? 'text-white' : 'text-[var(--text-primary)]'}>
                              {ct.label}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]'
                              }`}
                            >
                              {ct.mode}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Native select fallback for testing & accessibility */}
                <select
                  aria-label="Code Syntax Theme"
                  value={settings.codeTheme}
                  onChange={(e) => updateSettings({ codeTheme: e.target.value as CodeTheme })}
                  className="sr-only"
                  tabIndex={-1}
                >
                  {codeThemes.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* MARKDOWN TAB */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div>
                  <div className="font-semibold">Mermaid Diagrams</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Render code blocks with language "mermaid" into interactive diagrams
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableMermaid}
                  onChange={(e) => updateSettings({ enableMermaid: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div>
                  <div className="font-semibold">KaTeX Math Expressions</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Render TeX and LaTeX math formulas ($...$ and $$...$$)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableKaTeX}
                  onChange={(e) => updateSettings({ enableKaTeX: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div>
                  <div className="font-semibold">Render Raw HTML</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Allows sanitized HTML tags inside markdown (disabled by default for security)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.renderRawHtml}
                  onChange={(e) => updateSettings({ renderRawHtml: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div>
                  <div className="font-semibold">Open External Links in Browser</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Open web links (http/https) in your system default browser
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.openExternalLinksInBrowser}
                  onChange={(e) =>
                    updateSettings({ openExternalLinksInBrowser: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* FILES TAB */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div>
                  <div className="font-semibold">Show Hidden Files</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Display dotfiles and hidden folders in the workspace file tree
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showHiddenFiles}
                  onChange={(e) => updateSettings({ showHiddenFiles: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div>
                  <div className="font-semibold">Auto-Reload Changed Files</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Detect file modifications on disk and automatically refresh the view
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoReloadOnChange}
                  onChange={(e) => updateSettings({ autoReloadOnChange: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={resetSettings}
                >
                  Reset All Settings to Defaults
                </Button>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              {/* StrangeInfinity Brand & Profile Card */}
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold tracking-tight text-[var(--accent)] font-mono flex items-center gap-1.5">
                        <span className="text-lg">∞</span> StrangeInfinity
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20">
                        Developer Tools
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      MarkView <span className="text-[11px] font-mono font-normal text-[var(--text-muted)]">v1.0.0</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3.5">
                  Built by <span className="font-semibold text-[var(--text-primary)]">StrangeInfinity</span>. Crafted with a passion for high-performance software engineering, elegant design, and seamless developer workflows.
                </p>

                {/* Professional Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-[var(--border-color)]">
                  {/* Email */}
                  <a
                    href="mailto:strangeinfinity.dev@gmail.com"
                    onClick={(e) => {
                      e.preventDefault();
                      openExternalLink('mailto:strangeinfinity.dev@gmail.com');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all group text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] truncate">Email</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">strangeinfinity.dev@gmail.com</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </a>

                  {/* GitHub */}
                  <a
                    href="https://github.com/strangeinfinity/"
                    onClick={(e) => {
                      e.preventDefault();
                      openExternalLink('https://github.com/strangeinfinity/');
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all group text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-slate-500/10 text-[var(--text-primary)] flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] truncate">GitHub</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">@strangeinfinity</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://in.linkedin.com/in/ayush-kumar-maurya/"
                    onClick={(e) => {
                      e.preventDefault();
                      openExternalLink('https://in.linkedin.com/in/ayush-kumar-maurya/');
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all group text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] truncate">LinkedIn</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">Ayush Kumar Maurya</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com/strangeinfinity.dev"
                    onClick={(e) => {
                      e.preventDefault();
                      openExternalLink('https://instagram.com/strangeinfinity.dev');
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all group text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] truncate">Instagram</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">@strangeinfinity.dev</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </a>
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Keyboard Shortcuts Reference</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {shortcuts.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px]"
                    >
                      <span className="text-[var(--text-secondary)] truncate">{s.label}</span>
                      <div className="flex gap-1 shrink-0 ml-2">
                        {s.keys.map((k, kIdx) => (
                          <Kbd key={kIdx}>{k}</Kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
