import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import ColumnLoading from '@/features/ui/components/column-loading';
import {
  useDeleteDomainBlockMutation,
  useDomainBlocksQuery,
} from '@/queries/admin/use-domain-blocks';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { AdminDomainBlock } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.domain_blocks', defaultMessage: 'Domain blocks' },
  deleteConfirm: {
    id: 'confirmations.admin.delete_domain_block.confirm',
    defaultMessage: 'Delete',
  },
  deleteSuccess: {
    id: 'admin.domain_blocks.delete_success',
    defaultMessage: 'Domain block deleted',
  },
  deleteError: {
    id: 'admin.domain_blocks.delete_error',
    defaultMessage: 'Failed to delete domain block',
  },
});

interface IDomainBlock {
  domainBlock: AdminDomainBlock;
}

const DomainBlock: React.FC<IDomainBlock> = ({ domainBlock }) => {
  const intl = useIntl();

  const { mutate: deleteDomainBlock } = useDeleteDomainBlockMutation(domainBlock.id);

  const { openModal } = useModalsActions();

  const handleEdit = () => {
    openModal('EDIT_DOMAIN_BLOCK', { domainBlock });
  };

  const handleDelete = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.admin.delete_domain_block.heading'
          defaultMessage='Delete domain block'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.admin.delete_domain_block.message'
          defaultMessage='Are you sure you want to delete the block for {domain}?'
          values={{ domain: domainBlock.domain }}
        />
      ),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteDomainBlock(undefined, {
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
    <div className='⁂-domain-block'>
      <div className='⁂-domain-block__domain'>{domainBlock.domain}</div>
      <ul className='⁂-domain-block__tags'>
        {domainBlock.severity === 'suspend' && (
          <li>
            <FormattedMessage id='admin.domain_blocks.suspend' defaultMessage='Suspended' />
          </li>
        )}
        {domainBlock.severity === 'silence' && (
          <li>
            <FormattedMessage id='admin.domain_blocks.silence' defaultMessage='Silenced' />
          </li>
        )}
        {domainBlock.reject_media && (
          <li>
            <FormattedMessage
              id='admin.domain_blocks.reject_media'
              defaultMessage='Media rejected'
            />
          </li>
        )}
        {domainBlock.reject_reports && (
          <li>
            <FormattedMessage
              id='admin.domain_blocks.reject_reports'
              defaultMessage='Reports rejected'
            />
          </li>
        )}
        {domainBlock.obfuscate && (
          <li>
            <FormattedMessage id='admin.domain_blocks.obfuscate' defaultMessage='Obfuscated' />
          </li>
        )}
      </ul>
      {domainBlock.private_comment && (
        <div className='⁂-domain-block__comment'>
          <span>
            <FormattedMessage
              id='admin.domain_blocks.private_comment'
              defaultMessage='Private comment:'
            />
          </span>{' '}
          {domainBlock.private_comment}
        </div>
      )}
      {domainBlock.public_comment && (
        <div className='⁂-domain-block__comment'>
          <span>
            <FormattedMessage
              id='admin.domain_blocks.public_comment'
              defaultMessage='Public comment:'
            />
          </span>{' '}
          {domainBlock.public_comment}
        </div>
      )}
      <div className='⁂-domain-block__actions'>
        <button onClick={handleEdit}>
          <FormattedMessage id='admin.domain_blocks.edit' defaultMessage='Modify' />
        </button>
        <button onClick={handleDelete}>
          <FormattedMessage id='admin.domain_blocks.delete' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const DomainBlocksPage = () => {
  const intl = useIntl();

  const { data: domainBlocks } = useDomainBlocksQuery();

  const { openModal } = useModalsActions();

  if (!domainBlocks) return <ColumnLoading />;

  return (
    <Column bodyClassName='⁂-domain-blocks' label={intl.formatMessage(messages.heading)}>
      <div className='⁂-domain-blocks__actions'>
        <button onClick={() => openModal('EDIT_DOMAIN_BLOCK')}>
          <Icon src={iconPlus} aria-hidden />
          <FormattedMessage id='admin.domain_blocks.add' defaultMessage='Create' />
        </button>
      </div>
      <ScrollableList
        scrollKey='domain_blocks'
        emptyMessageText={
          <FormattedMessage
            id='empty_column.admin.domain_blocks'
            defaultMessage='No blocked domains found'
          />
        }
        itemClassName='⁂-domain-block__container'
      >
        {domainBlocks.map((domainBlock) => (
          <DomainBlock key={domainBlock.id} domainBlock={domainBlock} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { DomainBlocksPage as default };
