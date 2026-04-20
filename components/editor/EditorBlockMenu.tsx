import React from 'react';
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, TextQuote, Code, ChevronRight, Copy, Palette, Trash2, Eraser, Repeat } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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

interface EditorBlockMenuProps {
  editor: Editor | null;
  blockMenu: { x: number; y: number; isTable: boolean } | null;
  onClose: () => void;
  getTargetBlock: () => { node: any; from: number; to: number } | null;
  deleteCurrentBlock: () => void;
  duplicateCurrentBlock: () => void;
}

export function EditorBlockMenu({ editor, blockMenu, onClose, getTargetBlock, deleteCurrentBlock, duplicateCurrentBlock }: EditorBlockMenuProps) {
  const setBlockColor = (type: 'text' | 'bg' | 'clear', color: string) => {
    const block = getTargetBlock();
    if (block && editor) {
      if (type === 'bg') {
        editor.chain().focus()
          .setNodeSelection(block.from)
          .updateAttributes(block.node.type.name, { backgroundColor: color, textColor: null })
          .setTextSelection(block.from + 1)
          .run();
      } else if (type === 'text') {
        editor.chain().focus()
          .setNodeSelection(block.from)
          .updateAttributes(block.node.type.name, { textColor: color, backgroundColor: null })
          .setTextSelection(block.from + 1)
          .run();
      } else {
        editor.chain().focus()
          .setNodeSelection(block.from)
          .updateAttributes(block.node.type.name, { textColor: null, backgroundColor: null })
          .setTextSelection(block.from + 1)
          .run();
      }
    }
    onClose();
  };

  if (!blockMenu) return null;

  return (
    <DropdownMenu.Root open={!!blockMenu} onOpenChange={(open) => !open && onClose()}>
      <DropdownMenu.Trigger asChild>
        <div 
          style={{ 
            position: 'fixed', 
            top: blockMenu.y, 
            left: blockMenu.x, 
            width: 24, 
            height: 24, 
            pointerEvents: 'none' 
          }} 
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[220px] bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-xl z-50 block-menu-content animate-in fade-in zoom-in-95"
          side="left"
          align="start"
          sideOffset={8}
        >
          {!blockMenu.isTable && (
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none data-[state=open]:bg-neutral-700 data-[state=open]:text-white">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4" /> Turn into
                </div>
                <ChevronRight className="w-4 h-4" />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent 
                  className="min-w-[180px] bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-xl z-50 animate-in fade-in zoom-in-95"
                  sideOffset={4}
                  alignOffset={-4}
                >
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().setNode('paragraph').run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <Type className="w-4 h-4" /> Text
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().setNode('heading', { level: 1 }).run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <Heading1 className="w-4 h-4" /> Heading 1
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().setNode('heading', { level: 2 }).run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <Heading2 className="w-4 h-4" /> Heading 2
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().setNode('heading', { level: 3 }).run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <Heading3 className="w-4 h-4" /> Heading 3
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().toggleBulletList().run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <List className="w-4 h-4" /> Bullet List
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().toggleOrderedList().run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <ListOrdered className="w-4 h-4" /> Numbered List
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().toggleTaskList().run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <CheckSquare className="w-4 h-4" /> To-do List
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().toggleBlockquote().run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <TextQuote className="w-4 h-4" /> Quote
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => { editor?.chain().focus().setNode('codeBlock').run(); onClose(); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                    <Code className="w-4 h-4" /> Code Block
                  </DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          )}

          {!blockMenu.isTable && (
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none data-[state=open]:bg-neutral-700 data-[state=open]:text-white">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Color
                </div>
                <ChevronRight className="w-4 h-4" />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent 
                  className="min-w-[220px] bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-xl z-50 animate-in fade-in zoom-in-95"
                  sideOffset={4}
                  alignOffset={-4}
                >
                  <div className="px-2 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Text Color</div>
                  <div className="grid grid-cols-5 gap-1 px-2 pb-2">
                    {TEXT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setBlockColor('text', color)}
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
                        onClick={() => setBlockColor('bg', color)}
                        className="w-6 h-6 rounded-full border border-neutral-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title="Background Color"
                      />
                    ))}
                  </div>
                  <div className="h-px bg-neutral-700 my-1" />
                  <button onClick={() => setBlockColor('clear', '')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
                    <Eraser className="w-4 h-4" /> Clear Styles
                  </button>
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          )}
          
          <button onClick={() => { duplicateCurrentBlock(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          
          <div className="h-px bg-neutral-700 my-1" />
          
          <button onClick={() => { deleteCurrentBlock(); onClose(); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
