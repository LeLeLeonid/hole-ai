import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { WindowPosition, WindowSize, SnapState } from '../types';

interface DraggableWindowProps {
  title: string;
  children: React.ReactNode;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isSnapped: SnapState;
  parentBounds: DOMRect | null;
  onPositionChange: (pos: WindowPosition, snap: SnapState) => void;
  onSizeChange: (size: WindowSize) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
}

const SNAP_THRESHOLD = 25;
const MIN_WIDTH = 250;
const MIN_HEIGHT = 150;

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

const RESIZE_HANDLES: { dir: ResizeDirection, cursor: string }[] = [
    { dir: 'n', cursor: 'n-resize' }, { dir: 'ne', cursor: 'ne-resize' },
    { dir: 'e', cursor: 'e-resize' }, { dir: 'se', cursor: 'se-resize' },
    { dir: 's', cursor: 's-resize' }, { dir: 'sw', cursor: 'sw-resize' },
    { dir: 'w', cursor: 'w-resize' }, { dir: 'nw', cursor: 'nw-resize' },
];

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title, children, position, size, zIndex, isMinimized, isMaximized, isSnapped, parentBounds,
  onPositionChange, onSizeChange, onClose, onMinimize, onMaximize, onFocus
}) => {
  const { theme } = useTheme();
  const [interaction, setInteraction] = useState<'drag' | 'resize' | null>(null);
  const interactionRef = useRef({
      startX: 0, startY: 0,
      initialX: 0, initialY: 0,
      width: 0, height: 0,
      dir: '' as ResizeDirection | ''
  });

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement>, type: 'drag' | 'resize', dir: ResizeDirection | '' = '') => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    setInteraction(type);
    interactionRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      width: size.width,
      height: size.height,
      dir: dir,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction || !parentBounds) return;
    
    const dx = e.clientX - interactionRef.current.startX;
    const dy = e.clientY - interactionRef.current.startY;
    
    if (interaction === 'drag') {
      let isSnapped = false;
      let newX = interactionRef.current.initialX + dx;
      let newY = interactionRef.current.initialY + dy;
      let newWidth = size.width;
      let newHeight = size.height;
      
      const clearSnap = { top: false, right: false, bottom: false, left: false };
      
      // Detach from any snap if moving
      if(isSnapped) {
        onSizeChange({width: interactionRef.current.width, height: interactionRef.current.height});
      }
      
      onPositionChange({ x: newX, y: newY }, clearSnap);
      
      // Quadrant Snapping Logic
      if (e.clientY < SNAP_THRESHOLD) { // Top edge
        newY = 0; newHeight = parentBounds.height / 2;
        if(e.clientX < SNAP_THRESHOLD) { // Top-left corner
          newX = 0; newWidth = parentBounds.width / 2;
        } else if (e.clientX > parentBounds.width - SNAP_THRESHOLD) { // Top-right corner
          newX = parentBounds.width / 2; newWidth = parentBounds.width / 2;
        } else { // Top-half snap
          newX = 0; newWidth = parentBounds.width;
        }
        isSnapped = true;
      } else if (e.clientY > parentBounds.height - SNAP_THRESHOLD) { // Bottom edge
        newY = parentBounds.height / 2; newHeight = parentBounds.height / 2;
        if(e.clientX < SNAP_THRESHOLD) { // Bottom-left corner
            newX = 0; newWidth = parentBounds.width / 2;
        } else if (e.clientX > parentBounds.width - SNAP_THRESHOLD) { // Bottom-right corner
            newX = parentBounds.width / 2; newWidth = parentBounds.width / 2;
        } else { // Bottom-half snap
            newX = 0; newWidth = parentBounds.width;
        }
        isSnapped = true;
      } else if (e.clientX < SNAP_THRESHOLD) { // Left-half snap
        newX = 0; newY = 0; newWidth = parentBounds.width / 2; newHeight = parentBounds.height;
        isSnapped = true;
      } else if (e.clientX > parentBounds.width - SNAP_THRESHOLD) { // Right-half snap
        newX = parentBounds.width / 2; newY = 0; newWidth = parentBounds.width / 2; newHeight = parentBounds.height;
        isSnapped = true;
      }

      if (isSnapped) {
        onPositionChange({x: newX, y: newY}, {top: true, right: true, bottom: true, left: true});
        onSizeChange({width: newWidth, height: newHeight});
      } else {
        // Standard drag with unsnapping
        const finalX = interactionRef.current.initialX + dx;
        const finalY = interactionRef.current.initialY + dy;
        onPositionChange({ 
            x: Math.max(0, Math.min(finalX, parentBounds.width - size.width)), 
            y: Math.max(0, Math.min(finalY, parentBounds.height - size.height))
        }, clearSnap);
      }
    } else if (interaction === 'resize') {
      let newPos = { x: interactionRef.current.initialX, y: interactionRef.current.initialY };
      let newSize = { width: interactionRef.current.width, height: interactionRef.current.height };
      const { dir } = interactionRef.current;
      
      if (dir.includes('e')) newSize.width = Math.max(MIN_WIDTH, interactionRef.current.width + dx);
      if (dir.includes('s')) newSize.height = Math.max(MIN_HEIGHT, interactionRef.current.height + dy);
      if (dir.includes('w')) {
        const calculatedWidth = interactionRef.current.width - dx;
        if (calculatedWidth > MIN_WIDTH) {
          newSize.width = calculatedWidth;
          newPos.x = interactionRef.current.initialX + dx;
        }
      }
      if (dir.includes('n')) {
        const calculatedHeight = interactionRef.current.height - dy;
        if (calculatedHeight > MIN_HEIGHT) {
          newSize.height = calculatedHeight;
          newPos.y = interactionRef.current.initialY + dy;
        }
      }

      // Clamp to parent bounds
      if(newPos.x < 0) { newSize.width += newPos.x; newPos.x = 0; }
      if(newPos.y < 0) { newSize.height += newPos.y; newPos.y = 0; }
      if(newPos.x + newSize.width > parentBounds.width) { newSize.width = parentBounds.width - newPos.x; }
      if(newPos.y + newSize.height > parentBounds.height) { newSize.height = parentBounds.height - newPos.y; }

      onPositionChange(newPos, { top: false, right: false, bottom: false, left: false });
      onSizeChange(newSize);
    }
  }, [interaction, parentBounds, onPositionChange, onSizeChange, isSnapped, size.width, size.height]);

  const handleMouseUp = useCallback(() => {
    if(interaction === 'drag' && parentBounds) {
        // Final snap check on mouse up to set border style correctly
        const finalX = position.x;
        const finalY = position.y;
        const snap: SnapState = { top: false, right: false, bottom: false, left: false };
        if (finalY <= 0) snap.top = true;
        if (finalX <= 0) snap.left = true;
        if (finalX + size.width >= parentBounds.width - 1) snap.right = true;
        if (finalY + size.height >= parentBounds.height - 1) snap.bottom = true;
        onPositionChange(position, snap);
    }
    setInteraction(null);
  }, [interaction, parentBounds, onPositionChange, position, size]);

  useEffect(() => {
    if (interaction) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp, { once: true });
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interaction, handleMouseMove, handleMouseUp]);

  const headerButtonStyles: React.CSSProperties = {
    fontFamily: 'monospace', padding: '0 4px', cursor: 'pointer',
  };

  const anySnap = Object.values(isSnapped).some(s => s);

  return (
    <div
      style={{
        position: 'absolute', left: position.x, top: position.y,
        width: size.width, height: isMinimized ? 'auto' : size.height,
        backgroundColor: theme.colors.bg, zIndex,
        boxShadow: `5px 5px 15px rgba(0,0,0,0.5)`,
        display: 'flex', flexDirection: 'column',
        border: anySnap ? `1px solid ${theme.colors.accent2}` : `2px solid ${theme.colors.accent1}`,
        transition: interaction ? 'none' : 'all 0.1s ease-out'
      }}
      onMouseDown={onFocus}
    >
      <div
        onMouseDown={(e) => handleInteractionStart(e, 'drag')}
        style={{
          padding: '4px 8px', backgroundColor: theme.colors.accent1, color: theme.colors.bg,
          cursor: isMaximized ? 'default' : 'move', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', userSelect: 'none',
        }}
      >
        <span>{title}</span>
        <div style={{ display: 'flex' }}>
          <span style={headerButtonStyles} onMouseDown={(e) => { e.stopPropagation(); onMinimize(); }}>{isMinimized ? '[+]' : '[_]'}</span>
          <span style={headerButtonStyles} onMouseDown={(e) => { e.stopPropagation(); onMaximize(); }}>{isMaximized ? '[⧉]' : '[□]'}</span>
          <span style={headerButtonStyles} onMouseDown={(e) => { e.stopPropagation(); onClose(); }}>[X]</span>
        </div>
      </div>
      {!isMinimized && (
        <div style={{ flexGrow: 1, padding: '4px', overflow: 'auto', position: 'relative' }}>
            {children}
            {!isMaximized && RESIZE_HANDLES.map(({ dir, cursor }) => {
                const style: React.CSSProperties = { position: 'absolute', cursor };
                if (dir.includes('n')) { style.top = -5; style.height = 10; }
                if (dir.includes('s')) { style.bottom = -5; style.height = 10; }
                if (dir.includes('w')) { style.left = -5; style.width = 10; }
                if (dir.includes('e')) { style.right = -5; style.width = 10; }
                if (dir === 'n' || dir === 's') { style.left = 5; style.right = 5; }
                if (dir === 'w' || dir === 'e') { style.top = 5; style.bottom = 5; }
                return (
                    <div key={dir} style={style} onMouseDown={(e) => handleInteractionStart(e, 'resize', dir)}/>
                );
            })}
        </div>
      )}
    </div>
  );
};