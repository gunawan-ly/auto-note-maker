import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';

const TextBoxComponent = () => {
  return (
    <NodeViewWrapper className="text-box-node">
      <NodeViewContent className="text-box-content" />
    </NodeViewWrapper>
  );
};

export const TextBoxExtension = Node.create({
  name: 'textBox',

  group: 'block',

  content: 'block+',

  defining: true,

  draggable: true,

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
