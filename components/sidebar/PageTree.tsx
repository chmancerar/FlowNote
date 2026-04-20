'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { FileText, ChevronRight, ChevronDown, Plus, MoreHorizontal, Copy, Edit2, Link as LinkIcon, Trash2, FolderInput, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { RenderIcon } from '@/components/RenderIcon';

export interface Page {
  id: string;
  title: string;
  parentId: string | null;
  createdAt: any;
  isTrashed?: boolean;
  icon?: string;
  isFavorite?: boolean;
}

export default function PageTree() {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pages'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Page[];
      setPages(fetchedPages);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDropOnRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverRoot(false);
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    try {
      const pageRef = doc(db, 'pages', draggedId);
      await updateDoc(pageRef, { parentId: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${draggedId}`);
    }
  };

  if (loading) {
    return <div className="px-4 py-2 text-sm text-neutral-500 animate-pulse">Loading pages...</div>;
  }

  const activePages = pages.filter(p => !p.isTrashed);
  const rootPages = activePages.filter(p => !p.parentId);
  const favoritePages = activePages.filter(p => p.isFavorite);
  
  return (
    <div className="space-y-4">
      {favoritePages.length > 0 && (
        <div className="mb-2">
          <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Favorites
          </div>
          <div className="space-y-0.5">
            {favoritePages.map(page => (
              <PageItem key={`fav-${page.id}`} page={page} allPages={activePages} isFavoriteItem={true} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Private
        </div>
        <div 
          className={`space-y-0.5 min-h-[100px] pb-20 ${isDragOverRoot ? 'bg-neutral-800/50 rounded-md' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOverRoot(true); }}
          onDragLeave={() => setIsDragOverRoot(false)}
          onDrop={handleDropOnRoot}
        >
          {rootPages.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-neutral-500 pointer-events-none">No pages yet</div>
          ) : (
            rootPages.map(page => (
              <PageItem key={page.id} page={page} allPages={activePages} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PageItem({ page, allPages, level = 0, isFavoriteItem = false }: { page: Page, allPages: Page[], level?: number, isFavoriteItem?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isActive = pathname === `/workspace/${page.id}`;
  
  const childPages = allPages.filter(p => p.parentId === page.id);
  const hasChildren = childPages.length > 0;

  const toggleFavorite = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await updateDoc(doc(db, 'pages', page.id), { isFavorite: !page.isFavorite });
      toast.success(page.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isFavoriteItem) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', page.id);
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (isFavoriteItem) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === page.id) return;

    let currentParent = page.parentId;
    while (currentParent) {
      if (currentParent === draggedId) return;
      const parentPage = allPages.find(p => p.id === currentParent);
      currentParent = parentPage?.parentId || null;
    }

    try {
      const pageRef = doc(db, 'pages', draggedId);
      await updateDoc(pageRef, { parentId: page.id });
      setExpanded(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${draggedId}`);
    }
  };

  const handleCreateSubpage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      const newPageRef = doc(collection(db, 'pages'));
      await setDoc(newPageRef, {
        id: newPageRef.id,
        userId: user.uid,
        title: '',
        content: JSON.stringify({ type: 'doc', content: [] }),
        parentId: page.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setExpanded(true);
      router.push(`/workspace/${newPageRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pages');
    }
  };

  const handleTrash = async () => {
    try {
      await updateDoc(doc(db, 'pages', page.id), { isTrashed: true });
      setIsTrashDialogOpen(false);
      toast.success('Page moved to trash');
      if (isActive) {
        router.push('/workspace');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
      toast.error('Failed to move page to trash');
    }
  };

  const handleDuplicate = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
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
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pages');
    }
  };

  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const url = `${window.location.origin}/workspace/${page.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleRename = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setRenameValue(page.title || 'Untitled');
    setIsRenaming(true);
  };

  const saveRename = () => {
    setIsRenaming(false);
    if (renameValue.trim() !== '' && renameValue.trim() !== page.title) {
      updateDoc(doc(db, 'pages', page.id), { title: renameValue.trim() }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `pages/${page.id}`);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
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

  const renderPageTree = (parentId: string | null, currentLevel: number = 0) => {
    const children = allPages.filter(p => p.parentId === parentId && p.id !== page.id);
    if (children.length === 0) return null;

    return children.map(child => (
      <div key={child.id}>
        <button
          onClick={() => handleMoveTo(child.id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md text-left transition-colors"
          style={{ paddingLeft: `${currentLevel * 16 + 8}px` }}
        >
          {child.icon ? (
            <span className="w-4 h-4 flex items-center justify-center text-xs">{child.icon}</span>
          ) : (
            <FileText className="w-4 h-4 text-neutral-500" />
          )}
          <span className="truncate">{child.title || 'Untitled'}</span>
        </button>
        {renderPageTree(child.id, currentLevel + 1)}
      </div>
    ));
  };

  return (
    <div>
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`group flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors cursor-pointer ${
          isActive ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
        } ${isDragOver ? 'bg-blue-500/20 ring-1 ring-blue-500' : ''}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
          className={`p-0.5 rounded hover:bg-neutral-600 shrink-0 ${hasChildren ? 'opacity-100' : 'opacity-0'}`}
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        
        {isRenaming ? (
          <div className="flex-1 flex items-center gap-2 min-w-0 py-0.5">
            {page.icon ? (
              <RenderIcon icon={page.icon} className="w-4 h-4 shrink-0 text-sm leading-none text-neutral-400" />
            ) : (
              <FileText className="w-4 h-4 shrink-0" />
            )}
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={saveRename}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-neutral-900 border border-neutral-600 rounded px-1 text-sm text-white focus:outline-none focus:border-blue-500 w-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <Link href={`/workspace/${page.id}`} className="flex-1 flex items-center gap-2 truncate min-w-0 py-0.5">
            {page.icon ? (
              <RenderIcon icon={page.icon} className="w-4 h-4 shrink-0 text-sm leading-none text-neutral-400 group-hover:text-neutral-300" />
            ) : (
              <FileText className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">{page.title || 'Untitled'}</span>
          </Link>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="p-1 rounded hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors"
                title="More options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[160px] bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-xl z-50 animate-in fade-in zoom-in-95"
                sideOffset={5}
                align="start"
              >
                <DropdownMenu.Item 
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none"
                >
                  <Star className={`w-4 h-4 ${page.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {page.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  onClick={handleRename}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none"
                >
                  <Edit2 className="w-4 h-4" /> Rename
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none"
                >
                  <Copy className="w-4 h-4" /> Duplicate
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none"
                >
                  <LinkIcon className="w-4 h-4" /> Copy link
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-neutral-700 my-1" />
                <DropdownMenu.Item 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMoveDialogOpen(true);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none"
                >
                  <FolderInput className="w-4 h-4" /> Move to
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-neutral-700 my-1" />
                <DropdownMenu.Item 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsTrashDialogOpen(true);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 rounded-sm cursor-pointer outline-none"
                >
                  <Trash2 className="w-4 h-4" /> Move to Trash
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button 
            onClick={handleCreateSubpage}
            className="p-1 rounded hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors"
            title="Add a page inside"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
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
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {expanded && hasChildren && (
        <div className="mt-0.5">
          {childPages.map(child => (
            <PageItem key={child.id} page={child} allPages={allPages} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
