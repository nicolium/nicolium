import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import ColumnLoading from '@/features/ui/components/column-loading';
import {
  useCreateDomainAllowMutation,
  useDeleteDomainAllowMutation,
  useDomainAllowsQuery,
} from '@/queries/admin/use-domain-allows';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { AdminDomainAllow } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.domain_allows', defaultMessage: 'Domain allows' },
  domainPlaceholder: { id: 'admin.domain_allows.domain.placeholder', defaultMessage: 'Domain' },
  deleteConfirm: {
    id: 'confirmations.admin.delete_domain_allow.confirm',
    defaultMessage: 'Delete',
  },
  createSuccess: {
    id: 'admin.domain_allows.create.success',
    defaultMessage: 'Domain allow created',
  },
  createError: {
    id: 'admin.domain_allows.create.error',
    defaultMessage: 'Failed to create domain allow',
  },
  deleteSuccess: {
    id: 'admin.domain_allows.delete.success',
    defaultMessage: 'Domain allow deleted',
  },
  deleteError: {
    id: 'admin.domain_allows.delete.error',
    defaultMessage: 'Failed to delete domain allow',
  },
});

interface IDomainAllow {
  domainAllow: AdminDomainAllow;
}

const DomainAllow: React.FC<IDomainAllow> = ({ domainAllow }) => {
  const intl = useIntl();

  const { openModal } = useModalsActions();

  const { mutate: deleteDomainAllow } = useDeleteDomainAllowMutation(domainAllow.id);

  const handleDelete = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.admin.delete_domain_allow.heading'
          defaultMessage='Delete domain allow'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.admin.delete_domain_allow.message'
          defaultMessage='Are you sure you want to delete the allow for {domain}?'
          values={{ domain: domainAllow.domain }}
        />
      ),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteDomainAllow(undefined, {
          onSuccess: () => {
            toast.success(intl.formatMessage(messages.deleteSuccess));
          },
          onError: () => {
            toast.error(intl.formatMessage(messages.deleteError));
          },
        });
      },
    });
  };

  return (
    <div className='domain-allow'>
      <div className='domain-allow__domain'>{domainAllow.domain}</div>
      <div className='domain-allow__actions'>
        <button onClick={handleDelete}>
          <FormattedMessage id='admin.domain_allows.delete' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const DomainAllowsPage = () => {
  const intl = useIntl();

  const [domain, setDomain] = useState('');

  const { data: domainAllows } = useDomainAllowsQuery();
  const { mutate: createDomainAllow } = useCreateDomainAllowMutation();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createDomainAllow(domain, {
      onSuccess: () => {
        setDomain('');
        toast.success(messages.createSuccess);
      },
      onError: () => {
        toast.error(messages.createError);
      },
    });
  };

  if (!domainAllows) return <ColumnLoading />;

  return (
    <Column bodyClassName='domain-allows' label={intl.formatMessage(messages.heading)}>
      <form className='domain-allows__form' onSubmit={handleCreate}>
        <input
          className='input input--normal'
          type='text'
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={intl.formatMessage(messages.domainPlaceholder)}
        />
        <button type='submit'>
          <FormattedMessage id='admin.domain_allows.add' defaultMessage='Add' />
        </button>
      </form>
      <ScrollableList
        scrollKey='domain_allows'
        emptyMessageText={
          <FormattedMessage
            id='empty_column.admin.domain_allows'
            defaultMessage='No whitelisted domains found'
          />
        }
        itemClassName='domain-allow__container'
      >
        {domainAllows.map((domainAllow) => (
          <DomainAllow key={domainAllow.id} domainAllow={domainAllow} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { DomainAllowsPage as default };
