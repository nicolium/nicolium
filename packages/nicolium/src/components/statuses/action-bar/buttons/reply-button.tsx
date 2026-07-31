import iconArrowBendDoubleUpLeft from '@phosphor-icons/core/regular/arrow-bend-double-up-left.svg';
import iconArrowBendUpLeft from '@phosphor-icons/core/regular/arrow-bend-up-left.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import GroupPopover from '@/components/groups/popover/group-popover';
import StatusActionButton from '@/components/statuses/status-action-button';
import Popover from '@/components/ui/popover';
import { useColumnId } from '@/contexts/deck-column-id-context';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useComposeActions } from '@/stores/compose';

import { InteractionPopover } from '../interaction-popover';
import messages from '../messages';

import type { IActionButton } from '../types';
import type { Account } from 'pl-api';

interface IReplyButton extends IActionButton {
  rebloggedBy?: Account;
}

const ReplyButton: React.FC<IReplyButton> = ({
  status,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  rebloggedBy,
  withCounters,
}) => {
  const { replyCompose } = useComposeActions();
  const scopeUrl = useScopeUrl();
  const columnId = useColumnId();
  const intl = useIntl();

  const canReply = useCanInteract(status, 'can_reply');
  const { data: group } = useGroupQuery(status.group_id ?? undefined, true);

  let replyTitle;
  let replyDisabled = false;

  if (group?.membership_required && !group.relationship?.member) {
    replyDisabled = true;
    replyTitle = intl.formatMessage(messages.repliesDisabledGroup);
  }

  if (!status.in_reply_to_id) {
    replyTitle = intl.formatMessage(messages.reply);
  } else {
    replyTitle = intl.formatMessage(messages.replyAll);
  }

  const handleReplyClick: React.MouseEventHandler = () => {
    if (me) {
      replyCompose(status, scopeUrl, columnId, rebloggedBy, canReply.approvalRequired ?? false);
    } else {
      onOpenUnauthorizedModal('REPLY');
    }
  };

  const replyButton = (
    <StatusActionButton
      title={replyTitle}
      icon={status.in_reply_to_id ? iconArrowBendDoubleUpLeft : iconArrowBendUpLeft}
      onClick={handleReplyClick}
      count={withCounters ? status.replies_count : undefined}
      text={withLabels ? intl.formatMessage(messages.reply) : undefined}
      disabled={replyDisabled}
    />
  );

  if (me && !canReply.canInteract)
    return (
      <Popover
        interaction='click'
        content={<InteractionPopover allowed={canReply.allowed} type='reply' />}
      >
        {replyButton}
      </Popover>
    );

  return group ? (
    <GroupPopover group={group} isEnabled={replyDisabled}>
      {replyButton}
    </GroupPopover>
  ) : (
    replyButton
  );
};

export { ReplyButton, type IReplyButton };
