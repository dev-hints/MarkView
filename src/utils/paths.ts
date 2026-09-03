/**
 * Path manipulation utilities for cross-platform file paths
 */

export function getBaseName(pathStr: string): string {
  if (!pathStr) return '';
  const normalized = pathStr.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  return parts[parts.length - 1] || pathStr;
}

export function getDirName(pathStr: string): string {
  if (!pathStr) return '';
  const normalized = pathStr.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash === -1) return '';
  return normalized.substring(0, lastSlash);
}

export function getFileExtension(pathStr: string): string {
  const base = getBaseName(pathStr);
  const dotIndex = base.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return base.substring(dotIndex + 1).toLowerCase();
}

export function isMarkdownPath(pathStr: string): boolean {
  const ext = getFileExtension(pathStr);
  return ['md', 'markdown', 'mdown', 'mkd', 'mdx'].includes(ext);
}

export function resolveRelativePath(baseFilePath: string, relativeTarget: string): string {
  // If target is absolute or url, return as-is
  if (
    relativeTarget.startsWith('http://') ||
    relativeTarget.startsWith('https://') ||
    relativeTarget.startsWith('/') ||
    relativeTarget.startsWith('file://') ||
    relativeTarget.startsWith('#')
  ) {
    return relativeTarget;
  }

  const baseDir = getDirName(baseFilePath);
  if (!baseDir) return relativeTarget;

  const baseParts = baseDir.replace(/\\/g, '/').split('/').filter(Boolean);
  const targetParts = relativeTarget.replace(/\\/g, '/').split('/');

  const isWindowsAbsolute = /^[a-zA-Z]:/.test(baseDir);
  const rootPrefix = isWindowsAbsolute ? '' : '/';

  for (const part of targetParts) {
    if (part === '.' || part === '') {
      continue;
    } else if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }

  return (isWindowsAbsolute ? '' : rootPrefix) + baseParts.join('/');
}
