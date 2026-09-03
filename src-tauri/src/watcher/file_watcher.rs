use notify_debouncer_mini::{new_debouncer, notify::RecursiveMode, DebounceEventResult, Debouncer};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChangeEvent {
    pub path: String,
    pub kind: String,
}

pub struct AppWatcherState {
    pub debouncer: Mutex<Option<Debouncer<notify::RecommendedWatcher>>>,
    pub current_watched_path: Mutex<Option<String>>,
}

impl AppWatcherState {
    pub fn new() -> Self {
        Self {
            debouncer: Mutex::new(None),
            current_watched_path: Mutex::new(None),
        }
    }
}

pub fn watch_path(
    app: AppHandle,
    state: &AppWatcherState,
    path_to_watch: &str,
    recursive: bool,
) -> Result<(), String> {
    let p = Path::new(path_to_watch);
    if !p.exists() {
        return Err(format!("Path does not exist: {}", path_to_watch));
    }

    // Stop existing watcher if any
    stop_watching(state);

    let app_clone = app.clone();
    let mut debouncer = new_debouncer(
        Duration::from_millis(300),
        move |res: DebounceEventResult| match res {
            Ok(events) => {
                for event in events {
                    let path_str = event.path.to_string_lossy().to_string();
                    let _ = app_clone.emit(
                        "file-changed",
                        FileChangeEvent {
                            path: path_str,
                            kind: "modify".to_string(),
                        },
                    );
                }
            }
            Err(e) => {
                eprintln!("Watcher error: {:?}", e);
            }
        },
    )
    .map_err(|e| format!("Failed to create watcher: {}", e))?;

    let mode = if recursive {
        RecursiveMode::Recursive
    } else {
        RecursiveMode::NonRecursive
    };

    debouncer
        .watcher()
        .watch(p, mode)
        .map_err(|e| format!("Failed to watch path: {}", e))?;

    if let Ok(mut lock) = state.debouncer.lock() {
        *lock = Some(debouncer);
    }
    if let Ok(mut lock) = state.current_watched_path.lock() {
        *lock = Some(path_to_watch.to_string());
    }

    Ok(())
}

pub fn stop_watching(state: &AppWatcherState) {
    if let Ok(mut lock) = state.debouncer.lock() {
        *lock = None;
    }
    if let Ok(mut lock) = state.current_watched_path.lock() {
        *lock = None;
    }
}
