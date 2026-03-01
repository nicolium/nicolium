import React from 'react';

import { useStatus } from '@/queries/statuses/use-status';
import { useCompose, useComposeActions } from '@/stores/compose';

import ReplyIndicator from '../components/reply-indicator';

interface IReplyIndicatorContainer {
  composeId: string;
}

const ReplyIndicatorContainer: React.FC<IReplyIndicatorContainer> = ({ composeId }) => {
  const { inReplyToId, editedId } = useCompose(composeId);
  const { data: status } = useStatus(inReplyToId ?? undefined);
  const { resetCompose } = useComposeActions();

  const onCancel = () => {
    resetCompose('compose-modal');
  };

  if (!status) return null;

  return <ReplyIndicator status={status} hideActions={!!editedId} onCancel={onCancel} />;
};

export { ReplyIndicatorContainer as default };
