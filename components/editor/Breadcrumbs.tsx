'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useSidebarStore } from '@/lib/store';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  parentId: string | null;
}

export default function Breadcrumbs({ pageId, isTyping }: { pageId: string, isTyping: boolean }) {
  const { user } = useAuth();
  const { isOpen } = useSidebarStore();
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pages'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPages = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        parentId: doc.data().parentId,
      })) as Page[];
      setPages(fetchedPages);
    });

    return () => unsubscribe();
  }, [user]);

  if (pages.length === 0) return null;

  // Build breadcrumbs path
  const path: Page[] = [];
  let currentId: string | null = pageId;
  
  while (currentId) {
    const page = pages.find(p => p.id === currentId);
    if (page) {
      path.unshift(page);
      currentId = page.parentId;
    } else {
      break;
    }
  }

  return (
    <div 
      className={`absolute top-4 flex items-center gap-1 text-sm text-neutral-400 transition-all duration-500 z-10 ${isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${isOpen ? 'left-6' : 'left-16'}`}
    >
      {path.map((page, index) => (
        <div key={page.id} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />}
          <Link 
            href={`/workspace/${page.id}`}
            className="flex items-center gap-1.5 hover:text-white hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">{page.title || 'Untitled'}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
