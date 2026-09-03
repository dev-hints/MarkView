use crate::filesystem::scanner::{scan_flat_markdown_files, FileEntry};
use regex::RegexBuilder;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchMatch {
    pub path: String,
    pub relative_path: String,
    pub file_name: String,
    pub line_number: usize,
    pub line_content: String,
    pub match_start: usize,
    pub match_end: usize,
}

pub fn search_content(
    workspace_path: &str,
    query: &str,
    case_sensitive: bool,
    is_regex: bool,
    max_results: usize,
) -> Result<Vec<SearchMatch>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    let root = Path::new(workspace_path);
    if !root.exists() || !root.is_dir() {
        return Err(format!("Invalid workspace directory: {}", workspace_path));
    }

    let regex_matcher = if is_regex {
        RegexBuilder::new(query)
            .case_insensitive(!case_sensitive)
            .build()
            .map_err(|e| format!("Invalid regular expression: {}", e))?
    } else {
        let escaped = regex::escape(query);
        RegexBuilder::new(&escaped)
            .case_insensitive(!case_sensitive)
            .build()
            .map_err(|e| format!("Regex build error: {}", e))?
    };

    let files = scan_flat_markdown_files(root, false);
    let mut matches = Vec::new();

    for file in files {
        if matches.len() >= max_results {
            break;
        }

        if let Ok(content) = fs::read_to_string(&file.path) {
            for (line_idx, line) in content.lines().enumerate() {
                if matches.len() >= max_results {
                    break;
                }

                if let Some(mat) = regex_matcher.find(line) {
                    let trimmed = line.trim();
                    let offset = line.len() - line.trim_start().len();
                    let start = if mat.start() >= offset {
                        mat.start() - offset
                    } else {
                        0
                    };
                    let end = start + (mat.end() - mat.start());

                    matches.push(SearchMatch {
                        path: file.path.clone(),
                        relative_path: file.relative_path.clone(),
                        file_name: file.name.clone(),
                        line_number: line_idx + 1,
                        line_content: trimmed.to_string(),
                        match_start: start,
                        match_end: end,
                    });
                }
            }
        }
    }

    Ok(matches)
}

pub fn search_files_by_name(
    workspace_path: &str,
    query: &str,
    max_results: usize,
) -> Result<Vec<FileEntry>, String> {
    let root = Path::new(workspace_path);
    if !root.exists() || !root.is_dir() {
        return Err(format!("Invalid workspace directory: {}", workspace_path));
    }

    let files = scan_flat_markdown_files(root, false);
    if query.trim().is_empty() {
        return Ok(files.into_iter().take(max_results).collect());
    }

    let query_lower = query.to_lowercase();
    let mut scored_files: Vec<(usize, FileEntry)> = files
        .into_iter()
        .filter_map(|file| {
            let name_lower = file.name.to_lowercase();
            let path_lower = file.relative_path.to_lowercase();

            if name_lower == query_lower {
                Some((0, file)) // exact match
            } else if name_lower.starts_with(&query_lower) {
                Some((1, file)) // starts with
            } else if name_lower.contains(&query_lower) {
                Some((2, file)) // name contains
            } else if path_lower.contains(&query_lower) {
                Some((3, file)) // path contains
            } else {
                // Fuzzy check
                let mut query_chars = query_lower.chars().peekable();
                for c in path_lower.chars() {
                    if let Some(&qc) = query_chars.peek() {
                        if c == qc {
                            query_chars.next();
                        }
                    }
                }
                if query_chars.peek().is_none() {
                    Some((4, file)) // fuzzy match
                } else {
                    None
                }
            }
        })
        .collect();

    scored_files.sort_by(|a, b| {
        a.0.cmp(&b.0)
            .then_with(|| a.1.name.len().cmp(&b.1.name.len()))
            .then_with(|| a.1.name.cmp(&b.1.name))
    });

    Ok(scored_files
        .into_iter()
        .take(max_results)
        .map(|(_, f)| f)
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::Write;

    #[test]
    fn test_search_content_and_files() {
        let temp_dir = std::env::temp_dir().join("markview_test_search");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).expect("create dir");

        let mut f1 = File::create(temp_dir.join("guide.md")).expect("create file");
        writeln!(f1, "# Getting Started\nLearn Linux networking and kernel.\nLine 3").unwrap();

        let mut f2 = File::create(temp_dir.join("faq.md")).expect("create file");
        writeln!(f2, "# FAQ\nHow to configure networking?").unwrap();

        let matches = search_content(temp_dir.to_str().unwrap(), "networking", false, false, 10).unwrap();
        assert_eq!(matches.len(), 2);
        assert_eq!(matches[0].line_number, 2);

        let files = search_files_by_name(temp_dir.to_str().unwrap(), "guide", 10).unwrap();
        assert_eq!(files.len(), 1);
        assert_eq!(files[0].name, "guide.md");

        let _ = fs::remove_dir_all(&temp_dir);
    }
}

