'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Maximize2, Minimize2, FolderInput, Check, ChevronRight, FileText, Link as LinkIcon, Trash2, Copy, Lock, Unlock, Star } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import { doc, updateDoc, collection, query, where, getDocs, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RenderIcon } from '@/components/RenderIcon';

interface Page {
  id: string;
  title: string;
  parentId: string | null;
  icon?: string | null;
  fullWidth?: boolean;
  isLocked?: boolean;
  isFavorite?: boolean;
  coverImage?: string | null;
}

export default function PageMenu({ page, isTyping }: { page: Page, isTyping?: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const toggleFullWidth = async (checked: boolean) => {
    try {
      await updateDoc(doc(db, 'pages', page.id), { fullWidth: checked });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
      toast.error('Failed to update page width');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await updateDoc(doc(db, 'pages', page.id), { isFavorite: !page.isFavorite });
      toast.success(page.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
    }
  };

  const loadPages = async () => {
    if (!user) return;
    setLoadingPages(true);
    try {
      const q = query(
        collection(db, 'pages'),
        where('userId', '==', user.uid),
        where('isTrashed', '==', false)
      );
      const snapshot = await getDocs(q);
      const fetchedPages = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        parentId: doc.data().parentId,
        icon: doc.data().icon,
      })) as Page[];
      setPages(fetchedPages);
    } catch (error) {
      console.error('Failed to load pages', error);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleMoveTo = async (newParentId: string | null) => {
    try {
      await updateDoc(doc(db, 'pages', page.id), { parentId: newParentId });
      setIsMoveDialogOpen(false);
      toast.success('Page moved successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
      toast.error('Failed to move page');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/workspace/${page.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleDuplicate = async () => {
    if (!user) return;
    try {
      const originalDoc = await getDoc(doc(db, 'pages', page.id));
      if (!originalDoc.exists()) return;
      
      const data = originalDoc.data();
      const newPageRef = doc(collection(db, 'pages'));
      
      await setDoc(newPageRef, {
        ...data,
        id: newPageRef.id,
        title: `${data.title} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push(`/workspace/${newPageRef.id}`);
      toast.success('Page duplicated');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pages');
      toast.error('Failed to duplicate page');
    }
  };

  const handleTrash = async () => {
    try {
      await updateDoc(doc(db, 'pages', page.id), { isTrashed: true });
      setIsTrashDialogOpen(false);
      toast.success('Page moved to trash');
      router.push('/workspace');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
      toast.error('Failed to move page to trash');
    }
  };

  const toggleLock = async () => {
    try {
      await updateDoc(doc(db, 'pages', page.id), { isLocked: !page.isLocked });
      toast.success(page.isLocked ? 'Page unlocked' : 'Page locked');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
      toast.error('Failed to update page lock status');
    }
  };

  // Build a simple tree for the move dialog
  const renderPageTree = (parentId: string | null, level: number = 0) => {
    const children = pages.filter(p => p.parentId === parentId && p.id !== page.id);
    if (children.length === 0) return null;

    return children.map(child => (
      <div key={child.id}>
        <button
          onClick={() => handleMoveTo(child.id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md text-left transition-colors"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {child.icon ? (
            <RenderIcon icon={child.icon} className="w-4 h-4 text-xs text-neutral-400 group-hover:text-neutral-300" />
          ) : (
            <FileText className="w-4 h-4 text-neutral-500" />
          )}
          <span className="truncate">{child.title || 'Untitled'}</span>
        </button>
        {renderPageTree(child.id, level + 1)}
      </div>
    ));
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className={`absolute top-4 right-6 p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all duration-500 z-10 ${isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            align="end" 
            sideOffset={8}
            className="w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95"
          >
            <div className="px-2 py-1.5 flex items-center justify-between text-sm text-neutral-300">
              <span className="flex items-center gap-2">
                {page.fullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                Full width
              </span>
              <Switch.Root
                checked={page.fullWidth || false}
                onCheckedChange={toggleFullWidth}
                className="w-8 h-4 bg-neutral-700 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors cursor-pointer outline-none"
              >
                <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4.5" />
              </Switch.Root>
            </div>
            
            <DropdownMenu.Separator className="h-px bg-neutral-800 my-1" />
            
            <DropdownMenu.Item
              onClick={handleToggleFavorite}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md cursor-pointer outline-none"
            >
              <Star className={`w-4 h-4 ${page.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              {page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md cursor-pointer outline-none"
            >
              <LinkIcon className="w-4 h-4" />
              Copy link
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md cursor-pointer outline-none"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={toggleLock}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md cursor-pointer outline-none"
            >
              {page.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {page.isLocked ? 'Unlock page' : 'Lock page'}
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={() => {
                loadPages();
                setIsMoveDialogOpen(true);
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md cursor-pointer outline-none"
            >
              <FolderInput className="w-4 h-4" />
              Move to
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-neutral-800 my-1" />

            <DropdownMenu.Item
              onClick={() => setIsTrashDialogOpen(true)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded-md cursor-pointer outline-none"
            >
              <Trash2 className="w-4 h-4" />
              Move to Trash
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root open={isTrashDialogOpen} onOpenChange={setIsTrashDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg p-6 shadow-xl z-50 animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-lg font-semibold text-white mb-2">Move to Trash</Dialog.Title>
            <Dialog.Description className="text-sm text-neutral-400 mb-6">
              Are you sure you want to move &quot;{page.title || 'Untitled'}&quot; to the trash? You can restore it later from the Trash section.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                onClick={handleTrash}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              >
                Move to Trash
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">
            <Dialog.Description className="sr-only">Select a destination to move this page to.</Dialog.Description>
            <div className="p-4 border-b border-neutral-800">
              <Dialog.Title className="text-lg font-semibold text-white">Move to...</Dialog.Title>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {loadingPages ? (
                <div className="p-4 text-center text-sm text-neutral-500">Loading...</div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveTo(null)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md text-left transition-colors"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                    </div>
                    Workspace (Top Level)
                  </button>
                  {renderPageTree(null)}
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
