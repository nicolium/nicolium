import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { eventDiscussionCompose } from '@/actions/compose';
import { fetchStatusWithContext } from '@/actions/statuses';
import MissingIndicator from '@/components/missing-indicator';
import ScrollableList from '@/components/scrollable-list';
import Tombstone from '@/components/tombstone';
import Stack from '@/components/ui/stack';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import ThreadStatus from '@/features/status/components/thread-status';
import PendingStatus from '@/features/ui/components/pending-status';
import { eventDiscussionRoute } from '@/features/ui/router';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';
import { useDescendantsIds } from '@/stores/contexts';
import { selectChild } from '@/utils/scroll-utils';

import type { VirtuosoHandle } from 'react-virtuoso';

const EventDiscussionPage: React.FC = () => {
  const { statusId } = eventDiscussionRoute.useParams();

  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector((state) => getStatus(state, { id: statusId }));

  const me = useAppSelector((state) => state.me);

  const descendantsIds = useDescendantsIds(statusId);

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);

  const node = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle>(null);

  const fetchData = () => dispatch(fetchStatusWithContext(statusId, intl));

  useEffect(() => {
    fetchData()
      .then(() => {
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, [statusId]);

  useEffect(() => {
    if (isLoaded && me) dispatch(eventDiscussionCompose(`reply:${statusId}`, status!));
  }, [isLoaded, me]);

  const handleMoveUp = (id: string) => {
    const index = descendantsIds.indexOf(id);
    selectChild(index - 1, scroller, node.current ?? undefined);
  };

  const handleMoveDown = (id: string) => {
    const index = descendantsIds.indexOf(id);
    selectChild(index + 1, scroller, node.current ?? undefined, descendantsIds.length);
  };

  const renderTombstone = (id: string) => (
    <div className='py-4 pb-8'>
      <Tombstone key={id} id={id} onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} />
    </div>
  );

  const renderStatus = (id: string) => (
    <ThreadStatus
      key={id}
      id={id}
      focusedStatusId={status!.id}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
    />
  );

  const renderPendingStatus = (id: string) => {
    const idempotencyKey = id.replace(/^末pending-/, '');

    return <PendingStatus key={id} idempotencyKey={idempotencyKey} variant='default' />;
  };

  const renderChildren = (list: Array<string>) =>
    list.map((id) => {
      if (id.endsWith('-tombstone')) {
        return renderTombstone(id);
      } else if (id.startsWith('末pending-')) {
        return renderPendingStatus(id);
      } else {
        return renderStatus(id);
      }
    });

  const hasDescendants = descendantsIds.length > 0;

  if (!status && isLoaded) {
    return <MissingIndicator />;
  } else if (!status) {
    return <PlaceholderStatus />;
  }

  const children: JSX.Element[] = [];

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds));
  }

  return (
    <Stack space={2}>
      {me && (
        <div className='border-b border-solid border-gray-200 p-2 pt-0 dark:border-gray-800'>
          <ComposeForm id={`reply:${status.id}`} autoFocus={false} event={status.id} transparent />
        </div>
      )}
      <div ref={node} className='thread p-0 shadow-none sm:p-2'>
        <ScrollableList
          scrollKey={`eventDiscussion:${status.id}`}
          id='thread'
          placeholderComponent={() => <PlaceholderStatus variant='slim' />}
          initialTopMostItemIndex={0}
          emptyMessageText={
            <FormattedMessage
              id='event.discussion.empty'
              defaultMessage='No one has commented this event yet. When someone does, they will appear here.'
            />
          }
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export { EventDiscussionPage as default };
