import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DatabaseBlock } from './DatabaseBlock';

export const DatabaseExtension = Node.create({
  name: 'database',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      pageId: null,
      userId: null,
    };
  },

  addAttributes() {
    return {
      databaseId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="database"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'database' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DatabaseBlock);
  },
});
