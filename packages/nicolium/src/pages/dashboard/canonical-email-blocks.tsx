import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ColumnLoading from '@/components/column-loading';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import {
  useCanonicalEmailBlocksQuery,
  useCreateCanonicalEmailBlockMutation,
  useDeleteCanonicalEmailBlockMutation,
  useTestCanonicalEmailBlockMutation,
} from '@/queries/admin/use-canonical-email-blocks';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { AdminCanonicalEmailBlock } from 'pl-api';

const messages = defineMessages({
  heading: {
    id: 'column.admin.canonical_email_blocks',
    defaultMessage: 'Canonical e-mail blocks',
  },
  emailPlaceholder: {
    id: 'admin.canonical_email_blocks.email.placeholder',
    defaultMessage: 'E-mail address',
  },
  createSuccess: {
    id: 'admin.canonical_email_blocks.create.success',
    defaultMessage: 'E-mail address blocked',
  },
  createError: {
    id: 'admin.canonical_email_blocks.create.error',
    defaultMessage: 'Failed to block e-mail address',
  },
  deleteSuccess: {
    id: 'admin.canonical_email_blocks.delete.success',
    defaultMessage: 'E-mail block deleted',
  },
  deleteError: {
    id: 'admin.canonical_email_blocks.delete.error',
    defaultMessage: 'Failed to delete e-mail block',
  },
  testBlocked: {
    id: 'admin.canonical_email_blocks.test.blocked',
    defaultMessage: 'This e-mail address is blocked',
  },
  testNotBlocked: {
    id: 'admin.canonical_email_blocks.test.not_blocked',
    defaultMessage: 'This e-mail address is not blocked',
  },
  testError: {
    id: 'admin.canonical_email_blocks.test.error',
    defaultMessage: 'Failed to test e-mail address',
  },
});

interface ICanonicalEmailBlock {
  canonicalEmailBlock: AdminCanonicalEmailBlock;
}

const CanonicalEmailBlock: React.FC<ICanonicalEmailBlock> = ({ canonicalEmailBlock }) => {
  const { openModal } = useModalsActions();

  const { mutate: deleteCanonicalEmailBlock } = useDeleteCanonicalEmailBlockMutation(
    canonicalEmailBlock.id,
  );

  const handleDelete = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.admin.delete_canonical_email_block.heading'
          defaultMessage='Delete e-mail block'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.admin.delete_canonical_email_block.message'
          defaultMessage='Are you sure you want to delete this e-mail block?'
        />
      ),
      confirm: (
        <FormattedMessage
          id='confirmations.admin.delete_canonical_email_block.confirm'
          defaultMessage='Delete'
        />
      ),
      onConfirm: () => {
        deleteCanonicalEmailBlock(undefined, {
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
    <div className='admin-canonical-email-block'>
      <div className='admin-canonical-email-block__hash'>
        <code>{canonicalEmailBlock.canonical_email_hash}</code>
      </div>
      <div className='admin-canonical-email-block__actions'>
        <button onClick={handleDelete}>
          <FormattedMessage id='admin.canonical_email_blocks.delete' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const CanonicalEmailBlocksPage: React.FC = () => {
  const intl = useIntl();

  const [email, setEmail] = useState('');

  const { data: canonicalEmailBlocks } = useCanonicalEmailBlocksQuery();
  const { mutate: createCanonicalEmailBlock } = useCreateCanonicalEmailBlockMutation();
  const { mutate: testCanonicalEmailBlock, isPending: isTesting } =
    useTestCanonicalEmailBlockMutation();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCanonicalEmailBlock(email, {
      onSuccess: () => {
        setEmail('');
        toast.success(messages.createSuccess);
      },
      onError: () => {
        toast.error(messages.createError);
      },
    });
  };

  const handleTest = () => {
    testCanonicalEmailBlock(email, {
      onSuccess: (matches) => {
        if (matches.length) {
          toast.success(messages.testBlocked);
        } else {
          toast.info(messages.testNotBlocked);
        }
      },
      onError: () => {
        toast.error(messages.testError);
      },
    });
  };

  if (!canonicalEmailBlocks) return <ColumnLoading />;

  return (
    <Column
      bodyClassName='admin-canonical-email-blocks'
      label={intl.formatMessage(messages.heading)}
    >
      <form className='admin-canonical-email-blocks__form' onSubmit={handleCreate}>
        <input
          className='input input--normal'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={intl.formatMessage(messages.emailPlaceholder)}
        />
        <button type='button' disabled={!email || isTesting} onClick={handleTest}>
          <FormattedMessage id='admin.canonical_email_blocks.test' defaultMessage='Test' />
        </button>
        <button type='submit' disabled={!email}>
          <FormattedMessage id='admin.canonical_email_blocks.add' defaultMessage='Block' />
        </button>
      </form>
      <ScrollableList
        scrollKey='canonical_email_blocks'
        emptyMessageText={
          <FormattedMessage
            id='empty_column.admin.canonical_email_blocks'
            defaultMessage='No blocked e-mail addresses found'
          />
        }
        itemClassName='admin-canonical-email-block__container'
      >
        {canonicalEmailBlocks.map((canonicalEmailBlock) => (
          <CanonicalEmailBlock
            key={canonicalEmailBlock.id}
            canonicalEmailBlock={canonicalEmailBlock}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { CanonicalEmailBlocksPage as default };
