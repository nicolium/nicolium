import defaultIcon from '@phosphor-icons/core/regular/paperclip.svg';
import { clsx } from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import DropdownMenu, { Menu } from 'pl-fe/components/dropdown-menu';
import { EmptyMessage } from 'pl-fe/components/empty-message';
import Column from 'pl-fe/components/ui/column';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import { MIMETYPE_ICONS } from 'pl-fe/components/upload';
import ColumnLoading from 'pl-fe/features/ui/components/column-loading';
import { useCreateDriveFileMutation, useDeleteDriveFileMutation, useMoveDriveFileMutation, useUpdateDriveFileMutation } from 'pl-fe/queries/drive/use-drive-file';
import { useCreateDriveFolderMutation, useDeleteDriveFolderMutation, useDriveFolderQuery, useMoveDriveFolderMutation, useUpdateDriveFolderMutation } from 'pl-fe/queries/drive/use-drive-folder';
import { useModalsActions } from 'pl-fe/stores/modals';
import toast from 'pl-fe/toast';
import { download } from 'pl-fe/utils/download';

import type { DriveFile, DriveFolder, MediaAttachment } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.drive', defaultMessage: 'Drive' },
  folderDropdown: { id: 'drive.folder.dropdown', defaultMessage: 'Folder menu' },
  folderView: { id: 'drive.folder.view', defaultMessage: 'View folder' },
  folderRename: { id: 'drive.folder.rename', defaultMessage: 'Rename folder' },
  folderRenamePlaceholder: { id: 'drive.folder.rename.placeholder', defaultMessage: 'New folder name' },
  folderRenameSuccess: { id: 'drive.folder.rename.success', defaultMessage: 'Folder renamed successfully.' },
  folderRenameError: { id: 'drive.folder.rename.error', defaultMessage: 'Failed to rename folder.' },
  folderMove: { id: 'drive.folder.move', defaultMessage: 'Move folder' },
  folderMoveSuccess: { id: 'drive.folder.move.success', defaultMessage: 'Folder moved successfully.' },
  folderMoveError: { id: 'drive.folder.move.error', defaultMessage: 'Failed to move folder.' },
  folderDelete: { id: 'drive.folder.delete', defaultMessage: 'Delete folder' },
  folderDeleteSuccess: { id: 'drive.folder.delete.success', defaultMessage: 'Folder deleted successfully.' },
  folderDeleteError: { id: 'drive.folder.delete.error', defaultMessage: 'Failed to delete folder.' },
  fileDropdown: { id: 'drive.file.dropdown', defaultMessage: 'File menu' },
  fileView: { id: 'drive.file.view', defaultMessage: 'View file' },
  fileDownload: { id: 'drive.file.download', defaultMessage: 'Download file' },
  fileRename: { id: 'drive.file.rename', defaultMessage: 'Rename file' },
  fileRenamePlaceholder: { id: 'drive.file.rename.placeholder', defaultMessage: 'New file name' },
  fileRenameSuccess: { id: 'drive.file.rename.success', defaultMessage: 'File renamed successfully.' },
  fileRenameError: { id: 'drive.file.rename.error', defaultMessage: 'Failed to rename file.' },
  updateDescription: { id: 'drive.file.update_description', defaultMessage: 'Edit description' },
  updateDescriptionPlaceholder: { id: 'drive.file.update_description.placeholder', defaultMessage: 'New description' },
  updateDescriptionSuccess: { id: 'drive.file.update_description.success', defaultMessage: 'Description updated successfully.' },
  updateDescriptionError: { id: 'drive.file.update_description.error', defaultMessage: 'Failed to update description.' },
  markSensitive: { id: 'drive.file.mark_sensitive', defaultMessage: 'Mark as sensitive' },
  markSensitiveSuccess: { id: 'drive.file.mark_sensitive.success', defaultMessage: 'File marked as sensitive.' },
  markSensitiveError: { id: 'drive.file.mark_sensitive.error', defaultMessage: 'Failed to mark file as sensitive.' },
  unmarkSensitive: { id: 'drive.file.unmark_sensitive', defaultMessage: 'Unmark as sensitive' },
  unmarkSensitiveSuccess: { id: 'drive.file.unmark_sensitive.success', defaultMessage: 'File unmarked as sensitive.' },
  unmarkSensitiveError: { id: 'drive.file.unmark_sensitive.error', defaultMessage: 'Failed to unmark file as sensitive.' },
  fileMove: { id: 'drive.file.move', defaultMessage: 'Move file' },
  fileMoveSuccess: { id: 'drive.file.move.success', defaultMessage: 'File moved successfully.' },
  fileMoveError: { id: 'drive.file.move.error', defaultMessage: 'Failed to move file.' },
  fileDelete: { id: 'drive.file.delete', defaultMessage: 'Delete file' },
  fileDeleteSuccess: { id: 'drive.file.delete.success', defaultMessage: 'File deleted successfully.' },
  fileDeleteError: { id: 'drive.file.delete.error', defaultMessage: 'Failed to delete file.' },
  fileUpload: { id: 'drive.file.upload', defaultMessage: 'Upload file' },
  fileUploadSuccess: { id: 'drive.file.upload.success', defaultMessage: 'File uploaded successfully.' },
  fileUploadError: { id: 'drive.file.upload.error', defaultMessage: 'Failed to upload file.' },
  newFolder: { id: 'drive.folder.new', defaultMessage: 'New folder' },
  newFolderPlaceholder: { id: 'drive.folder.new.placeholder', defaultMessage: 'Folder name' },
  newFolderSuccess: { id: 'drive.folder.new.success', defaultMessage: 'Folder created successfully.' },
  newFolderError: { id: 'drive.folder.new.error', defaultMessage: 'Failed to create folder.' },
});

interface IBreadcrumbs {
  folderId?: string;
  depth?: number;
  onClick?: (folderId?: string) => void;
}

const Breadcrumbs: React.FC<IBreadcrumbs> = ({ folderId, depth = 0, onClick }) => {
  const { data } = useDriveFolderQuery(folderId);

  if (!folderId) {
    const label = depth === 0 && <span><FormattedMessage id='drive.breadcrumbs.home' defaultMessage='Home' /></span>;

    if (onClick || depth === 0) {
      return (
        <button
          className={clsx('⁂-drive-breadcrumbs__item ⁂-drive-breadcrumbs__home', { '⁂-drive-breadcrumbs__item--current': depth === 0 })}
          onClick={() => onClick?.()}
          disabled={depth === 0}
        >
          <Icon src={require('@phosphor-icons/core/regular/house.svg')} />
          {label}
        </button>
      );
    } else {
      return (
        <Link to='/drive' className='⁂-drive-breadcrumbs__home'>
          <Icon src={require('@phosphor-icons/core/regular/house.svg')} />
          {label}
        </Link>
      );
    }
  }

  if (!data) return null;

  const spacer = (
    <div className='⁂-drive-breadcrumbs__spacer' aria-hidden>
      <Icon src={require('@phosphor-icons/core/regular/caret-right.svg')} />
    </div>
  );

  const button = onClick ? (
    <button
      className={clsx('⁂-drive-breadcrumbs__item', { '⁂-drive-breadcrumbs__item--current': depth === 0 })}
      onClick={() => onClick?.(folderId)}
    >
      {data.name}
    </button>
  ) : (
    <Link
      to={`/drive/${folderId}`}
      className={clsx('⁂-drive-breadcrumbs__item', { '⁂-drive-breadcrumbs__item--current': depth === 0 })}
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
          <Icon src={require('@phosphor-icons/core/regular/dots-three.svg')} />
        </div>
        {spacer}
        {button}
      </>
    );
  }

  return (
    <>
      <Breadcrumbs folderId={data.parent_id || undefined} depth={depth + 1} onClick={onClick} />
      {spacer}
      {button}
    </>
  );
};

interface IFile {
  file: DriveFile;
}

const File: React.FC<IFile> = ({ file }) => {
  const intl = useIntl();

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

    const mediaAttachment = {
      id: file.id,
      url: file.url,
      preview_url: file.thumbnail_url,
      remote_url: file.url,
      description: file.description || '',
      type: file.content_type.split('/')[0] as 'image' | 'video' | 'audio' | 'unknown',
      mime_type: file.content_type,
      blurhash: null,
    } as MediaAttachment;

    openModal('MEDIA', {
      media: [mediaAttachment],
      index: 0,
    });
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
          updateFile({
            sensitive: file.sensitive,
            description: file.description || undefined,
            filename: value,
          }, {
            onSuccess: () => toast.success(messages.fileRenameSuccess),
            onError: () => toast.error(messages.fileRenameError),
          });
        },
      });
    };

    const handleUpdateDescription = () => {
      openModal('TEXT_FIELD', {
        heading: <FormattedMessage id='drive.file.update_description' defaultMessage='Edit description' />,
        placeholder: intl.formatMessage(messages.updateDescriptionPlaceholder),
        confirm: <FormattedMessage id='drive.file.update_description.confirm' defaultMessage='Save' />,
        text: file.description || '',
        onConfirm: (value: string) => {
          updateFile({
            sensitive: file.sensitive,
            filename: file.filename,
            description: value,
          }, {
            onSuccess: () => toast.success(messages.updateDescriptionSuccess),
            onError: () => toast.error(messages.updateDescriptionError),
          });
        },
      });
    };

    const handleToggleSensitive = () => {
      updateFile({
        sensitive: !file.sensitive,
        filename: file.filename,
        description: file.description || undefined,
      }, {
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
      });
    };

    const handleMove = () => {
      openModal('SELECT_DRIVE_FILE', {
        type: 'folder',
        onSelect: (targetFolder) => {
          moveFile(targetFolder.id || undefined, {
            onSuccess: () => toast.success(messages.fileMoveSuccess),
            onError: () => toast.error(messages.fileMoveError),
          });
        },
        disabled: [file.id],
        title: <FormattedMessage id='drive.file.move.heading' defaultMessage='Select move destination' />,
      });
    };

    const handleDelete = () => {
      openModal('CONFIRM', {
        heading: <FormattedMessage id='drive.file.delete' defaultMessage='Delete file' />,
        confirm: <FormattedMessage id='drive.file.delete.confirm' defaultMessage='Delete' />,
        message: <FormattedMessage id='drive.file.delete.text' defaultMessage='Are you sure you want to delete this file? This action cannot be undone.' />,
        onConfirm: () => {
          deleteFile(undefined, {
            onSuccess: () => toast.success(messages.fileDeleteSuccess),
            onError: () => toast.error(messages.fileDeleteError),
          });
        },
      });
    };

    return [
      isMedia ? {
        text: intl.formatMessage(messages.fileView),
        icon: require('@phosphor-icons/core/regular/eye.svg'),
        action: handleView,
      } : {
        text: intl.formatMessage(messages.fileDownload),
        icon: require('@phosphor-icons/core/regular/download.svg'),
        href: file.url,
      },
      {
        text: intl.formatMessage(messages.fileRename),
        icon: require('@phosphor-icons/core/regular/cursor-text.svg'),
        action: handleRename,
      },
      {
        text: intl.formatMessage(messages.updateDescription),
        icon: require('@phosphor-icons/core/regular/file-text.svg'),
        action: handleUpdateDescription,
      },
      file.sensitive ? {
        text: intl.formatMessage(messages.unmarkSensitive),
        icon: require('@phosphor-icons/core/regular/eye.svg'),
        action: handleToggleSensitive,
      } : {
        text: intl.formatMessage(messages.markSensitive),
        icon: require('@phosphor-icons/core/regular/eye-slash.svg'),
        action: handleToggleSensitive,
      },
      null,
      {
        text: intl.formatMessage(messages.fileMove),
        icon: require('@phosphor-icons/core/regular/folders.svg'),
        action: handleMove,
      },
      {
        text: intl.formatMessage(messages.fileDelete),
        icon: require('@phosphor-icons/core/regular/trash.svg'),
        destructive: true,
        action: handleDelete,
      },
    ];
  }, [file]);

  return (
    <div className='⁂-drive-file' tabIndex={0} onDoubleClick={handleView}>
      <div className='⁂-drive-file__button'>
        <DropdownMenu items={items} placement='right-start'>
          <IconButton
            src={require('@phosphor-icons/core/regular/dots-three.svg')}
            title={intl.formatMessage(messages.fileDropdown)}
            theme='secondary'
          />
        </DropdownMenu>
      </div>

      {file.thumbnail_url && isMedia ? (
        <img
          src={file.thumbnail_url}
          alt={file.description || undefined}
        />
      ) : (
        <Icon
          className='⁂-drive-file__icon'
          src={MIMETYPE_ICONS[file.content_type || ''] || defaultIcon}
        />
      )}

      <span className='⁂-drive-file__label'>
        {file.filename}
      </span>
    </div>
  );
};

interface IFolder {
  folder: DriveFolder;
}

const Folder: React.FC<IFolder> = ({ folder }) => {
  const history = useHistory();
  const intl = useIntl();

  const { openModal } = useModalsActions();
  const { mutate: deleteFolder } = useDeleteDriveFolderMutation(folder.id!);
  const { mutate: updateFolder } = useUpdateDriveFolderMutation(folder.id!);
  const { mutate: moveFolder } = useMoveDriveFolderMutation(folder.id!);

  const handleEnterFolder = () => {
    history.push(`/drive/${folder.id}`);
  };

  const items: Menu = useMemo(() => {
    const handleRename = () => {
      openModal('TEXT_FIELD', {
        heading: <FormattedMessage id='drive.folder.rename' defaultMessage='Rename folder' />,
        placeholder: intl.formatMessage(messages.folderRenamePlaceholder),
        confirm: <FormattedMessage id='drive.folder.rename.confirm' defaultMessage='Rename' />,
        text: folder.name || '',
        singleLine: true,
        onConfirm: (value: string) => {
          updateFolder(value, {
            onSuccess: () => toast.success(messages.folderRenameSuccess),
            onError: () => toast.error(messages.folderRenameError),
          });
        },
      });
    };

    const handleDelete = () => {
      openModal('CONFIRM', {
        heading: <FormattedMessage id='drive.folder.delete' defaultMessage='Delete folder' />,
        confirm: <FormattedMessage id='drive.folder.delete.confirm' defaultMessage='Delete' />,
        message: <FormattedMessage id='drive.folder.delete.text' defaultMessage='Are you sure you want to delete this folder? This action cannot be undone.' />,
        onConfirm: () => {
          deleteFolder(undefined, {
            onSuccess: () => toast.success(messages.folderDeleteSuccess),
            onError: () => toast.error(messages.folderDeleteError),
          });
        },
      });
    };

    const handleMove = () => {
      openModal('SELECT_DRIVE_FILE', {
        type: 'folder',
        onSelect: (targetFolder) => {
          moveFolder(targetFolder.id || undefined, {
            onSuccess: () => toast.success(messages.folderMoveSuccess),
            onError: () => toast.error(messages.folderMoveError),
          });
        },
        disabled: [folder.id],
        title: <FormattedMessage id='drive.file.move.heading' defaultMessage='Select move destination' />,
      });
    };

    return [
      {
        text: intl.formatMessage(messages.folderView),
        icon: require('@phosphor-icons/core/regular/folder-open.svg'),
        to: `/drive/${folder.id}`,
      },
      {
        text: intl.formatMessage(messages.folderRename),
        icon: require('@phosphor-icons/core/regular/cursor-text.svg'),
        action: handleRename,
      },
      {
        text: intl.formatMessage(messages.folderMove),
        icon: require('@phosphor-icons/core/regular/folders.svg'),
        action: handleMove,
      },
      {
        text: intl.formatMessage(messages.folderDelete),
        icon: require('@phosphor-icons/core/regular/trash.svg'),
        destructive: true,
        action: handleDelete,
      },
    ];
  }, [folder]);

  return (
    <div className='⁂-drive-file ⁂-drive-folder' tabIndex={0} onDoubleClick={handleEnterFolder}>
      <div className='⁂-drive-file__button'>
        <DropdownMenu items={items} placement='right-start'>
          <IconButton
            src={require('@phosphor-icons/core/regular/dots-three.svg')}
            title={intl.formatMessage(messages.folderDropdown)}
            theme='secondary'
          />
        </DropdownMenu>
      </div>

      <Icon
        className='⁂-drive-file__icon'
        src={require('@phosphor-icons/core/regular/folder.svg')}
      />

      <span className='⁂-drive-file__label'>
        {folder.name}
      </span>
    </div>
  );
};

interface IDrivePage {
  params?: {
    folderId?: string;
  };
}

const DrivePage: React.FC<IDrivePage> = ({ params }) => {
  const intl = useIntl();

  const { openModal } = useModalsActions();

  const { data, isPending } = useDriveFolderQuery(params?.folderId);
  const { mutate: uploadFile } = useCreateDriveFileMutation(params?.folderId);
  const { mutate: createFolder } = useCreateDriveFolderMutation();

  const items: Menu = [
    {
      text: intl.formatMessage(messages.fileUpload),
      icon: require('@phosphor-icons/core/regular/upload.svg'),
      onSelectFile: (files: FileList) => {
        uploadFile(files[0], {
          onSuccess: () => toast.success(messages.fileUploadSuccess),
          onError: (error) => toast.error(messages.fileUploadError),
        });
      },
    },
    {
      text: intl.formatMessage(messages.newFolder),
      icon: require('@phosphor-icons/core/regular/folder-plus.svg'),
      action: () => {
        openModal('TEXT_FIELD', {
          heading: <FormattedMessage id='drive.folder.create' defaultMessage='Create new folder' />,
          placeholder: intl.formatMessage(messages.newFolderPlaceholder),
          confirm: <FormattedMessage id='drive.folder.create.confirm' defaultMessage='Create' />,
          singleLine: true,
          onConfirm: (value: string) => {
            createFolder({ name: value, parentId: params?.folderId }, {
              onSuccess: () => toast.success(messages.newFolderSuccess),
              onError: () => toast.error(messages.newFolderError),
            });
          },
        });
      },
    },
  ];

  if (isPending) {
    return <ColumnLoading />;
  }

  const isEmpty = data?.files.length === 0 && data?.folders.length === 0;

  return (
    <Column
      className='⁂-drive-page'
      label={data?.name || intl.formatMessage(messages.heading)}
      backHref={data?.id === null ? '/drive' : data?.parent_id ? `/drive/${data.parent_id}` : undefined}
      action={<DropdownMenu items={items} src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')} />}
    >
      <div className='⁂-drive-breadcrumbs'>
        <Breadcrumbs folderId={params?.folderId} />
      </div>
      {isEmpty ? (
        <EmptyMessage
          text={<FormattedMessage id='drive.empty' defaultMessage='There are no files or folders in this folder.' />}
          icon={require('@phosphor-icons/core/regular/folder-open.svg')}
        />
      ) : (
        <div className='⁂-drive-page__files'>
          {data?.folders.map((folder) => <Folder key={folder.id} folder={folder} />)}
          {data?.files.map((file) => <File key={file.id} file={file} />)}
        </div>
      )}
    </Column>
  );
};

export { DrivePage as default, Breadcrumbs };
