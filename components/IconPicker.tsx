import React, { useState, useMemo } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Search } from 'lucide-react';
import { POPULAR_ICONS } from './RenderIcon';

// Extract all valid Lucide icon component names
const validIconNames = Object.keys(POPULAR_ICONS);

const COLORS = [
  '',          // Default/Inherit (No color set)
  '#ef4444',   // Red
  '#f97316',   // Orange
  '#eab308',   // Yellow
  '#22c55e',   // Green
  '#06b6d4',   // Cyan
  '#3b82f6',   // Blue
  '#8b5cf6',   // Purple
  '#d946ef',   // Pink
];

interface IconPickerProps {
  onSelect: (icon: string) => void;
}

export function IconPicker({ onSelect }: IconPickerProps) {
  const [tab, setTab] = useState<'emoji' | 'icons'>('emoji');
  const [search, setSearch] = useState('');
  const [iconColor, setIconColor] = useState<string>('');

  const filteredIcons = useMemo(() => {
    if (!search) return validIconNames;
    const q = search.toLowerCase();
    return validIconNames.filter(name => name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="w-[320px] bg-[#222222] border border-neutral-700/50 outline-none rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
      <div className="flex border-b border-neutral-800 bg-[#1e1e1e] p-1 gap-1 shrink-0">
        <button 
          onClick={() => setTab('emoji')} 
          className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${tab === 'emoji' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
        >
          Emoji
        </button>
        <button 
          onClick={() => setTab('icons')} 
          className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${tab === 'icons' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
        >
          Icons
        </button>
      </div>

      <div className="h-[350px] flex flex-col overflow-hidden w-full">
        {tab === 'emoji' && (
          <div className="flex-1 w-full overflow-hidden [&_.EmojiPickerReact]:border-none [&_.EmojiPickerReact]:w-[320px] [&_.EmojiPickerReact]:!w-full [&_.EmojiPickerReact]:!bg-transparent text-white">
            <EmojiPicker 
              onEmojiClick={(e) => onSelect(e.emoji)} 
              theme={Theme.DARK}
              lazyLoadEmojis={true}
              width="100%"
              height="350px"
              searchDisabled={false}
              skinTonesDisabled={true}
            />
          </div>
        )}

        {tab === 'icons' && (
          <div className="flex flex-col h-full w-full bg-[#222222]">
            <div className="p-3 border-b border-neutral-800 shrink-0 w-full">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="text" 
                  placeholder="Search icons..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-md py-1.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-neutral-500"
                />
              </div>
              
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setIconColor(c)}
                    className={`w-5 h-5 shrink-0 rounded-full border-2 transition-all ${iconColor === c ? 'border-neutral-300 scale-110 shadow-sm' : 'border-transparent opacity-70 hover:scale-110 hover:opacity-100'}`}
                    style={{ backgroundColor: c || '#a3a3a3' }}
                    title={c ? 'Color' : 'Default Color'}
                  >
                    {!c && <div className="w-full h-full rounded-full border border-neutral-600/50" />}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredIcons.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-neutral-500">
                No icons found.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-6 gap-1 pb-4">
                  {filteredIcons.map(name => {
                    const Icon = POPULAR_ICONS[name];
                    return (
                      <button 
                        key={name} 
                        onClick={() => onSelect(iconColor ? `lucide:${name}|${iconColor}` : `lucide:${name}`)}
                        className="flex justify-center items-center p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-all"
                        title={name}
                      >
                        <Icon className="w-6 h-6" color={iconColor || "currentColor"} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
