import React from 'react';
import { Trash2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Eraser } from 'lucide-react';
import { Editor } from '@tiptap/react';

const TEXT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#78716c', '#737373', '#94a3b8', '#d97706', '#14b8a6'
];

const BG_COLORS = [
  '#7f1d1d', '#7c2d12', '#713f12', '#14532d', '#164e63',
  '#1e3a8a', '#312e81', '#581c87', '#831843', '#881337',
  '#44403c', '#404040', '#334155', '#78350f', '#134e4a'
];

interface EditorContextMenuProps {
  editor: Editor | null;
  contextMenu: { x: number; y: number };
  onClose: () => void;
}

export function EditorContextMenu({ editor, contextMenu, onClose }: EditorContextMenuProps) {
  const setCellColor = (type: 'text' | 'bg' | 'clear', color: string) => {
    if (!editor) return;
    if (type === 'bg') {
      editor.chain().focus()
        .setCellAttribute('backgroundColor', color)
        .setCellAttribute('textColor', null)
        .run();
    } else if (type === 'text') {
      editor.chain().focus()
        .setCellAttribute('textColor', color)
        .setCellAttribute('backgroundColor', null)
        .run();
    } else {
      editor.chain().focus()
        .setCellAttribute('textColor', null)
        .setCellAttribute('backgroundColor', null)
        .run();
    }
    onClose();
  };

  return (
    <div 
      className="fixed z-50 min-w-[220px] bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-xl animate-in fade-in zoom-in-95 table-context-menu"
      style={{ top: contextMenu.y, left: contextMenu.x }}
    >
      <div className="px-2 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Text Color</div>
      <div className="grid grid-cols-5 gap-1 px-2 pb-2">
        {TEXT_COLORS.map(color => (
          <button
            key={color}
            onClick={() => setCellColor('text', color)}
            className="w-6 h-6 rounded-full border border-neutral-700 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title="Text Color"
          />
        ))}
      </div>
      <div className="px-2 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Background</div>
      <div className="grid grid-cols-5 gap-1 px-2 pb-2">
        {BG_COLORS.map(color => (
          <button
            key={color}
            onClick={() => setCellColor('bg', color)}
            className="w-6 h-6 rounded-full border border-neutral-700 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title="Background Color"
          />
        ))}
      </div>
      <div className="h-px bg-neutral-700 my-1" />
      <button onClick={() => setCellColor('clear', '')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <Eraser className="w-4 h-4" /> Clear Styles
      </button>
      <div className="h-px bg-neutral-700 my-1" />
      <button onClick={() => { editor?.chain().focus().addColumnBefore().run(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <ArrowLeft className="w-4 h-4" /> Add Column Before
      </button>
      <button onClick={() => { editor?.chain().focus().addColumnAfter().run(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <ArrowRight className="w-4 h-4" /> Add Column After
      </button>
      <button onClick={() => { editor?.chain().focus().deleteColumn().run(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <Trash2 className="w-4 h-4" /> Delete Column
      </button>
      <div className="h-px bg-neutral-700 my-1" />
      <button onClick={() => { editor?.chain().focus().addRowBefore().run(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <ArrowUp className="w-4 h-4" /> Add Row Before
      </button>
      <button onClick={() => { editor?.chain().focus().addRowAfter().run(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <ArrowDown className="w-4 h-4" /> Add Row After
      </button>
      <button onClick={() => { editor?.chain().focus().deleteRow().run(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <Trash2 className="w-4 h-4" /> Delete Row
      </button>
      <div className="h-px bg-neutral-700 my-1" />
      <button onClick={() => { editor?.chain().focus().deleteTable().run(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
        <Trash2 className="w-4 h-4" /> Delete Table
      </button>
    </div>
  );
}
