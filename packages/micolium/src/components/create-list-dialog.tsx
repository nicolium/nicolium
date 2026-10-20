import { Icon, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { GlassView } from 'expo-glass-effect';
import { FolderSimpleIcon } from 'phosphor-react-native/src/icons/FolderSimple';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import { toast } from 'sonner-native';

import { useCurrentAccount, useFeatures } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCreateAntenna, useUpdateAntenna } from '@/queries/accounts/use-antennas';
import { useCreateCircle, useUpdateCircle } from '@/queries/accounts/use-circles';
import { useCreateList, useUpdateList } from '@/queries/accounts/use-lists';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import {
  useCreateBookmarkFolder,
  useUpdateBookmarkFolder,
} from '@/queries/statuses/use-bookmark-folders';
import { useUiStoreActions } from '@/stores/ui';

import { DialogOrSheet } from './ui/dialog-or-sheet';
import { Emoji } from './ui/emoji';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  createList: { id: 'lists.new.create.title', defaultMessage: 'Add list' },
  createAntenna: { id: 'antennas.new.create.title', defaultMessage: 'Add antenna' },
  createCircle: { id: 'circles.new.create.title', defaultMessage: 'Add circle' },
  createBookmarkFolder: {
    id: 'bookmark_folders.new.create.title',
    defaultMessage: 'Add bookmark folder',
  },
  updateList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  updateAntenna: { id: 'antennas.edit', defaultMessage: 'Edit antenna' },
  updateCircle: { id: 'circles.edit', defaultMessage: 'Edit circle' },
  updateBookmarkFolder: {
    id: 'bookmark_folders.edit',
    defaultMessage: 'Edit bookmark folder',
  },
  listPlaceholder: { id: 'lists.new.title.placeholder', defaultMessage: 'New list title' },
  antennaPlaceholder: { id: 'antennas.new.title.placeholder', defaultMessage: 'New antenna title' },
  circlePlaceholder: { id: 'circles.new.title.placeholder', defaultMessage: 'New circle title' },
  bookmarkFolderPlaceholder: {
    id: 'bookmark_folders.new.title.placeholder',
    defaultMessage: 'New folder title',
  },
  bookmarkFolderAddFail: {
    id: 'bookmark_folders.add.fail',
    defaultMessage: 'Failed to create bookmark folder',
  },
  bookmarkFolderAddSuccess: {
    id: 'bookmark_folders.add.success',
    defaultMessage: 'Bookmark folder created',
  },
  antennaAddFail: { id: 'antennas.create.error', defaultMessage: 'Failed to create antenna' },
  antennaAddSuccess: { id: 'antennas.create.success', defaultMessage: 'Antenna created' },
  listAddFail: { id: 'lists.create.error', defaultMessage: 'Failed to create list' },
  listAddSuccess: { id: 'lists.create.success', defaultMessage: 'List created' },
  circleAddFail: { id: 'circles.create.error', defaultMessage: 'Failed to create circle' },
  circleAddSuccess: { id: 'circles.create.success', defaultMessage: 'Circle created' },
  bookmarkFolderEditFail: {
    id: 'bookmark_folders.edit.fail',
    defaultMessage: 'Failed to edit bookmark folder',
  },
  bookmarkFolderEditSuccess: {
    id: 'bookmark_folders.edit.success',
    defaultMessage: 'Bookmark folder updated',
  },
  antennaEditFail: { id: 'antennas.edit.error', defaultMessage: 'Failed to update antenna' },
  antennaEditSuccess: { id: 'antennas.edit.success', defaultMessage: 'Antenna updated' },
  listEditFail: { id: 'lists.edit.error', defaultMessage: 'Failed to update list' },
  listEditSuccess: { id: 'lists.edit.success', defaultMessage: 'List updated' },
  circleEditFail: { id: 'circles.edit.error', defaultMessage: 'Failed to update circle' },
  circleEditSuccess: { id: 'circles.edit.success', defaultMessage: 'Circle updated' },
});

interface ICreateListDialog {
  type: 'bookmark_folder' | 'antenna' | 'circle' | 'list';
  id?: string;
  visible: boolean;
  onDismiss: () => void;
}

const CreateListDialog: React.FC<ICreateListDialog> = ({ type, id, visible, onDismiss }) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const scopeUrl = useCurrentAccount();
  const { openEmojiPicker } = useUiStoreActions();
  const features = useFeatures();

  const glassEffect = useEnableLiquidGlass();

  const [closing, setClosing] = React.useState(false);
  const [emoji, setEmoji] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');

  const emojiUrl = React.useMemo(() => {
    if (emoji)
      return queryClient
        .getQueryData(scopedQueryKey(queryKeys.instance.customEmojis, scopeUrl))
        ?.find((e) => e.shortcode === emoji);
  }, [emoji, scopeUrl]);

  React.useEffect(() => {
    switch (type) {
      case 'bookmark_folder': {
        const bookmarkFolder = queryClient
          .getQueryData(scopedQueryKey(queryKeys.bookmarkFolders.all, scopeUrl))
          ?.find((folder) => folder.id === id);
        if (bookmarkFolder) {
          setTitle(bookmarkFolder.name);
          setEmoji(bookmarkFolder.emoji);
        }
        break;
      }
      case 'list': {
        const list = queryClient
          .getQueryData(scopedQueryKey(queryKeys.lists.all, scopeUrl))
          ?.find((list) => list.id === id);
        if (list) {
          setTitle(list.title);
          setEmoji(list.emoji);
        }
        break;
      }
      case 'circle': {
        const circle = queryClient
          .getQueryData(scopedQueryKey(queryKeys.circles.all, scopeUrl))
          ?.find((circle) => circle.id === id);
        if (circle) {
          setTitle(circle.title);
        }
        break;
      }
      case 'antenna': {
        const antenna = queryClient
          .getQueryData(scopedQueryKey(queryKeys.antennas.all, scopeUrl))
          ?.find((antenna) => antenna.id === id);
        if (antenna) {
          setTitle(antenna.title);
        }
        break;
      }
    }
  }, [id]);

  const canSetEmoji =
    (type === 'list' && features.listsEmojis) ||
    (type === 'bookmark_folder' && features.bookmarkFolderEmojis);

  const handleClose = () => setClosing(true);

  const { mutate: createList, isPending: isPendingList } = useCreateList();
  const { mutate: createAntenna, isPending: isPendingAntenna } = useCreateAntenna();
  const { mutate: createCircle, isPending: isPendingCircle } = useCreateCircle();
  const { mutate: createBookmarkFolder, isPending: isPendingBookmarkFolder } =
    useCreateBookmarkFolder();

  const { mutate: updateList } = useUpdateList(id || '');
  const { mutate: updateAntenna } = useUpdateAntenna(id || '');
  const { mutate: updateCircle } = useUpdateCircle(id || '');
  const { mutate: updateBookmarkFolder } = useUpdateBookmarkFolder(id || '');

  const isSubmitting =
    isPendingList || isPendingAntenna || isPendingCircle || isPendingBookmarkFolder;

  const handleSubmit = () => {
    const value = title.trim();
    if (!value) return;

    let successMessage;
    let failMessage;

    switch (type) {
      case 'bookmark_folder':
        successMessage = id
          ? messages.bookmarkFolderEditSuccess
          : messages.bookmarkFolderAddSuccess;
        failMessage = id ? messages.bookmarkFolderEditFail : messages.bookmarkFolderAddFail;
        break;
      case 'list':
        successMessage = id ? messages.listEditSuccess : messages.listAddSuccess;
        failMessage = id ? messages.listEditFail : messages.listAddFail;
        break;
      case 'antenna':
        successMessage = id ? messages.antennaEditSuccess : messages.antennaAddSuccess;
        failMessage = id ? messages.antennaEditFail : messages.antennaAddFail;
        break;
      case 'circle':
        successMessage = id ? messages.circleEditSuccess : messages.circleAddSuccess;
        failMessage = id ? messages.circleEditFail : messages.circleAddFail;
        break;
    }

    const onSuccess = () => {
      handleClose();
      toast.success(intl.formatMessage(successMessage));
    };
    const onError = () => {
      toast.error(intl.formatMessage(failMessage));
    };

    const emojiParam = emoji || undefined;

    switch (type) {
      case 'bookmark_folder':
        (id ? updateBookmarkFolder : createBookmarkFolder)(
          { name: value, emoji: emojiParam },
          { onSuccess, onError },
        );
        break;
      case 'antenna':
        (id ? updateAntenna : createAntenna)({ title: value }, { onSuccess, onError });
        break;
      case 'circle':
        (id ? updateCircle : createCircle)(value, { onSuccess, onError });
        break;
      case 'list':
        (id ? updateList : createList)({ title: value, emoji: emojiParam }, { onSuccess, onError });
        break;
    }
  };

  let dialogTitle;
  let createLabel;
  let titlePlaceholder;
  switch (type) {
    case 'bookmark_folder':
      dialogTitle = id ? (
        <FormattedMessage
          id='edit_bookmark_folder_modal.header.title'
          defaultMessage='Edit folder'
        />
      ) : (
        <FormattedMessage
          id='bookmark_folders.create.heading'
          defaultMessage='Create bookmark folder'
        />
      );
      createLabel = intl.formatMessage(
        id ? messages.updateBookmarkFolder : messages.createBookmarkFolder,
      );
      titlePlaceholder = intl.formatMessage(messages.bookmarkFolderPlaceholder);
      break;
    case 'antenna':
      dialogTitle = id ? (
        <FormattedMessage id='antennas.edit' defaultMessage='Edit antenna' />
      ) : (
        <FormattedMessage id='antenna.create.heading' defaultMessage='Create antenna' />
      );
      createLabel = intl.formatMessage(id ? messages.updateAntenna : messages.createAntenna);
      titlePlaceholder = intl.formatMessage(messages.antennaPlaceholder);
      break;
    case 'circle':
      dialogTitle = id ? (
        <FormattedMessage id='circles.edit' defaultMessage='Edit circle' />
      ) : (
        <FormattedMessage id='circles.create.heading' defaultMessage='Create circle' />
      );
      createLabel = intl.formatMessage(id ? messages.updateCircle : messages.createCircle);
      titlePlaceholder = intl.formatMessage(messages.circlePlaceholder);
      break;
    case 'list':
      dialogTitle = id ? (
        <FormattedMessage id='list.edit' defaultMessage='Edit list' />
      ) : (
        <FormattedMessage id='lists.create.heading' defaultMessage='Create list' />
      );
      createLabel = intl.formatMessage(id ? messages.updateList : messages.createList);
      titlePlaceholder = intl.formatMessage(messages.listPlaceholder);
      break;
  }

  const renderedEmoji = emoji ? (
    <Emoji emoji={emoji} url={emojiUrl?.url} shortcode={emojiUrl?.shortcode} />
  ) : (
    <Icon source={FolderSimpleIcon} size={24} />
  );

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      actions={[
        {
          icon: 'xmark',
          label: intl.formatMessage(messages.cancel),
          onPress: handleClose,
        },
        {
          icon: 'checkmark',
          label: createLabel,
          onPress: handleSubmit,
          loading: isSubmitting,
          disabled: isSubmitting || !title.trim(),
          confirm: true,
        },
      ]}
      title={dialogTitle}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {canSetEmoji && (
          <Pressable
            onPress={() =>
              openEmojiPicker(
                (emoji) => {
                  setEmoji(emoji);
                },
                emoji ? [emoji] : undefined,
              )
            }
          >
            {glassEffect ? (
              <GlassView
                style={{
                  height: 56,
                  width: 56,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 8,
                }}
                isInteractive
              >
                {renderedEmoji}
              </GlassView>
            ) : (
              <View
                style={{
                  height: 56,
                  width: 56,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                  borderColor: colors.outline,
                  borderWidth: 1,
                }}
              >
                {renderedEmoji}
              </View>
            )}
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <TextInput
            variant='outlined'
            placeholder={titlePlaceholder}
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>
    </DialogOrSheet>
  );
};

export { CreateListDialog };
