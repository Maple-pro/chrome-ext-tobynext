import React, { useEffect, useState } from 'react';

import { useNewTabContext } from '../context/NewTabContext';
import {
  acceptsDrag,
  beginDrag,
  DragItem,
  dropItem,
  endDrag,
  readDrag,
} from '../services/drag';

export function useDragSource(item: DragItem, allowedControlSelector?: string) {
  const { setDragType, dragType } = useNewTabContext();
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragType) setDragging(false);
  }, [dragType]);
  return {
    dragging,
    sourceProps: {
      draggable: true,
      onDragStart(event: React.DragEvent) {
        const control = (event.target as HTMLElement).closest(
          'button,input,dialog'
        );
        if (
          control &&
          (!allowedControlSelector || !control.matches(allowedControlSelector))
        ) {
          event.preventDefault();
          return;
        }
        event.stopPropagation();
        beginDrag(event.dataTransfer, item);
        setDragging(true);
        setDragType(item.type);
      },
      onDragEnd() {
        endDrag();
        setDragging(false);
        setDragType('');
      },
    },
  };
}

export function useDropTarget(
  types: DragItem['type'][],
  parentId: string,
  targetId?: string
) {
  const { dragType, setDragType, refresh } = useNewTabContext();
  const [position, setPosition] = useState<'' | 'before' | 'after' | 'inside'>(
    ''
  );
  const [error, setError] = useState('');
  useEffect(() => {
    if (!dragType) setPosition('');
  }, [dragType]);
  return {
    dropClass: position ? `drop-${position}` : '',
    error,
    targetProps: {
      onDragOver(event: React.DragEvent<HTMLElement>) {
        if (!acceptsDrag(types)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = dragType === 'tab' ? 'copy' : 'move';
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition(
          targetId
            ? event.clientY > rect.top + rect.height / 2
              ? 'after'
              : 'before'
            : 'inside'
        );
        // Keep long collection/space panels moving near the visible edges.
        let panel: HTMLElement | null = event.currentTarget;
        while (
          panel &&
          !/(auto|scroll)/.test(getComputedStyle(panel).overflowY)
        )
          panel = panel.parentElement;
        if (panel) {
          const bounds = panel.getBoundingClientRect();
          if (event.clientY < bounds.top + 40) panel.scrollTop -= 16;
          else if (event.clientY > bounds.bottom - 40) panel.scrollTop += 16;
        }
      },
      onDragLeave(event: React.DragEvent<HTMLElement>) {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setPosition('');
      },
      async onDrop(event: React.DragEvent<HTMLElement>) {
        if (!acceptsDrag(types)) return;
        event.preventDefault();
        event.stopPropagation();
        const item = readDrag(event.dataTransfer);
        const rect = event.currentTarget.getBoundingClientRect();
        const after = event.clientY > rect.top + rect.height / 2;
        endDrag();
        setDragType('');
        setPosition('');
        setError('');
        if (!item) return;
        try {
          await dropItem(item, parentId, targetId, after);
          refresh();
        } catch (reason) {
          setError(String(reason));
        }
      },
    },
  };
}
