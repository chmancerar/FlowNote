'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/editor/Breadcrumbs';
import PageMenu from '@/components/editor/PageMenu';
import PageCover from '@/components/editor/PageCover';
import { updateDoc } from 'firebase/firestore';
import { useEditorStore } from '@/lib/store';

import { Page } from '@/types';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
    </div>
  ),
});

export default function PageView() {
  const { pageId } = useParams() as { pageId: string };
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isTyping, setIsTyping } = useEditorStore();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      if (isTyping) {
        setIsTyping(false);
      }
    };
    
    // Throttle the mouse move evaluation to every 200ms
    const throttledMouseMove = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          handleMouseMove();
          timeout = undefined as any;
        }, 200);
      }
    };

    window.addEventListener('mousemove', throttledMouseMove);
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (timeout) clearTimeout(timeout);
    };
  }, [isTyping, setIsTyping]);

  useEffect(() => {
    if (!user || !pageId) return;

    const pageRef = doc(db, 'pages', pageId);
    const unsubscribe = onSnapshot(pageRef, (docSnap) => {
      if (docSnap.exists()) {
        setPage({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Page not found');
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `pages/${pageId}`);
      setError('Error loading page');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, pageId]);

  useEffect(() => {
    if (page?.title) {
      document.title = `${page.title} | FlowNote`;
    } else {
      document.title = 'FlowNote';
    }
  }, [page?.title]);

  const handleAddCover = async () => {
    const defaultCover = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop';
    try {
      await updateDoc(doc(db, 'pages', page.id), { coverImage: defaultCover });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${page.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400">
        {error || 'Page not found'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative">
      <PageCover pageId={page.id} coverImage={page.coverImage} />
      <Breadcrumbs pageId={page.id} />
      <PageMenu page={page} />
      <div className={`mx-auto px-8 py-12 transition-all duration-300 ${page.fullWidth ? 'max-w-none w-full px-12' : 'max-w-screen-md'}`}>
        <TiptapEditor 
          key={page.id}
          pageId={page.id} 
          initialTitle={page.title} 
          initialContent={typeof page.content === 'string' ? JSON.parse(page.content) : page.content} 
          initialIcon={page.icon}
          isLocked={page.isLocked}
          hasCover={!!page.coverImage}
          onAddCover={handleAddCover}
        />
      </div>
    </div>
  );
}
