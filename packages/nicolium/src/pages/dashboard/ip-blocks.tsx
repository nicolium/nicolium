import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React from 'react';
import { FormattedDate, FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ColumnLoading from '@/components/column-loading';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import { useDeleteIpBlockMutation, useIpBlocksQuery } from '@/queries/admin/use-ip-blocks';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { AdminIpBlock } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.ip_blocks', defaultMessage: 'IP blocks' },
  deleteSuccess: { id: 'admin.ip_blocks.delete.success', defaultMessage: 'IP block deleted' },
  deleteError: {
    id: 'admin.ip_blocks.delete.error',
    defaultMessage: 'Failed to delete IP block',
  },
});

interface IIpBlock {
  ipBlock: AdminIpBlock;
}

const IpBlock: React.FC<IIpBlock> = ({ ipBlock }) => {
  const { mutate: deleteIpBlock } = useDeleteIpBlockMutation(ipBlock.id);

  const { openModal } = useModalsActions();

  const handleEdit = () => {
    openModal('EDIT_IP_BLOCK', { ipBlock });
  };

  const handleDelete = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.admin.delete_ip_block.heading'
          defaultMessage='Delete IP block'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.admin.delete_ip_block.message'
          defaultMessage='Are you sure you want to delete the block for {ip}?'
          values={{ ip: ipBlock.ip }}
        />
      ),
      confirm: (
        <FormattedMessage
          id='confirmations.admin.delete_ip_block.confirm'
          defaultMessage='Delete'
        />
      ),
      onConfirm: () => {
        deleteIpBlock(undefined, {
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
    <div className='admin-ip-block'>
      <div className='admin-ip-block__ip'>
        <code>{ipBlock.ip}</code>
      </div>
      <ul className='admin-ip-block__tags'>
        {ipBlock.severity === 'sign_up_requires_approval' && (
          <li>
            <FormattedMessage
              id='admin.ip_blocks.severity.sign_up_requires_approval'
              defaultMessage='Sign-ups require approval'
            />
          </li>
        )}
        {ipBlock.severity === 'sign_up_block' && (
          <li>
            <FormattedMessage
              id='admin.ip_blocks.severity.sign_up_block'
              defaultMessage='Sign-ups blocked'
            />
          </li>
        )}
        {ipBlock.severity === 'no_access' && (
          <li>
            <FormattedMessage
              id='admin.ip_blocks.severity.no_access'
              defaultMessage='Access blocked'
            />
          </li>
        )}
      </ul>
      {ipBlock.comment && (
        <div className='admin-ip-block__comment'>
          <span>
            <FormattedMessage id='admin.ip_blocks.comment' defaultMessage='Comment:' />
          </span>{' '}
          {ipBlock.comment}
        </div>
      )}
      {ipBlock.expires_at && (
        <div className='admin-ip-block__expiry'>
          <FormattedMessage id='admin.ip_blocks.expires' defaultMessage='Expires:' />{' '}
          <FormattedDate value={ipBlock.expires_at} year='numeric' month='short' day='2-digit' />
        </div>
      )}
      <div className='admin-ip-block__actions'>
        <button onClick={handleEdit}>
          <FormattedMessage id='admin.ip_blocks.edit' defaultMessage='Modify' />
        </button>
        <button onClick={handleDelete}>
          <FormattedMessage id='admin.ip_blocks.delete' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const IpBlocksPage: React.FC = () => {
  const intl = useIntl();

  const { data: ipBlocks } = useIpBlocksQuery();

  const { openModal } = useModalsActions();

  if (!ipBlocks) return <ColumnLoading />;

  return (
    <Column
      bodyClassName='admin-ip-blocks'
      label={intl.formatMessage(messages.heading)}
      action={
        <button className='admin-ip-blocks__create' onClick={() => openModal('EDIT_IP_BLOCK')}>
          <Icon src={iconPlus} aria-hidden />
          <FormattedMessage id='admin.ip_blocks.add' defaultMessage='Create' />
        </button>
      }
    >
      <ScrollableList
        scrollKey='ip_blocks'
        emptyMessageText={
          <FormattedMessage
            id='empty_column.admin.ip_blocks'
            defaultMessage='No blocked IP ranges found'
          />
        }
        itemClassName='admin-ip-block__container'
      >
        {ipBlocks.map((ipBlock) => (
          <IpBlock key={ipBlock.id} ipBlock={ipBlock} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { IpBlocksPage as default };
