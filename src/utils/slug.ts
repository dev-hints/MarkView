/**
 * GitHub-compatible slug generator for markdown headings
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[^\w\s-]/g, '') // remove special chars except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into single hyphens
    .replace(/^-+|-+$/g, ''); // trim hyphens
}
