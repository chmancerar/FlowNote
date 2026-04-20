'use client';

import { FileText } from 'lucide-react';
import CreatePageButton from '@/components/sidebar/CreatePageButton';

export default function WorkspaceDefaultPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
      <FileText className="w-16 h-16 mb-4 opacity-20" />
      <h2 className="text-xl font-medium text-white mb-2">Welcome to your Workspace</h2>
      <p className="mb-6 text-center max-w-md">
        Select a page from the sidebar to start editing,<br /> or create a new one.
      </p>
      <div className="w-48 text-center flex justify-center">
        <CreatePageButton variant="primary" />
      </div>
    </div>
  );
}
