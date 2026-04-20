import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { IconPicker } from '@/components/IconPicker';
import { RenderIcon } from '@/components/RenderIcon';

const CalloutView = ({ node, updateAttributes }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <NodeViewWrapper className="flex items-start gap-3 p-4 my-4 rounded-lg bg-neutral-800/50 border border-neutral-700 w-full callout-block group">
      <div 
        className="text-xl pt-0.5 relative" 
        contentEditable={false}
      >
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger asChild>
            <button className="cursor-pointer select-none hover:bg-neutral-700/50 rounded p-1 -m-1 transition-colors">
              <RenderIcon icon={node.attrs.icon} className="w-6 h-6" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-50" sideOffset={5} align="start">
              <IconPicker 
                onSelect={(icon) => {
                  updateAttributes({ icon });
                  setIsOpen(false);
                }}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <NodeViewContent className="flex-1 w-full min-w-0 prose-p:my-0 callout-content text-neutral-200" />
    </NodeViewWrapper>
  );
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      icon: { default: '💡' },
      backgroundColor: { default: 'bg-neutral-800/50' }
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="callout"]' }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  }
});
