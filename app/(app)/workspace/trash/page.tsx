'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Trash2, RefreshCw, X, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TrashedPage {
  id: string;
  title: string;
  updatedAt: any;
  parentId: string | null;
  parentTitle?: string;
}

export default function TrashPage() {
  const { user } = useAuth();
  const [trashedPages, setTrashedPages] = useState<TrashedPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pages'),
      where('userId', '==', user.uid),
      where('isTrashed', '==', true),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedPages = await Promise.all(snapshot.docs.map(async (document) => {
        const data = document.data();
        let parentTitle = undefined;
        
        if (data.parentId) {
          try {
            const parentDoc = await getDoc(doc(db, 'pages', data.parentId));
            if (parentDoc.exists()) {
              parentTitle = parentDoc.data().title || 'Untitled';
            } else {
              parentTitle = 'Deleted Page';
            }
          } catch (e) {
            parentTitle = 'Unknown';
          }
        }

        return {
          id: document.id,
          title: data.title,
          updatedAt: data.updatedAt,
          parentId: data.parentId,
          parentTitle
        };
      }));
      setTrashedPages(fetchedPages);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRestore = async (pageId: string) => {
    try {
      await updateDoc(doc(db, 'pages', pageId), { isTrashed: false });
      toast.success('Page restored');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${pageId}`);
      toast.error('Failed to restore page');
    }
  };

  const handlePermanentDelete = async (pageId: string) => {
    if (confirm('Are you sure you want to permanently delete this page? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'pages', pageId));
        toast.success('Page permanently deleted');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `pages/${pageId}`);
        toast.error('Failed to delete page');
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (confirm('Are you sure you want to permanently delete all pages in the trash? This cannot be undone.')) {
      try {
        await Promise.all(trashedPages.map(page => deleteDoc(doc(db, 'pages', page.id))));
        toast.success('Trash emptied');
      } catch (error) {
        toast.error('Failed to empty trash completely');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-neutral-500">Loading trash...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Trash2 className="w-8 h-8 text-neutral-400" />
          <h1 className="text-3xl font-bold text-white">Trash</h1>
        </div>
        {trashedPages.length > 0 && (
          <button 
            onClick={handleEmptyTrash}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors text-sm font-medium"
          >
            <AlertTriangle className="w-4 h-4" />
            Empty Trash
          </button>
        )}
      </div>

      {trashedPages.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Your trash is empty.</p>
        </div>
      ) : (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-800 border-b border-neutral-700 text-neutral-400">
              <tr>
                <th className="px-6 py-3 font-medium">Page</th>
                <th className="px-6 py-3 font-medium">Deleted At</th>
                <th className="px-6 py-3 font-medium">Origin</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {trashedPages.map(page => (
                <tr key={page.id} className="hover:bg-neutral-800/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="font-medium truncate max-w-[200px]">{page.title || 'Untitled'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {page.updatedAt?.toDate().toLocaleString() || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {page.parentId ? (
                      <span className="truncate max-w-[150px] inline-block">{page.parentTitle}</span>
                    ) : (
                      <span className="text-neutral-600">Workspace</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleRestore(page.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(page.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete permanently"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
