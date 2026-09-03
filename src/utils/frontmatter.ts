import { FrontmatterData, ParsedDocument } from '@/types/markdown';

export function parseFrontmatter(rawContent: string): ParsedDocument {
  if (!rawContent || typeof rawContent !== 'string') {
    return { frontmatter: {}, content: '', rawContent: '' };
  }

  const trimmed = rawContent.trimStart();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, content: rawContent, rawContent };
  }

  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, content: rawContent, rawContent };
  }

  const rawYaml = match[1];
  const content = match[2];
  const frontmatter: FrontmatterData = {};

  try {
    const lines = rawYaml.split(/\r?\n/);
    let currentKey = '';
    let isArray = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;

      if (trimmedLine.startsWith('- ') && currentKey && isArray) {
        const val = trimmedLine.substring(2).trim().replace(/^['"]|['"]$/g, '');
        if (Array.isArray(frontmatter[currentKey])) {
          frontmatter[currentKey].push(val);
        }
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        if (value.startsWith('[') && value.endsWith(']')) {
          // Inline array: [tag1, tag2]
          const arrayItems = value
            .slice(1, -1)
            .split(',')
            .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
          frontmatter[key] = arrayItems;
          currentKey = '';
          isArray = false;
        } else if (value === '' || value === '>') {
          currentKey = key;
          isArray = true;
          frontmatter[key] = [];
        } else {
          // Strip quotes
          value = value.replace(/^['"]|['"]$/g, '');
          frontmatter[key] = value;
          currentKey = key;
          isArray = false;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse frontmatter YAML:', e);
  }

  return {
    frontmatter,
    content,
    rawContent,
  };
}
