import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';
import { SelectDropdown } from '@/features/forms';
import {
  useAddAccountsToAntenna,
  useAddExcludedAccountsToAntenna,
  useAntenna,
  useAntennaAccounts,
  useAntennaExcludedAccounts,
  useCreateAntenna,
  useRemoveAccountsFromAntenna,
  useRemoveExcludedAccountsFromAntenna,
  useUpdateAntenna,
} from '@/queries/accounts/use-antennas';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import Account from './list-editor-modal/components/account';
import Search from './list-editor-modal/components/search';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

type Tab = 'info' | 'accounts' | 'excludedAccounts';

const messages = defineMessages({
  createSuccess: { id: 'antennas.create.success', defaultMessage: 'Antenna created successfully' },
  editSuccess: { id: 'antennas.edit.success', defaultMessage: 'Antenna updated successfully' },
  createError: { id: 'antennas.create.error', defaultMessage: 'Error creating antenna' },
  editError: { id: 'antennas.edit.error', defaultMessage: 'Error updating antenna' },
  addToAntenna: { id: 'antennas.account.add', defaultMessage: 'Add to antenna' },
  removeFromAntenna: { id: 'antennas.account.remove', defaultMessage: 'Remove from antenna' },
  addExcludedToAntenna: {
    id: 'antennas.account.excluded.add',
    defaultMessage: 'Add to excluded accounts',
  },
  removeExcludedFromAntenna: {
    id: 'antennas.account.excluded.remove',
    defaultMessage: 'Remove from excluded accounts',
  },
});

interface IAntennaAccountsForm {
  antennaId: string;
  excluded?: boolean;
}

const AntennaAccountsForm: React.FC<IAntennaAccountsForm> = ({ antennaId, excluded = false }) => {
  const intl = useIntl();

  const [searchValue, setSearchValue] = useState('');

  const { data: accountIds = [] } = useAntennaAccounts(antennaId);
  const { data: excludedAccountIds = [] } = useAntennaExcludedAccounts(antennaId);
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
    <Stack space={2}>
      {selectedAccountIds.length > 0 ? (
        <div>
          <CardHeader>
            <CardTitle
              title={intl.formatMessage(
                excluded ? messages.removeExcludedFromAntenna : messages.removeFromAntenna,
              )}
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
      ) : (
        <Text theme='muted' size='sm'>
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
      )}

      <div>
        <CardHeader>
          <CardTitle
            title={intl.formatMessage(
              excluded ? messages.addExcludedToAntenna : messages.addToAntenna,
            )}
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
    </Stack>
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

  const disabled = antennaId ? updateDisabled : createDisabled;

  const [title, setTitle] = useState(antenna ? antenna.title : '');
  const [ltl, setLtl] = useState(antenna ? antenna.ltl : false);
  const [stl, setStl] = useState(antenna ? antenna.stl : false);
  const [insertFeeds, setInsertFeeds] = useState(antenna ? antenna.insert_feeds : false);
  const [withMediaOnly, setWithMediaOnly] = useState(antenna ? antenna.with_media_only : false);
  const [ignoreReblog, setIgnoreReblog] = useState(antenna ? antenna.ignore_reblog : false);
  const [favourite, setFavourite] = useState(antenna ? antenna.favourite : false);
  const [listId, setListId] = useState(antenna?.list?.id || undefined);

  const handleSubmit: React.FormEventHandler = (e) => {
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
            stl: intl.formatMessage({
              id: 'antennas.edit.mode.stl',
              defaultMessage: 'Social timeline mode',
            }),
            ltl: intl.formatMessage({
              id: 'antennas.edit.mode.ltl',
              defaultMessage: 'Local timeline mode',
            }),
            filtering: intl.formatMessage({
              id: 'antennas.edit.mode.filtering',
              defaultMessage: 'Filtering',
            }),
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
            home: intl.formatMessage({
              id: 'antennas.edit.destination.home',
              defaultMessage: 'Insert to home timeline',
            }),
            list: intl.formatMessage({
              id: 'antennas.edit.destination.list',
              defaultMessage: 'Insert to list',
            }),
            antenna: intl.formatMessage({
              id: 'antennas.edit.destination.antenna',
              defaultMessage: 'Antenna timeline only',
            }),
          }}
          defaultValue={insertFeeds ? 'home' : listId ? 'list' : 'antenna'}
          onChange={(e) => {
            const value = e.target.value;
            setInsertFeeds(value === 'home');
            if (value === 'list') {
              setListId(''); // TODO: add list selection
            } else {
              setListId(undefined);
            }
          }}
        />
      </FormGroup>
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
