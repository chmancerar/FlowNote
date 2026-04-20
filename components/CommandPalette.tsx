'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Command } from 'cmdk';
import { Search, FileText, LayoutTemplate, Star } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { RenderIcon } from '@/components/RenderIcon';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open && user) {
      const fetchPages = async () => {
        const q = query(
          collection(db, 'pages'),
          where('userId', '==', user.uid),
          where('isTrashed', '!=', true),
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a: any, b: any) => {
          return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        });
        setPages(data);
      };
      fetchPages();
    }
  }, [open, user]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95">
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
          <Dialog.Description className="sr-only">Search and quick navigate to pages in your workspace.</Dialog.Description>
          <Command
            className="flex w-full flex-col overflow-hidden bg-neutral-900 border-none outline-none focus:outline-none"
          >
            <div className="flex items-center border-b border-neutral-800 px-3">
              <Search className="mr-2 h-5 w-5 shrink-0 text-neutral-400" />
              <Command.Input 
                autoFocus
                placeholder="Search pages..." 
                className="flex h-14 w-full rounded-md bg-transparent py-4 text-sm outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0 text-neutral-200"
              />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-sm text-neutral-400">
                No results found.
              </Command.Empty>
              <Command.Group heading="Pages" className="text-xs font-medium text-neutral-500 p-1">
                {pages.map((page) => (
                  <Command.Item
                    key={page.id}
                    value={page.title || 'Untitled'}
                    onSelect={() => {
                      router.push(`/workspace/${page.id}`);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer select-none items-center rounded-md px-2 py-2.5 text-sm outline-none aria-selected:bg-neutral-800 data-[selected=true]:bg-neutral-800 hover:bg-neutral-800 text-neutral-200 transition-colors"
                  >
                    {page.icon ? (
                      <RenderIcon icon={page.icon} className="w-5 h-5 mr-2 text-neutral-400 group-hover:text-neutral-300" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4 text-neutral-400" />
                    )}
                    <span className="truncate">{page.title || 'Untitled'}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
