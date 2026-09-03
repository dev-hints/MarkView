import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { isTauri } from '@/services/filesystem/fsService';

interface FileChangeEventPayload {
  path: string;
  kind: string;
}

export function useFileWatcher() {
  const currentPath = useDocumentStore((s) => s.currentPath);
  const reloadDocument = useDocumentStore((s) => s.reloadDocument);
  const refreshWorkspace = useWorkspaceStore((s) => s.refreshWorkspace);
  const autoReload = useSettingsStore((s) => s.settings.autoReloadOnChange);

  useEffect(() => {
    if (!isTauri() || !autoReload) return;

    let unlistenFn: (() => void) | null = null;

    listen<FileChangeEventPayload>('file-changed', (event) => {
      const changedPath = event.payload.path;

      // If current open document was modified
      if (currentPath && changedPath.replace(/\\/g, '/') === currentPath.replace(/\\/g, '/')) {
        const scrollContainer = document.querySelector('main .overflow-y-auto') as HTMLElement | null;
        const savedScrollTop = scrollContainer?.scrollTop ?? 0;

        reloadDocument().then(() => {
          if (scrollContainer && savedScrollTop > 0) {
            requestAnimationFrame(() => {
              scrollContainer.scrollTop = savedScrollTop;
            });
          }
        });
      }

      // Also refresh workspace file tree
      refreshWorkspace();
    }).then((unlisten) => {
      unlistenFn = unlisten;
    });

    return () => {
      if (unlistenFn) {
        unlistenFn();
      }
    };
  }, [currentPath, autoReload, reloadDocument, refreshWorkspace]);
}
