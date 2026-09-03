export interface FrontmatterData {
  title?: string;
  description?: string;
  author?: string;
  date?: string | Date;
  tags?: string[];
  [key: string]: any;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

export interface ParsedDocument {
  frontmatter: FrontmatterData;
  content: string;
  rawContent: string;
}
