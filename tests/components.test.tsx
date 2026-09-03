import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FrontmatterHeader } from '../src/components/markdown/FrontmatterHeader';
import { TableOfContents } from '../src/components/markdown/TableOfContents';
import { EmptyState } from '../src/components/common/EmptyState';
import { MarkdownRenderer } from '../src/components/markdown/MarkdownRenderer';
import { useSettingsStore } from '../src/stores/settingsStore';

describe('UI Components', () => {
  it('renders FrontmatterHeader with tags and metadata', () => {
    const fm = {
      title: 'Guide to MarkView',
      description: 'A comprehensive markdown reader guide',
      author: 'Ayush',
      tags: ['guide', 'desktop'],
    };

    render(<FrontmatterHeader frontmatter={fm} />);
    expect(screen.getByText('Guide to MarkView')).toBeInTheDocument();
    expect(screen.getByText('A comprehensive markdown reader guide')).toBeInTheDocument();
    expect(screen.getByText('Ayush')).toBeInTheDocument();
    expect(screen.getByText('guide')).toBeInTheDocument();
    expect(screen.getByText('desktop')).toBeInTheDocument();
  });

  it('renders TableOfContents with headings hierarchy', () => {
    const items = [
      { id: 'intro', title: 'Introduction', level: 1 },
      { id: 'usage', title: 'Basic Usage', level: 2 },
    ];

    render(<TableOfContents items={items} activeId="intro" />);
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Basic Usage')).toBeInTheDocument();
  });

  it('renders EmptyState with action buttons', () => {
    render(<EmptyState />);
    expect(screen.getByText('MarkView')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open File/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Folder/i })).toBeInTheDocument();
  });

  it('renders MarkdownRenderer with headings, lists, and tables', () => {
    const md = `
# Markdown Test Heading
This is a test paragraph with **bold text** and *italic text*.

- Item 1
- Item 2

| Column 1 | Column 2 |
| -------- | -------- |
| Value A  | Value B  |
`;

    const { container } = render(<MarkdownRenderer content={md} />);
    expect(screen.getByText('Markdown Test Heading')).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Value A')).toBeInTheDocument();
  });

  it('escapes raw HTML by default when renderRawHtml is disabled', () => {
    useSettingsStore.getState().updateSettings({ renderRawHtml: false });
    const malicious = '<script>window.pwned=true;</script><p>Safe paragraph</p>';
    const { container } = render(<MarkdownRenderer content={malicious} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('p')).toBeNull(); // escaped as text
    expect(container.textContent).toContain('<script>');
  });

  it('sanitizes dangerous HTML tags when raw HTML is enabled', () => {
    useSettingsStore.getState().updateSettings({ renderRawHtml: true });
    const malicious = '<script>window.pwned=true;</script><img src="x" onerror="alert(1)" /><p>Safe paragraph</p>';
    const { container } = render(<MarkdownRenderer content={malicious} />);
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('Safe paragraph')).toBeInTheDocument();
    // Reset to default
    useSettingsStore.getState().updateSettings({ renderRawHtml: false });
  });

  it('renders task lists correctly with checked and unchecked states', () => {
    const taskMd = `
- [x] Completed task
- [ ] Incomplete task
`;
    const { container } = render(<MarkdownRenderer content={taskMd} />);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
  });

  it('handles malformed markdown gracefully without throwing exceptions', () => {
    const malformed = `
# Unclosed [link(
\`\`\`ts
const x = 1;
unclosed code block
| col 1 | col 2
incomplete table row
`;
    expect(() => render(<MarkdownRenderer content={malformed} />)).not.toThrow();
  });
});
