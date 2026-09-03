export interface SearchMatch {
  path: string;
  relative_path: string;
  file_name: string;
  line_number: number;
  line_content: string;
  match_start: number;
  match_end: number;
}

export interface InDocSearchMatch {
  index: number;
  line: number;
  text: string;
}
