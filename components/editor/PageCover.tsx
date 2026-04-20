'use client';

import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Image as ImageIcon, X } from 'lucide-react';

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop', // Gradient
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&auto=format&fit=crop', // Purple gradient
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop', // Beach
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2000&auto=format&fit=crop', // Abstract
  'https://picsum.photos/seed/aurora/2000/600', // Aurora
  'https://picsum.photos/seed/nebula/2000/600', // Nebula
  'https://picsum.photos/seed/ocean/2000/600', // Ocean
  'https://picsum.photos/seed/forest/2000/600', // Forest
  'https://picsum.photos/seed/mountain/2000/600', // Mountain
  'https://picsum.photos/seed/desert/2000/600', // Desert
  'https://picsum.photos/seed/space/2000/600', // Space
  'https://picsum.photos/seed/galaxy/2000/600', // Galaxy
  'https://picsum.photos/seed/sunset/2000/600', // Sunset
  'https://picsum.photos/seed/sunrise/2000/600', // Sunrise
  'https://picsum.photos/seed/river/2000/600', // River
  'https://picsum.photos/seed/valley/2000/600', // Valley
  'https://picsum.photos/seed/canyon/2000/600', // Canyon
  'https://picsum.photos/seed/snow/2000/600', // Snow
  'https://picsum.photos/seed/glacier/2000/600', // Glacier
  'https://picsum.photos/seed/bloom/2000/600', // Bloom
];

interface PageCoverProps {
  pageId: string;
  coverImage?: string | null;
}

export default function PageCover({ pageId, coverImage }: PageCoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  if (!coverImage) return null;

  const updateCover = async (url: string | null) => {
    try {
      await updateDoc(doc(db, 'pages', pageId), { coverImage: url });
      setShowGallery(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${pageId}`);
    }
  };

  return (
    <div 
      className="mt-16 relative w-full h-48 md:h-64 group/cover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowGallery(false); }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={coverImage} 
        alt="Cover" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      
      <div className={`absolute bottom-4 right-4 flex items-center gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={() => setShowGallery(!showGallery)}
          className="bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium backdrop-blur-md transition-colors flex items-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Change cover
        </button>
      </div>

      {showGallery && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-2xl z-20 w-80">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-medium text-neutral-300">Gallery</span>
            <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
            {DEFAULT_COVERS.map((url, i) => (
              <button 
                key={i} 
                onClick={() => updateCover(url)}
                className="h-16 rounded overflow-hidden hover:opacity-80 transition-opacity ring-2 ring-transparent focus:outline-none focus:ring-blue-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Cover option ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between">
            <button 
              onClick={() => updateCover(null)}
              className="text-sm text-red-400 hover:text-red-300 px-2 py-1 hover:bg-neutral-800 rounded transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
