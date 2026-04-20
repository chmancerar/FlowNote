import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface HoveredLink {
  href: string;
  element: HTMLElement;
  text: string;
  rect: DOMRect;
}

interface EditorLinkPopoverProps {
  editor: Editor | null;
  hoveredLink: HoveredLink;
  isEditingLink: boolean;
  editLinkUrl: string;
  editLinkText: string;
  setHoveredLink: (link: HoveredLink | null) => void;
  setIsEditingLink: (editing: boolean) => void;
  setEditLinkUrl: (url: string) => void;
  setEditLinkText: (text: string) => void;
}

export function EditorLinkPopover({
  editor,
  hoveredLink,
  isEditingLink,
  editLinkUrl,
  editLinkText,
  setHoveredLink,
  setIsEditingLink,
  setEditLinkUrl,
  setEditLinkText
}: EditorLinkPopoverProps) {
  return (
    <div 
      id="link-hover-popover"
      className="fixed z-50 bg-[#252525] border border-neutral-700 rounded-md shadow-xl p-1 flex items-center gap-1"
      style={{
        top: hoveredLink.rect.bottom + 4,
        left: hoveredLink.rect.left,
      }}
      onMouseLeave={() => {
        setHoveredLink(null);
        setIsEditingLink(false);
      }}
    >
      {!isEditingLink ? (
        <>
          <a href={hoveredLink.href} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-300 hover:text-white px-2 py-1 truncate max-w-[200px] hover:underline">
            {hoveredLink.href}
          </a>
          <div className="w-px h-4 bg-neutral-700 mx-1" />
          <button className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors" onClick={() => navigator.clipboard.writeText(hoveredLink.href)} title="Copy link">
            <Copy className="w-4 h-4" />
          </button>
          <button className="px-2 py-1 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors" onClick={() => {
            setIsEditingLink(true);
            setEditLinkUrl(hoveredLink.href);
            setEditLinkText(hoveredLink.text);
          }}>
            Edit
          </button>
        </>
      ) : (
        <div className="p-2 flex flex-col gap-3 w-72">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-400 font-medium">Page or URL</label>
            <input 
              type="url" 
              value={editLinkUrl} 
              onChange={e => setEditLinkUrl(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && editor) {
                  const pos = editor.view.posAtDOM(hoveredLink.element.firstChild || hoveredLink.element, 0);
                  editor.chain().focus()
                    .setTextSelection({ from: pos, to: pos + hoveredLink.text.length })
                    .insertContent(editLinkText)
                    .setTextSelection({ from: pos, to: pos + editLinkText.length })
                    .setLink({ href: editLinkUrl })
                    .run();
                  setHoveredLink(null);
                  setIsEditingLink(false);
                }
              }}
              className="bg-[#1e1e1e] text-sm text-white px-2 py-1.5 rounded border border-neutral-700 focus:outline-none focus:border-neutral-500"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-400 font-medium">Link title</label>
            <input 
              type="text" 
              value={editLinkText} 
              onChange={e => setEditLinkText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && editor) {
                  const pos = editor.view.posAtDOM(hoveredLink.element.firstChild || hoveredLink.element, 0);
                  editor.chain().focus()
                    .setTextSelection({ from: pos, to: pos + hoveredLink.text.length })
                    .insertContent(editLinkText)
                    .setTextSelection({ from: pos, to: pos + editLinkText.length })
                    .setLink({ href: editLinkUrl })
                    .run();
                  setHoveredLink(null);
                  setIsEditingLink(false);
                }
              }}
              className="bg-[#1e1e1e] text-sm text-white px-2 py-1.5 rounded border border-neutral-700 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div className="w-full h-px bg-neutral-700 my-0.5" />
          <button 
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 p-1.5 rounded w-full text-left transition-colors"
            onClick={() => {
              if (editor) {
                const pos = editor.view.posAtDOM(hoveredLink.element.firstChild || hoveredLink.element, 0);
                editor.chain().focus().setTextSelection({ from: pos, to: pos + hoveredLink.text.length }).unsetLink().run();
              }
              setHoveredLink(null);
              setIsEditingLink(false);
            }}
          >
            <Trash2 className="w-4 h-4" /> Remove link
          </button>
        </div>
      )}
    </div>
  );
}
