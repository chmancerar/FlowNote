import React from 'react';
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, TextQuote, Code, Palette, Eraser, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, Repeat, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';

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

interface EditorBubbleMenuProps {
  editor: Editor | null;
  showLinkInput: boolean;
  linkUrl: string;
  setShowLinkInput: (show: boolean) => void;
  setLinkUrl: (url: string) => void;
}

export function EditorBubbleMenu({
  editor,
  showLinkInput,
  linkUrl,
  setShowLinkInput,
  setLinkUrl
}: EditorBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      // @ts-ignore
      tippyOptions={{ placement: 'bottom', duration: 150, animation: 'shift-away', flip: false }}
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        const { empty } = selection;
        if (empty || !editor.isEditable) return false;
        if (editor.isActive('database')) return false;
        
        if (typeof window !== 'undefined') {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const node = domSelection.anchorNode;
            if (node && node.nodeType === Node.ELEMENT_NODE) {
              if ((node as Element).closest('[data-type="database"]')) return false;
            } else if (node && node.parentElement) {
              if (node.parentElement.closest('[data-type="database"]')) return false;
            }
          }
        }
        
        return true;
      }}
      className="flex items-center gap-1 p-1 bg-neutral-800 border border-neutral-700 rounded-md shadow-xl"
    >
      {showLinkInput ? (
        <div className="flex items-center gap-2 px-1">
          <input
            type="url"
            placeholder="Enter link URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
                else editor.chain().focus().unsetLink().run();
                setShowLinkInput(false);
                setLinkUrl('');
              } else if (e.key === 'Escape') {
                setShowLinkInput(false);
                setLinkUrl('');
              }
            }}
            className="bg-neutral-900 text-sm text-white px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-neutral-500 w-48"
            autoFocus
          />
          <button 
            onClick={() => {
              if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
              else editor.chain().focus().unsetLink().run();
              setShowLinkInput(false);
              setLinkUrl('');
            }}
            className="p-1 text-neutral-300 hover:text-white bg-neutral-700 rounded text-xs px-2"
          >
            Save
          </button>
          <button 
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
            }}
            className="p-1 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors outline-none" title="Turn into">
                <Repeat className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content 
              className="min-w-[180px] bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-xl z-50 animate-in fade-in zoom-in-95"
              sideOffset={8}
            >
              <DropdownMenu.Item onClick={() => editor.chain().focus().setNode('paragraph').run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <Type className="w-4 h-4" /> Text
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().setNode('heading', { level: 1 }).run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <Heading1 className="w-4 h-4" /> Heading 1
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().setNode('heading', { level: 2 }).run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <Heading2 className="w-4 h-4" /> Heading 2
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().setNode('heading', { level: 3 }).run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <Heading3 className="w-4 h-4" /> Heading 3
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().toggleBulletList().run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <List className="w-4 h-4" /> Bullet List
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().toggleOrderedList().run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <ListOrdered className="w-4 h-4" /> Numbered List
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().toggleTaskList().run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <CheckSquare className="w-4 h-4" /> To-do List
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().toggleBlockquote().run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <TextQuote className="w-4 h-4" /> Quote
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => editor.chain().focus().setNode('codeBlock').run()} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm cursor-pointer outline-none">
                <Code className="w-4 h-4" /> Code Block
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors outline-none" title="Color">
                <Palette className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content 
              className="min-w-[220px] bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-xl z-50 animate-in fade-in zoom-in-95"
              sideOffset={8}
            >
              <div className="px-2 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Text Color</div>
              <div className="grid grid-cols-5 gap-1 px-2 pb-2">
                {TEXT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => editor.chain().focus().setColor(color).run()}
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
                    onClick={() => editor.chain().focus().setHighlight({ color }).run()}
                    className="w-6 h-6 rounded-full border border-neutral-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title="Background Color"
                  />
                ))}
              </div>
              <div className="h-px bg-neutral-700 my-1" />
              <button onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors cursor-pointer outline-none">
                <Eraser className="w-4 h-4" /> Clear Styles
              </button>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <div className="w-px h-4 bg-neutral-700 mx-1" />

          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded transition-colors outline-none ${editor.isActive('bold') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'}`} title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded transition-colors outline-none ${editor.isActive('italic') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'}`} title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded transition-colors outline-none ${editor.isActive('underline') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'}`} title="Underline">
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded transition-colors outline-none ${editor.isActive('strike') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'}`} title="Strikethrough">
            <Strikethrough className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1.5 rounded transition-colors outline-none ${editor.isActive('code') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'}`} title="Code">
            <Code className="w-4 h-4" />
          </button>
          <button onClick={() => {
              setShowLinkInput(true);
              setLinkUrl(editor.getAttributes('link').href || '');
            }} 
            className={`p-1.5 rounded transition-colors outline-none ${editor.isActive('link') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'}`} title="Link">
            <LinkIcon className="w-4 h-4" />
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
