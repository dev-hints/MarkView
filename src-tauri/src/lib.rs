pub mod commands;
pub mod filesystem;
pub mod search;
pub mod watcher;

use watcher::file_watcher::AppWatcherState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppWatcherState::new())
        .invoke_handler(tauri::generate_handler![
            commands::fs_commands::scan_workspace,
            commands::fs_commands::read_markdown_file,
            commands::fs_commands::check_file_exists,
            commands::fs_commands::check_dir_exists,
            commands::search_commands::search_workspace_content,
            commands::search_commands::quick_search_files,
            commands::watcher_commands::start_watching,
            commands::watcher_commands::stop_watching_current,
            commands::sys_commands::get_app_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
