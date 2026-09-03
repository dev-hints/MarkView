use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub relative_path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
    pub size: Option<u64>,
    pub modified: Option<u64>,
    pub extension: Option<String>,
}

const MARKDOWN_EXTENSIONS: &[&str] = &["md", "markdown", "mdown", "mkd", "mdx"];
const IGNORED_DIRECTORIES: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    ".cache",
    ".vscode",
    ".idea",
    ".next",
    ".nuxt",
    "dist",
    "build",
    "__pycache__",
    ".venv",
    "venv",
];

pub fn is_markdown_file(path: &Path) -> bool {
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        MARKDOWN_EXTENSIONS.contains(&ext.to_lowercase().as_str())
    } else {
        false
    }
}

pub fn scan_directory_tree(root_path: &Path, show_hidden: bool) -> Result<FileEntry, String> {
    if !root_path.exists() {
        return Err(format!("Directory does not exist: {}", root_path.display()));
    }
    if !root_path.is_dir() {
        return Err(format!("Path is not a directory: {}", root_path.display()));
    }

    scan_node(root_path, root_path, show_hidden)
}

fn scan_node(base_root: &Path, current_path: &Path, show_hidden: bool) -> Result<FileEntry, String> {
    let name = current_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| current_path.to_string_lossy().to_string());

    let relative_path = match current_path.strip_prefix(base_root) {
        Ok(p) => {
            let s = p.to_string_lossy().to_string();
            if s.is_empty() {
                name.clone()
            } else {
                s
            }
        }
        Err(_) => name.clone(),
    };

    let metadata = fs::metadata(current_path).map_err(|e| e.to_string())?;
    let modified = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    if metadata.is_dir() {
        let mut children = Vec::new();
        if let Ok(entries) = fs::read_dir(current_path) {
            for entry in entries.flatten() {
                let entry_path = entry.path();
                let file_name = entry_path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();

                if !show_hidden && file_name.starts_with('.') {
                    continue;
                }

                if entry_path.is_dir() {
                    if IGNORED_DIRECTORIES.contains(&file_name.as_str()) {
                        continue;
                    }
                    if let Ok(child_entry) = scan_node(base_root, &entry_path, show_hidden) {
                        // Only add directory if it contains markdown files (or keep directories for structure)
                        if has_markdown_files(&child_entry) {
                            children.push(child_entry);
                        }
                    }
                } else if is_markdown_file(&entry_path) {
                    if let Ok(child_entry) = scan_node(base_root, &entry_path, show_hidden) {
                        children.push(child_entry);
                    }
                }
            }
        }

        // Sort: directories first, then alphabetical
        children.sort_by(|a, b| match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        });

        Ok(FileEntry {
            name,
            path: current_path.to_string_lossy().to_string(),
            relative_path,
            is_dir: true,
            children: Some(children),
            size: None,
            modified,
            extension: None,
        })
    } else {
        let extension = current_path
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_lowercase());

        Ok(FileEntry {
            name,
            path: current_path.to_string_lossy().to_string(),
            relative_path,
            is_dir: false,
            children: None,
            size: Some(metadata.len()),
            modified,
            extension,
        })
    }
}

fn has_markdown_files(entry: &FileEntry) -> bool {
    if !entry.is_dir {
        return true;
    }
    if let Some(children) = &entry.children {
        for child in children {
            if has_markdown_files(child) {
                return true;
            }
        }
    }
    false
}

pub fn scan_flat_markdown_files(root_path: &Path, show_hidden: bool) -> Vec<FileEntry> {
    let mut results = Vec::new();
    collect_files_recursive(root_path, root_path, show_hidden, &mut results);
    results.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    results
}

fn collect_files_recursive(
    base_root: &Path,
    current_path: &Path,
    show_hidden: bool,
    results: &mut Vec<FileEntry>,
) {
    if let Ok(entries) = fs::read_dir(current_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            let file_name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();

            if !show_hidden && file_name.starts_with('.') {
                continue;
            }

            if path.is_dir() {
                if !IGNORED_DIRECTORIES.contains(&file_name.as_str()) {
                    collect_files_recursive(base_root, &path, show_hidden, results);
                }
            } else if is_markdown_file(&path) {
                let relative_path = path
                    .strip_prefix(base_root)
                    .map(|p| p.to_string_lossy().to_string())
                    .unwrap_or_else(|_| file_name.clone());

                let metadata = fs::metadata(&path).ok();
                let size = metadata.as_ref().map(|m| m.len());
                let modified = metadata
                    .and_then(|m| m.modified().ok())
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                    .map(|d| d.as_secs());

                let extension = path
                    .extension()
                    .and_then(|e| e.to_str())
                    .map(|e| e.to_lowercase());

                results.push(FileEntry {
                    name: file_name,
                    path: path.to_string_lossy().to_string(),
                    relative_path,
                    is_dir: false,
                    children: None,
                    size,
                    modified,
                    extension,
                });
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::Write;

    #[test]
    fn test_is_markdown_file() {
        assert!(is_markdown_file(Path::new("doc.md")));
        assert!(is_markdown_file(Path::new("doc.markdown")));
        assert!(is_markdown_file(Path::new("doc.MDX")));
        assert!(!is_markdown_file(Path::new("doc.txt")));
        assert!(!is_markdown_file(Path::new("doc.rs")));
    }

    #[test]
    fn test_scan_directory_tree() {
        let temp_dir = std::env::temp_dir().join("markview_test_scan");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(temp_dir.join("sub")).expect("create dir");

        let mut f1 = File::create(temp_dir.join("README.md")).expect("create file");
        writeln!(f1, "# Hello").unwrap();

        let mut f2 = File::create(temp_dir.join("sub").join("guide.md")).expect("create file");
        writeln!(f2, "# Guide").unwrap();

        let mut f3 = File::create(temp_dir.join("sub").join("ignored.txt")).expect("create file");
        writeln!(f3, "Not markdown").unwrap();

        let tree = scan_directory_tree(&temp_dir, false).expect("scan directory");
        assert!(tree.is_dir);
        let children = tree.children.expect("children");
        assert_eq!(children.len(), 2); // sub directory and README.md

        let flat = scan_flat_markdown_files(&temp_dir, false);
        assert_eq!(flat.len(), 2);

        let _ = fs::remove_dir_all(&temp_dir);
    }
}

