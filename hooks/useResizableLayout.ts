import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../lib/store';
import { PanelSizes } from '../types/models';

// Minimum and maximum size constraints for panels (in percentage)
const PANEL_CONSTRAINTS = {
  centralPanel: {
    width: { min: 40, max: 80 },
    height: { min: 30, max: 70 }
  },
  leftPanel: {
    width: { min: 15, max: 35 }
  },
  rightPanel: {
    width: { min: 15, max: 35 }
  },
  financialAnalysisPanel: {
    height: { min: 15, max: 40 }
  },
  industryPanel: {
    height: { min: 10, max: 30 }
  }
} as const;

// Default panel sizes (in percentage)
const DEFAULT_PANEL_SIZES: PanelSizes = {
  centralPanel: { width: 60, height: 50 },
  leftPanel: { width: 20 },
  rightPanel: { width: 20 },
  financialAnalysisPanel: { height: 25 },
  industryPanel: { height: 15 }
};

export interface ResizeHandle {
  panel: keyof PanelSizes;
  direction: 'horizontal' | 'vertical';
  position: 'start' | 'end';
}

export interface DragState {
  isDragging: boolean;
  handle: ResizeHandle | null;
  startPosition: { x: number; y: number };
  startSizes: PanelSizes;
}

export interface UseResizableLayoutReturn {
  panelSizes: PanelSizes;
  dragState: DragState;
  isResizing: boolean;
  
  // Core resize functions
  startResize: (handle: ResizeHandle, event: MouseEvent | TouchEvent) => void;
  handleResize: (event: MouseEvent | TouchEvent) => void;
  endResize: () => void;
  
  // Panel size management
  updatePanelSize: (panel: keyof PanelSizes, size: Partial<PanelSizes[keyof PanelSizes]>) => void;
  resetLayout: () => void;
  
  // Constraint validation
  validatePanelSize: (panel: keyof PanelSizes, size: Partial<PanelSizes[keyof PanelSizes]>) => PanelSizes[keyof PanelSizes];
  
  // Utility functions
  getPanelStyle: (panel: keyof PanelSizes) => React.CSSProperties;
  getResizeHandleProps: (handle: ResizeHandle) => {
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    style: React.CSSProperties;
  };
}

export function useResizableLayout(): UseResizableLayoutReturn {
  const { panelSizes, setPanelSizes, updatePanelSize: storeUpdatePanelSize, resetPanelSizes } = useAppStore();
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    handle: null,
    startPosition: { x: 0, y: 0 },
    startSizes: DEFAULT_PANEL_SIZES
  });
  
  const containerRef = useRef<HTMLElement | null>(null);
  
  // Get container dimensions for percentage calculations
  const getContainerDimensions = useCallback(() => {
    if (!containerRef.current) {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);
  
  // Validate panel size against constraints
  const validatePanelSize = useCallback((
    panel: keyof PanelSizes, 
    size: Partial<PanelSizes[keyof PanelSizes]>
  ): PanelSizes[keyof PanelSizes] => {
    const constraints = PANEL_CONSTRAINTS[panel];
    const currentSize = panelSizes[panel];
    const newSize = { ...currentSize, ...size };
    
    // Apply width constraints
    if ('width' in newSize && constraints.width) {
      newSize.width = Math.max(
        constraints.width.min,
        Math.min(constraints.width.max, newSize.width)
      );
    }
    
    // Apply height constraints
    if ('height' in newSize && constraints.height) {
      newSize.height = Math.max(
        constraints.height.min,
        Math.min(constraints.height.max, newSize.height)
      );
    }
    
    return newSize;
  }, [panelSizes]);
  
  // Update panel size with validation and space conservation
  const updatePanelSize = useCallback((
    panel: keyof PanelSizes, 
    size: Partial<PanelSizes[keyof PanelSizes]>
  ) => {
    const validatedSize = validatePanelSize(panel, size);
    const newSizes = { ...panelSizes };
    
    // Update the target panel
    newSizes[panel] = validatedSize;
    
    // Ensure space conservation for horizontal panels
    if ('width' in validatedSize) {
      const totalWidth = newSizes.leftPanel.width + newSizes.centralPanel.width + newSizes.rightPanel.width;
      
      if (totalWidth !== 100) {
        const excess = totalWidth - 100;
        
        // Distribute excess proportionally to other horizontal panels
        if (panel !== 'leftPanel') {
          const adjustment = excess * (newSizes.leftPanel.width / (newSizes.leftPanel.width + (panel !== 'rightPanel' ? newSizes.rightPanel.width : 0)));
          newSizes.leftPanel.width = Math.max(PANEL_CONSTRAINTS.leftPanel.width.min, newSizes.leftPanel.width - adjustment);
        }
        
        if (panel !== 'rightPanel') {
          const adjustment = excess * (newSizes.rightPanel.width / (newSizes.rightPanel.width + (panel !== 'leftPanel' ? newSizes.leftPanel.width : 0)));
          newSizes.rightPanel.width = Math.max(PANEL_CONSTRAINTS.rightPanel.width.min, newSizes.rightPanel.width - adjustment);
        }
        
        if (panel !== 'centralPanel') {
          const remainingWidth = 100 - newSizes.leftPanel.width - newSizes.rightPanel.width;
          newSizes.centralPanel.width = Math.max(PANEL_CONSTRAINTS.centralPanel.width.min, remainingWidth);
        }
      }
    }
    
    // Ensure space conservation for vertical panels
    if ('height' in validatedSize && (panel === 'centralPanel' || panel === 'financialAnalysisPanel' || panel === 'industryPanel')) {
      const totalHeight = newSizes.centralPanel.height + newSizes.financialAnalysisPanel.height + newSizes.industryPanel.height;
      
      if (totalHeight !== 100) {
        const excess = totalHeight - 100;
        
        // Distribute excess proportionally to other vertical panels
        if (panel !== 'centralPanel') {
          const adjustment = excess * (newSizes.centralPanel.height / (newSizes.centralPanel.height + (panel !== 'financialAnalysisPanel' ? newSizes.financialAnalysisPanel.height : 0) + (panel !== 'industryPanel' ? newSizes.industryPanel.height : 0)));
          newSizes.centralPanel.height = Math.max(PANEL_CONSTRAINTS.centralPanel.height.min, newSizes.centralPanel.height - adjustment);
        }
        
        if (panel !== 'financialAnalysisPanel') {
          const adjustment = excess * (newSizes.financialAnalysisPanel.height / (newSizes.financialAnalysisPanel.height + (panel !== 'centralPanel' ? newSizes.centralPanel.height : 0) + (panel !== 'industryPanel' ? newSizes.industryPanel.height : 0)));
          newSizes.financialAnalysisPanel.height = Math.max(PANEL_CONSTRAINTS.financialAnalysisPanel.height.min, newSizes.financialAnalysisPanel.height - adjustment);
        }
        
        if (panel !== 'industryPanel') {
          const remainingHeight = 100 - newSizes.centralPanel.height - newSizes.financialAnalysisPanel.height;
          newSizes.industryPanel.height = Math.max(PANEL_CONSTRAINTS.industryPanel.height.min, remainingHeight);
        }
      }
    }
    
    setPanelSizes(newSizes);
  }, [panelSizes, validatePanelSize, setPanelSizes]);
  
  // Start resize operation
  const startResize = useCallback((handle: ResizeHandle, event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    setDragState({
      isDragging: true,
      handle,
      startPosition: { x: clientX, y: clientY },
      startSizes: { ...panelSizes }
    });
    
    // Add global event listeners
    document.addEventListener('mousemove', handleResize as any);
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchmove', handleResize as any);
    document.addEventListener('touchend', endResize);
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = handle.direction === 'horizontal' ? 'col-resize' : 'row-resize';
  }, [panelSizes]);
  
  // Handle resize during drag
  const handleResize = useCallback((event: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !dragState.handle) return;
    
    event.preventDefault();
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const deltaX = clientX - dragState.startPosition.x;
    const deltaY = clientY - dragState.startPosition.y;
    
    const containerDimensions = getContainerDimensions();
    const { handle, startSizes } = dragState;
    
    // Calculate new size based on handle direction and position
    let newSize: Partial<PanelSizes[keyof PanelSizes]> = {};
    
    if (handle.direction === 'horizontal') {
      const deltaPercentage = (deltaX / containerDimensions.width) * 100;
      
      if (handle.panel === 'leftPanel') {
        newSize = { width: startSizes.leftPanel.width + (handle.position === 'end' ? deltaPercentage : -deltaPercentage) };
      } else if (handle.panel === 'rightPanel') {
        newSize = { width: startSizes.rightPanel.width + (handle.position === 'start' ? -deltaPercentage : deltaPercentage) };
      } else if (handle.panel === 'centralPanel') {
        newSize = { width: startSizes.centralPanel.width + deltaPercentage };
      }
    } else if (handle.direction === 'vertical') {
      const deltaPercentage = (deltaY / containerDimensions.height) * 100;
      
      if (handle.panel === 'centralPanel') {
        newSize = { height: startSizes.centralPanel.height + (handle.position === 'end' ? deltaPercentage : -deltaPercentage) };
      } else if (handle.panel === 'financialAnalysisPanel') {
        newSize = { height: startSizes.financialAnalysisPanel.height + deltaPercentage };
      } else if (handle.panel === 'industryPanel') {
        newSize = { height: startSizes.industryPanel.height + (handle.position === 'start' ? -deltaPercentage : deltaPercentage) };
      }
    }
    
    if (Object.keys(newSize).length > 0) {
      updatePanelSize(handle.panel, newSize);
    }
  }, [dragState, getContainerDimensions, updatePanelSize]);
  
  // End resize operation
  const endResize = useCallback(() => {
    setDragState({
      isDragging: false,
      handle: null,
      startPosition: { x: 0, y: 0 },
      startSizes: DEFAULT_PANEL_SIZES
    });
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleResize as any);
    document.removeEventListener('mouseup', endResize);
    document.removeEventListener('touchmove', handleResize as any);
    document.removeEventListener('touchend', endResize);
    
    // Restore normal cursor and text selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleResize]);
  
  // Reset layout to defaults
  const resetLayout = useCallback(() => {
    resetPanelSizes();
  }, [resetPanelSizes]);
  
  // Get CSS styles for a panel
  const getPanelStyle = useCallback((panel: keyof PanelSizes): React.CSSProperties => {
    const size = panelSizes[panel];
    
    switch (panel) {
      case 'leftPanel':
        return {
          width: `${size.width}%`,
          height: '100%',
          position: 'relative'
        };
      case 'rightPanel':
        return {
          width: `${size.width}%`,
          height: '100%',
          position: 'relative'
        };
      case 'centralPanel':
        return {
          width: `${size.width}%`,
          height: `${size.height}%`,
          position: 'relative'
        };
      case 'financialAnalysisPanel':
        return {
          width: '100%',
          height: `${size.height}%`,
          position: 'relative'
        };
      case 'industryPanel':
        return {
          width: '100%',
          height: `${size.height}%`,
          position: 'relative'
        };
      default:
        return {};
    }
  }, [panelSizes]);
  
  // Get props for resize handles
  const getResizeHandleProps = useCallback((handle: ResizeHandle) => ({
    onMouseDown: (event: React.MouseEvent) => startResize(handle, event.nativeEvent),
    onTouchStart: (event: React.TouchEvent) => startResize(handle, event.nativeEvent),
    style: {
      position: 'absolute' as const,
      zIndex: 10,
      cursor: handle.direction === 'horizontal' ? 'col-resize' : 'row-resize',
      backgroundColor: 'transparent',
      transition: dragState.isDragging ? 'none' : 'background-color 0.2s ease',
      ...(handle.direction === 'horizontal' ? {
        width: '4px',
        height: '100%',
        top: 0,
        [handle.position === 'start' ? 'left' : 'right']: '-2px'
      } : {
        width: '100%',
        height: '4px',
        left: 0,
        [handle.position === 'start' ? 'top' : 'bottom']: '-2px'
      })
    } as React.CSSProperties
  }), [startResize, dragState.isDragging]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragState.isDragging) {
        endResize();
      }
    };
  }, [dragState.isDragging, endResize]);
  
  // Set container ref for dimension calculations
  useEffect(() => {
    containerRef.current = document.querySelector('[data-resizable-container]') as HTMLElement;
  }, []);
  
  return {
    panelSizes,
    dragState,
    isResizing: dragState.isDragging,
    startResize,
    handleResize,
    endResize,
    updatePanelSize,
    resetLayout,
    validatePanelSize,
    getPanelStyle,
    getResizeHandleProps
  };
}