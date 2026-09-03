export interface FileEntry {
  name: string;
  path: string;
  relative_path: string;
  is_dir: boolean;
  children?: FileEntry[];
  size?: number;
  modified?: number;
  extension?: string;
}

export interface ReadFileResult {
  path: string;
  name: string;
  content: string;
  size: number;
  modified: number;
  line_count: number;
  word_count: number;
}

export interface RecentItem {
  path: string;
  name: string;
  workspace_path?: string;
  is_directory: boolean;
  last_opened: number;
}
