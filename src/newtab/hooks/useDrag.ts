import React, { useEffect, useState } from 'react';

import { useNewTabContext } from '../context/NewTabContext';
import {
  acceptsDrag,
  activeDrag,
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
    if (!dragType || dragType !== item.type) setDragging(false);
  }, [dragType, item.type]);
  useEffect(() => {
    if (!dragging) return;
    const resetDragging = (event: DragEvent) => {
      if (event.type === 'drop' && activeDrag()) event.preventDefault();
      setDragging(false);
      setDragType('');
      (document.activeElement as HTMLElement | null)?.blur();
    };
    const preventNativeDragOver = (event: DragEvent) => {
      if (activeDrag()) event.preventDefault();
    };
    window.addEventListener('dragover', preventNativeDragOver, true);
    window.addEventListener('dragend', resetDragging, true);
    window.addEventListener('drop', resetDragging, true);
    return () => {
      window.removeEventListener('dragover', preventNativeDragOver, true);
      window.removeEventListener('dragend', resetDragging, true);
      window.removeEventListener('drop', resetDragging, true);
    };
  }, [dragging, setDragType]);
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
        (document.activeElement as HTMLElement | null)?.blur();
      },
    },
  };
}

export type DropDestination = { parentId: string; targetId?: string };

export function useDropTarget(
  types: DragItem['type'][],
  destinationForItem: (item: DragItem) => DropDestination | undefined
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
        const item = activeDrag();
        if (!item || !acceptsDrag(types)) return;
        const destination = destinationForItem(item);
        if (!destination || destination.targetId === item.id) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = item.type === 'tab' ? 'copy' : 'move';
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition(
          destination.targetId
            ? event.clientY > rect.top + rect.height / 2
              ? 'after'
              : 'before'
            : 'inside'
        );
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
        const item = readDrag(event.dataTransfer);
        if (!item || !types.includes(item.type)) return;
        const destination = destinationForItem(item);
        if (!destination || destination.targetId === item.id) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const after = event.clientY > rect.top + rect.height / 2;
        endDrag();
        setDragType('');
        setPosition('');
        setError('');
        try {
          await dropItem(
            item,
            destination.parentId,
            destination.targetId,
            after
          );
          refresh();
        } catch (reason) {
          setError(String(reason));
        }
      },
    },
  };
}
