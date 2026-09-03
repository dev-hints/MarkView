use crate::filesystem::scanner::FileEntry;
use crate::search::content_search::{search_content, search_files_by_name, SearchMatch};

#[tauri::command]
pub async fn search_workspace_content(
    workspace_path: String,
    query: String,
    case_sensitive: Option<bool>,
    is_regex: Option<bool>,
    max_results: Option<usize>,
) -> Result<Vec<SearchMatch>, String> {
    let cs = case_sensitive.unwrap_or(false);
    let rx = is_regex.unwrap_or(false);
    let limit = max_results.unwrap_or(100);

    search_content(&workspace_path, &query, cs, rx, limit)
}

#[tauri::command]
pub async fn quick_search_files(
    workspace_path: String,
    query: String,
    max_results: Option<usize>,
) -> Result<Vec<FileEntry>, String> {
    let limit = max_results.unwrap_or(50);
    search_files_by_name(&workspace_path, &query, limit)
}
