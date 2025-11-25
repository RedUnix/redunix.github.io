import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

interface DraggableSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  dragOverId?: string | null;
}

export const DraggableSection: React.FC<DraggableSectionProps> = ({
  id,
  title,
  icon,
  children,
  defaultCollapsed = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
  dragOverId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const sectionRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`section-${id}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setIsCollapsed(parsed.collapsed ?? defaultCollapsed);
      } catch (e) {
        console.error('Failed to parse saved section state:', e);
        setIsCollapsed(defaultCollapsed);
      }
    } else {
      setIsCollapsed(defaultCollapsed);
    }
    setIsInitialized(true);
  }, [id, defaultCollapsed]);

  // Save collapsed state to localStorage (only after initial load and when changed)
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem(`section-${id}`, JSON.stringify({ collapsed: isCollapsed }));
    } catch (e) {
      console.error('Failed to save section state:', e);
    }
  }, [id, isCollapsed, isInitialized]);

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Only allow dragging from the grip handle
    if (!dragHandleRef.current?.contains(e.target as Node)) {
      e.preventDefault();
      return;
    }

    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // Create a custom drag image for better visual feedback
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    dragImage.style.pointerEvents = 'none';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    if (onDragStart) {
      onDragStart(id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const isDragOver = dragOverId === id && !isDragging;

  return (
    <div
      ref={sectionRef}
      data-section-id={id}
      className={`draggable-section ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
    >
      <div className="flex items-center justify-between mb-4 border-b pb-2 border-surface">
        <div className="flex items-center gap-2 flex-1">
          <div
            ref={dragHandleRef}
            className="cursor-grab active:cursor-grabbing hover:text-accent transition-colors select-none touch-none"
            title="Drag to reorder"
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <GripVertical size={16} />
          </div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {icon}
            {title}
          </h2>
        </div>
        <button
          onClick={toggleCollapse}
          className="ml-4 hover:text-accent transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand section' : 'Collapse section'}
          aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
          type="button"
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
};
