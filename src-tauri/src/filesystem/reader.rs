use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadFileResult {
    pub path: String,
    pub name: String,
    pub content: String,
    pub size: u64,
    pub modified: u64,
    pub line_count: usize,
    pub word_count: usize,
}

pub fn read_file_content(path_str: &str) -> Result<ReadFileResult, String> {
    let path = Path::new(path_str);
    if !path.exists() {
        return Err(format!("File does not exist: {}", path_str));
    }
    if !path.is_file() {
        return Err(format!("Path is not a file: {}", path_str));
    }

    let metadata = fs::metadata(path).map_err(|e| format!("Cannot read file metadata: {}", e))?;
    let size = metadata.len();

    // Prevent loading absurdly large files (> 50MB) directly into memory
    if size > 50 * 1024 * 1024 {
        return Err("File is too large to render (> 50 MB)".to_string());
    }

    let bytes = fs::read(path).map_err(|e| format!("Cannot read file: {}", e))?;
    let content = String::from_utf8(bytes)
        .map_err(|_| "File contains invalid UTF-8 characters or is a binary file".to_string())?;

    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path_str.to_string());

    let modified = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let line_count = content.lines().count();
    let word_count = content.split_whitespace().count();

    Ok(ReadFileResult {
        path: path_str.to_string(),
        name,
        content,
        size,
        modified,
        line_count,
        word_count,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_read_file_content_success() {
        let temp_dir = std::env::temp_dir();
        let test_file = temp_dir.join("markview_test_reader.md");
        let mut f = fs::File::create(&test_file).expect("create file");
        writeln!(f, "# Test Heading\n\nSome test markdown content.\nLine 3").expect("write file");

        let result = read_file_content(test_file.to_str().unwrap());
        assert!(result.is_ok());
        let res = result.unwrap();
        assert_eq!(res.name, "markview_test_reader.md");
        assert!(res.content.contains("# Test Heading"));
        assert_eq!(res.line_count, 4);

        let _ = fs::remove_file(test_file);
    }

    #[test]
    fn test_read_nonexistent_file() {
        let result = read_file_content("/nonexistent/path/doc.md");
        assert!(result.is_err());
    }
}

