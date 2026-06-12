import iconFolder from '@phosphor-icons/core/regular/folder.svg';
import defaultIcon from '@phosphor-icons/core/regular/paperclip.svg';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Icon from '@/components/ui/icon';
import Modal from '@/components/ui/modal';
import { MIMETYPE_ICONS } from '@/components/upload';
import { Breadcrumbs } from '@/pages/drive/components/breadcrumbs';
import { useDriveFolderQuery } from '@/queries/drive/use-drive-folder';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { DriveFile, DriveFolder } from 'pl-api';

type SelectDriveFileModalProps = {
  disabled?: Array<string | null>;
  title?: React.ReactNode;
} & (
  | {
      type: 'file';
      onSelect: (file: DriveFile) => void;
      accepted?: Array<string>;
    }
  | {
      type: 'folder';
      onSelect: (folder: DriveFolder) => void;
    }
);

interface IFolder {
  folder: DriveFolder;
  active?: boolean;
  disabled?: boolean;
  onSelect?: (folder: DriveFolder) => void;
  onDoubleClick?: (folder: DriveFolder) => void;
}

const Folder: React.FC<IFolder> = ({ folder, active, disabled, onSelect, onDoubleClick }) => {
  return (
    <button
      className={clsx('drive-file drive-folder', {
        'drive-file--active': active,
        'drive-file--disabled': disabled,
      })}
      tabIndex={disabled ? -1 : 0}
      onDoubleClick={disabled ? undefined : () => onDoubleClick?.(folder)}
      onClick={disabled ? undefined : () => onSelect?.(folder)}
      disabled={disabled}
    >
      <Icon className='drive-file__icon' src={iconFolder} />

      <span className='drive-file__label'>{folder.name}</span>
    </button>
  );
};

interface IFile {
  file: DriveFile;
  active?: boolean;
  disabled?: boolean;
  onSelect?: (file: DriveFile) => void;
}

const File: React.FC<IFile> = ({ file, active, disabled, onSelect }) => {
  const isMedia = file.content_type.match(/image|video|audio/);

  return (
    <button
      className={clsx('drive-file', {
        'drive-file--active': active,
        'drive-file--disabled': disabled,
      })}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : () => onSelect?.(file)}
      disabled={disabled}
    >
      {file.thumbnail_url && isMedia ? (
        <img src={file.thumbnail_url} alt={file.description ?? undefined} />
      ) : (
        <Icon
          className='drive-file__icon'
          src={MIMETYPE_ICONS[file.content_type || ''] || defaultIcon}
        />
      )}

      <span className='drive-file__label'>{file.filename}</span>
    </button>
  );
};

const SelectDriveFileModal: React.FC<SelectDriveFileModalProps & BaseModalProps> = ({
  onClose,
  onSelect,
  type,
  disabled,
  title,
  ...props
}) => {
  const onClickClose = () => {
    onClose('SELECT_DRIVE_FILE');
  };

  const [currentFolder, setCurrentFolder] = React.useState<string>();
  const [selectedFile, setSelectedFile] = React.useState<string>();

  const { data: folder } = useDriveFolderQuery(currentFolder);

  const handleConfirm = () => {
    if (!folder) return;

    if (type === 'file') {
      const file = folder.files.find(({ id }) => id === selectedFile);
      if (file) {
        onSelect(file);
      }
    } else {
      const selectedFolder = folder.folders.find(({ id }) => id === selectedFile);
      if (selectedFolder) {
        onSelect(selectedFolder);
      } else if (!disabled?.includes(folder?.id ?? null)) {
        onSelect(folder);
      }
    }

    onClose('SELECT_DRIVE_FILE');
  };

  const files = useMemo(() => {
    const children: React.ReactNode[] = [];

    if (!folder) return children;

    for (const subfolder of folder.folders) {
      children.push(
        <Folder
          key={subfolder.id}
          folder={subfolder}
          active={selectedFile === subfolder.id}
          disabled={disabled?.includes(subfolder.id)}
          onSelect={({ id }) => {
            if (type === 'folder') {
              setSelectedFile(id ?? undefined);
            }
          }}
          onDoubleClick={({ id }) => {
            setCurrentFolder(id ?? undefined);
          }}
        />,
      );
    }

    for (const file of folder.files) {
      children.push(
        <File
          key={file.id}
          file={file}
          active={selectedFile === file.id}
          disabled={
            type === 'folder' ||
            (disabled?.includes(file.id) ??
              ('accepted' in props &&
                props.accepted &&
                !props.accepted.includes(file.content_type)))
          }
          onSelect={({ id }) => {
            if (type === 'file') {
              setSelectedFile(id);
            }
          }}
        />,
      );
    }

    return children;
  }, [folder, selectedFile]);

  return (
    <Modal
      title={
        title ??
        (type === 'folder' ? (
          <FormattedMessage id='drive.select_folder.heading' defaultMessage='Select folder' />
        ) : (
          <FormattedMessage id='drive.select_file.heading' defaultMessage='Select file' />
        ))
      }
      onClose={onClickClose}
      confirmationAction={handleConfirm}
      confirmationText={
        type === 'folder' ? (
          <FormattedMessage id='drive.select_folder.confirm' defaultMessage='Select folder' />
        ) : (
          <FormattedMessage id='drive.select_file.confirm' defaultMessage='Select file' />
        )
      }
      confirmationDisabled={!selectedFile && type !== 'folder'}
    >
      <div className='drive-breadcrumbs'>
        <Breadcrumbs
          folderId={currentFolder}
          onClick={(folderId) => {
            setCurrentFolder(folderId);
          }}
        />
      </div>
      <ScrollableList
        listClassName='drive-file-list status-list'
        style={{ minHeight: 'calc(80vh - 192px)' }}
        isLoading={!folder}
        showLoading={!folder}
        useWindowScroll={false}
      >
        {files}
      </ScrollableList>
    </Modal>
  );
};

export { SelectDriveFileModal as default, type SelectDriveFileModalProps };
