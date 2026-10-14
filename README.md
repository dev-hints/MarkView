# MarkView 

> **MarkView** is a modern, high-performance cross-platform desktop Markdown application engineered with **Tauri 2**, **Rust**, **React 19**, **TypeScript**, and **Tailwind CSS**. Built from the ground up for developers, technical writers, and researchers who need a fast, distraction-free, and secure local reading environment.

---

## Overview

Unlike lightweight web wrappers or browser extensions, MarkView combines native Rust filesystem operations with a modern React frontend to deliver sub-millisecond document navigation, deep workspace search, live file-system watching, and syntax highlighting without sacrificing privacy, system memory, or security.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MarkView       Open Folder   Open File   Quick Search [Ctrl+P]   ⚙   Theme │
├────────────────┬────────────────────────────────────────────────────────────┤
│                │                                                            │
│  EXPLORER      │  # Understanding Distributed Consensus                    │
│                │                                                            │
│   consensus  │  ## 1. Introduction                                        │
│    ├ raft.md   │  ───────────────                                           │
│    ├ paxos.md  │  Consensus algorithms are fundamental to building          │
│    └ zab.md    │  fault-tolerant distributed systems...                     │
│                │                                                            │
│   storage    │  ```rust                                                   │
│    ├ lsm.md    │  pub struct RaftNode<S: Storage> {                         │
│    └ wal.md    │      state: NodeState,                                     │
│                │      current_term: u64,                                    │
│                │  }                                                         │
│                │  ```                                                       │
│                │                                                            │
├────────────────┴────────────────────────────────────────────────────────────┤
│ Ready  •  UTF-8  •  Workspace: docs       1,420 lines  •  6,800 words  •  16px
└─────────────────────────────────────────────────────────────────────────────┘
```

---

##  Features

### 📖 High-Fidelity Markdown Rendering
- **CommonMark & GFM Support**: Full support for tables, task lists (`- [x]`), strikethrough, autolinks, and footnotes.
- **Code Highlighting with Shiki**: Accurate syntax highlighting for 25+ programming and markup languages (Rust, Go, TypeScript, Python, C++, Bash, SQL, JSON, YAML, etc.) with theme switching (GitHub Dark/Light, One Dark Pro, Nord, Dracula, Vitesse) and one-click code copying.
- **Math Equations**: Seamless KaTeX rendering for inline (`$...$`) and block (`$$...$$`) mathematical formulas.
- **Diagrams**: Native Mermaid diagram generation (`flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram`, `erDiagram`, `gantt`).
- **YAML Frontmatter**: Automatic extraction and structured visual cards for document metadata (`title`, `description`, `author`, `date`, `tags`, and custom keys).
- **Interactive Heading Anchors**: Auto-generated permalinks for all heading levels (H1–H6).

###  Native File & Workspace Management
- **Single File & Folder Browsing**: Open standalone `.md` files or open entire directories.
- **Recursive Directory Scanner**: Efficient Rust-powered directory traverser with automatic pruning of non-markdown branches and hidden/system directories (`.git`, `node_modules`, `target`, `dist`, etc.).
- **Real-Time Filesystem Watcher**: Background debounced filesystem monitoring (`notify`) that detects external edits, re-renders the document automatically, and preserves the user's scroll position.
- **Recent Files & Workspaces**: Quick-access history of recently visited files and folders with timestamps and individual removal.
- **Session Restoration**: Seamlessly restores your last open folder and document on launch.

###  Lightning-Fast Search
- **Quick Open (`Ctrl/Cmd + P`)**: Fuzzy file finder with instant filtering across all Markdown documents in your workspace.
- **Workspace Content Search (`Ctrl/Cmd + Shift + F`)**: High-performance regex or substring search across all files in the directory tree with line numbers and matched text previews.
- **In-Document Search (`Ctrl/Cmd + F`)**: Real-time DOM highlighting with match counts and keyboard navigation (`Enter` / `Shift + Enter`).

###  Navigation & Table of Contents
- **Auto-Generated TOC**: Dynamic outline generated from document heading hierarchy (H1–H6).
- **ScrollSpy Integration**: Automatically highlights the active section in the outline as you scroll through long articles.
- **History Stack**: Browser-style Back (`Ctrl + [`) and Forward (`Ctrl + ]`) navigation between visited documents.
- **Relative Path Resolution**: Click links pointing to relative markdown files (e.g. `[Next Step](./setup.md)`) to open them immediately in the reader.
- **Local Image Rendering**: Resolves and renders local relative image paths via Tauri's asset streaming protocol.

###  Clean, Accessible UI & Ergonomics
- **Modern Design System**: Clean typography, refined spacing, and subtle borders built with Tailwind CSS.
- **Theme Modes**: Supports **Light Mode**, **Dark Mode**, and **System Default** (automatically syncing with OS preference changes).
- **Reading Controls**: Instant adjustment of font size (12px–32px) and reading container width (Narrow, Medium, Wide, Full).
- **Status Bar**: Real-time statistics including line count, word count, estimated reading time, file size, last modified timestamp, and character encoding.

---

##  Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Desktop Framework** | **Tauri 2** | Lightweight, native cross-platform application runtime |
| **Backend Core** | **Rust** (`std::fs`, `walkdir`, `regex`, `notify`) | Fast, memory-safe filesystem traversal, watcher, and search |
| **Frontend Framework** | **React 19** + **TypeScript** | Responsive and declarative UI with strict type safety |
| **Build Tool** | **Vite 6** | Instant HMR and optimized production bundling |
| **Styling** | **Tailwind CSS 4** | Clean, responsive design system with CSS custom properties |
| **Markdown Pipeline**| `react-markdown`, `remark-gfm`, `remark-math` | AST-based extensible Markdown parsing |
| **HTML Pipeline** | `rehype-slug`, `rehype-katex`, `rehype-sanitize` | Safe HTML transform and XSS prevention |
| **Code Highlighting**| **Shiki** | VS Code-grade Oniguruma syntax highlighting |
| **State Management** | **Zustand** | Lightweight, decoupled stores with local persistence |
| **Icons** | **Lucide React** | Consistent, crisp developer iconography |

---

##  Architecture

MarkView strictly separates native operating system responsibilities from UI presentation:

```
                  ┌─────────────────────────────────────┐
                  │          React 19 Frontend          │
                  │   Components • Hooks • Stores (UI)  │
                  └──────────────────┬──────────────────┘
                                     │ Tauri IPC (invoke/listen)
                  ┌──────────────────▼──────────────────┐
                  │         Tauri 2 Core Layer          │
                  │   Capabilities • Window Management  │
                  └──────────────────┬──────────────────┘
                                     │ Safe Rust Commands
                  ┌──────────────────▼──────────────────┐
                  │           Native Rust Core          │
                  │ ├─ filesystem/ (scanner, reader)    │
                  │ ├─ search/ (regex content & files)  │
                  │ └─ watcher/ (debounced notify)      │
                  └──────────────────┬──────────────────┘
                                     │ OS Syscalls
                          Local Storage & Disk
```

### Directory Structure

```
MarkView/
├── src/
│   ├── components/
│   │   ├── common/          # Button, Modal, Kbd, EmptyState, ErrorBoundary
│   │   ├── layout/          # AppLayout, Titlebar, StatusBar
│   │   ├── markdown/        # MarkdownRenderer, CodeBlock, FrontmatterHeader, TOC, Mermaid
│   │   ├── search/          # QuickOpenModal, WorkspaceSearchModal, InDocSearchBar
│   │   ├── settings/        # SettingsModal
│   │   ├── sidebar/         # Sidebar, FileTree, FileTreeNode, RecentFiles
│   │   └── toolbar/         # DocumentToolbar
│   ├── hooks/               # useTheme, useKeyboardShortcuts, useFileWatcher, useScrollSpy, useInDocSearch
│   ├── services/            # fsService (Tauri IPC), settingsService (Local storage)
│   ├── stores/              # Zustand stores (document, workspace, search, settings)
│   ├── styles/              # index.css (tokens & themes), markdown.css (typography)
│   ├── types/               # TypeScript interfaces (fs, markdown, search, settings)
│   └── utils/               # paths, frontmatter, shiki, slug, toc, format
├── src-tauri/
│   ├── capabilities/        # Tauri 2 permission boundaries (default.json)
│   ├── icons/               # Multi-platform app icons (PNG, ICO, ICNS)
│   ├── src/
│   │   ├── commands/        # Tauri IPC command handlers
│   │   ├── filesystem/      # Recursive scanner and safe file reader
│   │   ├── search/          # Substring and regex search engine
│   │   ├── watcher/         # Debounced filesystem change notifier
│   │   ├── lib.rs           # Tauri application builder and handler registration
│   │   └── main.rs          # Native binary entry point
│   ├── Cargo.toml           # Rust package configuration
│   └── tauri.conf.json      # Tauri application and window configuration
├── tests/                   # Vitest unit & integration test suites
└── package.json
```

---

##  Security Model

Security is a primary design tenet of MarkView:

1. **Local Sandboxing**: Arbitrary filesystem manipulation is prohibited from JavaScript. All directory listings and reads pass through verified Rust routines.
2. **XSS Prevention**: Markdown documents are rendered using AST transforms. Raw HTML is disabled by default. When enabled by user preference, all output is strictly sanitized using `rehype-sanitize` with a whitelist schema.
3. **Safe Link Navigation**: Web links (`http://`, `https://`) and external schemes do not open inside the desktop webview; they are delegated to the user's default system browser via Tauri's Opener plugin.
4. **Offline First**: No telemetry, analytics, or remote network requests are executed. All rendering and syntax highlighting engines (Shiki, KaTeX) run locally.
5. **Path Traversal Protection**: Relative links are validated and canonicalized against the active workspace directory.

---

##  Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl/Cmd + O` | Open single Markdown file |
| `Ctrl/Cmd + Shift + O` | Open workspace folder |
| `Ctrl/Cmd + P` | Quick Open file search |
| `Ctrl/Cmd + Shift + F` | Workspace content search |
| `Ctrl/Cmd + F` | Find in current document |
| `Ctrl/Cmd + B` | Toggle sidebar visibility |
| `Ctrl/Cmd + Shift + T` | Cycle theme (System → Light → Dark) |
| `Ctrl/Cmd + R` | Reload current document & refresh tree |
| `Ctrl/Cmd + Plus` | Increase font size |
| `Ctrl/Cmd + Minus` | Decrease font size |
| `Ctrl/Cmd + 0` | Reset font size to default (16px) |
| `Ctrl/Cmd + [` | Navigate back in document history |
| `Ctrl/Cmd + ]` | Navigate forward in document history |
| `Escape` | Dismiss active modal / search bar |

---

##  Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm** or **pnpm**
- **Rust toolchain**: `rustc` and `cargo` >= 1.77
- **Platform Dependencies**:
  - **Linux (Ubuntu/Debian)**: `sudo apt install libwebkit2gtk-4.1-dev libsoup-3.0-dev build-essential curl wget file libssl-dev libgtk-3-dev`
  - **Linux (Fedora)**: `sudo dnf install webkit2gtk4.1-devel libsoup3-devel gtk3-devel openssl-devel`
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Windows**: Microsoft Visual Studio C++ Build Tools & WebView2 (included in Windows 10/11)

### Installation

```bash
# Clone repository
git clone https://github.com/ayush/markview.git
cd markview

# Install frontend dependencies
npm install
```

### Running in Development

```bash
# Run web preview (Vite dev server)
npm run dev

# Run desktop application with Tauri
npm run tauri dev
```

### Running Tests

```bash
# Run frontend unit & integration tests (Vitest)
npm test

# Run Rust native unit tests
npm run test:rust

# Run all test suites
npm run test:all
```

---

##  Building and Packaging

To produce native production bundles:

```bash
# Compile frontend and generate production installers for the current OS
npm run tauri build
```

Generated installer artifacts will be created in `src-tauri/target/release/bundle/`:

- **Linux**:
  - Debian package: `.deb`
  - AppImage: `.AppImage`
  - RPM package: `.rpm`
- **Windows**:
  - NSIS Installer: `.exe`
  - Windows Installer: `.msi`
- **macOS**:
  - Apple Disk Image: `.dmg`
  - Application bundle: `.app`

---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m "feat: add feature"`.
4. Verify tests and lints pass: `npm run test:all && npm run build`.
5. Push to your branch and open a Pull Request.

---

##  License

Distributed under the **MIT License**. See `LICENSE` for more information.
