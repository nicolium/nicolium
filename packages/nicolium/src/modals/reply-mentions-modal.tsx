import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import AccountComponent from '@/components/accounts/account';
import IconButton from '@/components/ui/icon-button';
import Modal from '@/components/ui/modal';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useCompose, useComposeActions } from '@/stores/compose';
import { statusToMentionsAccountIdsArray } from '@/stores/compose';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  remove: { id: 'reply_mentions.account.remove', defaultMessage: 'Remove from mentions' },
  add: { id: 'reply_mentions.account.add', defaultMessage: 'Add to mentions' },
});

interface IReplyMentionAccount {
  composeId: string;
  accountId: string;
  author: boolean;
}

const ReplyMentionAccount: React.FC<IReplyMentionAccount> = ({ composeId, accountId, author }) => {
  const intl = useIntl();
  const { updateCompose } = useComposeActions();

  const compose = useCompose(composeId);
  const { data: account } = useAccount(accountId);
  const added = !!account && compose.to?.includes(account.acct);

  const onRemove = () =>
    updateCompose(composeId, (draft) => {
      if (account) {
        draft.to = draft.to?.filter((acct) => acct !== account.acct) || [];
      }
    });
  const onAdd = () =>
    updateCompose(composeId, (draft) => {
      if (account) {
        if (draft.to?.includes(account.acct)) return;
        draft.to = [...(draft.to || []), account.acct];
      }
    });

  if (!account) return null;

  let button;

  if (added) {
    button = (
      <IconButton
        src={iconX}
        className='reply-mentions__account__button'
        title={intl.formatMessage(messages.remove)}
        onClick={onRemove}
      />
    );
  } else {
    button = (
      <IconButton
        src={iconPlus}
        className='reply-mentions__account__button'
        title={intl.formatMessage(messages.add)}
        onClick={onAdd}
      />
    );
  }

  return (
    <div className='reply-mentions__account'>
      <AccountComponent
        account={account}
        withRelationship={false}
        withLinkToProfile={false}
        action={author ? undefined : button}
      />
    </div>
  );
};

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
      closeIcon={iconArrowLeft}
      closePosition='left'
    >
      <div className='reply-mentions'>
        {mentions.map((accountId) => (
          <ReplyMentionAccount
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
