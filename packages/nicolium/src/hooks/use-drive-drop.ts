import React, { useCallback, useEffect, useState } from 'react';

import { useScopeUrl } from '@/hooks/use-scope-url';

import type { DriveFile } from 'pl-api';

const DRIVE_DATA_TYPE = 'application/x-nicolium-drive-item';

const getDriveDataType = (scopeUrl: string) =>
  `${DRIVE_DATA_TYPE};scope=${encodeURIComponent(scopeUrl)}`.toLowerCase();

type DriveDragItem =
  | { type: 'file'; file: DriveFile; folderId?: string }
  | { type: 'folder'; id: string; folderId?: string };

const getDriveKindDataType = (scopeUrl: string, kind: DriveDragItem['type']) =>
  `${getDriveDataType(scopeUrl)};kind=${kind}`;

const getDriveSourceDataType = (scopeUrl: string, folderId?: string) =>
  `${getDriveDataType(scopeUrl)};from=${folderId ?? ''}`.toLowerCase();

const isDriveFile = (value: unknown): value is DriveFile =>
  !!value &&
  typeof value === 'object' &&
  'id' in value &&
  typeof value.id === 'string' &&
  'url' in value &&
  typeof value.url === 'string' &&
  'thumbnail_url' in value &&
  typeof value.thumbnail_url === 'string' &&
  'filename' in value &&
  typeof value.filename === 'string' &&
  'content_type' in value &&
  typeof value.content_type === 'string' &&
  'sensitive' in value &&
  typeof value.sensitive === 'boolean' &&
  'description' in value &&
  (typeof value.description === 'string' || value.description === null) &&
  'is_avatar' in value &&
  typeof value.is_avatar === 'boolean' &&
  'is_banner' in value &&
  typeof value.is_banner === 'boolean';

const parseDriveDragItem = (dataTransfer: DataTransfer, dataType: string): DriveDragItem | null => {
  try {
    const item: unknown = JSON.parse(dataTransfer.getData(dataType));
    if (!item || typeof item !== 'object' || !('type' in item)) return null;

    const folderId =
      'folderId' in item && typeof item.folderId === 'string' ? item.folderId : undefined;

    if (item.type === 'file' && 'file' in item && isDriveFile(item.file)) {
      return { type: 'file', file: item.file, folderId };
    }

    if (item.type === 'folder' && 'id' in item && typeof item.id === 'string') {
      return { type: 'folder', id: item.id, folderId };
    }
  } catch {
    return null;
  }

  return null;
};

const setDriveDragItem = (dataTransfer: DataTransfer, scopeUrl: string, item: DriveDragItem) => {
  dataTransfer.setData(getDriveDataType(scopeUrl), JSON.stringify(item));
  dataTransfer.setData(getDriveKindDataType(scopeUrl, item.type), '1');
  dataTransfer.setData(getDriveSourceDataType(scopeUrl, item.folderId), '1');
};

const useDriveDropTarget = (
  onDropItem: ((item: DriveDragItem) => void) | undefined,
  targetFolderId?: string,
  disabled = false,
) => {
  const scopeUrl = useScopeUrl();
  const dataType = getDriveDataType(scopeUrl);
  const sourceType = getDriveSourceDataType(scopeUrl, targetFolderId);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const accepts = (dataTransfer: DataTransfer | null): dataTransfer is DataTransfer =>
    !!dataTransfer?.types.includes(dataType) && !dataTransfer.types.includes(sourceType);

  const handleDragOver: React.DragEventHandler = (event) => {
    if (disabled || !accepts(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  };

  const handleDragLeave: React.DragEventHandler = (event) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDropTarget(false);
  };

  const handleDrop: React.DragEventHandler = (event) => {
    setIsDropTarget(false);
    if (disabled || !accepts(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();

    const item = parseDriveDragItem(event.dataTransfer, dataType);
    if (item) onDropItem?.(item);
  };

  return {
    isDropTarget: isDropTarget && !disabled && !!onDropItem,
    dropTargetProps: onDropItem
      ? { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }
      : {},
  };
};

const useDriveFileDrop = (onDropFile: (file: DriveFile) => void) => {
  const scopeUrl = useScopeUrl();
  const dataType = getDriveDataType(scopeUrl);
  const fileType = getDriveKindDataType(scopeUrl, 'file');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const accepts = useCallback(
    (dataTransfer: DataTransfer | null): dataTransfer is DataTransfer =>
      !!dataTransfer?.types.includes(fileType),
    [fileType],
  );

  useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      if (accepts(event.dataTransfer)) setIsDragging(true);
    };
    const handleDragLeave = (event: DragEvent) => {
      if (event.screenX === 0 && event.screenY === 0) setIsDragging(false);
    };
    const handleDrop = () => {
      setIsDragging(false);
      setIsDraggedOver(false);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [accepts]);

  const handleDragEnter: React.DragEventHandler = (event) => {
    if (accepts(event.dataTransfer)) setIsDraggedOver(true);
  };

  const handleDragOver: React.DragEventHandler = (event) => {
    if (!accepts(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave: React.DragEventHandler = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggedOver(false);
    }
  };

  const handleDrop: React.DragEventHandler = (event) => {
    if (!accepts(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setIsDraggedOver(false);

    const item = parseDriveDragItem(event.dataTransfer, dataType);
    if (item?.type === 'file') onDropFile(item.file);
  };

  return {
    isDragging,
    isDraggedOver,
    dropTargetProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};

export { setDriveDragItem, useDriveDropTarget, useDriveFileDrop, type DriveDragItem };
