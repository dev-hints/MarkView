import React from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { FileEntry } from '@/types/fs';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDocumentStore } from '@/stores/documentStore';

interface FileTreeNodeProps {
  node: FileEntry;
  depth?: number;
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, depth = 0 }) => {
  const expandedFolders = useWorkspaceStore((s) => s.expandedFolders);
  const toggleFolder = useWorkspaceStore((s) => s.toggleFolder);
  const filterQuery = useWorkspaceStore((s) => s.filterQuery);

  const currentPath = useDocumentStore((s) => s.currentPath);
  const openDocument = useDocumentStore((s) => s.openDocument);

  const isExpanded = expandedFolders.has(node.path);
  const isSelected =
    !node.is_dir && currentPath?.replace(/\\/g, '/') === node.path.replace(/\\/g, '/');

  // If filtering, check if node or any children match
  if (filterQuery.trim()) {
    const q = filterQuery.toLowerCase();
    const matchesSelf = node.name.toLowerCase().includes(q);
    const hasMatchingDescendant = (entry: FileEntry): boolean => {
      if (entry.name.toLowerCase().includes(q)) return true;
      if (entry.children) {
        return entry.children.some(hasMatchingDescendant);
      }
      return false;
    };

    if (!matchesSelf && !hasMatchingDescendant(node)) {
      return null;
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.is_dir) {
      toggleFolder(node.path);
    } else {
      openDocument(node.path);
    }
  };

  const paddingLeft = `${depth * 12 + 8}px`;

  return (
    <div className="select-none text-xs">
      <div
        onClick={handleClick}
        style={{ paddingLeft }}
        className={`group flex items-center gap-1.5 py-1.5 pr-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] font-semibold shadow-2xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]'
        }`}
      >
        {node.is_dir ? (
          <>
            <span className="w-3.5 h-3.5 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500/90 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500/90 shrink-0" />
            )}
            <span className="truncate font-medium">{node.name}</span>
          </>
        ) : (
          <>
            <span className="w-3.5" /> {/* alignment spacer */}
            <FileText
              className={`w-3.5 h-3.5 shrink-0 ${
                isSelected ? 'text-[var(--accent)]' : 'text-blue-500/70'
              }`}
            />
            <span className="truncate">{node.name}</span>
          </>
        )}
      </div>

      {node.is_dir && isExpanded && node.children && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
