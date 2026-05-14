import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import iconCursorText from '@phosphor-icons/core/regular/cursor-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconDownload from '@phosphor-icons/core/regular/download.svg';
import iconEyeSlash from '@phosphor-icons/core/regular/eye-slash.svg';
import iconEye from '@phosphor-icons/core/regular/eye.svg';
import iconFileText from '@phosphor-icons/core/regular/file-text.svg';
import iconFolderOpen from '@phosphor-icons/core/regular/folder-open.svg';
import iconFolderPlus from '@phosphor-icons/core/regular/folder-plus.svg';
import iconFolder from '@phosphor-icons/core/regular/folder.svg';
import iconFolders from '@phosphor-icons/core/regular/folders.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import defaultIcon from '@phosphor-icons/core/regular/paperclip.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import iconUpload from '@phosphor-icons/core/regular/upload.svg';
import { Link, useNavigate } from '@tanstack/react-router';
import { clsx } from 'clsx';
import { mediaAttachmentSchema, type DriveFile, type DriveFolder } from 'pl-api';
import React, { useMemo, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import { EmptyMessage } from '@/components/empty-message';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { MIMETYPE_ICONS } from '@/components/upload';
import ColumnLoading from '@/features/ui/components/column-loading';
import {
  useCreateDriveFileMutation,
  useDeleteDriveFileMutation,
  useMoveDriveFileMutation,
  useUpdateDriveFileMutation,
} from '@/queries/drive/use-drive-file';
import {
  useCreateDriveFolderMutation,
  useDeleteDriveFolderMutation,
  useDriveFolderQuery,
  useMoveDriveFolderMutation,
  useUpdateDriveFolderMutation,
} from '@/queries/drive/use-drive-folder';
import { driveRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';
import { download } from '@/utils/download';

const messages = defineMessages({
  heading: { id: 'column.drive', defaultMessage: 'Drive' },
  folderDropdown: { id: 'drive.folder.dropdown', defaultMessage: 'Folder menu' },
  folderView: { id: 'drive.folder.view', defaultMessage: 'View folder' },
  folderRename: { id: 'drive.folder.rename', defaultMessage: 'Rename folder' },
  folderRenamePlaceholder: {
    id: 'drive.folder.rename.placeholder',
    defaultMessage: 'New folder name',
  },
  folderRenameSuccess: {
    id: 'drive.folder.rename.success',
    defaultMessage: 'Folder renamed successfully.',
  },
  folderRenameError: {
    id: 'drive.folder.rename.error',
    defaultMessage: 'Failed to rename folder.',
  },
  folderMove: { id: 'drive.folder.move', defaultMessage: 'Move folder' },
  folderMoveSuccess: {
    id: 'drive.folder.move.success',
    defaultMessage: 'Folder moved successfully.',
  },
  folderMoveError: { id: 'drive.folder.move.error', defaultMessage: 'Failed to move folder.' },
  folderDelete: { id: 'drive.folder.delete', defaultMessage: 'Delete folder' },
  folderDeleteSuccess: {
    id: 'drive.folder.delete.success',
    defaultMessage: 'Folder deleted successfully.',
  },
  folderDeleteError: {
    id: 'drive.folder.delete.error',
    defaultMessage: 'Failed to delete folder.',
  },
  fileDropdown: { id: 'drive.file.dropdown', defaultMessage: 'File menu' },
  fileView: { id: 'drive.file.view', defaultMessage: 'View file' },
  fileDownload: { id: 'drive.file.download', defaultMessage: 'Download file' },
  fileRename: { id: 'drive.file.rename', defaultMessage: 'Rename file' },
  fileRenamePlaceholder: { id: 'drive.file.rename.placeholder', defaultMessage: 'New file name' },
  fileRenameSuccess: {
    id: 'drive.file.rename.success',
    defaultMessage: 'File renamed successfully.',
  },
  fileRenameError: { id: 'drive.file.rename.error', defaultMessage: 'Failed to rename file.' },
  updateDescription: { id: 'drive.file.update.description', defaultMessage: 'Edit description' },
  updateDescriptionPlaceholder: {
    id: 'drive.file.update.description.placeholder',
    defaultMessage: 'New description',
  },
  updateDescriptionSuccess: {
    id: 'drive.file.update.description.success',
    defaultMessage: 'Description updated successfully.',
  },
  updateDescriptionError: {
    id: 'drive.file.update.description.error',
    defaultMessage: 'Failed to update description.',
  },
  markSensitive: { id: 'drive.file.mark_sensitive', defaultMessage: 'Mark as sensitive' },
  markSensitiveSuccess: {
    id: 'drive.file.mark_sensitive.success',
    defaultMessage: 'File marked as sensitive.',
  },
  markSensitiveError: {
    id: 'drive.file.mark_sensitive.error',
    defaultMessage: 'Failed to mark file as sensitive.',
  },
  unmarkSensitive: { id: 'drive.file.unmark_sensitive', defaultMessage: 'Unmark as sensitive' },
  unmarkSensitiveSuccess: {
    id: 'drive.file.unmark_sensitive.success',
    defaultMessage: 'File unmarked as sensitive.',
  },
  unmarkSensitiveError: {
    id: 'drive.file.unmark_sensitive.error',
    defaultMessage: 'Failed to unmark file as sensitive.',
  },
  fileMove: { id: 'drive.file.move', defaultMessage: 'Move file' },
  fileMoveSuccess: { id: 'drive.file.move.success', defaultMessage: 'File moved successfully.' },
  fileMoveError: { id: 'drive.file.move.error', defaultMessage: 'Failed to move file.' },
  fileDelete: { id: 'drive.file.delete', defaultMessage: 'Delete file' },
  fileDeleteSuccess: {
    id: 'drive.file.delete.success',
    defaultMessage: 'File deleted successfully.',
  },
  fileDeleteError: { id: 'drive.file.delete.error', defaultMessage: 'Failed to delete file.' },
  fileUpload: { id: 'drive.file.upload', defaultMessage: 'Upload file' },
  fileUploadSuccess: {
    id: 'drive.file.upload.success',
    defaultMessage: 'File uploaded successfully.',
  },
  fileUploadError: { id: 'drive.file.upload.error', defaultMessage: 'Failed to upload file.' },
  newFolder: { id: 'drive.folder.new', defaultMessage: 'New folder' },
  newFolderPlaceholder: { id: 'drive.folder.new.placeholder', defaultMessage: 'Folder name' },
  newFolderSuccess: {
    id: 'drive.folder.new.success',
    defaultMessage: 'Folder created successfully.',
  },
  newFolderError: { id: 'drive.folder.new.error', defaultMessage: 'Failed to create folder.' },
  home: { id: 'drive.breadcrumbs.home', defaultMessage: 'Home' },
});

interface IBreadcrumbs {
  folderId?: string;
  depth?: number;
  onClick?: (folderId?: string) => void;
}

const Breadcrumbs: React.FC<IBreadcrumbs> = ({ folderId, depth = 0, onClick }) => {
  const { data } = useDriveFolderQuery(folderId);
  const intl = useIntl();

  if (!folderId) {
    const label = depth === 0 && (
      <span>
        <FormattedMessage id='drive.breadcrumbs.home' defaultMessage='Home' />
      </span>
    );

    if (onClick || depth === 0) {
      return (
        <button
          className={clsx('⁂-drive-breadcrumbs__item ⁂-drive-breadcrumbs__home', {
            '⁂-drive-breadcrumbs__item--current': depth === 0,
          })}
          onClick={() => onClick?.()}
          disabled={depth === 0}
          aria-label={intl.formatMessage(messages.home)}
          title={intl.formatMessage(messages.home)}
        >
          <Icon src={iconHouse} aria-hidden />
          {label}
        </button>
      );
    } else {
      return (
        <Link
          to='/drive/{-$folderId}'
          params={{ folderId: undefined }}
          className='⁂-drive-breadcrumbs__home'
          aria-label={intl.formatMessage(messages.home)}
          title={intl.formatMessage(messages.home)}
        >
          <Icon src={iconHouse} aria-hidden />
          {label}
        </Link>
      );
    }
  }

  if (!data) return null;

  const spacer = (
    <div className='⁂-drive-breadcrumbs__spacer' aria-hidden>
      <Icon src={iconCaretRight} />
    </div>
  );

  const button = onClick ? (
    <button
      className={clsx('⁂-drive-breadcrumbs__item', {
        '⁂-drive-breadcrumbs__item--current': depth === 0,
      })}
      onClick={() => {
        onClick?.(folderId);
      }}
    >
      {data.name}
    </button>
  ) : (
    <Link
      to={'/drive/{-$folderId}'}
      params={{ folderId }}
      className={clsx('⁂-drive-breadcrumbs__item', {
        '⁂-drive-breadcrumbs__item--current': depth === 0,
      })}
    >
      {data.name}
    </Link>
  );

  if (depth === 2 && data?.parent_id) {
    return (
      <>
        <Breadcrumbs depth={depth + 1} onClick={onClick} />
        {spacer}
        <div className='⁂-drive-breadcrumbs__spacer' aria-hidden>
          <Icon src={iconDotsThree} />
        </div>
        {spacer}
        {button}
      </>
    );
  }

  return (
    <>
      <Breadcrumbs folderId={data.parent_id ?? undefined} depth={depth + 1} onClick={onClick} />
      {spacer}
      {button}
    </>
  );
};

interface IFile {
  file: DriveFile;
  index: number;
  onMove: (index: number, direction: 'home' | 'end' | 'up' | 'down') => void;
}

const File: React.FC<IFile> = ({ file, index, onMove }) => {
  const intl = useIntl();
  const fileRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { openModal } = useModalsActions();
  const { mutate: updateFile } = useUpdateDriveFileMutation(file.id);
  const { mutate: deleteFile } = useDeleteDriveFileMutation(file.id);
  const { mutate: moveFile } = useMoveDriveFileMutation(file.id);

  const isMedia = file.content_type.match(/image|video|audio/);

  const handleView = () => {
    if (!isMedia) {
      download(file.url, file.filename);
      return;
    }

    let type = file.content_type.split('/')[0] as 'image' | 'video' | 'audio' | 'unknown';
    if (!['image', 'video', 'audio', 'unknown'].includes(type)) {
      type = 'unknown';
    }

    const mediaAttachment = v.parse(mediaAttachmentSchema, {
      id: file.id,
      url: file.url,
      preview_url: file.thumbnail_url,
      remote_url: file.url,
      description: file.description ?? '',
      type,
      mime_type: file.content_type,
    });

    openModal('MEDIA', {
      media: [mediaAttachment],
      index: 0,
    });
  };

  const handleFileKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (isDropdownOpen) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        handleView();
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'Home':
      case 'PageUp':
        onMove(index, 'home');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'End':
      case 'PageDown':
        onMove(index, 'end');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        onMove(index, 'up');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        onMove(index, 'down');
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    fileRef.current?.querySelector('button')?.click();
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
          moveFile(targetFolder.id ?? undefined, {
            onSuccess: () => {
              toast.success(messages.fileMoveSuccess);
            },
            onError: () => {
              toast.error(messages.fileMoveError);
            },
          });
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
      className='⁂-drive-file'
      tabIndex={0}
      onDoubleClick={handleView}
      onKeyDown={handleFileKeyDown}
      onContextMenu={handleContextMenu}
      data-index={index}
    >
      <div className='⁂-drive-file__button'>
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
          className='⁂-drive-file__icon'
          src={MIMETYPE_ICONS[file.content_type || ''] || defaultIcon}
        />
      )}

      <span className='⁂-drive-file__label'>{file.filename}</span>
    </div>
  );
};

interface IFolder {
  folder: DriveFolder;
  index: number;
  onMove: (index: number, direction: 'home' | 'end' | 'up' | 'down') => void;
}

const Folder: React.FC<IFolder> = ({ folder, index, onMove }) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const folderRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { openModal } = useModalsActions();
  const { mutate: deleteFolder } = useDeleteDriveFolderMutation(folder.id!);
  const { mutate: updateFolder } = useUpdateDriveFolderMutation(folder.id!);
  const { mutate: moveFolder } = useMoveDriveFolderMutation(folder.id!);

  const handleEnterFolder = () => {
    navigate({ to: '/drive/{-$folderId}', params: { folderId: folder.id ?? undefined } });
  };

  const handleFolderKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (isDropdownOpen) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        handleEnterFolder();
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'Home':
      case 'PageUp':
        onMove(index, 'home');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'End':
      case 'PageDown':
        onMove(index, 'end');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        onMove(index, 'up');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        onMove(index, 'down');
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    folderRef.current?.querySelector('button')?.click();
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
          moveFolder(targetFolder.id ?? undefined, {
            onSuccess: () => {
              toast.success(messages.folderMoveSuccess);
            },
            onError: () => {
              toast.error(messages.folderMoveError);
            },
          });
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
        to: '/drive/{-$folderId}',
        params: { folderId: folder.id ?? undefined },
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
      className='⁂-drive-file ⁂-drive-folder'
      ref={folderRef}
      tabIndex={0}
      onDoubleClick={handleEnterFolder}
      onKeyDown={handleFolderKeyDown}
      onContextMenu={handleContextMenu}
      data-index={index}
    >
      <div className='⁂-drive-file__button'>
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

      <Icon className='⁂-drive-file__icon' src={iconFolder} />

      <span className='⁂-drive-file__label'>{folder.name}</span>
    </div>
  );
};

const DrivePage: React.FC = () => {
  const filesRef = useRef<HTMLDivElement | null>(null);
  const intl = useIntl();

  const { folderId } = driveRoute.useParams();

  const { openModal } = useModalsActions();

  const { data, isPending } = useDriveFolderQuery(folderId);
  const { mutate: uploadFile } = useCreateDriveFileMutation(folderId);
  const { mutate: createFolder } = useCreateDriveFolderMutation();

  const items: Menu = [
    {
      text: intl.formatMessage(messages.fileUpload),
      icon: iconUpload,
      onSelectFile: (files: FileList) => {
        uploadFile(files[0], {
          onSuccess: () => {
            toast.success(messages.fileUploadSuccess);
          },
          onError: () => {
            toast.error(messages.fileUploadError);
          },
        });
      },
    },
    {
      text: intl.formatMessage(messages.newFolder),
      icon: iconFolderPlus,
      action: () => {
        openModal('TEXT_FIELD', {
          heading: <FormattedMessage id='drive.folder.create' defaultMessage='Create new folder' />,
          placeholder: intl.formatMessage(messages.newFolderPlaceholder),
          confirm: <FormattedMessage id='drive.folder.create.confirm' defaultMessage='Create' />,
          singleLine: true,
          onConfirm: (value: string) => {
            createFolder(
              { name: value, parentId: folderId },
              {
                onSuccess: () => {
                  toast.success(messages.newFolderSuccess);
                },
                onError: () => {
                  toast.error(messages.newFolderError);
                },
              },
            );
          },
        });
      },
    },
  ];

  const handleMove = (index: number, direction: 'home' | 'end' | 'up' | 'down') => {
    const totalItems = data!.files.length + data!.folders.length;
    const newItem =
      direction === 'home'
        ? 0
        : direction === 'end'
          ? totalItems - 1
          : direction === 'up'
            ? index - 1
            : index + 1;
    if (newItem < 0 || newItem >= totalItems) return;
    (filesRef.current?.querySelector(`div[data-index="${newItem}"]`) as HTMLDivElement)?.focus();
  };

  if (isPending) {
    return <ColumnLoading />;
  }

  const isEmpty = data?.files.length === 0 && data?.folders.length === 0;

  return (
    <Column
      className='⁂-drive-page'
      label={data?.name ?? intl.formatMessage(messages.heading)}
      backHref={'/drive/{-$folderId}'}
      backParams={{ folderId: data?.parent_id ?? undefined }}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />}
    >
      <div className='⁂-drive-breadcrumbs'>
        <Breadcrumbs folderId={folderId} />
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
        <div className='⁂-drive-page__files' ref={filesRef}>
          {data?.folders.map((folder, index) => (
            <Folder key={folder.id} folder={folder} index={index} onMove={handleMove} />
          ))}
          {data?.files.map((file, index) => (
            <File
              key={file.id}
              file={file}
              index={data.folders.length + index}
              onMove={handleMove}
            />
          ))}
        </div>
      )}
    </Column>
  );
};

export { DrivePage as default, Breadcrumbs };
