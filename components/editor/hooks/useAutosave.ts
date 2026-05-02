import { useRef, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { removeUndefined } from '@/lib/utils';
import { JSONContent } from '@tiptap/react';

export function useAutosave(pageId: string) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const triggerSave = (newTitle: string, newContent: JSONContent) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const pageRef = doc(db, 'pages', pageId);
        
        const cleanContent = removeUndefined(newContent);
        const stringifiedContent = JSON.stringify(cleanContent);

        await updateDoc(pageRef, {
          title: newTitle,
          content: stringifiedContent,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `pages/${pageId}`);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce
  };

  return { triggerSave, isSaving };
}
