import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import MissingIndicator from '@/components/missing-indicator';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import ScrollableList from '@/components/scrollable-list';
import PendingStatus from '@/components/statuses/pending-status';
import Tombstone from '@/components/statuses/tombstone';
import { useCurrentAccount } from '@/contexts/current-account-context';
import ThreadStatus from '@/features/status/components/thread-status';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useStatus } from '@/queries/statuses/use-status';
import { eventDiscussionRoute } from '@/router';
import { useComposeActions } from '@/stores/compose';
import { useDescendantsIds } from '@/stores/contexts';
import { selectChild } from '@/utils/scroll-utils';

import type { VirtuosoHandle } from 'react-virtuoso';

const EventDiscussionPage: React.FC = () => {
  const { statusId } = eventDiscussionRoute.useParams();

  const { eventDiscussionCompose } = useComposeActions();

  const { data: status, isPending } = useStatus(statusId);

  const me = useCurrentAccount();

  const descendantsIds = useDescendantsIds(statusId);

  const node = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    if (status && me) eventDiscussionCompose(`reply:${statusId}`, status);
  }, [status, me]);

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
      if (id.endsWith('-tombstone') || id.endsWith('-unavailable')) {
        return renderTombstone(id);
      } else if (id.startsWith('末pending-')) {
        return renderPendingStatus(id);
      } else {
        return renderStatus(id);
      }
    });

  const hasDescendants = descendantsIds.length > 0;

  if (!status && isPending) {
    return <MissingIndicator />;
  } else if (!status) {
    return <PlaceholderStatus />;
  }

  const children: React.JSX.Element[] = [];

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds));
  }

  return (
    <div className='event-discussion'>
      {me && (
        <div className='event-discussion__compose'>
          <ComposeForm id={`reply:${status.id}`} event={status.id} transparent />
        </div>
      )}
      <div ref={node} className='event-discussion__thread'>
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
    </div>
  );
};

export { EventDiscussionPage as default };
