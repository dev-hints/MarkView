use crate::watcher::file_watcher::{stop_watching, watch_path, AppWatcherState};
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn start_watching(
    app: AppHandle,
    state: State<'_, AppWatcherState>,
    path: String,
    recursive: Option<bool>,
) -> Result<(), String> {
    let rec = recursive.unwrap_or(false);
    watch_path(app, &state, &path, rec)
}

#[tauri::command]
pub async fn stop_watching_current(state: State<'_, AppWatcherState>) -> Result<(), String> {
    stop_watching(&state);
    Ok(())
}
