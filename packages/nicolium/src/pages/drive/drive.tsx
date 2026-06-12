import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconFolderPlus from '@phosphor-icons/core/regular/folder-plus.svg';
import iconUpload from '@phosphor-icons/core/regular/upload.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import Column from '@/components/ui/column';
import ColumnLoading from '@/features/ui/components/column-loading';
import { useCreateDriveFileMutation } from '@/queries/drive/use-drive-file';
import {
  useCreateDriveFolderMutation,
  useDriveFolderQuery,
} from '@/queries/drive/use-drive-folder';
import { driveRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import { DriveBrowser } from './components/drive-browser';

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
  fileUpload: { id: 'drive.file.upload', defaultMessage: 'Upload file' },
  fileUploadSuccess: {
    id: 'drive.file.upload.success',
    defaultMessage: 'File uploaded',
  },
  fileUploadError: { id: 'drive.file.upload.error', defaultMessage: 'Failed to upload file' },
  newFolder: { id: 'drive.folder.new', defaultMessage: 'New folder' },
  newFolderPlaceholder: { id: 'drive.folder.new.placeholder', defaultMessage: 'Folder name' },
  newFolderSuccess: {
    id: 'drive.folder.new.success',
    defaultMessage: 'Folder created',
  },
  newFolderError: { id: 'drive.folder.new.error', defaultMessage: 'Failed to create folder' },
  home: { id: 'drive.breadcrumbs.home', defaultMessage: 'Home' },
});

const DrivePage: React.FC = () => {
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

  if (isPending) {
    return <ColumnLoading />;
  }

  return (
    <Column
      className='drive-page'
      label={data?.name ?? intl.formatMessage(messages.heading)}
      backHref='/drive/{-$folderId}'
      backParams={{ folderId: data?.parent_id ?? undefined }}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />}
    >
      <DriveBrowser folderId={folderId} />
    </Column>
  );
};

export { DrivePage as default };
