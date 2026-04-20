'use client';

import { useSidebarStore } from '@/lib/store';
import { ChevronLeft, Menu, Plus, LogOut, Trash2 } from 'lucide-react';
import PageTree from './PageTree';
import CreatePageButton from './CreatePageButton';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebarStore();
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`absolute top-4 left-4 z-50 p-2 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none -translate-x-full' : 'opacity-100 translate-x-0'}`}
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside 
        className={`h-full bg-neutral-800 border-neutral-700 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${isOpen ? 'w-64 border-r' : 'w-0 border-r-0'}`}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-neutral-700">
            <Link href="/workspace" className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h4l3-9 5 18 3-9h5" />
              </svg>
              <span className="text-sm font-bold truncate">
                FlowNote
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 flex flex-col">
            <div className="px-2 mb-2">
              <CreatePageButton />
            </div>
            <div className="px-2 flex-1">
              <PageTree />
            </div>
            
            <div className="px-2 mt-auto pt-2">
              <Link 
                href="/workspace/trash"
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  pathname === '/workspace/trash' 
                    ? 'bg-neutral-700 text-white' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Trash</span>
              </Link>
            </div>
          </div>

          <div className="p-3 border-t border-neutral-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              {user?.photoURL ? (
                <Image 
                  src={user.photoURL} 
                  alt="Profile" 
                  width={28} 
                  height={28} 
                  className="rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold shrink-0 text-white">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate text-white leading-tight">
                  {user?.displayName || user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-neutral-400 truncate leading-tight">
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut(auth)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-md transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
