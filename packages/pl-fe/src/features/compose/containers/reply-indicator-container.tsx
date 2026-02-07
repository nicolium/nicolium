import React, { useCallback } from 'react';

import { cancelReplyCompose } from '@/actions/compose';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useCompose } from '@/hooks/use-compose';
import { makeGetStatus } from '@/selectors';

import ReplyIndicator from '../components/reply-indicator';

interface IReplyIndicatorContainer {
  composeId: string;
}

const ReplyIndicatorContainer: React.FC<IReplyIndicatorContainer> = ({ composeId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const { inReplyToId, editedId } = useCompose(composeId);
  const status = useAppSelector(state => getStatus(state, { id: inReplyToId! }));
  const dispatch = useAppDispatch();

  const onCancel = () => {
    dispatch(cancelReplyCompose());
  };

  if (!status) return null;

  return (
    <ReplyIndicator status={status} hideActions={!!editedId} onCancel={onCancel} />
  );
};

export { ReplyIndicatorContainer as default };
