use crate::filesystem::reader::{read_file_content, ReadFileResult};
use crate::filesystem::scanner::{scan_directory_tree, FileEntry};
use std::path::Path;

#[tauri::command]
pub async fn scan_workspace(path: String, show_hidden: Option<bool>) -> Result<FileEntry, String> {
    let show = show_hidden.unwrap_or(false);
    let p = Path::new(&path);
    scan_directory_tree(p, show)
}

#[tauri::command]
pub async fn read_markdown_file(path: String) -> Result<ReadFileResult, String> {
    read_file_content(&path)
}

#[tauri::command]
pub async fn check_file_exists(path: String) -> Result<bool, String> {
    let p = Path::new(&path);
    Ok(p.exists() && p.is_file())
}

#[tauri::command]
pub async fn check_dir_exists(path: String) -> Result<bool, String> {
    let p = Path::new(&path);
    Ok(p.exists() && p.is_dir())
}
