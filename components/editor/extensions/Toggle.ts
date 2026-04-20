import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const Summary = Node.create({
  name: 'summary',
  content: 'inline*',
  group: 'summary',
  defining: true,
  
  addAttributes() {
    return {
      level: {
        default: 0,
        parseHTML: element => parseInt(element.getAttribute('data-level') || '0', 10),
        renderHTML: attributes => {
          if (!attributes.level) return {};
          return { 'data-level': attributes.level };
        }
      }
    }
  },
  
  parseHTML() {
    return [{ tag: 'summary' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    const level = HTMLAttributes['data-level'];
    let sizeClass = 'text-base font-semibold';
    if (level === 1) { sizeClass = 'text-3xl font-extrabold mt-6 mb-2'; }
    else if (level === 2) { sizeClass = 'text-2xl font-bold mt-4 mb-2'; }
    else if (level === 3) { sizeClass = 'text-xl font-semibold mt-3 mb-1'; }

    return ['summary', mergeAttributes(HTMLAttributes, { class: `${sizeClass} cursor-text outline-none hover:bg-neutral-800/50 rounded py-1 pr-2 transition-colors block text-neutral-200 select-text relative` }), 0];
  },
});

export const Details = Node.create({
  name: 'details',
  group: 'block',
  content: 'summary block+',
  defining: true,
  
  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: element => element.hasAttribute('open') ? true : false,
        renderHTML: attributes => {
          if (attributes.open) {
            return { open: '' }
          }
          return {}
        }
      }
    }
  },
  
  parseHTML() {
    return [{ tag: 'details' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { class: 'group/details my-2 outline-none w-full relative block' }), 0];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('detailsToggle'),
        props: {
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement;
            
            if (target && target.closest('summary')) {
              try {
                const $pos = view.state.doc.resolve(pos);
                for (let depth = $pos.depth; depth > 0; depth--) {
                  if ($pos.node(depth).type.name === 'details') {
                    const detailsNode = $pos.node(depth);
                    const detailsPos = $pos.before(depth);
                    
                    const tr = view.state.tr.setNodeMarkup(detailsPos, undefined, {
                      ...detailsNode.attrs,
                      open: !detailsNode.attrs.open,
                    });
                    view.dispatch(tr);
                    
                    event.preventDefault();
                    event.stopPropagation();
                    return true;
                  }
                }
              } catch (e) {
                console.error('Error toggling details block:', e);
              }
            }
            return false;
          }
        }
      })
    ];
  }
});
