import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandList } from './CommandList';
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, TextQuote, Code, CheckSquare, Minus, Table as TableIcon, Columns, Columns2, Columns3, Columns4, MessageSquare, ToggleRight, ImageIcon, Youtube } from 'lucide-react';
import React from 'react';

const getSuggestionItems = ({ query }: { query: string }) => {
  const items = [
    {
      title: 'Text',
      aliases: ['p', 'paragraph'],
      icon: <Type className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run();
      },
    },
    {
      title: 'Heading 1',
      aliases: ['h1'],
      icon: <Heading1 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      aliases: ['h2'],
      icon: <Heading2 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      aliases: ['h3'],
      icon: <Heading3 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Bullet List',
      aliases: ['ul', 'list', 'bullet'],
      icon: <List className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Numbered List',
      aliases: ['ol', 'list', 'numbered'],
      icon: <ListOrdered className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'To-do List',
      aliases: ['todo', 'task', 'check', '[]'],
      icon: <CheckSquare className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Table',
      aliases: ['table', 'grid'],
      icon: <TableIcon className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run();
      },
    },
    {
      title: 'Database',
      aliases: ['database', 'db', 'board'],
      icon: <TableIcon className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'database' }).run();
      },
    },
    {
      title: 'Quote',
      aliases: ['blockquote', 'quote'],
      icon: <TextQuote className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: 'Code Block',
      aliases: ['code', 'pre'],
      icon: <Code className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('codeBlock').run();
      },
    },
    {
      title: 'Divider',
      aliases: ['hr', 'line', 'divider', '---'],
      icon: <Minus className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: 'Callout',
      description: 'Make text stand out',
      aliases: ['callout', 'info', 'warning'],
      icon: <MessageSquare className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent('<div data-type="callout"><p></p></div>').run();
      },
    },
    {
      title: 'Toggle List',
      description: 'Collapsible list',
      aliases: ['toggle', 'details', 'collapse'],
      icon: <ToggleRight className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'details', attrs: { open: true },
          content: [ { type: 'summary', attrs: { level: 0 } }, { type: 'paragraph' } ]
        }).setTextSelection(range.from + 2).run();
      },
    },
    {
      title: 'Toggle Heading 1',
      description: 'Large collapsible heading',
      aliases: ['toggle h1', 'h1 toggle'],
      icon: <Heading1 className="w-4 h-4 text-neutral-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'details', attrs: { open: true },
          content: [ { type: 'summary', attrs: { level: 1 } }, { type: 'paragraph' } ]
        }).setTextSelection(range.from + 2).run();
      },
    },
    {
      title: 'Toggle Heading 2',
      description: 'Medium collapsible heading',
      aliases: ['toggle h2', 'h2 toggle'],
      icon: <Heading2 className="w-4 h-4 text-neutral-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'details', attrs: { open: true },
          content: [ { type: 'summary', attrs: { level: 2 } }, { type: 'paragraph' } ]
        }).setTextSelection(range.from + 2).run();
      },
    },
    {
      title: 'Toggle Heading 3',
      description: 'Small collapsible heading',
      aliases: ['toggle h3', 'h3 toggle'],
      icon: <Heading3 className="w-4 h-4 text-neutral-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'details', attrs: { open: true },
          content: [ { type: 'summary', attrs: { level: 3 } }, { type: 'paragraph' } ]
        }).setTextSelection(range.from + 2).run();
      },
    },
    {
      title: 'Image',
      description: 'Upload or embed with a link',
      aliases: ['image', 'img', 'picture'],
      icon: <ImageIcon className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              editor.chain().focus().deleteRange(range).setImage({ src: dataUrl }).run();
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      },
    },
    {
      title: 'Video',
      description: 'Embed a YouTube video',
      aliases: ['video', 'youtube', 'embed'],
      icon: <Youtube className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run();
        window.dispatchEvent(new CustomEvent('open-video-dialog', { detail: { pos: range.from } }));
      },
    },
  ];

  return items
    .filter(item => {
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().startsWith(q) ||
        item.aliases.some(alias => alias.startsWith(q))
      );
    })
    .slice(0, 10);
};

const renderItems = () => {
  let component: ReactRenderer<any>;
  let popup: any;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },
    onUpdate(props: any) {
      component.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },
    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return component.ref?.onKeyDown(props);
    },
    onExit() {
      popup[0].destroy();
      component.destroy();
    },
  };
};

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const slashCommandConfig = {
  items: getSuggestionItems,
  render: renderItems,
};
