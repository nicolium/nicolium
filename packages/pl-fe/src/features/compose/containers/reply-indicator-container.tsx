import React, { useCallback } from 'react';

import { cancelReplyCompose } from 'pl-fe/actions/compose';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { makeGetStatus } from 'pl-fe/selectors';

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
