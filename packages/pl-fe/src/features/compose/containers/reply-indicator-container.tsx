import React, { useCallback } from 'react';

import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';
import { useCompose, useComposeActions } from '@/stores/compose';

import ReplyIndicator from '../components/reply-indicator';

interface IReplyIndicatorContainer {
  composeId: string;
}

const ReplyIndicatorContainer: React.FC<IReplyIndicatorContainer> = ({ composeId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const { inReplyToId, editedId } = useCompose(composeId);
  const status = useAppSelector((state) => getStatus(state, { id: inReplyToId! }));
  const { resetCompose } = useComposeActions();

  const onCancel = () => {
    resetCompose('compose-modal');
  };

  if (!status) return null;

  return <ReplyIndicator status={status} hideActions={!!editedId} onCancel={onCancel} />;
};

export { ReplyIndicatorContainer as default };
