import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { loadLastSession } from '@/services/settings/settingsService';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDocumentStore } from '@/stores/documentStore';

export const App: React.FC = () => {
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const openDocument = useDocumentStore((s) => s.openDocument);

  useEffect(() => {
    // Attempt restoring last workspace and document
    const { lastWorkspace, lastDocument } = loadLastSession();
    if (lastWorkspace) {
      openWorkspace(lastWorkspace).then(() => {
        if (lastDocument) {
          openDocument(lastDocument);
        }
      });
    } else if (lastDocument) {
      openDocument(lastDocument);
    }
  }, [openWorkspace, openDocument]);

  return <AppLayout />;
};

export default App;
