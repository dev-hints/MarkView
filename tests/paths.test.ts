import { describe, it, expect } from 'vitest';
import {
  getBaseName,
  getDirName,
  getFileExtension,
  isMarkdownPath,
  resolveRelativePath,
} from '../src/utils/paths';

describe('Path Utilities', () => {
  it('extracts basename correctly on posix and windows paths', () => {
    expect(getBaseName('/home/user/docs/readme.md')).toBe('readme.md');
    expect(getBaseName('C:\\Users\\Ayush\\Projects\\docs\\intro.md')).toBe('intro.md');
    expect(getBaseName('file.md')).toBe('file.md');
  });

  it('extracts directory correctly', () => {
    expect(getDirName('/home/user/docs/readme.md')).toBe('/home/user/docs');
    expect(getDirName('C:\\Users\\Ayush\\file.md')).toBe('C:/Users/Ayush');
  });

  it('identifies markdown file extensions accurately', () => {
    expect(isMarkdownPath('doc.md')).toBe(true);
    expect(isMarkdownPath('doc.markdown')).toBe(true);
    expect(isMarkdownPath('doc.MDX')).toBe(true);
    expect(isMarkdownPath('doc.txt')).toBe(false);
    expect(isMarkdownPath('image.png')).toBe(false);
  });

  it('resolves relative file paths accurately', () => {
    expect(resolveRelativePath('/home/user/docs/guide.md', './getting-started.md')).toBe(
      '/home/user/docs/getting-started.md'
    );
    expect(resolveRelativePath('/home/user/docs/guide.md', '../intro.md')).toBe(
      '/home/user/intro.md'
    );
    expect(resolveRelativePath('/home/user/docs/guide.md', 'https://example.com')).toBe(
      'https://example.com'
    );
    expect(resolveRelativePath('/home/user/docs/guide.md', '#heading-anchor')).toBe(
      '#heading-anchor'
    );
  });
});
