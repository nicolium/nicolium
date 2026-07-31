import iconCursorText from '@phosphor-icons/core/regular/cursor-text.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconDownload from '@phosphor-icons/core/regular/download.svg';
import iconEyeSlash from '@phosphor-icons/core/regular/eye-slash.svg';
import iconEye from '@phosphor-icons/core/regular/eye.svg';
import iconFileText from '@phosphor-icons/core/regular/file-text.svg';
import iconFolderOpen from '@phosphor-icons/core/regular/folder-open.svg';
import iconFolder from '@phosphor-icons/core/regular/folder.svg';
import iconFolders from '@phosphor-icons/core/regular/folders.svg';
import defaultIcon from '@phosphor-icons/core/regular/paperclip.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import { useNavigate } from '@tanstack/react-router';
import { clsx } from 'clsx';
import React, { useMemo, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import ColumnLoading from '@/components/column-loading';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import { EmptyMessage } from '@/components/empty-message';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { MIMETYPE_ICONS } from '@/components/upload';
import { setDriveDragItem, useDriveDropTarget, type DriveDragItem } from '@/hooks/use-drive-drop';
import { useScopeUrl } from '@/hooks/use-scope-url';
import {
  useDeleteDriveFileMutation,
  useMoveDriveFileMutation,
  useUpdateDriveFileMutation,
} from '@/queries/drive/use-drive-file';
import {
  useDeleteDriveFolderMutation,
  useDriveFolderQuery,
  useMoveDriveFolderMutation,
  useUpdateDriveFolderMutation,
} from '@/queries/drive/use-drive-folder';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';
import { download } from '@/utils/download';
import { driveFileToMediaAttachment } from '@/utils/drive';

import { Breadcrumbs } from './breadcrumbs';
import { ViewModeToggle } from './view-mode-toggle';

import type { DriveFile, DriveFolder } from 'pl-api';

const messages = defineMessages({
  folderDropdown: { id: 'drive.folder.dropdown', defaultMessage: 'Folder menu' },
  folderView: { id: 'drive.folder.view', defaultMessage: 'View folder' },
  folderRename: { id: 'drive.folder.rename', defaultMessage: 'Rename folder' },
  folderRenamePlaceholder: {
    id: 'drive.folder.rename.placeholder',
    defaultMessage: 'New folder name',
  },
  folderRenameSuccess: {
    id: 'drive.folder.rename.success',
    defaultMessage: 'Folder renamed',
  },
  folderRenameError: {
    id: 'drive.folder.rename.error',
    defaultMessage: 'Failed to rename folder',
  },
  folderMove: { id: 'drive.folder.move', defaultMessage: 'Move folder' },
  folderMoveSuccess: {
    id: 'drive.folder.move.success',
    defaultMessage: 'Folder moved',
  },
  folderMoveError: { id: 'drive.folder.move.error', defaultMessage: 'Failed to move folder' },
  folderDelete: { id: 'drive.folder.delete', defaultMessage: 'Delete folder' },
  folderDeleteSuccess: {
    id: 'drive.folder.delete.success',
    defaultMessage: 'Folder deleted',
  },
  folderDeleteError: {
    id: 'drive.folder.delete.error',
    defaultMessage: 'Failed to delete folder',
  },
  fileDropdown: { id: 'drive.file.dropdown', defaultMessage: 'File menu' },
  fileView: { id: 'drive.file.view', defaultMessage: 'View file' },
  fileDownload: { id: 'drive.file.download', defaultMessage: 'Download file' },
  fileRename: { id: 'drive.file.rename', defaultMessage: 'Rename file' },
  fileRenamePlaceholder: { id: 'drive.file.rename.placeholder', defaultMessage: 'New file name' },
  fileRenameSuccess: {
    id: 'drive.file.rename.success',
    defaultMessage: 'File renamed',
  },
  fileRenameError: { id: 'drive.file.rename.error', defaultMessage: 'Failed to rename file' },
  updateDescription: { id: 'drive.file.update.description', defaultMessage: 'Edit description' },
  updateDescriptionPlaceholder: {
    id: 'drive.file.update.description.placeholder',
    defaultMessage: 'New description',
  },
  updateDescriptionSuccess: {
    id: 'drive.file.update.description.success',
    defaultMessage: 'Description updated',
  },
  updateDescriptionError: {
    id: 'drive.file.update.description.error',
    defaultMessage: 'Failed to update description',
  },
  markSensitive: { id: 'drive.file.mark_sensitive', defaultMessage: 'Mark as sensitive' },
  markSensitiveSuccess: {
    id: 'drive.file.mark_sensitive.success',
    defaultMessage: 'File marked as sensitive',
  },
  markSensitiveError: {
    id: 'drive.file.mark_sensitive.error',
    defaultMessage: 'Failed to mark file as sensitive',
  },
  unmarkSensitive: { id: 'drive.file.unmark_sensitive', defaultMessage: 'Unmark as sensitive' },
  unmarkSensitiveSuccess: {
    id: 'drive.file.unmark_sensitive.success',
    defaultMessage: 'File unmarked as sensitive',
  },
  unmarkSensitiveError: {
    id: 'drive.file.unmark_sensitive.error',
    defaultMessage: 'Failed to unmark file as sensitive',
  },
  fileMove: { id: 'drive.file.move', defaultMessage: 'Move file' },
  fileMoveSuccess: { id: 'drive.file.move.success', defaultMessage: 'File moved' },
  fileMoveError: { id: 'drive.file.move.error', defaultMessage: 'Failed to move file' },
  fileDelete: { id: 'drive.file.delete', defaultMessage: 'Delete file' },
  fileDeleteSuccess: {
    id: 'drive.file.delete.success',
    defaultMessage: 'File deleted',
  },
  fileDeleteError: { id: 'drive.file.delete.error', defaultMessage: 'Failed to delete file' },
});

type FocusDirection = 'home' | 'end' | 'previous' | 'next' | 'up' | 'down';

const getFocusDirection = (key: string): FocusDirection | null => {
  switch (key) {
    case 'Home':
    case 'PageUp':
      return 'home';
    case 'End':
    case 'PageDown':
      return 'end';
    case 'ArrowLeft':
      return 'previous';
    case 'ArrowRight':
      return 'next';
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    default:
      return null;
  }
};

interface IFile {
  file: DriveFile;
  folderId?: string;
  index: number;
  onMove: (index: number, direction: FocusDirection) => void;
  onDragStateChange: (item: DriveDragItem | null) => void;
  isDragged: boolean;
}

const File: React.FC<IFile> = ({ file, folderId, index, onMove, onDragStateChange, isDragged }) => {
  const intl = useIntl();
  const scopeUrl = useScopeUrl();
  const fileRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { openModal } = useModalsActions();
  const { mutate: updateFile } = useUpdateDriveFileMutation(file.id);
  const { mutate: deleteFile } = useDeleteDriveFileMutation(file.id);
  const { mutate: moveFile } = useMoveDriveFileMutation();

  const isMedia = file.content_type.match(/image|video|audio/);

  const handleView = () => {
    if (!isMedia) {
      download(file.url, file.filename);
      return;
    }

    const mediaAttachment = driveFileToMediaAttachment(file);

    openModal('MEDIA', {
      media: [mediaAttachment],
      index: 0,
    });
  };

  const handleFileKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (isDropdownOpen) return;

    if (e.key === 'Enter' || e.key === ' ') {
      handleView();
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const direction = getFocusDirection(e.key);
    if (direction) {
      onMove(index, direction);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    fileRef.current?.querySelector('button')?.click();
  };

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (e) => {
    const item: DriveDragItem = { type: 'file', file, folderId };
    setDriveDragItem(e.dataTransfer, scopeUrl, item);
    e.dataTransfer.effectAllowed = 'copyMove';
    onDragStateChange(item);
  };

  const handleDragEnd = () => {
    onDragStateChange(null);
  };

  const items = useMemo(() => {
    const handleRename = () => {
      openModal('TEXT_FIELD', {
        heading: <FormattedMessage id='drive.file.rename' defaultMessage='Rename file' />,
        placeholder: intl.formatMessage(messages.fileRenamePlaceholder),
        confirm: <FormattedMessage id='drive.file.rename.confirm' defaultMessage='Rename' />,
        text: file.filename,
        singleLine: true,
        onConfirm: (value: string) => {
          updateFile(
            {
              sensitive: file.sensitive,
              description: file.description ?? undefined,
              filename: value,
            },
            {
              onSuccess: () => {
                toast.success(messages.fileRenameSuccess);
              },
              onError: () => {
                toast.error(messages.fileRenameError);
              },
            },
          );
        },
      });
    };

    const handleUpdateDescription = () => {
      openModal('TEXT_FIELD', {
        heading: (
          <FormattedMessage id='drive.file.update.description' defaultMessage='Edit description' />
        ),
        placeholder: intl.formatMessage(messages.updateDescriptionPlaceholder),
        confirm: (
          <FormattedMessage id='drive.file.update.description.confirm' defaultMessage='Save' />
        ),
        text: file.description ?? '',
        onConfirm: (value: string) => {
          updateFile(
            {
              sensitive: file.sensitive,
              filename: file.filename,
              description: value,
            },
            {
              onSuccess: () => {
                toast.success(messages.updateDescriptionSuccess);
              },
              onError: () => {
                toast.error(messages.updateDescriptionError);
              },
            },
          );
        },
      });
    };

    const handleToggleSensitive = () => {
      updateFile(
        {
          sensitive: !file.sensitive,
          filename: file.filename,
          description: file.description ?? undefined,
        },
        {
          onSuccess: (file) => {
            if (file.sensitive) {
              toast.success(messages.markSensitiveSuccess);
            } else {
              toast.success(messages.unmarkSensitiveSuccess);
            }
          },
          onError: () => {
            if (file.sensitive) {
              toast.error(messages.markSensitiveError);
            } else {
              toast.error(messages.unmarkSensitiveError);
            }
          },
        },
      );
    };

    const handleMove = () => {
      openModal('SELECT_DRIVE_FILE', {
        type: 'folder',
        onSelect: (targetFolder) => {
          moveFile(
            { id: file.id, targetFolderId: targetFolder.id ?? undefined },
            {
              onSuccess: () => {
                toast.success(messages.fileMoveSuccess);
              },
              onError: () => {
                toast.error(messages.fileMoveError);
              },
            },
          );
        },
        disabled: [file.id],
        title: (
          <FormattedMessage id='drive.file.move.heading' defaultMessage='Select move destination' />
        ),
      });
    };

    const handleDelete = () => {
      openModal('CONFIRM', {
        heading: <FormattedMessage id='drive.file.delete' defaultMessage='Delete file' />,
        confirm: <FormattedMessage id='drive.file.delete.confirm' defaultMessage='Delete' />,
        message: (
          <FormattedMessage
            id='drive.file.delete.text'
            defaultMessage='Are you sure you want to delete this file? This action cannot be undone.'
          />
        ),
        onConfirm: () => {
          deleteFile(undefined, {
            onSuccess: () => {
              toast.success(messages.fileDeleteSuccess);
            },
            onError: () => {
              toast.error(messages.fileDeleteError);
            },
          });
        },
      });
    };

    return [
      isMedia
        ? {
            text: intl.formatMessage(messages.fileView),
            icon: iconEye,
            action: handleView,
          }
        : {
            text: intl.formatMessage(messages.fileDownload),
            icon: iconDownload,
            href: file.url,
          },
      {
        text: intl.formatMessage(messages.fileRename),
        icon: iconCursorText,
        action: handleRename,
      },
      {
        text: intl.formatMessage(messages.updateDescription),
        icon: iconFileText,
        action: handleUpdateDescription,
      },
      file.sensitive
        ? {
            text: intl.formatMessage(messages.unmarkSensitive),
            icon: iconEye,
            action: handleToggleSensitive,
          }
        : {
            text: intl.formatMessage(messages.markSensitive),
            icon: iconEyeSlash,
            action: handleToggleSensitive,
          },
      null,
      {
        text: intl.formatMessage(messages.fileMove),
        icon: iconFolders,
        action: handleMove,
      },
      {
        text: intl.formatMessage(messages.fileDelete),
        icon: iconTrash,
        destructive: true,
        action: handleDelete,
      },
    ];
  }, [file]);

  return (
    <div
      ref={fileRef}
      className={clsx('drive-file', {
        'drive-file--dragging': isDragged,
      })}
      tabIndex={0}
      draggable
      onDoubleClick={handleView}
      onKeyDown={handleFileKeyDown}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-index={index}
      data-file-id={file.id}
    >
      <div className='drive-file__button'>
        <DropdownMenu
          items={items}
          placement='right-start'
          onOpen={() => {
            setIsDropdownOpen(true);
          }}
          onClose={() => {
            setIsDropdownOpen(false);
          }}
        >
          <IconButton
            src={iconDotsThree}
            title={intl.formatMessage(messages.fileDropdown)}
            theme='secondary'
          />
        </DropdownMenu>
      </div>

      {file.thumbnail_url && isMedia ? (
        <img src={file.thumbnail_url} alt={file.description ?? undefined} />
      ) : (
        <Icon
          className='drive-file__icon'
          src={MIMETYPE_ICONS[file.content_type || ''] || defaultIcon}
        />
      )}

      <span className='drive-file__label'>{file.filename}</span>
    </div>
  );
};

interface IFolder {
  folder: DriveFolder;
  folderId?: string;
  index: number;
  onMove: (index: number, direction: FocusDirection) => void;
  onDragStateChange: (item: DriveDragItem | null) => void;
  onDropItem: (item: DriveDragItem, targetFolderId?: string) => void;
  draggedItem: DriveDragItem | null;
}

const Folder: React.FC<IFolder> = ({
  folder,
  folderId,
  index,
  onMove,
  onDragStateChange,
  onDropItem,
  draggedItem,
}) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const scopeUrl = useScopeUrl();
  const folderRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { openModal } = useModalsActions();
  const { mutate: deleteFolder } = useDeleteDriveFolderMutation(folder.id!);
  const { mutate: updateFolder } = useUpdateDriveFolderMutation(folder.id!);
  const { mutate: moveFolder } = useMoveDriveFolderMutation();

  const isDragged = draggedItem?.type === 'folder' && draggedItem.id === folder.id;

  const { isDropTarget, dropTargetProps } = useDriveDropTarget(
    (item) => onDropItem(item, folder.id ?? undefined),
    folder.id ?? undefined,
    isDragged,
  );

  const handleEnterFolder = () => {
    navigate({ to: '/drive/{-$folderId}', params: { folderId: folder.id ?? undefined } });
  };

  const handleFolderKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (isDropdownOpen) return;

    if (e.key === 'Enter' || e.key === ' ') {
      handleEnterFolder();
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const direction = getFocusDirection(e.key);
    if (direction) {
      onMove(index, direction);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    folderRef.current?.querySelector('button')?.click();
  };

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (e) => {
    const item: DriveDragItem = { type: 'folder', id: folder.id!, folderId };
    setDriveDragItem(e.dataTransfer, scopeUrl, item);
    e.dataTransfer.effectAllowed = 'move';
    onDragStateChange(item);
  };

  const handleDragEnd = () => {
    onDragStateChange(null);
  };

  const items: Menu = useMemo(() => {
    const handleRename = () => {
      openModal('TEXT_FIELD', {
        heading: <FormattedMessage id='drive.folder.rename' defaultMessage='Rename folder' />,
        placeholder: intl.formatMessage(messages.folderRenamePlaceholder),
        confirm: <FormattedMessage id='drive.folder.rename.confirm' defaultMessage='Rename' />,
        text: folder.name ?? '',
        singleLine: true,
        onConfirm: (value: string) => {
          updateFolder(value, {
            onSuccess: () => {
              toast.success(messages.folderRenameSuccess);
            },
            onError: () => {
              toast.error(messages.folderRenameError);
            },
          });
        },
      });
    };

    const handleDelete = () => {
      openModal('CONFIRM', {
        heading: <FormattedMessage id='drive.folder.delete' defaultMessage='Delete folder' />,
        confirm: <FormattedMessage id='drive.folder.delete.confirm' defaultMessage='Delete' />,
        message: (
          <FormattedMessage
            id='drive.folder.delete.text'
            defaultMessage='Are you sure you want to delete this folder? This action cannot be undone.'
          />
        ),
        onConfirm: () => {
          deleteFolder(undefined, {
            onSuccess: () => {
              toast.success(messages.folderDeleteSuccess);
            },
            onError: () => {
              toast.error(messages.folderDeleteError);
            },
          });
        },
      });
    };

    const handleMove = () => {
      openModal('SELECT_DRIVE_FILE', {
        type: 'folder',
        onSelect: (targetFolder) => {
          moveFolder(
            { id: folder.id!, targetFolderId: targetFolder.id ?? undefined },
            {
              onSuccess: () => {
                toast.success(messages.folderMoveSuccess);
              },
              onError: () => {
                toast.error(messages.folderMoveError);
              },
            },
          );
        },
        disabled: [folder.id],
        title: (
          <FormattedMessage id='drive.file.move.heading' defaultMessage='Select move destination' />
        ),
      });
    };

    return [
      {
        text: intl.formatMessage(messages.folderView),
        icon: iconFolderOpen,
        action: handleEnterFolder,
      },
      {
        text: intl.formatMessage(messages.folderRename),
        icon: iconCursorText,
        action: handleRename,
      },
      {
        text: intl.formatMessage(messages.folderMove),
        icon: iconFolders,
        action: handleMove,
      },
      {
        text: intl.formatMessage(messages.folderDelete),
        icon: iconTrash,
        destructive: true,
        action: handleDelete,
      },
    ];
  }, [folder]);

  return (
    <div
      className={clsx('drive-file drive-folder', {
        'drive-file--dragging': isDragged,
        'drive-file--drop-target': isDropTarget,
      })}
      ref={folderRef}
      tabIndex={0}
      draggable
      onDoubleClick={handleEnterFolder}
      onKeyDown={handleFolderKeyDown}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-index={index}
      data-file-id={folder.id}
      {...dropTargetProps}
    >
      <div className='drive-file__button'>
        <DropdownMenu
          items={items}
          placement='right-start'
          onOpen={() => {
            setIsDropdownOpen(true);
          }}
          onClose={() => {
            setIsDropdownOpen(false);
          }}
        >
          <IconButton
            src={iconDotsThree}
            title={intl.formatMessage(messages.folderDropdown)}
            theme='secondary'
          />
        </DropdownMenu>
      </div>

      <Icon className='drive-file__icon' src={iconFolder} />

      <span className='drive-file__label'>{folder.name}</span>
    </div>
  );
};

interface IDriveBrowser {
  folderId?: string;
}

const DriveBrowser: React.FC<IDriveBrowser> = ({ folderId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const filesRef = useRef<HTMLDivElement | null>(null);
  const { driveViewMode } = useSettings();

  const [draggedItem, setDraggedItem] = useState<DriveDragItem | null>(null);

  const { data, isPending } = useDriveFolderQuery(folderId);
  const { mutate: moveFile } = useMoveDriveFileMutation();
  const { mutate: moveFolder } = useMoveDriveFolderMutation();

  const handleDropItem = (item: DriveDragItem, targetFolderId?: string) => {
    if (item.folderId === targetFolderId) return;
    if (item.type === 'folder' && item.id === targetFolderId) return;

    const id = item.type === 'file' ? item.file.id : item.id;

    (item.type === 'file' ? moveFile : moveFolder)(
      { id, targetFolderId },
      {
        onSuccess: () => {
          toast.success(
            item.type === 'file' ? messages.fileMoveSuccess : messages.folderMoveSuccess,
          );
        },
        onError: () => {
          toast.error(item.type === 'file' ? messages.fileMoveError : messages.folderMoveError);
        },
      },
    );
  };

  const { isDropTarget: isFilesDropTarget, dropTargetProps: filesDropTargetProps } =
    useDriveDropTarget((item) => handleDropItem(item, folderId), folderId);

  const handleMove = (index: number, direction: FocusDirection) => {
    const container = filesRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLDivElement>('[data-index]'));
    const total = items.length;
    if (!total) return;

    let perRow = 1;
    const firstTop = items[0].offsetTop;
    while (perRow < total && items[perRow].offsetTop === firstTop) perRow++;

    let target: number;
    switch (direction) {
      case 'home':
        target = 0;
        break;
      case 'end':
        target = total - 1;
        break;
      case 'previous':
        target = index - 1;
        break;
      case 'next':
        target = index + 1;
        break;
      case 'up':
        target = index - perRow;
        break;
      case 'down':
        target = index + perRow;
        break;
    }

    if (
      direction === 'down' &&
      target >= total &&
      Math.floor(index / perRow) < Math.floor((total - 1) / perRow)
    ) {
      target = total - 1;
    }

    if (target < 0 || target >= total) return;
    container.querySelector<HTMLDivElement>(`div[data-index="${target}"]`)?.focus();
  };

  if (isPending) {
    return <ColumnLoading />;
  }

  const isEmpty = data?.files.length === 0 && data?.folders.length === 0;

  return (
    <div className='drive-browser' ref={containerRef}>
      <div className='drive-breadcrumbs__container'>
        <div className='drive-breadcrumbs'>
          <Breadcrumbs folderId={folderId} onDropItem={handleDropItem} />
        </div>
        <ViewModeToggle
          viewMode={driveViewMode}
          onChange={(viewMode) => changeSetting(['driveViewMode'], viewMode)}
        />
      </div>
      {isEmpty ? (
        <EmptyMessage
          text={
            <FormattedMessage
              id='drive.empty'
              defaultMessage='There are no files or folders in this folder.'
            />
          }
          icon={iconFolderOpen}
        />
      ) : (
        <div
          className={clsx('drive-page__files', `drive-page__files--${driveViewMode}`, {
            'drive-page__files--drop-target': isFilesDropTarget,
          })}
          ref={filesRef}
          {...filesDropTargetProps}
        >
          {data?.folders.map((folder, index) => (
            <Folder
              key={folder.id}
              folder={folder}
              folderId={folderId}
              index={index}
              onMove={handleMove}
              onDragStateChange={setDraggedItem}
              onDropItem={handleDropItem}
              draggedItem={draggedItem}
            />
          ))}
          {data?.files.map((file, index) => (
            <File
              key={file.id}
              file={file}
              folderId={folderId}
              index={data.folders.length + index}
              onMove={handleMove}
              onDragStateChange={setDraggedItem}
              isDragged={draggedItem?.type === 'file' && draggedItem.file.id === file.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { DriveBrowser };
