import { TableOfContentsItem } from '@/types/markdown';
import { slugify } from './slug';

export function extractTableOfContents(markdownContent: string): TableOfContentsItem[] {
  if (!markdownContent) return [];

  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: TableOfContentsItem[] = [];
  const slugCounts: Record<string, number> = {};

  let match;
  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length;
    const rawTitle = match[2].trim();
    // Strip markdown formatting from title
    const cleanTitle = rawTitle
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    let slug = slugify(cleanTitle);
    if (slugCounts[slug] !== undefined) {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 0;
    }

    items.push({
      id: slug,
      title: cleanTitle,
      level,
    });
  }

  return items;
}
