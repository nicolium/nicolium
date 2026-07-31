import React, { useCallback, useEffect, useState } from 'react';

/** Controls the state of files being dragged over a node. */
const useDraggedFiles = <R extends HTMLElement>(
  node: React.RefObject<R | null>,
  onDrop?: (files: FileList) => void,
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const timeoutRef = React.useRef<number | null>(null);
  const draggedOverRef = React.useRef(false);

  const handleDocumentDragEnter = useCallback(
    (e: DragEvent) => {
      if (isDraggingFiles(e)) {
        setIsDragging(true);
      }
    },
    [setIsDragging],
  );

  const handleDocumentDragLeave = useCallback(
    (e: DragEvent) => {
      if (isDraggedOffscreen(e)) {
        setIsDragging(false);
      }
    },
    [setIsDragging],
  );

  const handleDocumentDrop = useCallback(() => {
    setIsDragging(false);
    setIsDraggedOver(false);
    draggedOverRef.current = false;
  }, [setIsDragging]);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      if (isDraggingFiles(e)) {
        setIsDraggedOver(true);
        draggedOverRef.current = true;
      }
    },
    [setIsDraggedOver],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      if (!node.current || isDraggedOutOfNode(e, node.current)) {
        setIsDraggedOver(false);
        draggedOverRef.current = false;
      }
    },
    [setIsDraggedOver],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (isDraggingFiles(e) && onDrop) {
        onDrop(e.dataTransfer.files);
      }
      setIsDragging(false);
      setIsDraggedOver(false);
      draggedOverRef.current = false;
      e.preventDefault();
    },
    [onDrop],
  );

  const handleDocumentDragOver = useCallback((e: DragEvent) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      if (!draggedOverRef.current) {
        setIsDragging(false);
      }
    }, 200);
    e.preventDefault();
  }, []);

  useEffect(() => {
    document.addEventListener('dragenter', handleDocumentDragEnter);
    document.addEventListener('dragleave', handleDocumentDragLeave);
    document.addEventListener('drop', handleDocumentDrop);
    document.addEventListener('dragover', handleDocumentDragOver);
    return () => {
      document.removeEventListener('dragenter', handleDocumentDragEnter);
      document.removeEventListener('dragleave', handleDocumentDragLeave);
      document.removeEventListener('drop', handleDocumentDrop);
      document.removeEventListener('dragover', handleDocumentDragOver);
    };
  }, []);

  useEffect(() => {
    node.current?.addEventListener('dragenter', handleDragEnter);
    node.current?.addEventListener('dragleave', handleDragLeave);
    node.current?.addEventListener('drop', handleDrop);
    node.current?.addEventListener('dragover', handleDocumentDragOver);
    return () => {
      node.current?.removeEventListener('dragenter', handleDragEnter);
      node.current?.removeEventListener('dragleave', handleDragLeave);
      node.current?.removeEventListener('drop', handleDrop);
      node.current?.removeEventListener('dragover', handleDocumentDragOver);
    };
  }, [node.current]);

  return {
    /** Whether the document is being dragged over. */
    isDragging,
    /** Whether the node is being dragged over. */
    isDraggedOver,
  };
};

/** Ensure only files are being dragged, and not eg highlighted text. */
const isDraggingFiles = (e: DragEvent): e is DragEvent & { dataTransfer: DataTransfer } => {
  if (e.dataTransfer) {
    const { types } = e.dataTransfer;
    return types.length === 1 && types[0] === 'Files';
  } else {
    return false;
  }
};

/** Check whether the cursor is in the screen. Mostly useful for dragleave events. */
const isDraggedOffscreen = (e: DragEvent): boolean => e.screenX === 0 && e.screenY === 0;

/** Check whether the cursor is dragged out of the node. */
const isDraggedOutOfNode = (e: DragEvent, node: Node): boolean =>
  !node.contains(document.elementFromPoint(e.clientX, e.clientY));

export { useDraggedFiles };
