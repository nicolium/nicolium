import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import List, { ListItem } from '@/components/list';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Spinner from '@/components/ui/spinner';
import Textarea from '@/components/ui/textarea';
import Toggle from '@/components/ui/toggle';
import Search from '@/modals/list-editor-modal/components/search';
import { useAccount } from '@/queries/accounts/use-account';
import {
  MAX_COLLECTION_ACCOUNT_COUNT,
  useAddCollectionItem,
  useCollection,
  useCreateCollection,
  useRemoveCollectionItem,
  useUpdateCollection,
} from '@/queries/accounts/use-collections';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';
import { languages } from '@/utils/languages';

import type { BaseModalProps } from '@/modals/modal-root';
import type { Account } from 'pl-api';

const messages = defineMessages({
  createSuccess: { id: 'collections.create.success', defaultMessage: 'Collection created' },
  editSuccess: { id: 'collections.edit.success', defaultMessage: 'Collection updated' },
  createError: { id: 'collections.create.error', defaultMessage: 'Failed to create collection' },
  editError: { id: 'collections.edit.error', defaultMessage: 'Failed to update collection' },
  addAccount: { id: 'collections.account.add', defaultMessage: 'Add to collection' },
  removeAccount: { id: 'collections.account.remove', defaultMessage: 'Remove from collection' },
  languageNone: { id: 'collections.edit.language.none', defaultMessage: 'None' },
  visibilityPublic: { id: 'collections.edit.visibility.public', defaultMessage: 'Public' },
  visibilityUnlisted: { id: 'collections.edit.visibility.unlisted', defaultMessage: 'Unlisted' },
});

type Tab = 'details' | 'accounts';

const normalizeTag = (value: string) => value.replace(/^#/u, '').trim();

const canAccountBeAdded = (account: Pick<Account, 'feature_approval'>) =>
  ['automatic', 'manual'].includes(account.feature_approval?.current_user ?? '');

const canAccountBeAddedByFollowers = (account: Pick<Account, 'feature_approval'>) =>
  !!account.feature_approval &&
  (account.feature_approval.automatic.includes('followers') ||
    account.feature_approval.manual.includes('followers'));

interface ICollectionSuggestion {
  accountId: string;
  added: boolean;
  disabled: boolean;
  onAdd: (accountId: string) => void;
  onRemove: (accountId: string) => void;
}

const CollectionSuggestion: React.FC<ICollectionSuggestion> = ({
  accountId,
  added,
  disabled,
  onAdd,
  onRemove,
}) => {
  const intl = useIntl();
  const { data: account } = useAccount(accountId, true);

  if (!account) {
    return null;
  }

  const addable = canAccountBeAdded(account);
  const mustFollow =
    !addable && canAccountBeAddedByFollowers(account) && !account.relationship?.following;

  let action;

  if (added) {
    action = (
      <IconButton
        src={iconX}
        title={intl.formatMessage(messages.removeAccount)}
        onClick={() => onRemove(accountId)}
      />
    );
  } else if (addable) {
    action = (
      <IconButton
        src={iconPlus}
        title={intl.formatMessage(messages.addAccount)}
        disabled={disabled}
        onClick={() => onAdd(accountId)}
      />
    );
  } else {
    action = (
      <span className='collection-editor-modal__unavailable'>
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
      </span>
    );
  }

  return (
    <div className='list-editor-modal__account'>
      <div>
        <AccountContainer id={accountId} withRelationship={false} />
      </div>
      {action}
    </div>
  );
};

interface ICollectionAccountsForm {
  collectionId: string;
}

const CollectionAccountsForm: React.FC<ICollectionAccountsForm> = ({ collectionId }) => {
  const intl = useIntl();
  const [searchValue, setSearchValue] = useState('');

  const { data: collection, isFetching } = useCollection(collectionId);
  const { data: searchAccountIds = [] } = useAccountSearch(searchValue, { limit: 5 });

  const { openModal } = useModalsActions();
  const { mutate: addItem } = useAddCollectionItem(collectionId);
  const { mutate: removeItem } = useRemoveCollectionItem(collectionId);

  const items = collection?.items ?? [];
  const hasMaxItems = items.length >= MAX_COLLECTION_ACCOUNT_COUNT;
  const hasPendingItems = items.some((item) => item.state === 'pending');

  const onAdd = (accountId: string) => {
    if (!hasMaxItems) {
      addItem(accountId);
    }
  };

  const onRemove = (accountId: string) => {
    const itemId = items.find((item) => item.account_id === accountId)?.id;
    if (!itemId) return;

    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.remove_from_collection.heading'
          defaultMessage='Remove account from collection?'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.remove_from_collection.message'
          defaultMessage='Are you sure you want to remove this account from this collection?'
        />
      ),
      confirm: (
        <FormattedMessage
          id='confirmations.remove_from_collection.confirm'
          defaultMessage='Remove'
        />
      ),
      onConfirm: () => removeItem(itemId),
    });
  };

  return (
    <div className='list-members-modal__form__container'>
      {items.length > 0 ? (
        <div className='list-members-modal__form'>
          <CardHeader>
            <CardTitle
              title={
                <FormattedMessage
                  id='collections.accounts_counter'
                  defaultMessage='Colection members ({count}/{max} accounts)'
                  values={{ count: items.length, max: MAX_COLLECTION_ACCOUNT_COUNT }}
                />
              }
            />
          </CardHeader>
          {hasPendingItems && (
            <p className='collection-editor-modal__pending-note'>
              <FormattedMessage
                id='collections.pending_accounts.message'
                defaultMessage='Accounts may appear as pending when we’re awaiting a response from the user or their server. Only you can see pending accounts.'
              />
            </p>
          )}
          <div className='list-members-modal__form__accounts'>
            {items.map((item) =>
              item.account_id ? (
                <div key={item.id} className='list-editor-modal__account'>
                  <div className='collection-editor-modal__member'>
                    <AccountContainer id={item.account_id} withRelationship={false} />
                    {item.state === 'pending' && (
                      <span className='collection-editor-modal__pending-badge'>
                        <FormattedMessage
                          id='collections.account.pending'
                          defaultMessage='Pending'
                        />
                      </span>
                    )}
                  </div>
                  <IconButton
                    src={iconX}
                    title={intl.formatMessage(messages.removeAccount)}
                    onClick={() => onRemove(item.account_id!)}
                  />
                </div>
              ) : null,
            )}
          </div>
        </div>
      ) : isFetching ? (
        <div className='list-members-modal__form__pending'>
          <Spinner />
        </div>
      ) : (
        <div className='list-members-modal__form__pending'>
          <p>
            <FormattedMessage
              id='empty_column.collection_accounts'
              defaultMessage='No one is in this collection yet. Use search to find accounts to feature. You can add up to {max} accounts.'
              values={{ max: MAX_COLLECTION_ACCOUNT_COUNT }}
            />
          </p>
        </div>
      )}

      <div>
        <CardHeader>
          <CardTitle
            title={
              <FormattedMessage id='collections.account.add' defaultMessage='Add to collection' />
            }
          />
        </CardHeader>
        {hasMaxItems && (
          <p className='collection-editor-modal__pending-note'>
            <FormattedMessage
              id='collections.accounts.max_reached'
              defaultMessage='You have added the maximum number of accounts'
            />
          </p>
        )}
        <Search value={searchValue} onSubmit={setSearchValue} />
        <div className='list-members-modal__form__accounts'>
          {searchAccountIds.map((accountId) => (
            <CollectionSuggestion
              key={accountId}
              accountId={accountId}
              added={items.some((item) => item.account_id === accountId)}
              disabled={hasMaxItems}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface IEditCollectionForm {
  collectionId?: string;
  onCreated: (collectionId: string) => void;
  onTabChange: (tab: Tab) => void;
}

const EditCollectionForm: React.FC<IEditCollectionForm> = ({
  collectionId,
  onCreated,
  onTabChange,
}) => {
  const intl = useIntl();

  const { data: collection } = useCollection(collectionId);
  const { mutate: updateCollection, isPending: updateDisabled } = useUpdateCollection(
    collectionId!,
  );
  const { mutate: createCollection, isPending: createDisabled } = useCreateCollection();

  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [tagName, setTagName] = useState(collection?.tag?.name ?? '');
  const [language, setLanguage] = useState(collection?.language ?? '');
  const [discoverable, setDiscoverable] = useState(collection?.discoverable ?? true);
  const [sensitive, setSensitive] = useState(collection?.sensitive ?? false);

  const disabled = (collectionId ? updateDisabled : createDisabled) || !name.trim();

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleUpdate = () => {
    const params = {
      name,
      description,
      tag_name: normalizeTag(tagName) || undefined,
      language: language || undefined,
      discoverable,
      sensitive,
    };

    if (collectionId) {
      updateCollection(params, {
        onSuccess: () => {
          toast.success(messages.editSuccess);
        },
        onError: () => {
          toast.error(messages.editError);
        },
      });
    } else {
      createCollection(params, {
        onSuccess: (created) => {
          toast.success(messages.createSuccess);
          onCreated(created.id);
        },
        onError: () => {
          toast.error(messages.createError);
        },
      });
    }
  };

  const languageItems = Object.entries(languages).reduce(
    (acc, [code, title]) => {
      acc[code] = title;
      return acc;
    },
    { '': intl.formatMessage(messages.languageNone) } as Record<string, string>,
  );

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        labelText={<FormattedMessage id='collections.edit.name' defaultMessage='Name' />}
        hintText={
          <FormattedMessage id='collections.edit.name.hint' defaultMessage='40 characters limit' />
        }
      >
        <Input
          type='text'
          value={name}
          maxLength={40}
          required
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </FormGroup>

      <FormGroup
        labelText={
          <FormattedMessage id='collections.edit.description' defaultMessage='Description' />
        }
        hintText={
          <FormattedMessage
            id='collections.edit.description.hint'
            defaultMessage='100 characters limit'
          />
        }
      >
        <Textarea
          value={description}
          maxLength={100}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </FormGroup>

      <FormGroup
        labelText={<FormattedMessage id='collections.edit.topic' defaultMessage='Topic' />}
        hintText={
          <FormattedMessage
            id='collections.edit.topic.hint'
            defaultMessage='Add a hashtag that helps others understand the main topic of this collection.'
          />
        }
      >
        <Input
          type='text'
          value={tagName}
          maxLength={40}
          autoCapitalize='off'
          autoCorrect='off'
          onChange={(e) => {
            setTagName(e.target.value);
          }}
        />
      </FormGroup>

      <FormGroup
        labelText={<FormattedMessage id='collections.edit.language' defaultMessage='Language' />}
      >
        <SelectDropdown
          items={languageItems}
          defaultValue={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
      </FormGroup>

      <FormGroup
        labelText={
          <FormattedMessage id='collections.edit.visibility' defaultMessage='Visibility' />
        }
        hintText={
          discoverable ? (
            <FormattedMessage
              id='collections.edit.visibility.public.hint'
              defaultMessage='Discoverable in search results and other areas where recommendations appear.'
            />
          ) : (
            <FormattedMessage
              id='collections.edit.visibility.unlisted.hint'
              defaultMessage='Visible to anyone with a link. Hidden from search results and recommendations.'
            />
          )
        }
      >
        <SelectDropdown
          items={{
            public: intl.formatMessage(messages.visibilityPublic),
            unlisted: intl.formatMessage(messages.visibilityUnlisted),
          }}
          defaultValue={discoverable ? 'public' : 'unlisted'}
          onChange={(e) => setDiscoverable(e.target.value === 'public')}
        />
      </FormGroup>

      <List>
        <ListItem
          label={
            <FormattedMessage id='collections.edit.sensitive' defaultMessage='Mark as sensitive' />
          }
          hint={
            <FormattedMessage
              id='collections.edit.sensitive.hint'
              defaultMessage='Hides the collection’s description and accounts behind a content warning. The collection name will still be visible.'
            />
          }
        >
          <Toggle checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} />
        </ListItem>
        {collectionId && (
          <ListItem
            label={
              <FormattedMessage id='collections.manage_accounts' defaultMessage='Manage accounts' />
            }
            onClick={() => {
              onTabChange('accounts');
            }}
          />
        )}
      </List>

      <FormActions>
        <button
          className='collection-editor-modal__submit'
          type='button'
          onClick={handleUpdate}
          disabled={disabled}
        >
          {collectionId ? (
            <FormattedMessage id='collections.edit.save' defaultMessage='Save collection' />
          ) : (
            <FormattedMessage id='collections.create.save' defaultMessage='Create collection' />
          )}
        </button>
      </FormActions>
    </Form>
  );
};

interface CollectionEditorModalProps {
  collectionId?: string;
  tab?: Tab;
}

const CollectionEditorModal: React.FC<BaseModalProps & CollectionEditorModalProps> = ({
  collectionId: initialCollectionId,
  tab: initialTab,
  onClose,
}) => {
  const [collectionId, setCollectionId] = useState<string | undefined>(initialCollectionId);
  const [tab, setTab] = useState<Tab>(initialTab ?? 'details');

  const { isFetched } = useCollection(collectionId);

  const onClickClose = () => {
    onClose('COLLECTION_EDITOR');
  };

  const handleCreated = (createdCollectionId: string) => {
    setCollectionId(createdCollectionId);
    setTab('accounts');
  };

  return (
    <Modal
      title={
        collectionId ? (
          tab === 'accounts' ? (
            <FormattedMessage id='collections.manage_accounts' defaultMessage='Manage accounts' />
          ) : (
            <FormattedMessage id='collections.edit' defaultMessage='Edit collection' />
          )
        ) : (
          <FormattedMessage id='collections.create' defaultMessage='Create collection' />
        )
      }
      onClose={onClickClose}
      onBack={
        tab === 'accounts'
          ? () => {
              setTab('details');
            }
          : undefined
      }
    >
      {!isFetched && collectionId ? (
        <Spinner />
      ) : tab === 'accounts' && collectionId ? (
        <CollectionAccountsForm collectionId={collectionId} />
      ) : (
        <EditCollectionForm
          collectionId={collectionId}
          onCreated={handleCreated}
          onTabChange={setTab}
        />
      )}
    </Modal>
  );
};

export { CollectionEditorModal as default, type CollectionEditorModalProps };
