import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { dateFormatOptions } from '@/components/relative-timestamp';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import Indicator from '@/components/ui/indicator';
import { useDomains } from '@/queries/admin/use-domains';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { AdminDomain as DomainEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.domains', defaultMessage: 'Domains' },
  deleteConfirm: { id: 'confirmations.admin.delete_domain.confirm', defaultMessage: 'Delete' },
  deleteHeading: {
    id: 'confirmations.admin.delete_domain.heading',
    defaultMessage: 'Delete domain',
  },
  deleteMessage: {
    id: 'confirmations.admin.delete_domain.message',
    defaultMessage: 'Are you sure you want to delete the domain?',
  },
  domainDeleteSuccess: { id: 'admin.edit_domain.deleted', defaultMessage: 'Domain deleted' },
  domainLastChecked: {
    id: 'admin.domains.resolve.last_checked',
    defaultMessage: 'Last checked: {date}',
  },
});

interface IDomain {
  domain: DomainEntity;
}

const Domain: React.FC<IDomain> = ({ domain }) => {
  const intl = useIntl();

  const { openModal } = useModalsActions();
  const { deleteDomain } = useDomains();

  const handleEditDomain = (domain: DomainEntity) => () => {
    openModal('EDIT_DOMAIN', { domainId: domain.id });
  };

  const handleDeleteDomain = () => () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteDomain(domain.id, {
          onSuccess: () => {
            toast.success(messages.domainDeleteSuccess);
          },
        });
      },
    });
  };

  const domainState = domain.last_checked_at ? (domain.resolves ? 'active' : 'error') : 'pending';
  const domainStateLabel = {
    active: (
      <FormattedMessage
        id='admin.domains.resolve.success.label'
        defaultMessage='Resolves correctly'
      />
    ),
    error: (
      <FormattedMessage id='admin.domains.resolve.fail.label' defaultMessage='Not resolving' />
    ),
    pending: (
      <FormattedMessage
        id='admin.domains.resolve.pending.label'
        defaultMessage='Pending resolve check'
      />
    ),
  }[domainState];
  const domainStateTitle = domain.last_checked_at
    ? intl.formatMessage(messages.domainLastChecked, {
        date: intl.formatDate(domain.last_checked_at, dateFormatOptions),
      })
    : undefined;

  return (
    <div key={domain.id} className='domains__domain'>
      <div className='domains__domain__info'>
        <p className='domains__domain__name'>
          <span className='domains__domain__label'>
            <FormattedMessage id='admin.domains.name' defaultMessage='Domain:' />
          </span>{' '}
          {domain.domain}
        </p>
        <span className='domains__domain__visibility'>
          {domain.public ? (
            <FormattedMessage id='admin.domains.public' defaultMessage='Public' />
          ) : (
            <FormattedMessage id='admin.domains.private' defaultMessage='Private' />
          )}
        </span>
        <div className='domains__domain__state__container' title={domainStateTitle}>
          <Indicator state={domainState} />
          <span className='domains__domain__state'>{domainStateLabel}</span>
        </div>
      </div>
      <div className='domains__domain__actions'>
        <button onClick={handleEditDomain(domain)}>
          <FormattedMessage id='admin.domains.edit' defaultMessage='Edit' />
        </button>
        <button onClick={handleDeleteDomain()}>
          <FormattedMessage id='admin.domains.delete' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const AdminDomainsPage: React.FC = () => {
  const intl = useIntl();

  const { openModal } = useModalsActions();
  const { data: domains, isFetching, refetch } = useDomains();

  const handleCreateDomain = () => {
    openModal('EDIT_DOMAIN');
  };

  useEffect(() => {
    if (!isFetching) refetch();
  }, []);

  const emptyMessage = (
    <FormattedMessage id='empty_column.admin.domains' defaultMessage='There are no domains yet.' />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='domains'>
        <button className='domains__create' onClick={handleCreateDomain}>
          <Icon src={iconPlus} aria-hidden />
          <FormattedMessage id='admin.domains.action' defaultMessage='Create domain' />
        </button>
        {domains && (
          <ScrollableList
            scrollKey='domains'
            emptyMessageText={emptyMessage}
            itemClassName='domains__domain__container'
            isLoading={isFetching}
            showLoading={isFetching && !domains?.length}
          >
            {domains.map((domain) => (
              <Domain key={domain.id} domain={domain} />
            ))}
          </ScrollableList>
        )}
      </div>
    </Column>
  );
};

export { AdminDomainsPage as default };
