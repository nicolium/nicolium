import React, { useState } from 'react';
import { FormattedDate, FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ColumnLoading from '@/components/column-loading';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import {
  useCreateEmailDomainBlockMutation,
  useDeleteEmailDomainBlockMutation,
  useEmailDomainBlocksQuery,
} from '@/queries/admin/use-email-domain-blocks';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { AdminEmailDomainBlock } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.email_domain_blocks', defaultMessage: 'E-mail domain blocks' },
  domainPlaceholder: {
    id: 'admin.email_domain_blocks.domain.placeholder',
    defaultMessage: 'E-mail domain',
  },
  createSuccess: {
    id: 'admin.email_domain_blocks.create.success',
    defaultMessage: 'E-mail domain block created',
  },
  createError: {
    id: 'admin.email_domain_blocks.create.error',
    defaultMessage: 'Failed to create e-mail domain block',
  },
  deleteSuccess: {
    id: 'admin.email_domain_blocks.delete.success',
    defaultMessage: 'E-mail domain block deleted',
  },
  deleteError: {
    id: 'admin.email_domain_blocks.delete.error',
    defaultMessage: 'Failed to delete e-mail domain block',
  },
});

interface IEmailDomainBlock {
  emailDomainBlock: AdminEmailDomainBlock;
}

const EmailDomainBlock: React.FC<IEmailDomainBlock> = ({ emailDomainBlock }) => {
  const { openModal } = useModalsActions();

  const { mutate: deleteEmailDomainBlock } = useDeleteEmailDomainBlockMutation(emailDomainBlock.id);

  const attempts = emailDomainBlock.history.reduce((sum, day) => sum + Number(day.uses), 0);

  const handleDelete = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.admin.delete_email_domain_block.heading'
          defaultMessage='Delete e-mail domain block'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.admin.delete_email_domain_block.message'
          defaultMessage='Are you sure you want to delete the block for {domain}?'
          values={{ domain: emailDomainBlock.domain }}
        />
      ),
      confirm: (
        <FormattedMessage
          id='confirmations.admin.delete_email_domain_block.confirm'
          defaultMessage='Delete'
        />
      ),
      onConfirm: () => {
        deleteEmailDomainBlock(undefined, {
          onSuccess: () => {
            toast.success(messages.deleteSuccess);
          },
          onError: () => {
            toast.error(messages.deleteError);
          },
        });
      },
    });
  };

  return (
    <div className='admin-email-domain-block'>
      <div className='admin-email-domain-block__domain'>{emailDomainBlock.domain}</div>
      <div className='admin-email-domain-block__meta'>
        <span>
          <FormattedMessage
            id='admin.email_domain_blocks.attempts'
            defaultMessage='{count, plural, one {# sign-up attempt in the last week} other {# sign-up attempts in the last week}}'
            values={{ count: attempts }}
          />
        </span>
        {emailDomainBlock.created_at && (
          <span>
            <FormattedMessage id='admin.email_domain_blocks.created' defaultMessage='Created:' />{' '}
            <FormattedDate
              value={emailDomainBlock.created_at}
              year='numeric'
              month='short'
              day='2-digit'
            />
          </span>
        )}
      </div>
      <div className='admin-email-domain-block__actions'>
        <button onClick={handleDelete}>
          <FormattedMessage id='admin.email_domain_blocks.delete' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const EmailDomainBlocksPage: React.FC = () => {
  const intl = useIntl();

  const [domain, setDomain] = useState('');

  const { data: emailDomainBlocks } = useEmailDomainBlocksQuery();
  const { mutate: createEmailDomainBlock } = useCreateEmailDomainBlockMutation();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createEmailDomainBlock(domain, {
      onSuccess: () => {
        setDomain('');
        toast.success(messages.createSuccess);
      },
      onError: () => {
        toast.error(messages.createError);
      },
    });
  };

  if (!emailDomainBlocks) return <ColumnLoading />;

  return (
    <Column bodyClassName='admin-email-domain-blocks' label={intl.formatMessage(messages.heading)}>
      <form className='admin-email-domain-blocks__form' onSubmit={handleCreate}>
        <input
          className='input input--normal'
          type='text'
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={intl.formatMessage(messages.domainPlaceholder)}
        />
        <button type='submit' disabled={!domain}>
          <FormattedMessage id='admin.email_domain_blocks.add' defaultMessage='Add' />
        </button>
      </form>
      <ScrollableList
        scrollKey='email_domain_blocks'
        emptyMessageText={
          <FormattedMessage
            id='empty_column.admin.email_domain_blocks'
            defaultMessage='No blocked e-mail domains found'
          />
        }
        itemClassName='admin-email-domain-block__container'
      >
        {emailDomainBlocks.map((emailDomainBlock) => (
          <EmailDomainBlock key={emailDomainBlock.id} emailDomainBlock={emailDomainBlock} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { EmailDomainBlocksPage as default };
