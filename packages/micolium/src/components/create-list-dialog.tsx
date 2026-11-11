import {
  ActivityIndicator,
  Button,
  Icon,
  IconButton,
  List as PaperList,
  Searchbar,
  TextInput,
  useTheme,
} from '@mkljczk/react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { GlassView } from 'expo-glass-effect';
import { FolderSimpleIcon } from 'phosphor-react-native/src/icons/FolderSimple';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { UsersIcon } from 'phosphor-react-native/src/icons/Users';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';

import { useCurrentAccount, useFeatures } from '@/contexts/current-account-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import {
  useAddAccountsToAntenna,
  useAntennaAccounts,
  useCreateAntenna,
  useRemoveAccountsFromAntenna,
  useUpdateAntenna,
} from '@/queries/accounts/use-antennas';
import {
  useAddAccountsToCircle,
  useCircleAccounts,
  useCreateCircle,
  useRemoveAccountsFromCircle,
  useUpdateCircle,
} from '@/queries/accounts/use-circles';
import {
  useAddAccountsToList,
  useCreateList,
  useListAccounts,
  useRemoveAccountsFromList,
  useUpdateList,
} from '@/queries/accounts/use-lists';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import {
  useCreateBookmarkFolder,
  useUpdateBookmarkFolder,
} from '@/queries/statuses/use-bookmark-folders';
import { useUiStoreActions } from '@/stores/ui';
import { haptics } from '@/utils/haptics';
import { toast } from '@/utils/toast';

import { Account } from './accounts/account';
import { DialogOrSheet } from './ui/dialog-or-sheet';
import { Emoji } from './ui/emoji';
import { EmptyMessage } from './ui/empty-message';
import { iconHelper } from './ui/icon';
import { type IListSections, List } from './ui/list';

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
  showRepliesTo: {
    id: 'lists.edit.show_replies_to',
    defaultMessage: 'Include replies from list members to',
  },
  repliesPolicyNone: { id: 'lists.replies_policy.none', defaultMessage: 'No one' },
  repliesPolicyList: { id: 'lists.replies_policy.list', defaultMessage: 'Members of the list' },
  repliesPolicyFollowed: {
    id: 'lists.replies_policy.followed',
    defaultMessage: 'Any followed user',
  },
  exclusive: { id: 'lists.exclusive', defaultMessage: 'Hide members in Home' },
  exclusiveHint: {
    id: 'lists.exclusive.hint',
    defaultMessage:
      'If someone is on this list, hide them in your Home feed to avoid seeing their posts twice.',
  },
  notifications: { id: 'lists.notifications', defaultMessage: 'Subscribe' },
  notificationsHint: {
    id: 'lists.notifications.hint',
    defaultMessage: 'Receive notifications for new posts in the list.',
  },
  back: { id: 'navigation_bar.back', defaultMessage: 'Back' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  search: { id: 'lists.search', defaultMessage: 'Search among people you follow' },
  addAccount: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  removeAccount: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  addToCircle: { id: 'circles.add_to_circle', defaultMessage: 'Add to circle' },
  addToAntenna: { id: 'antennas.account.add', defaultMessage: 'Add to antenna' },
  listMembers: { id: 'lists.account.members', defaultMessage: 'List members' },
  circleMembers: { id: 'circles.members', defaultMessage: 'Circle members' },
  antennaMembers: { id: 'antennas.account.list', defaultMessage: 'Antenna members list' },
  manageListMembers: { id: 'lists.manage_members', defaultMessage: 'Manage list members' },
  manageAntennaAccounts: {
    id: 'antennas.manage_accounts',
    defaultMessage: 'Manage antenna accounts',
  },
});

interface IMemberAccount {
  accountId: string;
  added: boolean;
  onAdd: (accountId: string) => void;
  onRemove: (accountId: string) => void;
}

const MemberAccount: React.FC<IMemberAccount> = ({ accountId, added, onAdd, onRemove }) => {
  const intl = useIntl();

  return (
    <Account
      id={accountId}
      style={{ paddingVertical: 8 }}
      action={
        <IconButton
          icon={iconHelper(added ? XIcon : PlusIcon)}
          mode={added ? 'contained-tonal' : 'outlined'}
          onPress={() => {
            (added ? onRemove : onAdd)(accountId);
            haptics.selection();
          }}
          accessibilityLabel={intl.formatMessage(
            added ? messages.removeAccount : messages.addAccount,
          )}
        />
      }
    />
  );
};

interface IAccountMembersList {
  query: {
    data?: Array<string>;
    isFetching: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
  };
  onAdd: (accountId: string) => void;
  onRemove: (accountId: string) => void;
  membersTitle: string;
  addTitle: string;
  emptyMessage: React.JSX.Element;
}

const AccountMembersList: React.FC<IAccountMembersList> = ({
  query,
  onAdd,
  onRemove,
  membersTitle,
  addTitle,
  emptyMessage,
}) => {
  const { colors } = useTheme();
  const intl = useIntl();

  const [searchValue, setSearchValue] = React.useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const { data: accountIds = [], isFetching } = query;
  const { data: searchAccountIds = [], isFetching: isSearching } = useAccountSearch(
    debouncedSearchValue,
    { following: true, limit: 10 },
  );

  const searching = !!debouncedSearchValue.trim();

  const renderAccount = (accountId: string) => (
    <MemberAccount
      key={accountId}
      accountId={accountId}
      added={accountIds.includes(accountId)}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );

  let content;
  if (searching) {
    if (searchAccountIds.length) content = searchAccountIds.map(renderAccount);
    else if (isSearching) content = <ActivityIndicator style={{ marginVertical: 16 }} />;
    else
      content = (
        <EmptyMessage
          emptyMessageText={
            <FormattedMessage
              id='empty_column.search.accounts'
              defaultMessage='There are no people results for "{term}"'
              values={{ term: debouncedSearchValue }}
            />
          }
        />
      );
  } else if (accountIds.length) {
    content = (
      <>
        {accountIds.map(renderAccount)}
        {query.hasNextPage && (
          <Button
            mode='contained-tonal'
            onPress={query.fetchNextPage}
            loading={isFetching}
            style={{ alignSelf: 'center', marginVertical: 8 }}
          >
            <FormattedMessage id='status.load_more' defaultMessage='Load more' />
          </Button>
        )}
      </>
    );
  } else if (isFetching) {
    content = <ActivityIndicator style={{ marginVertical: 16 }} />;
  } else {
    content = (
      <EmptyMessage emptyMessageIcon={iconHelper(UsersIcon)} emptyMessageText={emptyMessage} />
    );
  }

  return (
    <>
      <Searchbar
        placeholder={intl.formatMessage(messages.search)}
        value={searchValue}
        onChangeText={setSearchValue}
        autoCapitalize='none'
        autoCorrect={false}
        style={{
          marginHorizontal: 0,
          marginBottom: 8,
          borderColor: colors.outlineVariant,
          borderWidth: 1,
        }}
      />
      <PaperList.Subheader style={{ marginHorizontal: -16 }}>
        {searching ? addTitle : membersTitle}
      </PaperList.Subheader>
      {content}
    </>
  );
};

const ListMembers: React.FC<{ id: string }> = ({ id }) => {
  const intl = useIntl();

  const query = useListAccounts(id);
  const { mutate: addToList } = useAddAccountsToList(id);
  const { mutate: removeFromList } = useRemoveAccountsFromList(id);

  return (
    <AccountMembersList
      query={query}
      onAdd={(accountId) => addToList([accountId])}
      onRemove={(accountId) => removeFromList([accountId])}
      membersTitle={intl.formatMessage(messages.listMembers)}
      addTitle={intl.formatMessage(messages.addAccount)}
      emptyMessage={
        <FormattedMessage
          id='empty_column.list_members'
          defaultMessage='There are no members in this list. Use search to find users to add.'
        />
      }
    />
  );
};

const CircleMembers: React.FC<{ id: string }> = ({ id }) => {
  const intl = useIntl();

  const query = useCircleAccounts(id);
  const { mutate: addToCircle } = useAddAccountsToCircle(id);
  const { mutate: removeFromCircle } = useRemoveAccountsFromCircle(id);

  return (
    <AccountMembersList
      query={query}
      onAdd={(accountId) => addToCircle([accountId])}
      onRemove={(accountId) => removeFromCircle([accountId])}
      membersTitle={intl.formatMessage(messages.circleMembers)}
      addTitle={intl.formatMessage(messages.addToCircle)}
      emptyMessage={
        <FormattedMessage
          id='empty_column.circle_members'
          defaultMessage='There are no members in this circle. Use search to find users to add.'
        />
      }
    />
  );
};

const AntennaMembers: React.FC<{ id: string }> = ({ id }) => {
  const intl = useIntl();

  const query = useAntennaAccounts(id);
  const { mutate: addToAntenna } = useAddAccountsToAntenna(id);
  const { mutate: removeFromAntenna } = useRemoveAccountsFromAntenna(id);

  return (
    <AccountMembersList
      query={query}
      onAdd={(accountId) => addToAntenna([accountId])}
      onRemove={(accountId) => removeFromAntenna([accountId])}
      membersTitle={intl.formatMessage(messages.antennaMembers)}
      addTitle={intl.formatMessage(messages.addToAntenna)}
      emptyMessage={
        <FormattedMessage
          id='empty_column.antenna_accounts'
          defaultMessage='There are no accounts in this antenna. Use search to find users to add.'
        />
      }
    />
  );
};

interface IEditListMembersDialog {
  type: 'antenna' | 'circle' | 'list';
  id: string;
  visible: boolean;
  onDismiss: () => void;
  onDismissCreateDialog: () => void;
}

const EditListMembersDialog: React.FC<IEditListMembersDialog> = ({
  type,
  id,
  visible,
  onDismiss,
  onDismissCreateDialog,
}) => {
  const intl = useIntl();

  const [closing, setClosing] = React.useState(false);

  let title;
  let content;
  switch (type) {
    case 'list':
      title = <FormattedMessage id='lists.manage_members' defaultMessage='Manage list members' />;
      content = <ListMembers id={id} />;
      break;
    case 'circle':
      title = <FormattedMessage id='circles.members' defaultMessage='Circle members' />;
      content = <CircleMembers id={id} />;
      break;
    case 'antenna':
      title = (
        <FormattedMessage id='antennas.manage_accounts' defaultMessage='Manage antenna accounts' />
      );
      content = <AntennaMembers id={id} />;
      break;
  }

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      actions={[
        {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.back),
          onPress: () => setClosing(true),
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(messages.close),
          onPress: () => {
            setClosing(true);
            onDismissCreateDialog();
          },
          confirm: true,
        },
      ]}
      title={title}
    >
      {content}
    </DialogOrSheet>
  );
};

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
  const [membersDialog, setMembersDialog] = React.useState(false);
  const [emoji, setEmoji] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');

  const [repliesPolicy, setRepliesPolicy] = React.useState<'none' | 'list' | 'followed'>('list');
  const [exclusive, setExclusive] = React.useState(false);
  const [notify, setNotify] = React.useState(false);

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
        (id ? updateList : createList)(
          { title: value, emoji: emojiParam, replies_policy: repliesPolicy, exclusive, notify },
          { onSuccess, onError },
        );
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

  const formItems = React.useMemo(() => {
    const sections: IListSections = [];
    const section: IListSections[number] = {
      items: [],
    };

    if (type === 'list' && features.listsRepliesPolicy) {
      section.items.push({
        type: 'select',
        label: intl.formatMessage(messages.showRepliesTo),
        active: repliesPolicy ?? 'list',
        onChange: setRepliesPolicy,
        options: [
          { value: 'none', label: intl.formatMessage(messages.repliesPolicyNone) },
          { value: 'list', label: intl.formatMessage(messages.repliesPolicyList) },
          { value: 'followed', label: intl.formatMessage(messages.repliesPolicyFollowed) },
        ],
      });
    }

    if (type === 'list' && features.listsExclusive) {
      section.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.exclusive),
        sublabel: intl.formatMessage(messages.exclusiveHint),
        active: exclusive,
        onPress: () => setExclusive((value) => !value),
      });
    }

    if (type === 'list' && features.listsNotifications) {
      section.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.notifications),
        sublabel: intl.formatMessage(messages.notificationsHint),
        active: notify,
        onPress: () => setNotify((value) => !value),
      });
    }

    if (section.items.length) sections.push(section);

    if (id && type !== 'bookmark_folder') {
      sections.push({
        items: [
          {
            type: 'button',
            label: intl.formatMessage(
              type === 'list'
                ? messages.manageListMembers
                : type === 'antenna'
                  ? messages.manageAntennaAccounts
                  : messages.circleMembers,
            ),
            onPress: () => setMembersDialog(true),
          },
        ],
      });
    }

    return sections;
  }, [features, id, type, repliesPolicy, exclusive, notify]);

  return (
    <>
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

        <List style={{ marginHorizontal: -16 }} sections={formItems} />
      </DialogOrSheet>
      {membersDialog && id && type !== 'bookmark_folder' && (
        <EditListMembersDialog
          id={id}
          type={type}
          visible
          onDismiss={() => setMembersDialog(false)}
          onDismissCreateDialog={handleClose}
        />
      )}
    </>
  );
};

export { CreateListDialog };
