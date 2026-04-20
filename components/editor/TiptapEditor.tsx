'use client';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import { ResizableImage } from './extensions/ResizableImage';
import Youtube from '@tiptap/extension-youtube';
import { Callout } from './extensions/Callout';
import { Details, Summary } from './extensions/Toggle';
import { useEffect, useState, useRef } from 'react';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { SlashCommand, slashCommandConfig } from './slash-extension';
import { DatabaseExtension } from './extensions/database-extension';
import { Trash2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Eraser, Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, TextQuote, Code, ChevronRight, Copy, Palette, Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Strikethrough, X, Maximize, Repeat, SmilePlus } from 'lucide-react';
import { EditorBlockMenu } from './EditorBlockMenu';
import { EditorContextMenu } from './EditorContextMenu';
import { EditorLinkPopover } from './EditorLinkPopover';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { IconPicker } from '@/components/IconPicker';
import { RenderIcon } from '@/components/RenderIcon';

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

const BlockStyles = Extension.create({
  name: 'blockStyles',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'listItem', 'taskItem', 'blockquote', 'codeBlock', 'table'],
        attributes: {
          textColor: {
            default: null,
            parseHTML: element => element.style.color || null,
            renderHTML: attributes => {
              if (!attributes.textColor) return {};
              return { style: `color: ${attributes.textColor}` };
            },
          },
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) return {};
              return { style: `background-color: ${attributes.backgroundColor}` };
            },
          },
        },
      },
    ];
  },
});

interface TiptapEditorProps {
  pageId: string;
  initialTitle: string;
  initialContent: any;
  initialIcon?: string;
  isLocked?: boolean;
  hasCover?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
  onAddCover?: () => void;
}

export default function TiptapEditor({ pageId, initialTitle, initialContent, initialIcon, isLocked, hasCover, onTypingChange, onAddCover }: TiptapEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [isSaving, setIsSaving] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [blockMenu, setBlockMenu] = useState<{ x: number; y: number; isTable: boolean } | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [hoveredLink, setHoveredLink] = useState<{ href: string, element: HTMLElement, text: string, rect: DOMRect } | null>(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editLinkText, setEditLinkText] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPos, setVideoPos] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVideoDialog = (e: any) => {
      setShowVideoInput(true);
      setVideoPos(e.detail.pos);
    };
    window.addEventListener('open-video-dialog', handleVideoDialog);
    return () => window.removeEventListener('open-video-dialog', handleVideoDialog);
  }, []);

  const handleTyping = () => {
    if (onTypingChange) {
      onTypingChange(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Only trigger for links inside the editor content
      const isInsideEditor = target.closest('.ProseMirror');
      const linkElement = isInsideEditor ? target.closest('a') : null;
      
      const popoverElement = document.getElementById('link-hover-popover');
      if (popoverElement && popoverElement.contains(target)) {
        return; // Keep it open if hovering over the popover
      }

      if (linkElement) {
        setHoveredLink(prev => {
          if (prev?.element === linkElement) return prev;
          return {
            href: linkElement.getAttribute('href') || '',
            element: linkElement,
            text: linkElement.innerText,
            rect: linkElement.getBoundingClientRect()
          };
        });
      } else {
        setTimeout(() => {
          const currentHover = document.querySelectorAll(':hover');
          let isHoveringPopover = false;
          currentHover.forEach(el => {
            if (el.id === 'link-hover-popover') isHoveringPopover = true;
          });
          if (!isHoveringPopover) {
            setHoveredLink(null);
            setIsEditingLink(false);
          }
        }, 100);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const editor = useEditor({
    extensions: [
      BlockStyles,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full m-0'
        }
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-md mt-4 mb-4'
        }
      }),
      Callout,
      Details,
      Summary,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline cursor-pointer',
        },
      }),
      GlobalDragHandle.configure({
        dragHandleWidth: 24,
        scrollTreshold: 100,
      }),
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      DatabaseExtension.configure({
        pageId,
        userId: user?.uid,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'summary') {
            return 'Toggle title';
          }
          return "Press '/' for commands, or start typing...";
        },
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
        includeChildren: true,
      }),
      SlashCommand.configure({
        suggestion: slashCommandConfig,
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editable: !isLocked,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-neutral max-w-none focus:outline-none min-h-[500px] prose-code:before:content-none prose-code:after:content-none prose-code:bg-neutral-800 prose-code:text-red-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-normal [&_strong]:text-inherit [&_strong]:font-bold',
      },
      handlePaste: (view, event, slice) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text && text.startsWith(window.location.origin + '/workspace/')) {
          const pastedPageId = text.split('/workspace/')[1];
          if (pastedPageId) {
            event.preventDefault();
            getDoc(doc(db, 'pages', pastedPageId)).then(docSnap => {
              if (docSnap.exists()) {
                const pageTitle = docSnap.data().title || 'Untitled';
                const { state, dispatch } = view;
                const { tr } = state;
                const pos = state.selection.from;
                
                const linkMark = state.schema.marks.link.create({ href: text });
                const textNode = state.schema.text(pageTitle, [linkMark]);
                
                dispatch(tr.insert(pos, textNode));
              } else {
                // Fallback if page doesn't exist
                const { state, dispatch } = view;
                const { tr } = state;
                const pos = state.selection.from;
                const linkMark = state.schema.marks.link.create({ href: text });
                const textNode = state.schema.text(text, [linkMark]);
                dispatch(tr.insert(pos, textNode));
              }
            }).catch(err => {
              console.error(err);
            });
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      handleTyping();
      triggerSave(title, editor.getJSON());
    },
  });

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const dragHandle = target.closest('.drag-handle');
      if (dragHandle) {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = dragHandle.getBoundingClientRect();
        const pos = editor?.view.posAtCoords({ left: rect.right + 20, top: rect.top + 10 });
        
        if (pos && editor) {
          editor.chain().focus().setTextSelection(pos.pos).run();
          
          setBlockMenu({
            x: rect.left,
            y: rect.top,
            isTable: editor.isActive('table')
          });
          setContextMenu(null);
        }
        return;
      }
      
      if (!target.closest('.block-menu-content')) {
        setBlockMenu(null);
      }
      if (!target.closest('.table-context-menu')) {
        setContextMenu(null);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [editor]);

  const getTargetBlock = () => {
    if (!editor) return null;
    const { $from } = editor.state.selection;
    
    let depth = $from.depth;
    while (depth > 0) {
      const node = $from.node(depth);
      if (['listItem', 'taskItem', 'table', 'blockquote', 'codeBlock'].includes(node.type.name)) {
        return { node, from: $from.before(depth), to: $from.after(depth) };
      }
      depth--;
    }
    
    if ($from.depth >= 1) {
      return { node: $from.node(1), from: $from.before(1), to: $from.after(1) };
    }
    return null;
  };

  const deleteCurrentBlock = () => {
    const block = getTargetBlock();
    if (block && editor) {
      editor.chain().focus().deleteRange({ from: block.from, to: block.to }).run();
    }
  };

  const duplicateCurrentBlock = () => {
    const block = getTargetBlock();
    if (block && editor) {
      editor.chain().focus().insertContentAt(block.to, block.node.toJSON()).run();
    }
  };

  const triggerSave = (newTitle: string, newContent: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const pageRef = doc(db, 'pages', pageId);
        
        // Firestore doesn't accept undefined values, so we recursively strip them out
        const removeUndefined = (obj: any): any => {
          if (obj === null || obj === undefined) return null;
          if (Array.isArray(obj)) return obj.map(removeUndefined);
          if (typeof obj === 'object') {
            const newObj: any = {};
            for (const key in obj) {
              if (obj[key] !== undefined) {
                newObj[key] = removeUndefined(obj[key]);
              }
            }
            return newObj;
          }
          return obj;
        };

        const cleanContent = removeUndefined(newContent);
        const stringifiedContent = JSON.stringify(cleanContent);

        await updateDoc(pageRef, {
          title: newTitle,
          content: stringifiedContent,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `pages/${pageId}`);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce
  };

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [editor, isLocked]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleTyping();
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;

    if (editor) {
      triggerSave(newTitle, editor.getJSON());
    }
  };

  const handleIconChange = async (newIcon: string) => {
    setIcon(newIcon);
    handleTyping();
    setPickerOpen(false);
    
    try {
      const pageRef = doc(db, 'pages', pageId);
      await updateDoc(pageRef, {
        icon: newIcon,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${pageId}`);
    }
  };

  const removeIcon = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIcon(undefined);
    handleTyping();
    
    try {
      const pageRef = doc(db, 'pages', pageId);
      await updateDoc(pageRef, {
        icon: null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pages/${pageId}`);
    }
  };

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
    setContextMenu(null);
  };

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
    setBlockMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isTable = target.closest('table');
    const isDatabase = target.closest('[data-type="database"]');
    
    if (isTable && !isDatabase && editor) {
      e.preventDefault();
      
      // Move cursor to the clicked cell so commands apply to the correct spot
      const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (pos) {
        editor.chain().focus().setTextSelection(pos.pos).run();
      }

      setContextMenu({ x: e.clientX, y: e.clientY });
    } else {
      setContextMenu(null);
    }
  };

  return (
    <div className="w-full relative group/editor">
      <div className="mb-8 relative">
        <div className="flex flex-row gap-2 items-center mb-4 min-h-[32px]">
          {icon ? (
            <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
              <Popover.Trigger asChild>
                <button className="text-6xl hover:bg-neutral-800 rounded-lg p-2 transition-colors relative group/icon">
                  <RenderIcon icon={icon} className="w-14 h-14" />
                  <div 
                    className="absolute -top-2 -right-2 bg-neutral-700 hover:bg-neutral-600 rounded-full p-1 opacity-0 group-hover/icon:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeIcon();
                    }}
                  >
                    <X className="w-3 h-3 text-neutral-300" />
                  </div>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="z-[100]" sideOffset={5} align="start">
                  <IconPicker onSelect={handleIconChange} />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ) : (
            <div className="opacity-0 group-hover/editor:opacity-100 transition-opacity duration-200 flex flex-row gap-2">
              <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
                <Popover.Trigger asChild>
                  <button className="flex items-center gap-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors text-sm font-medium">
                    <SmilePlus className="w-4 h-4" />
                    <span>Add icon</span>
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content className="z-[100]" sideOffset={5} align="start">
                    <IconPicker onSelect={handleIconChange} />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          )}

          {!hasCover && onAddCover && (
            <div className={`transition-opacity duration-200 ${icon ? 'opacity-0 group-hover/editor:opacity-100 ml-4 self-end pb-2' : 'opacity-0 group-hover/editor:opacity-100'}`}>
              <button 
                onClick={onAddCover}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors text-sm font-medium"
              >
                <Palette className="w-4 h-4" />
                <span>Add cover</span>
              </button>
            </div>
          )}
        </div>
        <textarea
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          readOnly={isLocked}
          className="w-full bg-transparent text-4xl font-bold text-white placeholder-neutral-600 focus:outline-none resize-none overflow-hidden"
          rows={1}
          style={{ minHeight: '56px' }}
        />
        {isSaving && (
          <div className="absolute top-4 right-0 text-xs text-neutral-500">
            Saving...
          </div>
        )}
      </div>
      
      {contextMenu && (
        <EditorContextMenu 
          editor={editor} 
          contextMenu={contextMenu} 
          onClose={() => setContextMenu(null)} 
        />
      )}

      {blockMenu && (
        <EditorBlockMenu 
          editor={editor} 
          blockMenu={blockMenu} 
          onClose={() => setBlockMenu(null)} 
          getTargetBlock={getTargetBlock}
          deleteCurrentBlock={deleteCurrentBlock}
          duplicateCurrentBlock={duplicateCurrentBlock}
        />
      )}

      <div className="editor-wrapper" onContextMenu={handleContextMenu}>
        {editor && (
          <EditorBubbleMenu 
            editor={editor}
            showLinkInput={showLinkInput}
            linkUrl={linkUrl}
            setShowLinkInput={setShowLinkInput}
            setLinkUrl={setLinkUrl}
          />
        )}
        <EditorContent editor={editor} />
        
        {showVideoInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-neutral-800 p-5 rounded-xl shadow-2xl border border-neutral-700 w-[26rem] flex flex-col gap-4 animate-in zoom-in-95 fade-in duration-200">
              <div>
                <h3 className="text-white font-medium text-lg">Embed Video</h3>
                <p className="text-neutral-400 text-sm">Paste a YouTube link below to embed it into your page.</p>
              </div>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (videoUrl && editor) {
                      editor.chain().focus().setTextSelection(videoPos || editor.state.selection.from).setYoutubeVideo({ src: videoUrl }).run();
                    }
                    setShowVideoInput(false);
                    setVideoUrl('');
                  } else if (e.key === 'Escape') {
                    setShowVideoInput(false);
                    setVideoUrl('');
                  }
                }}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setShowVideoInput(false)} 
                  className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (videoUrl && editor) {
                      editor.chain().focus().setTextSelection(videoPos || editor.state.selection.from).setYoutubeVideo({ src: videoUrl }).run();
                    }
                    setShowVideoInput(false);
                    setVideoUrl('');
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                  disabled={!videoUrl}
                >
                  Embed Video
                </button>
              </div>
            </div>
          </div>
        )}
        
        {hoveredLink && (
          <EditorLinkPopover
            editor={editor}
            hoveredLink={hoveredLink}
            isEditingLink={isEditingLink}
            editLinkUrl={editLinkUrl}
            editLinkText={editLinkText}
            setHoveredLink={setHoveredLink}
            setIsEditingLink={setIsEditingLink}
            setEditLinkUrl={setEditLinkUrl}
            setEditLinkText={setEditLinkText}
          />
        )}
      </div>
    </div>
  );
}
