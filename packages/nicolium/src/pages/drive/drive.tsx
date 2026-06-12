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
