'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export default function CreatePageButton({ parentId = null, variant = 'sidebar' }: { parentId?: string | null, variant?: 'sidebar' | 'primary' }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isCreating) return;

    setIsCreating(true);
    try {
      const newPageRef = doc(collection(db, 'pages'));
      const newPageId = newPageRef.id;

      await setDoc(newPageRef, {
        id: newPageId,
        userId: user.uid,
        title: '',
        content: JSON.stringify({ type: 'doc', content: [] }),
        parentId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push(`/workspace/${newPageId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pages');
    } finally {
      setIsCreating(false);
    }
  };

  const buttonClass = variant === 'primary' 
    ? "flex items-center justify-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors shadow-sm"
    : "w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-md transition-colors group";

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className={buttonClass}
    >
      <Plus className="w-4 h-4" />
      <span>New Page</span>
    </button>
  );
}
