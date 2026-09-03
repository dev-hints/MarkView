import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../src/utils/frontmatter';

describe('Frontmatter Parser', () => {
  it('parses standard YAML frontmatter with title, description, and author', () => {
    const markdown = `---
title: Test Document
description: A document for testing
author: Ayush
date: 2026-09-02
tags: [react, tauri, markdown]
---
# Hello World
This is content.`;

    const parsed = parseFrontmatter(markdown);
    expect(parsed.frontmatter.title).toBe('Test Document');
    expect(parsed.frontmatter.description).toBe('A document for testing');
    expect(parsed.frontmatter.author).toBe('Ayush');
    expect(parsed.frontmatter.tags).toEqual(['react', 'tauri', 'markdown']);
    expect(parsed.content.trim()).toBe('# Hello World\nThis is content.');
  });

  it('handles markdown without frontmatter gracefully', () => {
    const markdown = '# Just a Heading\n\nNo frontmatter here.';
    const parsed = parseFrontmatter(markdown);
    expect(parsed.frontmatter).toEqual({});
    expect(parsed.content).toBe(markdown);
  });

  it('handles malformed frontmatter without throwing an error', () => {
    const markdown = `---
title: [unclosed array
invalid : yaml ::::
---
# Content`;
    const parsed = parseFrontmatter(markdown);
    expect(parsed).toBeDefined();
    expect(parsed.content).toBe('# Content');
  });

  it('handles empty input string', () => {
    const parsed = parseFrontmatter('');
    expect(parsed.frontmatter).toEqual({});
    expect(parsed.content).toBe('');
  });
});
