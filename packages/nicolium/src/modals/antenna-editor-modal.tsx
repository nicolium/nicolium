import iconX from '@phosphor-icons/core/regular/x.svg';
import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';
import {
  useAddAccountsToAntenna,
  useAddDomainsToAntenna,
  useAddExcludedAccountsToAntenna,
  useAddExcludedDomainsToAntenna,
  useAddExcludedKeywordsToAntenna,
  useAddExcludedTagsToAntenna,
  useAddKeywordsToAntenna,
  useAddTagsToAntenna,
  useAntenna,
  useAntennaAccounts,
  useAntennaDomains,
  useAntennaExcludedAccounts,
  useAntennaKeywords,
  useAntennaTags,
  useCreateAntenna,
  useRemoveDomainsFromAntenna,
  useRemoveAccountsFromAntenna,
  useRemoveExcludedDomainsFromAntenna,
  useRemoveExcludedAccountsFromAntenna,
  useRemoveExcludedKeywordsFromAntenna,
  useRemoveExcludedTagsFromAntenna,
  useRemoveKeywordsFromAntenna,
  useRemoveTagsFromAntenna,
  useUpdateAntenna,
} from '@/queries/accounts/use-antennas';
import { useLists } from '@/queries/accounts/use-lists';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import Account from './list-editor-modal/components/account';
import Search from './list-editor-modal/components/search';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  createSuccess: { id: 'antennas.create.success', defaultMessage: 'Antenna created successfully' },
  editSuccess: { id: 'antennas.edit.success', defaultMessage: 'Antenna updated successfully' },
  createError: { id: 'antennas.create.error', defaultMessage: 'Error creating antenna' },
  editError: { id: 'antennas.edit.error', defaultMessage: 'Error updating antenna' },
  removeDomain: { id: 'antennas.domain.remove', defaultMessage: 'Remove domain' },
  removeKeyword: { id: 'antennas.keyword.remove', defaultMessage: 'Remove keyword' },
  removeTag: { id: 'antennas.tag.remove', defaultMessage: 'Remove tag' },
  modeStl: { id: 'antennas.edit.mode.stl', defaultMessage: 'Social timeline mode' },
  modeLtl: { id: 'antennas.edit.mode.ltl', defaultMessage: 'Local timeline mode' },
  modeFiltering: { id: 'antennas.edit.mode.filtering', defaultMessage: 'Filtering' },
  destinationHome: {
    id: 'antennas.edit.destination.home',
    defaultMessage: 'Insert to home timeline',
  },
  destinationList: { id: 'antennas.edit.destination.list', defaultMessage: 'Insert to list' },
  destinationAntenna: {
    id: 'antennas.edit.destination.antenna',
    defaultMessage: 'Antenna timeline only',
  },
  listPlaceholder: { id: 'antennas.edit.list.select', defaultMessage: 'Select list' },
});

type Tab = 'info' | 'accounts' | 'excludedAccounts' | 'domains' | 'keywords' | 'tags';

interface IAntennaAccountsForm {
  antennaId: string;
  excluded?: boolean;
}

const AntennaAccountsForm: React.FC<IAntennaAccountsForm> = ({ antennaId, excluded = false }) => {
  const [searchValue, setSearchValue] = useState('');

  const { data: accountIds = [] as Array<string>, isFetching: isFetchingAccounts } =
    useAntennaAccounts(antennaId);
  const { data: excludedAccountIds = [] as Array<string>, isFetching: isFetchingExcludedAccounts } =
    useAntennaExcludedAccounts(antennaId);
  const { data: searchAccountIds = [] } = useAccountSearch(searchValue, {
    following: true,
    limit: 5,
  });

  const { mutate: addToAntenna } = useAddAccountsToAntenna(antennaId);
  const { mutate: removeFromAntenna } = useRemoveAccountsFromAntenna(antennaId);
  const { mutate: addToExcludedAntenna } = useAddExcludedAccountsToAntenna(antennaId);
  const { mutate: removeFromExcludedAntenna } = useRemoveExcludedAccountsFromAntenna(antennaId);

  const selectedAccountIds = excluded ? excludedAccountIds : accountIds;

  const onAdd = (accountId: string) => {
    if (excluded) {
      addToExcludedAntenna([accountId]);
    } else {
      addToAntenna([accountId]);
    }
  };

  const onRemove = (accountId: string) => {
    if (excluded) {
      removeFromExcludedAntenna([accountId]);
    } else {
      removeFromAntenna([accountId]);
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      {selectedAccountIds.length > 0 ? (
        <div className='min-h-24'>
          <CardHeader>
            <CardTitle
              title={
                excluded ? (
                  <FormattedMessage
                    id='antennas.account.excluded.list'
                    defaultMessage='Excluded accounts list'
                  />
                ) : (
                  <FormattedMessage
                    id='antennas.account.list'
                    defaultMessage='Antenna members list'
                  />
                )
              }
            />
          </CardHeader>
          <div className='max-h-48 overflow-y-auto'>
            {selectedAccountIds.map((accountId) => (
              <Account
                key={accountId}
                accountId={accountId}
                added={selectedAccountIds.includes(accountId)}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      ) : (excluded ? isFetchingExcludedAccounts : isFetchingAccounts) ? (
        <div className='flex min-h-24 items-center justify-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex min-h-24 items-center justify-center'>
          <Text theme='muted' size='sm' align='center'>
            {excluded ? (
              <FormattedMessage
                id='empty_column.antenna_excluded_accounts'
                defaultMessage='There are no excluded accounts in this antenna. Use search to find users to exclude.'
              />
            ) : (
              <FormattedMessage
                id='empty_column.antenna_accounts'
                defaultMessage='There are no accounts in this antenna. Use search to find users to add.'
              />
            )}
          </Text>
        </div>
      )}

      <div>
        <CardHeader>
          <CardTitle
            title={
              excluded ? (
                <FormattedMessage
                  id='antennas.account.excluded.add'
                  defaultMessage='Add to excluded accounts'
                />
              ) : (
                <FormattedMessage id='antennas.account.add' defaultMessage='Add to antenna' />
              )
            }
          />
        </CardHeader>
        <Search value={searchValue} onSubmit={setSearchValue} />
        <div className='max-h-48 overflow-y-auto'>
          {searchAccountIds.map((accountId) => (
            <Account
              key={accountId}
              accountId={accountId}
              added={selectedAccountIds.includes(accountId)}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface IAntennaValuesForm {
  values: Array<string>;
  excludedValues: Array<string>;
  isFetching: boolean;
  addTitle: React.ReactNode;
  listTitle: React.ReactNode;
  addExcludedTitle: React.ReactNode;
  listExcludedTitle: React.ReactNode;
  emptyValues: React.ReactNode;
  emptyExcludedValues: React.ReactNode;
  removeTitle?: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onAddExcluded: (value: string) => void;
  onRemoveExcluded: (value: string) => void;
}

const AntennaValuesForm: React.FC<IAntennaValuesForm> = ({
  values,
  excludedValues,
  isFetching,
  addTitle,
  listTitle,
  addExcludedTitle,
  listExcludedTitle,
  emptyValues,
  emptyExcludedValues,
  removeTitle,
  onAdd,
  onRemove,
  onAddExcluded,
  onRemoveExcluded,
}) => {
  const [value, setValue] = useState('');
  const [excludedValue, setExcludedValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    onAdd(trimmed);
    setValue('');
  };

  const handleAddExcluded = () => {
    const trimmed = excludedValue.trim();
    if (!trimmed) {
      return;
    }

    onAddExcluded(trimmed);
    setExcludedValue('');
  };

  return (
    <div className='flex flex-col gap-2'>
      {values.length > 0 ? (
        <div>
          <CardHeader>
            <CardTitle title={listTitle} />
          </CardHeader>
          <div className='max-h-48 overflow-y-auto'>
            {values.map((item) => (
              <div key={item} className='flex items-center justify-between gap-2 p-2.5'>
                <Text>{item}</Text>
                <IconButton
                  src={iconX}
                  className='text-gray-400 hover:text-gray-600'
                  iconClassName='h-5 w-5'
                  title={removeTitle}
                  onClick={() => onRemove(item)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : isFetching ? (
        <div className='flex min-h-24 items-center justify-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex min-h-24 items-center justify-center'>
          <Text theme='muted' size='sm' align='center'>
            {emptyValues}
          </Text>
        </div>
      )}

      <Form onSubmit={handleAdd}>
        <CardHeader>
          <CardTitle title={addTitle} />
        </CardHeader>
        <div className='flex gap-2'>
          <Input
            type='text'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            outerClassName='grow'
          />
          <Button onClick={handleAdd}>
            <FormattedMessage id='common.add' defaultMessage='Add' />
          </Button>
        </div>
      </Form>

      {excludedValues.length > 0 ? (
        <div>
          <CardHeader>
            <CardTitle title={listExcludedTitle} />
          </CardHeader>
          <div className='max-h-48 overflow-y-auto'>
            {excludedValues.map((item) => (
              <div key={item} className='flex items-center justify-between gap-2 p-2.5'>
                <Text>{item}</Text>
                <IconButton
                  src={iconX}
                  className='text-gray-400 hover:text-gray-600'
                  iconClassName='h-5 w-5'
                  title={removeTitle}
                  onClick={() => onRemoveExcluded(item)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : isFetching ? (
        <div className='flex min-h-24 items-center justify-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex min-h-24 items-center justify-center'>
          <Text theme='muted' size='sm' align='center'>
            {emptyExcludedValues}
          </Text>
        </div>
      )}

      <Form onSubmit={handleAddExcluded}>
        <CardHeader>
          <CardTitle title={addExcludedTitle} />
        </CardHeader>
        <div className='flex gap-2'>
          <Input
            type='text'
            value={excludedValue}
            onChange={(e) => setExcludedValue(e.target.value)}
            outerClassName='grow'
          />
          <Button onClick={handleAddExcluded}>
            <FormattedMessage id='common.add' defaultMessage='Add' />
          </Button>
        </div>
      </Form>
    </div>
  );
};

interface IAntennaStringForm {
  antennaId: string;
}

const AntennaDomainsForm: React.FC<IAntennaStringForm> = ({ antennaId }) => {
  const intl = useIntl();
  const { data, isFetching } = useAntennaDomains(antennaId);
  const { mutate: addDomains } = useAddDomainsToAntenna(antennaId);
  const { mutate: removeDomains } = useRemoveDomainsFromAntenna(antennaId);
  const { mutate: addExcludedDomains } = useAddExcludedDomainsToAntenna(antennaId);
  const { mutate: removeExcludedDomains } = useRemoveExcludedDomainsFromAntenna(antennaId);

  return (
    <AntennaValuesForm
      values={data?.domains ?? []}
      excludedValues={data?.exclude_domains ?? []}
      isFetching={isFetching}
      addTitle={<FormattedMessage id='antennas.domain.add' defaultMessage='Add domain' />}
      listTitle={<FormattedMessage id='antennas.domains' defaultMessage='Domains' />}
      addExcludedTitle={
        <FormattedMessage id='antennas.domain.excluded.add' defaultMessage='Add excluded domain' />
      }
      listExcludedTitle={
        <FormattedMessage id='antennas.domains.excluded' defaultMessage='Excluded domains' />
      }
      removeTitle={intl.formatMessage(messages.removeDomain)}
      emptyValues={
        <FormattedMessage
          id='empty_column.antenna_domains'
          defaultMessage='There are no domains in this antenna. Add one below.'
        />
      }
      emptyExcludedValues={
        <FormattedMessage
          id='empty_column.antenna_excluded_domains'
          defaultMessage='There are no excluded domains in this antenna. Add one below.'
        />
      }
      onAdd={(value) => addDomains([value])}
      onRemove={(value) => removeDomains([value])}
      onAddExcluded={(value) => addExcludedDomains([value])}
      onRemoveExcluded={(value) => removeExcludedDomains([value])}
    />
  );
};

const AntennaKeywordsForm: React.FC<IAntennaStringForm> = ({ antennaId }) => {
  const intl = useIntl();
  const { data, isFetching } = useAntennaKeywords(antennaId);
  const { mutate: addKeywords } = useAddKeywordsToAntenna(antennaId);
  const { mutate: removeKeywords } = useRemoveKeywordsFromAntenna(antennaId);
  const { mutate: addExcludedKeywords } = useAddExcludedKeywordsToAntenna(antennaId);
  const { mutate: removeExcludedKeywords } = useRemoveExcludedKeywordsFromAntenna(antennaId);

  return (
    <AntennaValuesForm
      values={data?.keywords ?? []}
      excludedValues={data?.exclude_keywords ?? []}
      isFetching={isFetching}
      listTitle={<FormattedMessage id='antennas.keywords' defaultMessage='Keywords' />}
      addTitle={<FormattedMessage id='antennas.keyword.add' defaultMessage='Add keyword' />}
      listExcludedTitle={
        <FormattedMessage id='antennas.keywords.excluded' defaultMessage='Excluded keywords' />
      }
      addExcludedTitle={
        <FormattedMessage
          id='antennas.keyword.excluded.add'
          defaultMessage='Add excluded keyword'
        />
      }
      removeTitle={intl.formatMessage(messages.removeKeyword)}
      emptyValues={
        <FormattedMessage
          id='empty_column.antenna_keywords'
          defaultMessage='There are no keywords in this antenna. Add one below.'
        />
      }
      emptyExcludedValues={
        <FormattedMessage
          id='empty_column.antenna_excluded_keywords'
          defaultMessage='There are no excluded keywords in this antenna. Add one below.'
        />
      }
      onAdd={(value) => addKeywords([value])}
      onRemove={(value) => removeKeywords([value])}
      onAddExcluded={(value) => addExcludedKeywords([value])}
      onRemoveExcluded={(value) => removeExcludedKeywords([value])}
    />
  );
};

const AntennaTagsForm: React.FC<IAntennaStringForm> = ({ antennaId }) => {
  const intl = useIntl();
  const { data, isFetching } = useAntennaTags(antennaId);
  const { mutate: addTags } = useAddTagsToAntenna(antennaId);
  const { mutate: removeTags } = useRemoveTagsFromAntenna(antennaId);
  const { mutate: addExcludedTags } = useAddExcludedTagsToAntenna(antennaId);
  const { mutate: removeExcludedTags } = useRemoveExcludedTagsFromAntenna(antennaId);

  return (
    <AntennaValuesForm
      values={data?.tags ?? []}
      excludedValues={data?.exclude_tags ?? []}
      isFetching={isFetching}
      listTitle={<FormattedMessage id='antennas.tags' defaultMessage='Tags' />}
      addTitle={<FormattedMessage id='antennas.tag.add' defaultMessage='Add tag' />}
      listExcludedTitle={
        <FormattedMessage id='antennas.tags.excluded' defaultMessage='Excluded tags' />
      }
      addExcludedTitle={
        <FormattedMessage id='antennas.tag.excluded.add' defaultMessage='Add excluded tag' />
      }
      removeTitle={intl.formatMessage(messages.removeTag)}
      emptyValues={
        <FormattedMessage
          id='empty_column.antenna_tags'
          defaultMessage='There are no tags in this antenna. Add one below.'
        />
      }
      emptyExcludedValues={
        <FormattedMessage
          id='empty_column.antenna_excluded_tags'
          defaultMessage='There are no excluded tags in this antenna. Add one below.'
        />
      }
      onAdd={(value) => addTags([value])}
      onRemove={(value) => removeTags([value])}
      onAddExcluded={(value) => addExcludedTags([value])}
      onRemoveExcluded={(value) => removeExcludedTags([value])}
    />
  );
};

interface IEditAntennaForm {
  antennaId?: string;
  setAntennaId: (id: string | undefined) => void;
  onTabChange: (tab: Tab) => void;
}

const EditAntennaForm: React.FC<IEditAntennaForm> = ({ antennaId, onTabChange }) => {
  const intl = useIntl();
  const { closeModal } = useModalsActions();

  const { data: antenna } = useAntenna(antennaId);
  const { mutate: updateAntenna, isPending: updateDisabled } = useUpdateAntenna(antennaId!);
  const { mutate: createAntenna, isPending: createDisabled } = useCreateAntenna();

  const { data: lists } = useLists();

  const [title, setTitle] = useState(antenna ? antenna.title : '');
  const [ltl, setLtl] = useState(antenna ? antenna.ltl : false);
  const [stl, setStl] = useState(antenna ? antenna.stl : false);
  const [insertFeeds, setInsertFeeds] = useState(antenna ? antenna.insert_feeds : false);
  const [withMediaOnly, setWithMediaOnly] = useState(antenna ? antenna.with_media_only : false);
  const [ignoreReblog, setIgnoreReblog] = useState(antenna ? antenna.ignore_reblog : false);
  const [favourite, setFavourite] = useState(antenna ? antenna.favourite : false);
  const [listId, setListId] = useState(antenna?.list?.id || undefined);

  const disabled = (antennaId ? updateDisabled : createDisabled) || listId === '';

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleUpdate = () => {
    (antennaId ? updateAntenna : createAntenna)(
      {
        title,
        stl,
        ltl,
        insert_feeds: insertFeeds,
        with_media_only: withMediaOnly,
        ignore_reblog: ignoreReblog,
        favourite,
        list_id: listId,
      },
      {
        onSuccess: () => {
          toast.success(
            intl.formatMessage(antennaId ? messages.editSuccess : messages.createSuccess),
          );
          closeModal('ANTENNA_EDITOR');
        },
        onError: () => {
          toast.error(intl.formatMessage(antennaId ? messages.editError : messages.createError));
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        labelText={<FormattedMessage id='antennas.edit.title' defaultMessage='Antenna title' />}
      >
        <Input
          outerClassName='grow'
          type='text'
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </FormGroup>
      <FormGroup labelText={<FormattedMessage id='antennas.edit.mode' defaultMessage='Mode' />}>
        <SelectDropdown
          items={{
            stl: intl.formatMessage(messages.modeStl),
            ltl: intl.formatMessage(messages.modeLtl),
            filtering: intl.formatMessage(messages.modeFiltering),
          }}
          defaultValue={stl ? 'stl' : ltl ? 'ltl' : 'filtering'}
          onChange={(e) => {
            const value = e.target.value;
            setStl(value === 'stl');
            setLtl(value === 'ltl');
          }}
        />
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='antennas.edit.destination' defaultMessage='Destination' />}
      >
        <SelectDropdown
          items={{
            home: intl.formatMessage(messages.destinationHome),
            list: intl.formatMessage(messages.destinationList),
            antenna: intl.formatMessage(messages.destinationAntenna),
          }}
          defaultValue={insertFeeds ? 'home' : listId ? 'list' : 'antenna'}
          onChange={(e) => {
            const value = e.target.value;
            setInsertFeeds(value === 'home');
            if (value === 'list') {
              setListId('');
            } else {
              setListId(undefined);
            }
          }}
        />
      </FormGroup>
      {listId !== undefined && (
        <FormGroup
          labelText={<FormattedMessage id='antennas.edit.list' defaultMessage='Target list' />}
        >
          <SelectDropdown
            items={
              lists
                ? lists.reduce(
                    (acc, list) => {
                      acc[list.id] = list.title;
                      return acc;
                    },
                    {
                      '': intl.formatMessage(messages.listPlaceholder),
                    } as Record<string, string>,
                  )
                : {}
            }
            defaultValue={listId}
            onChange={(e) => setListId(e.target.value)}
          />
        </FormGroup>
      )}
      <List>
        <ListItem
          label={
            <FormattedMessage id='antennas.edit.with_media_only' defaultMessage='Media only' />
          }
          hint={
            <FormattedMessage
              id='antennas.edit.with_media_only.hint'
              defaultMessage='Only include posts with media attachments'
            />
          }
        >
          <Toggle checked={withMediaOnly} onChange={(e) => setWithMediaOnly(e.target.checked)} />
        </ListItem>
        <ListItem
          label={
            <FormattedMessage id='antennas.edit.ignore_reblogs' defaultMessage='Ignore reblogs' />
          }
          hint={
            <FormattedMessage
              id='antennas.edit.ignore_reblogs.hint'
              defaultMessage='Reblogs will not be included in the antenna'
            />
          }
        >
          <Toggle checked={ignoreReblog} onChange={(e) => setIgnoreReblog(e.target.checked)} />
        </ListItem>
        <ListItem
          label={<FormattedMessage id='antennas.edit.favourite' defaultMessage='Favourite' />}
          hint={
            <FormattedMessage
              id='antennas.edit.favourite.hint'
              defaultMessage='The antenna will be marked as favourite (not used by Nicolium yet)'
            />
          }
        >
          <Toggle checked={favourite} onChange={(e) => setFavourite(e.target.checked)} />
        </ListItem>
        {antennaId && (
          <>
            <ListItem
              label={
                <FormattedMessage
                  id='antennas.manage_accounts'
                  defaultMessage='Manage antenna accounts'
                />
              }
              onClick={() => {
                onTabChange('accounts');
              }}
            />
            <ListItem
              label={
                <FormattedMessage
                  id='antennas.manage_excluded_accounts'
                  defaultMessage='Manage excluded accounts'
                />
              }
              onClick={() => {
                onTabChange('excludedAccounts');
              }}
            />
            <ListItem
              label={
                <FormattedMessage id='antennas.manage_domains' defaultMessage='Manage domains' />
              }
              onClick={() => {
                onTabChange('domains');
              }}
            />
            <ListItem
              label={
                <FormattedMessage id='antennas.manage_keywords' defaultMessage='Manage keywords' />
              }
              onClick={() => {
                onTabChange('keywords');
              }}
            />
            <ListItem
              label={<FormattedMessage id='antennas.manage_tags' defaultMessage='Manage tags' />}
              onClick={() => {
                onTabChange('tags');
              }}
            />
          </>
        )}
      </List>
      <FormActions>
        <Button onClick={handleUpdate} disabled={disabled}>
          {antennaId ? (
            <FormattedMessage id='antennas.edit.save' defaultMessage='Save antenna' />
          ) : (
            <FormattedMessage id='antennas.create.save' defaultMessage='Create antenna' />
          )}
        </Button>
      </FormActions>
    </Form>
  );
};

interface AntennaEditorModalProps {
  antennaId?: string;
}

const AntennaEditorModal: React.FC<BaseModalProps & AntennaEditorModalProps> = ({
  antennaId: initialAntennaId,
  onClose,
}) => {
  const [antennaId, setAntennaId] = useState<string | undefined>(initialAntennaId);
  const [tab, setTab] = useState<Tab>('info');

  const { isFetched } = useAntenna(antennaId);

  const onClickClose = () => {
    onClose('ANTENNA_EDITOR');
  };

  const tabContent = useMemo(() => {
    if (!isFetched) {
      return <Spinner />;
    }

    switch (tab) {
      case 'info':
        return (
          <EditAntennaForm antennaId={antennaId} setAntennaId={setAntennaId} onTabChange={setTab} />
        );
      case 'accounts':
        return <AntennaAccountsForm antennaId={antennaId!} />;
      case 'excludedAccounts':
        return <AntennaAccountsForm antennaId={antennaId!} excluded />;
      case 'domains':
        return <AntennaDomainsForm antennaId={antennaId!} />;
      case 'keywords':
        return <AntennaKeywordsForm antennaId={antennaId!} />;
      case 'tags':
        return <AntennaTagsForm antennaId={antennaId!} />;
      default:
        return null;
    }
  }, [tab, antennaId, isFetched]);

  return (
    <Modal
      title={
        antennaId ? (
          <FormattedMessage id='antennas.edit' defaultMessage='Edit antenna' />
        ) : (
          <FormattedMessage id='antennas.create' defaultMessage='Create antenna' />
        )
      }
      onClose={onClickClose}
      onBack={
        tab === 'info'
          ? undefined
          : () => {
              setTab('info');
            }
      }
    >
      {tabContent}
    </Modal>
  );
};

export { AntennaEditorModal as default, type AntennaEditorModalProps };
