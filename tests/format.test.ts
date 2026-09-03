import { describe, it, expect } from 'vitest';
import { formatBytes, formatRelativeTime, estimateReadingTime } from '../src/utils/format';

describe('Format Utilities', () => {
  it('formats bytes into human readable units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });

  it('formats relative timestamps', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatRelativeTime(now - 10)).toBe('just now');
    expect(formatRelativeTime(now - 120)).toBe('2m ago');
    expect(formatRelativeTime(now - 7200)).toBe('2h ago');
    expect(formatRelativeTime(now - 172800)).toBe('2d ago');
  });

  it('estimates reading time accurately', () => {
    expect(estimateReadingTime(100)).toBe('1 min read');
    expect(estimateReadingTime(400)).toBe('2 min read');
    expect(estimateReadingTime(1000)).toBe('5 min read');
  });
});
