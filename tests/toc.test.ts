import { describe, it, expect } from 'vitest';
import { extractTableOfContents } from '../src/utils/toc';
import { slugify } from '../src/utils/slug';

describe('Table of Contents Extractor & Slug Generator', () => {
  it('generates clean GitHub-style slugs', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('Understanding Linux & Processes')).toBe('understanding-linux-processes');
    expect(slugify('1. Introduction (Basics)')).toBe('1-introduction-basics');
    expect(slugify('  Trim Spaces  ')).toBe('trim-spaces');
  });


  it('extracts table of contents hierarchy from headings', () => {
    const md = `
# Chapter 1: Introduction
Some text

## Getting Started
More text

### Installation
Step 1

## Configuration
Config options

# Chapter 2: Advanced
Deep dive
`;

    const toc = extractTableOfContents(md);
    expect(toc).toHaveLength(5);
    expect(toc[0]).toEqual({
      id: 'chapter-1-introduction',
      title: 'Chapter 1: Introduction',
      level: 1,
    });
    expect(toc[1]).toEqual({
      id: 'getting-started',
      title: 'Getting Started',
      level: 2,
    });
    expect(toc[2]).toEqual({
      id: 'installation',
      title: 'Installation',
      level: 3,
    });
  });

  it('handles duplicate heading slugs by appending index', () => {
    const md = `
## Overview
First overview
## Overview
Second overview
## Overview
Third overview
`;
    const toc = extractTableOfContents(md);
    expect(toc).toHaveLength(3);
    expect(toc[0].id).toBe('overview');
    expect(toc[1].id).toBe('overview-1');
    expect(toc[2].id).toBe('overview-2');
  });

  it('strips inline markdown formatting from TOC titles', () => {
    const md = '## **Bold** and `code` and [link](url)';
    const toc = extractTableOfContents(md);
    expect(toc[0].title).toBe('Bold and code and link');
  });
});
