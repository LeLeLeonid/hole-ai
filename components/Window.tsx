import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { PanelState } from '../types';

interface WindowProps {
  panel: PanelState;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (pos: { x: number; y: number }) => void;
  onResize: (size: { width: number; height: number }) => void;
  bounds: { top: number; left: number; right: number; bottom: number };
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;
const SNAP_THRESHOLD = 20;
const HEADER_HEIGHT = 38;

const RESIZE_HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const CURSOR_MAP: { [key: string]: string } = {
  n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
  ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize',
};

export const Window: React.FC<WindowProps> = ({ panel, children, onClose, onMinimize, onMaximize, onFocus, onMove, onResize, bounds }) => {
  const { theme } = useTheme();
  const operation = useRef<{ type: 'move' | 'resize', handle?: string, startX: number, startY: number, startWidth: number, startHeight: number, startLeft: number, startTop: number } | null>(null);
  
  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize', handle?: string) => {
    // Prevent interaction if window is maximized or minimized
    if (panel.isMaximized || panel.isMinimized) return;
    
    e.preventDefault();
    e.stopPropagation();
    onFocus();

    operation.current = {
      type,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: panel.size.width,
      startHeight: panel.size.height,
      startLeft: panel.pos.x,
      startTop: panel.pos.y,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!operation.current) return;
    
    const dx = e.clientX - operation.current.startX;
    const dy = e.clientY - operation.current.startY;

    if (operation.current.type === 'move') {
      let newX = operation.current.startLeft + dx;
      let newY = operation.current.startTop + dy;

      if (Math.abs(newX - bounds.left) < SNAP_THRESHOLD) newX = bounds.left;
      if (Math.abs(newY - bounds.top) < SNAP_THRESHOLD) newY = bounds.top;
      if (Math.abs((newX + panel.size.width) - bounds.right) < SNAP_THRESHOLD) newX = bounds.right - panel.size.width;
      // When minimized, height is just header height. Use full size for boundary checks.
      const effectiveHeight = panel.isMinimized ? operation.current.startHeight : panel.size.height;
      if (Math.abs((newY + effectiveHeight) - bounds.bottom) < SNAP_THRESHOLD) newY = bounds.bottom - effectiveHeight;
      
      newX = Math.max(bounds.left, Math.min(newX, bounds.right - panel.size.width));
      newY = Math.max(bounds.top, Math.min(newY, bounds.bottom - effectiveHeight));
      
      onMove({ x: newX, y: newY });

    } else if (operation.current.type === 'resize' && operation.current.handle) {
        let { startLeft, startTop, startWidth, startHeight } = operation.current;
        let newPos = { x: startLeft, y: startTop };
        let newSize = { width: startWidth, height: startHeight };
        const handle = operation.current.handle;

        const minW = panel.minSize?.width || MIN_WIDTH;
        const minH = panel.minSize?.height || MIN_HEIGHT;

        if (handle.includes('e')) newSize.width = Math.max(minW, startWidth + dx);
        if (handle.includes('w')) {
            const width = Math.max(minW, startWidth - dx);
            newPos.x = startLeft + startWidth - width;
            newSize.width = width;
        }
        if (handle.includes('s')) newSize.height = Math.max(minH, startHeight + dy);
        if (handle.includes('n')) {
            const height = Math.max(minH, startHeight - dy);
            newPos.y = startTop + startHeight - height;
            newSize.height = height;
        }
        
        if(newPos.x < bounds.left) {
            newSize.width -= (bounds.left - newPos.x);
            newPos.x = bounds.left;
        }
        if(newPos.y < bounds.top) {
            newSize.height -= (bounds.top - newPos.y);
            newPos.y = bounds.top;
        }
        if((newPos.x + newSize.width) > bounds.right) newSize.width = bounds.right - newPos.x;
        if((newPos.y + newSize.height) > bounds.bottom) newSize.height = bounds.bottom - newPos.y;

        onMove(newPos);
        onResize(newSize);
    }
  };

  const handleMouseUp = () => {
    operation.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => { 
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Determine window height based on state for smooth animation.
  const getWindowHeight = () => {
      if (panel.isMaximized) return '100%';
      if (panel.isMinimized) return `${HEADER_HEIGHT}px`;
      return panel.size.height;
  }

  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    left: panel.isMaximized ? 0 : panel.pos.x,
    top: panel.isMaximized ? 0 : panel.pos.y,
    width: panel.isMaximized ? '100%' : panel.size.width,
    height: getWindowHeight(),
    zIndex: panel.zIndex,
    backgroundColor: theme.colors.bg,
    border: `2px solid ${theme.colors.accent1}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // Animate height changes for the minimize/restore effect. Other properties change instantly.
    transition: 'height 0.2s ease-in-out',
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
  };

  return (
    <div
      style={windowStyle}
      onMouseDown={onFocus}
    >
      <div
        style={{
          padding: '4px 8px',
          backgroundColor: theme.colors.accent1,
          color: theme.colors.bg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          flexShrink: 0,
          cursor: !panel.isMaximized && !panel.isMinimized ? 'move' : 'default',
          height: `${HEADER_HEIGHT}px`,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        <span>{panel.title}</span>
        <div style={{ display: 'flex', cursor: 'default' }}>
            <span title="Minimize" style={{ padding: '0 4px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onMinimize(); }} onMouseDown={(e) => e.stopPropagation()}>
                {panel.isMinimized ? '[+]' : '[_]'}
            </span>
            <span title={panel.isMaximized ? "Restore" : "Maximize"} style={{ padding: '0 4px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onMaximize(); }} onMouseDown={(e) => e.stopPropagation()}>
                [O]
            </span>
            <span title="Close" style={{ padding: '0 4px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onClose(); }} onMouseDown={(e) => e.stopPropagation()}>
                [X]
            </span>
        </div>
      </div>
      {/* BUGFIX: Do not render content when minimized to prevent layout/content bugs. */}
      {!panel.isMinimized && (
        <div style={{ flexGrow: 1, padding: '4px', overflow: 'auto', position: 'relative' }}>
          {children}
          {/* Hide resize handles if maximized or minimized */}
          {!panel.isMaximized && !panel.isMinimized && RESIZE_HANDLES.map(handle => (
              <div
                key={handle}
                onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
                style={{
                  position: 'absolute',
                  top: handle.includes('n') ? '-5px' : handle.includes('s') ? undefined : '0px',
                  bottom: handle.includes('s') ? '-5px' : undefined,
                  left: handle.includes('w') ? '-5px' : handle.includes('e') ? undefined : '0px',
                  right: handle.includes('e') ? '-5px' : undefined,
                  width: handle.includes('n') || handle.includes('s') ? '100%' : '10px',
                  height: handle.includes('w') || handle.includes('e') ? '100%' : '10px',
                  cursor: CURSOR_MAP[handle],
                  zIndex: 1,
                }}
              />
          ))}
        </div>
      )}
    </div>
  );
};
