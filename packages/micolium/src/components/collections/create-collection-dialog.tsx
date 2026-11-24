import {
  ActivityIndicator,
  Chip,
  IconButton,
  List as PaperList,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from '@mkljczk/react-native-paper';
import { codes } from 'iso-language-codes';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { UsersIcon } from 'phosphor-react-native/src/icons/Users';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';

import { useInstance } from '@/contexts/current-account-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useAddCollectionItem,
  useCollection,
  useCreateCollection,
  useRemoveCollectionItem,
  useUpdateCollection,
} from '@/queries/accounts/use-collections';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import { Alert } from '@/stores/alerts';
import { haptics } from '@/utils/haptics';
import { toast } from '@/utils/toast';

import { Account } from '../accounts/account';
import { DialogOrSheet } from '../ui/dialog-or-sheet';
import { EmptyMessage } from '../ui/empty-message';
import { iconHelper } from '../ui/icon';
import { type IListSections, List } from '../ui/list';

import type { Account as AccountEntity } from 'pl-api';

const languages = codes
  .map(({ iso639_1, nativeName }) => ({ value: iso639_1, label: nativeName.split(', ')[0] }))
  .toSorted((a, b) => a.label.localeCompare(b.label));

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  back: { id: 'navigation_bar.back', defaultMessage: 'Back' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  create: { id: 'collections.create.save', defaultMessage: 'Create collection' },
  save: { id: 'collections.edit.save', defaultMessage: 'Save collection' },
  createSuccess: { id: 'collections.create.success', defaultMessage: 'Collection created' },
  editSuccess: { id: 'collections.edit.success', defaultMessage: 'Collection updated' },
  createError: { id: 'collections.create.error', defaultMessage: 'Failed to create collection' },
  editError: { id: 'collections.edit.error', defaultMessage: 'Failed to update collection' },
  name: { id: 'collections.edit.name', defaultMessage: 'Name' },
  description: { id: 'collections.edit.description', defaultMessage: 'Description' },
  charactersRemaining: {
    id: 'textarea.counter.label',
    defaultMessage: '{count, plural, one {# character} other {# characters}} remaining',
  },
  topic: { id: 'collections.edit.topic', defaultMessage: 'Topic' },
  topicHint: {
    id: 'collections.edit.topic.hint',
    defaultMessage: 'Add a hashtag that helps others understand the main topic of this collection.',
  },
  language: { id: 'collections.edit.language', defaultMessage: 'Language' },
  languageNone: { id: 'collections.edit.language.none', defaultMessage: 'None' },
  visibility: { id: 'collections.edit.visibility', defaultMessage: 'Visibility' },
  visibilityPublic: { id: 'collections.edit.visibility.public', defaultMessage: 'Public' },
  visibilityPublicHint: {
    id: 'collections.edit.visibility.public.hint',
    defaultMessage: 'Discoverable in search results and other areas where recommendations appear.',
  },
  visibilityUnlisted: { id: 'collections.edit.visibility.unlisted', defaultMessage: 'Unlisted' },
  visibilityUnlistedHint: {
    id: 'collections.edit.visibility.unlisted.hint',
    defaultMessage:
      'Visible to anyone with a link. Hidden from search results and recommendations.',
  },
  sensitive: { id: 'collections.edit.sensitive', defaultMessage: 'Mark as sensitive' },
  sensitiveHint: {
    id: 'collections.edit.sensitive.hint',
    defaultMessage:
      'Hides the collection’s description and accounts behind a content warning. The collection name will still be visible.',
  },
  manageAccounts: { id: 'collections.manage_accounts', defaultMessage: 'Manage accounts' },
  search: { id: 'lists.search', defaultMessage: 'Search among people you follow' },
  addAccount: { id: 'collections.account.add', defaultMessage: 'Add to collection' },
  removeAccount: { id: 'collections.account.remove', defaultMessage: 'Remove from collection' },
  removeHeading: {
    id: 'confirmations.remove_from_collection.heading',
    defaultMessage: 'Remove account from collection?',
  },
  removeMessage: {
    id: 'confirmations.remove_from_collection.message',
    defaultMessage: 'Are you sure you want to remove this account from this collection?',
  },
  removeConfirm: { id: 'confirmations.remove_from_collection.confirm', defaultMessage: 'Remove' },
  accountsCounter: {
    id: 'collections.accounts_counter',
    defaultMessage: 'Collection members ({count}/{max} accounts)',
  },
});

const normalizeTag = (value: string) => value.replace(/^#/u, '').trim();

const canAccountBeAdded = (account: Pick<AccountEntity, 'feature_approval'>) =>
  ['automatic', 'manual'].includes(account.feature_approval?.current_user ?? '');

const canAccountBeAddedByFollowers = (account: Pick<AccountEntity, 'feature_approval'>) =>
  !!account.feature_approval &&
  (account.feature_approval.automatic.includes('followers') ||
    account.feature_approval.manual.includes('followers'));

interface ICollectionMemberAccount {
  accountId: string;
  added: boolean;
  pending?: boolean;
  disabled?: boolean;
  onAdd: (accountId: string) => void;
  onRemove: (accountId: string) => void;
}

const CollectionMemberAccount: React.FC<ICollectionMemberAccount> = ({
  accountId,
  added,
  pending,
  disabled,
  onAdd,
  onRemove,
}) => {
  const { colors } = useTheme();
  const intl = useIntl();

  const { data: account } = useAccount(accountId, true);

  if (!account) return null;

  const addable = canAccountBeAdded(account);
  const mustFollow =
    !addable && canAccountBeAddedByFollowers(account) && !account.relationship?.following;

  let action;
  if (added || addable) {
    action = (
      <IconButton
        icon={iconHelper(added ? XIcon : PlusIcon)}
        mode={added ? 'contained-tonal' : 'outlined'}
        disabled={!added && disabled}
        onPress={() => {
          (added ? onRemove : onAdd)(accountId);
          haptics.selection();
        }}
        accessibilityLabel={intl.formatMessage(
          added ? messages.removeAccount : messages.addAccount,
        )}
      />
    );
  } else {
    action = (
      <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant }}>
        {mustFollow ? (
          <FormattedMessage
            id='collections.suggestions.must_follow'
            defaultMessage='Must follow first'
          />
        ) : (
          <FormattedMessage
            id='collections.suggestions.can_not_add'
            defaultMessage='Can’t be added'
          />
        )}
      </Text>
    );
  }

  return (
    <Account
      id={accountId}
      style={{ paddingVertical: 8 }}
      badge={
        pending ? (
          <Chip compact>
            <FormattedMessage id='collections.account.pending' defaultMessage='Pending' />
          </Chip>
        ) : undefined
      }
      action={action}
    />
  );
};

interface ICollectionAccounts {
  id: string;
}

const CollectionAccounts: React.FC<ICollectionAccounts> = ({ id }) => {
  const { colors } = useTheme();
  const intl = useIntl();

  const [searchValue, setSearchValue] = React.useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const { data: collection, isFetching } = useCollection(id);
  const { data: searchAccountIds = [], isFetching: isSearching } = useAccountSearch(
    debouncedSearchValue,
    { limit: 10 },
  );
  const { mutate: addItem } = useAddCollectionItem(id);
  const { mutate: removeItem } = useRemoveCollectionItem(id);

  const { max_items: maxItems } = useInstance().configuration.collections;

  const items = collection?.items ?? [];
  const hasMaxItems = items.length >= maxItems;
  const hasPendingItems = items.some((item) => item.state === 'pending');

  const searching = !!debouncedSearchValue.trim();

  const onAdd = (accountId: string) => {
    if (!hasMaxItems) addItem(accountId);
  };

  const onRemove = (accountId: string) => {
    const itemId = items.find((item) => item.account_id === accountId)?.id;
    if (!itemId) return;

    Alert.alert(
      intl.formatMessage(messages.removeHeading),
      intl.formatMessage(messages.removeMessage),
      [
        {
          text: intl.formatMessage(messages.cancel),
          style: 'cancel',
        },
        {
          text: intl.formatMessage(messages.removeConfirm),
          style: 'destructive',
          onPress: () => removeItem(itemId),
        },
      ],
    );
  };

  let note;
  if (searching && hasMaxItems) {
    note = (
      <FormattedMessage
        id='collections.accounts.max_reached'
        defaultMessage='You have added the maximum number of accounts'
      />
    );
  } else if (!searching && hasPendingItems) {
    note = (
      <FormattedMessage
        id='collections.pending_accounts.message'
        defaultMessage='Accounts may appear as pending when we’re awaiting a response from the user or their server. Only you can see pending accounts.'
      />
    );
  }

  let content;
  if (searching) {
    if (searchAccountIds.length)
      content = searchAccountIds.map((accountId) => (
        <CollectionMemberAccount
          key={accountId}
          accountId={accountId}
          added={items.some((item) => item.account_id === accountId)}
          disabled={hasMaxItems}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ));
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
  } else if (items.length) {
    content = items.map(
      (item) =>
        item.account_id && (
          <CollectionMemberAccount
            key={item.id}
            accountId={item.account_id}
            added
            pending={item.state === 'pending'}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ),
    );
  } else if (isFetching) {
    content = <ActivityIndicator style={{ marginVertical: 16 }} />;
  } else {
    content = (
      <EmptyMessage
        emptyMessageIcon={iconHelper(UsersIcon)}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.collection_accounts'
            defaultMessage='No one is in this collection yet. Use search to find accounts to feature. You can add up to {max} accounts.'
            values={{ max: maxItems }}
          />
        }
      />
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
        {searching
          ? intl.formatMessage(messages.addAccount)
          : intl.formatMessage(messages.accountsCounter, { count: items.length, max: maxItems })}
      </PaperList.Subheader>
      {note && (
        <Text variant='bodySmall' style={{ color: colors.onSurfaceVariant, marginBottom: 8 }}>
          {note}
        </Text>
      )}
      {content}
    </>
  );
};

interface IEditCollectionAccountsDialog {
  id: string;
  visible: boolean;
  onDismiss: () => void;
  onDismissCreateDialog: () => void;
}

const EditCollectionAccountsDialog: React.FC<IEditCollectionAccountsDialog> = ({
  id,
  visible,
  onDismiss,
  onDismissCreateDialog,
}) => {
  const intl = useIntl();

  const [closing, setClosing] = React.useState(false);

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      actions={[
        {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.back),
          onPress: () => setClosing(true),
          sheetOnly: true,
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
        {
          label: intl.formatMessage(messages.close),
          onPress: () => {
            setClosing(true);
          },
          dialogOnly: true,
        },
      ]}
      title={<FormattedMessage id='collections.manage_accounts' defaultMessage='Manage accounts' />}
    >
      <CollectionAccounts id={id} />
    </DialogOrSheet>
  );
};

interface ICreateCollectionDialog {
  id?: string;
  visible: boolean;
  onDismiss: () => void;
  backAction?: boolean;
}

const CreateCollectionDialog: React.FC<ICreateCollectionDialog> = ({
  id: initialId,
  visible,
  onDismiss,
  backAction,
}) => {
  const intl = useIntl();
  const { max_name_length: maxNameLength, max_description_length: maxDescriptionLength } =
    useInstance().configuration.collections;

  const [id, setId] = React.useState(initialId);
  const [closing, setClosing] = React.useState(false);
  const [accountsDialog, setAccountsDialog] = React.useState(false);

  const { data: collection } = useCollection(initialId);

  const [name, setName] = React.useState(collection?.name ?? '');
  const [description, setDescription] = React.useState(collection?.description ?? '');
  const [tagName, setTagName] = React.useState(collection?.tag?.name ?? '');
  const [language, setLanguage] = React.useState(collection?.language ?? '');
  const [discoverable, setDiscoverable] = React.useState(collection?.discoverable ?? true);
  const [sensitive, setSensitive] = React.useState(collection?.sensitive ?? false);

  const { mutate: createCollection, isPending: isPendingCreate } = useCreateCollection();
  const { mutate: updateCollection, isPending: isPendingUpdate } = useUpdateCollection(id || '');

  const isSubmitting = isPendingCreate || isPendingUpdate;

  const handleClose = () => setClosing(true);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const params = {
      name: name.trim(),
      description,
      tag_name: normalizeTag(tagName) || undefined,
      language: language || undefined,
      discoverable,
      sensitive,
    };

    if (id) {
      updateCollection(params, {
        onSuccess: () => {
          handleClose();
          toast.success(intl.formatMessage(messages.editSuccess));
        },
        onError: () => toast.error(intl.formatMessage(messages.editError)),
      });
    } else {
      createCollection(params, {
        onSuccess: (created) => {
          toast.success(intl.formatMessage(messages.createSuccess));
          setId(created.id);
          setAccountsDialog(true);
        },
        onError: () => toast.error(intl.formatMessage(messages.createError)),
      });
    }
  };

  const formItems: IListSections = [
    {
      items: [
        {
          type: 'select',
          label: intl.formatMessage(messages.language),
          active: language,
          onChange: setLanguage,
          options: [{ value: '', label: intl.formatMessage(messages.languageNone) }, ...languages],
        },
        {
          type: 'select',
          label: intl.formatMessage(messages.visibility),
          sublabel: intl.formatMessage(
            discoverable ? messages.visibilityPublicHint : messages.visibilityUnlistedHint,
          ),
          active: discoverable ? 'public' : 'unlisted',
          onChange: (value: 'public' | 'unlisted') => setDiscoverable(value === 'public'),
          options: [
            { value: 'public', label: intl.formatMessage(messages.visibilityPublic) },
            { value: 'unlisted', label: intl.formatMessage(messages.visibilityUnlisted) },
          ],
        },
        {
          type: 'toggle',
          label: intl.formatMessage(messages.sensitive),
          sublabel: intl.formatMessage(messages.sensitiveHint),
          active: sensitive,
          onPress: () => setSensitive((value) => !value),
        },
      ],
    },
  ];

  if (id) {
    formItems.push({
      items: [
        {
          type: 'button',
          label: intl.formatMessage(messages.manageAccounts),
          onPress: () => setAccountsDialog(true),
        },
      ],
    });
  }

  return (
    <>
      <DialogOrSheet
        visible={visible && !closing}
        handleDismiss={onDismiss}
        actions={[
          {
            icon: backAction ? 'arrow.left' : 'xmark',
            label: intl.formatMessage(messages.cancel),
            onPress: handleClose,
          },
          {
            icon: 'checkmark',
            label: intl.formatMessage(id ? messages.save : messages.create),
            onPress: handleSubmit,
            loading: isSubmitting,
            disabled: isSubmitting || !name.trim(),
            confirm: true,
          },
        ]}
        title={
          id ? (
            <FormattedMessage id='collections.edit' defaultMessage='Edit collection' />
          ) : (
            <FormattedMessage id='collections.create' defaultMessage='Create collection' />
          )
        }
      >
        <View style={{ gap: 8 }}>
          <TextInput
            variant='outlined'
            label={intl.formatMessage(messages.name)}
            value={name}
            onChangeText={setName}
            maxLength={maxNameLength}
            supportingText={intl.formatMessage(messages.charactersRemaining, {
              count: maxNameLength - name.length,
            })}
          />
          <TextInput
            variant='outlined'
            label={intl.formatMessage(messages.description)}
            value={description}
            onChangeText={setDescription}
            maxLength={maxDescriptionLength}
            multiline
            numberOfLines={3}
            supportingText={intl.formatMessage(messages.charactersRemaining, {
              count: maxDescriptionLength - description.length,
            })}
            style={{ minHeight: 80 }}
          />
          <TextInput
            variant='outlined'
            label={intl.formatMessage(messages.topic)}
            value={tagName}
            onChangeText={(text) =>
              setTagName(!text.trim() || text.startsWith('#') ? text : `#${text}`)
            }
            maxLength={40}
            autoCapitalize='none'
            autoCorrect={false}
            supportingText={intl.formatMessage(messages.topicHint)}
          />
        </View>

        <List style={{ marginHorizontal: -16 }} sections={formItems} />
      </DialogOrSheet>
      {accountsDialog && id && (
        <EditCollectionAccountsDialog
          id={id}
          visible
          onDismiss={() => setAccountsDialog(false)}
          onDismissCreateDialog={handleClose}
        />
      )}
    </>
  );
};

export { CreateCollectionDialog };
