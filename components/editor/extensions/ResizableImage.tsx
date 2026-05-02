import { Node, mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useRef, useState } from 'react';

const ResizableImageNode = (props: any) => {
  const { node, updateAttributes, selected } = props;
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = imgRef.current?.clientWidth || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      updateAttributes({ width: Math.max(50, newWidth) });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
    };

    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <NodeViewWrapper className={`relative inline-block leading-none ${selected || isResizing ? 'ring-2 ring-blue-500 rounded-md' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        ref={imgRef}
        src={node.attrs.src} 
        alt={node.attrs.alt}
        title={node.attrs.title}
        style={{ 
          width: node.attrs.width ? `${node.attrs.width}px` : 'auto', 
          maxWidth: '100%',
          display: 'block',
          borderRadius: '0.375rem'
        }} 
        className="cursor-default m-0"
      />
      {(selected || isResizing) && (
        <div 
          onMouseDown={handleMouseDown}
          className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-sm transition-transform z-10"
        />
      )}
    </NodeViewWrapper>
  );
};

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  }
});
