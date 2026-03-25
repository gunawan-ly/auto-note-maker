import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import React from 'react';

const TextBoxComponent = (props: NodeViewProps) => {
  const { node, updateAttributes, selected } = props;
  const { x, y, width, zIndex } = node.attrs;

  const getHighestZIndex = () => {
    const nodes = document.querySelectorAll('.floating-node');
    let maxZ = 10;
    nodes.forEach((n) => {
      const z = parseInt(window.getComputedStyle(n).zIndex || '10', 10);
      if (z > maxZ) maxZ = z;
    });
    return maxZ;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.text-box-content')) return;
    
    e.preventDefault();
    updateAttributes({ zIndex: getHighestZIndex() + 1 });
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = x;
    const initialY = y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      updateAttributes({ x: initialX + dx, y: initialY + dy });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <NodeViewWrapper 
      className={`floating-node text-box-node ${selected ? 'is-selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        zIndex: zIndex,
      }}
    >
      <div 
        className="text-box-drag-handle" 
        onPointerDown={handlePointerDown}
      />
      <NodeViewContent className="text-box-content" />
    </NodeViewWrapper>
  );
};

export const TextBoxExtension = Node.create({
  name: 'textBox',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      x: { default: 100 },
      y: { default: 100 },
      width: { default: 280 },
      zIndex: { default: 10 }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="text-box"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'text-box' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TextBoxComponent);
  },
});
