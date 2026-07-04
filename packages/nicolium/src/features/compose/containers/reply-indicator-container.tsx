import React from 'react';

import { useStatus } from '@/queries/statuses/use-status';
import { useCompose, useComposeActions } from '@/stores/compose';

import ReplyIndicator from '../components/reply-indicator';

interface IReplyIndicatorContainer {
  composeId: string;
}

const ReplyIndicatorContainer: React.FC<IReplyIndicatorContainer> = ({ composeId }) => {
  const { inReplyToId, sourceInReplyToId, editedId } = useCompose(composeId);
  const { data: status } = useStatus(inReplyToId ?? undefined);
  const { composeResetInReplyTo } = useComposeActions();

  const onCancel = () => {
    composeResetInReplyTo('compose-modal');
  };

  return (
    <ReplyIndicator
      status={status}
      hasUnresolvedStatus={inReplyToId === null && !!sourceInReplyToId}
      hideActions={!!editedId}
      onCancel={onCancel}
    />
  );
};

export { ReplyIndicatorContainer as default };
