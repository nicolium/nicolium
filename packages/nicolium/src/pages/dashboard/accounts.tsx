import { useNavigate } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import List, { ListItem } from '@/components/list';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import ScrollableList from '@/components/scrollable-list';
import Accordion from '@/components/ui/accordion';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Toggle from '@/components/ui/toggle';
import { useDebounce } from '@/hooks/use-debounce';
import { useAdminAccounts } from '@/queries/admin/use-accounts';
import { adminAccountsRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.admin.accounts', defaultMessage: 'Accounts' },
  originAll: { id: 'admin.accounts.filters.origin.all', defaultMessage: 'All' },
  originLocal: { id: 'admin.accounts.filters.origin.local', defaultMessage: 'Local' },
  originRemote: { id: 'admin.accounts.filters.origin.remote', defaultMessage: 'Remote' },
  statusAll: { id: 'admin.accounts.filters.status.all', defaultMessage: 'All' },
  statusActive: { id: 'admin.accounts.filters.status.active', defaultMessage: 'Active' },
  statusPending: { id: 'admin.accounts.filters.status.pending', defaultMessage: 'Pending' },
  statusDisabled: { id: 'admin.accounts.filters.status.disabled', defaultMessage: 'Disabled' },
  statusSilenced: { id: 'admin.accounts.filters.status.silenced', defaultMessage: 'Silenced' },
  statusSuspended: { id: 'admin.accounts.filters.status.suspended', defaultMessage: 'Suspended' },
  usernamePlaceholder: {
    id: 'admin.accounts.filters.username.placeholder',
    defaultMessage: 'Enter username',
  },
  displayNamePlaceholder: {
    id: 'admin.accounts.filters.display_name.placeholder',
    defaultMessage: 'Enter display name',
  },
  domainPlaceholder: {
    id: 'admin.accounts.filters.domain.placeholder',
    defaultMessage: 'Enter domain',
  },
  emailPlaceholder: {
    id: 'admin.accounts.filters.email.placeholder',
    defaultMessage: 'Enter e-mail address',
  },
});

const Filters: React.FC = () => {
  const navigate = useNavigate({ from: adminAccountsRoute.fullPath });
  const params = adminAccountsRoute.useSearch();
  const intl = useIntl();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const toggleFilters = () => setFiltersOpen((open) => !open);

  const activeFilterCount = Object.values(params).filter((value) => value !== undefined).length;

  const originItems = useMemo(
    () => ({
      '': intl.formatMessage(messages.originAll),
      local: intl.formatMessage(messages.originLocal),
      remote: intl.formatMessage(messages.originRemote),
    }),
    [intl],
  );

  const statusItems = useMemo(
    () => ({
      '': intl.formatMessage(messages.statusAll),
      active: intl.formatMessage(messages.statusActive),
      pending: intl.formatMessage(messages.statusPending),
      disabled: intl.formatMessage(messages.statusDisabled),
      silenced: intl.formatMessage(messages.statusSilenced),
      suspended: intl.formatMessage(messages.statusSuspended),
    }),
    [intl],
  );

  return (
    <Accordion
      expanded={filtersOpen}
      onToggle={toggleFilters}
      headline={
        <FormattedMessage
          id='admin.accounts.filters'
          defaultMessage='Filters ({count})'
          values={{ count: activeFilterCount }}
        />
      }
    >
      <Form>
        <div className='⁂-admin-accounts-page__filter-grid'>
          <FormGroup
            labelText={
              <FormattedMessage
                id='admin.accounts.filters.origin'
                defaultMessage='Account origin'
              />
            }
          >
            <SelectDropdown
              items={originItems}
              defaultValue={params.origin}
              onChange={({ target }) =>
                navigate({
                  search: (params) => ({ ...params, origin: (target.value as any) || undefined }),
                })
              }
            />
          </FormGroup>
          <FormGroup
            labelText={
              <FormattedMessage
                id='admin.accounts.filters.status'
                defaultMessage='Account status'
              />
            }
          >
            <SelectDropdown
              items={statusItems}
              defaultValue={params.status}
              onChange={({ target }) =>
                navigate({
                  search: (params) => ({ ...params, status: (target.value as any) || undefined }),
                })
              }
            />
          </FormGroup>
        </div>
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='admin.accounts.filters.status.staff_only'
                defaultMessage='Staff only'
              />
            }
          >
            <Toggle
              checked={params.permissions === 'staff'}
              onChange={(e) =>
                navigate({
                  search: (params) => ({
                    ...params,
                    permissions: e.target.checked ? 'staff' : undefined,
                  }),
                })
              }
            />
          </ListItem>
        </List>
        <div className='⁂-admin-accounts-page__filter-grid'>
          <FormGroup
            labelText={
              <FormattedMessage
                id='admin.accounts.filters.username'
                defaultMessage='Search by username'
              />
            }
          >
            <Input
              placeholder={intl.formatMessage(messages.usernamePlaceholder)}
              value={params.username}
              onChange={(e) =>
                navigate({
                  search: (params) => ({ ...params, username: e.target.value || undefined }),
                })
              }
            />
          </FormGroup>
          <FormGroup
            labelText={
              <FormattedMessage
                id='admin.accounts.filters.display_name'
                defaultMessage='Search by display name'
              />
            }
          >
            <Input
              placeholder={intl.formatMessage(messages.displayNamePlaceholder)}
              value={params.display_name}
              onChange={(e) =>
                navigate({
                  search: (params) => ({ ...params, display_name: e.target.value || undefined }),
                })
              }
            />
          </FormGroup>
        </div>
        <div className='⁂-admin-accounts-page__filter-grid'>
          <FormGroup
            labelText={
              <FormattedMessage
                id='admin.accounts.filters.domain'
                defaultMessage='Search by domain'
              />
            }
          >
            <Input
              placeholder={intl.formatMessage(messages.domainPlaceholder)}
              value={params.by_domain}
              onChange={(e) =>
                navigate({
                  search: (params) => ({ ...params, by_domain: e.target.value || undefined }),
                })
              }
            />
          </FormGroup>
          <FormGroup
            labelText={
              <FormattedMessage
                id='admin.accounts.filters.email'
                defaultMessage='Search by e-mail address'
              />
            }
          >
            <Input
              placeholder={intl.formatMessage(messages.emailPlaceholder)}
              value={params.email}
              onChange={(e) =>
                navigate({
                  search: (params) => ({ ...params, email: e.target.value || undefined }),
                })
              }
            />
          </FormGroup>
        </div>
        <FormActions>
          <Button theme='primary' onClick={() => navigate({ search: {} })}>
            <FormattedMessage id='admin.accounts.filters.clear' defaultMessage='Reset filters' />
          </Button>
        </FormActions>
      </Form>
    </Accordion>
  );
};

const AccountsPage: React.FC = () => {
  const intl = useIntl();

  const params = adminAccountsRoute.useSearch();
  const debouncedParams = useDebounce(params, 1000);

  const {
    data: accountIds,
    isPending,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useAdminAccounts(debouncedParams);

  return (
    <Column label={intl.formatMessage(messages.heading)} bodyClassName='⁂-admin-accounts-page'>
      <Filters />
      <ScrollableList
        scrollKey='userIndex'
        hasMore={hasNextPage}
        isLoading={isFetching}
        showLoading={isPending}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={
          <FormattedMessage id='admin.user_index.empty' defaultMessage='No users found.' />
        }
        itemClassName='⁂-admin-accounts-page__item'
        placeholderComponent={PlaceholderAccount}
        placeholderCount={20}
      >
        {(accountIds ?? []).map((id) => (
          <AccountContainer
            key={id}
            id={id}
            withDate
            hideActions
            to='/nicolium/admin/accounts/$accountId'
            params={{ accountId: id }}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { AccountsPage as default };
