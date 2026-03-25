import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import React from 'react';

const ArrowComponent = (props: NodeViewProps) => {
  const { node, updateAttributes, selected } = props;
  const { startX, startY, endX, endY, zIndex } = node.attrs;

  const getHighestZIndex = () => {
    const nodes = document.querySelectorAll('.floating-node');
    let maxZ = 10;
    nodes.forEach((n) => {
      const z = parseInt(window.getComputedStyle(n).zIndex || '10', 10);
      if (z > maxZ) maxZ = z;
    });
    return maxZ;
  };

  const handlePointerDown = (e: React.PointerEvent, isStart: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    updateAttributes({ zIndex: getHighestZIndex() + 1 });
    
    const clientStartX = e.clientX;
    const clientStartY = e.clientY;
    const initialX = isStart ? startX : endX;
    const initialY = isStart ? startY : endY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - clientStartX;
      const dy = moveEvent.clientY - clientStartY;
      if (isStart) {
        updateAttributes({ startX: initialX + dx, startY: initialY + dy });
      } else {
        updateAttributes({ endX: initialX + dx, endY: initialY + dy });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleLinePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    updateAttributes({ zIndex: getHighestZIndex() + 1 });
    
    const clientStartX = e.clientX;
    const clientStartY = e.clientY;
    const initStartX = startX;
    const initStartY = startY;
    const initEndX = endX;
    const initEndY = endY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - clientStartX;
      const dy = moveEvent.clientY - clientStartY;
      updateAttributes({ 
        startX: initStartX + dx, 
        startY: initStartY + dy,
        endX: initEndX + dx,
        endY: initEndY + dy
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const padding = 20;
  const left = Math.min(startX, endX) - padding;
  const top = Math.min(startY, endY) - padding;
  const right = Math.max(startX, endX) + padding;
  const bottom = Math.max(startY, endY) + padding;
  const width = right - left;
  const height = bottom - top;

  const sx = startX - left;
  const sy = startY - top;
  const ex = endX - left;
  const ey = endY - top;

  const angle = Math.atan2(ey - sy, ex - sx);
  const headLength = 15;
  const headAngle = Math.PI / 6;

  const h1x = ex - headLength * Math.cos(angle - headAngle);
  const h1y = ey - headLength * Math.sin(angle - headAngle);
  
  const h2x = ex - headLength * Math.cos(angle + headAngle);
  const h2y = ey - headLength * Math.sin(angle + headAngle);

  return (
    <NodeViewWrapper 
      className={`floating-node arrow-node-wrapper ${selected ? 'is-selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: zIndex,
        pointerEvents: 'none'
      }}
    >
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <g stroke="var(--ios-blue)" strokeWidth="3" fill="none" style={{ pointerEvents: 'auto', cursor: selected ? 'move' : 'pointer' }} onPointerDown={handleLinePointerDown}>
          <line x1={sx} y1={sy} x2={ex} y2={ey} />
          <polyline points={`${h1x},${h1y} ${ex},${ey} ${h2x},${h2y}`} strokeLinejoin="round" strokeLinecap="round" />
        </g>
        
        {selected && (
          <>
            <circle cx={sx} cy={sy} r="6" fill="white" stroke="var(--ios-blue)" strokeWidth="2.5" style={{ pointerEvents: 'auto', cursor: 'grab' }} onPointerDown={(e) => handlePointerDown(e, true)} />
            <circle cx={ex} cy={ey} r="6" fill="white" stroke="var(--ios-blue)" strokeWidth="2.5" style={{ pointerEvents: 'auto', cursor: 'grab' }} onPointerDown={(e) => handlePointerDown(e, false)} />
          </>
        )}
      </svg>
    </NodeViewWrapper>
  );
};

export const ArrowExtension = Node.create({
  name: 'arrow',
  group: 'block',
  defining: true,

  addAttributes() {
    return {
      startX: { default: 50 },
      startY: { default: 50 },
      endX: { default: 200 },
      endY: { default: 50 },
      zIndex: { default: 10 }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="arrow"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'arrow' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ArrowComponent);
  },
});
