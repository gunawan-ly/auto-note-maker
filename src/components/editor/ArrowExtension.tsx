import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

const ArrowComponent = () => {
  return (
    <NodeViewWrapper className="arrow-node" as="span" style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px', verticalAlign: 'middle', userSelect: 'none' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </NodeViewWrapper>
  );
};

export const ArrowExtension = Node.create({
  name: 'arrow',

  group: 'inline',

  inline: true,

  draggable: true,

  selectable: true,

  parseHTML() {
    return [
      {
        tag: 'span[data-type="arrow"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'arrow' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ArrowComponent);
  },
});
