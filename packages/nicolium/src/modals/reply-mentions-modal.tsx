import React from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from '@/components/ui/modal';
import Account from '@/features/reply-mentions/account';
import { useCompose } from '@/hooks/use-compose';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { statusToMentionsAccountIdsArray } from '@/stores/compose';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ReplyMentionsModalProps {
  composeId: string;
}

const ReplyMentionsModal: React.FC<BaseModalProps & ReplyMentionsModalProps> = ({
  composeId,
  onClose,
}) => {
  const compose = useCompose(composeId);

  const { data: status } = useMinimalStatus(compose.inReplyToId ?? undefined);
  const { data: account } = useOwnAccount();

  const mentions = statusToMentionsAccountIdsArray(status!, account!, compose.parentRebloggedById);
  const author = status?.account_id;

  const onClickClose = () => {
    onClose('REPLY_MENTIONS');
  };

  return (
    <Modal
      title={<FormattedMessage id='navigation_bar.in_reply_to' defaultMessage='In reply to' />}
      onClose={onClickClose}
      closeIcon={require('@phosphor-icons/core/regular/arrow-left.svg')}
      closePosition='left'
    >
      <div className='block min-h-[300px] flex-1 flex-row overflow-y-auto'>
        {mentions.map((accountId) => (
          <Account
            composeId={composeId}
            key={accountId}
            accountId={accountId}
            author={author === accountId}
          />
        ))}
      </div>
    </Modal>
  );
};

export { ReplyMentionsModal as default, type ReplyMentionsModalProps };
