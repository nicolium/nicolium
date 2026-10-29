import { IconButton } from '@mkljczk/react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ImageIcon } from 'phosphor-react-native/src/icons/Image';
import { PaperclipIcon } from 'phosphor-react-native/src/icons/Paperclip';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Alert } from 'react-native';

import DropdownMenu from '@/components/ui/dropdown-menu';
import { useInstance } from '@/contexts/current-account-context';
import { useCompose, useUploadCompose } from '@/stores/compose';

import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';

const onlyImages = (types: string[] | undefined): boolean =>
  types?.every((type) => type.startsWith('image/')) ?? false;

const messages = defineMessages({
  upload: { id: 'upload_button.label', defaultMessage: 'Add media attachment' },
  camera: { id: 'upload_button.label.camera', defaultMessage: 'Take a photo' },
  addFile: { id: 'upload_button.label.file', defaultMessage: 'Add file' },
  uploadPermissionRequiredTitle: {
    id: 'upload_button.permission_required.title',
    defaultMessage: 'Permission required',
  },
  uploadPermissionRequiredMessage: {
    id: 'upload_button.permission_required.message',
    defaultMessage: 'Permission to access the media library is required.',
  },
  uploadCameraPermissionRequiredMessage: {
    id: 'upload_button.camera_permission_required.message',
    defaultMessage: 'Permission to access the camera is required.',
  },
});

const ComposeUploadButton: React.FC<ICompose> = ({ composeId }) => {
  const intl = useIntl();

  const { configuration } = useInstance();
  const { isUploading, mediaAttachments, poll } = useCompose(composeId);
  const uploadCompose = useUploadCompose(composeId);

  const attachmentTypes = configuration.media_attachments.supported_mime_types;

  const handleAddFile = async () => {
    let type = attachmentTypes;
    if (type?.join(',') === 'application/octet-stream') type = undefined;

    const result = await DocumentPicker.getDocumentAsync({ type, multiple: true });

    if (result.canceled) return;

    uploadCompose(
      result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
        size: asset.size ?? 0,
      })),
    );
  };

  const handleAddMedia = async (camera?: boolean) => {
    let permissionResult;
    if (camera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert(
        intl.formatMessage(messages.uploadPermissionRequiredTitle),
        intl.formatMessage(
          camera
            ? messages.uploadCameraPermissionRequiredMessage
            : messages.uploadPermissionRequiredMessage,
        ),
      );
      return;
    }

    const fn = camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;

    const result = await fn({
      mediaTypes: onlyImages(attachmentTypes) ? ['images'] : ['images', 'videos'],
      allowsMultipleSelection: true,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      selectionLimit: configuration.statuses.max_media_attachments - mediaAttachments.length,
    });

    if (result.canceled) return;

    uploadCompose(
      result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split('/').pop()!,
        type: asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        size: asset.fileSize ?? 0,
        duration: asset.duration ? asset.duration / 1000 : null,
      })),
    );
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          icon={iconHelper(onlyImages(attachmentTypes) ? ImageIcon : PaperclipIcon)}
          style={{ marginHorizontal: 0 }}
          onPress={() => {}}
          disabled={
            !!poll ||
            isUploading ||
            mediaAttachments.length >= configuration.statuses.max_media_attachments
          }
          accessibilityLabel={intl.formatMessage(messages.upload)}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item key='camera' onSelect={() => handleAddMedia(true)}>
          <DropdownMenu.ItemIcon ios={{ name: 'camera' }} androidIconName='ph_camera' />
          <DropdownMenu.ItemTitle>{intl.formatMessage(messages.camera)}</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        <DropdownMenu.Item key='file' onSelect={handleAddFile}>
          <DropdownMenu.ItemIcon ios={{ name: 'paperclip' }} androidIconName='ph_paperclip' />
          <DropdownMenu.ItemTitle>{intl.formatMessage(messages.addFile)}</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        <DropdownMenu.Item key='media' onSelect={() => handleAddMedia()}>
          <DropdownMenu.ItemIcon
            ios={{ name: 'photo.on.rectangle.angled' }}
            androidIconName='ph_images'
          />
          <DropdownMenu.ItemTitle>{intl.formatMessage(messages.upload)}</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export { ComposeUploadButton };
