import { Navigate } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import MissingIndicator from '@/components/missing-indicator';
import PullToRefresh from '@/components/pull-to-refresh';
import Column from '@/components/ui/column';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import Thread from '@/features/status/components/thread';
import { statusRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useStatus } from '@/queries/statuses/use-status';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'status.title', defaultMessage: 'Post details' },
  titleDirect: { id: 'status.title_direct', defaultMessage: 'Direct message' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: {
    id: 'confirmations.delete.message',
    defaultMessage: 'Are you sure you want to delete this post?',
  },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftHeading: { id: 'confirmations.redraft.heading', defaultMessage: 'Delete & redraft' },
  redraftMessage: {
    id: 'confirmations.redraft.message',
    defaultMessage:
      'Are you sure you want to delete this post and re-draft it? Favorites and reposts will be lost, and replies to the original post will be orphaned.',
  },
  revealAll: { id: 'status.show_more_all', defaultMessage: 'Show more for all' },
  hideAll: { id: 'status.show_less_all', defaultMessage: 'Show less for all' },
  detailedStatus: { id: 'status.detailed_status', defaultMessage: 'Detailed conversation view' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: {
    id: 'confirmations.reply.message',
    defaultMessage:
      'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?',
  },
  treeView: { id: 'status.thread.tree_view', defaultMessage: 'Tree view' },
  linearView: { id: 'status.thread.linear_view', defaultMessage: 'Linear view' },
  expandAll: { id: 'status.thread.expand_all', defaultMessage: 'Expand all posts' },
});

const StatusPage: React.FC = () => {
  const { username, statusId } = statusRoute.useParams();

  const dispatch = useAppDispatch();
  const intl = useIntl();

  const {
    data: status,
    isPending,
    refetch,
    refetchContext,
  } = useStatus(statusId, { withContext: true });

  const [expandAllStatuses, setExpandAllStatuses] = useState<() => void>();

  const {
    displaySpoilers,
    threads: { displayMode },
  } = useSettings();

  const handleRefresh = () => {
    refetch();
    refetchContext();
  };

  const items = useMemo(() => {
    const menu: Menu = [
      {
        text: intl.formatMessage(messages.treeView),
        action: () => {
          dispatch(changeSetting(['threads', 'displayMode'], 'tree'));
        },
        icon: require('@phosphor-icons/core/regular/tree-view.svg'),
        type: 'radio',
        checked: displayMode === 'tree',
      },
      {
        text: intl.formatMessage(messages.linearView),
        action: () => {
          dispatch(changeSetting(['threads', 'displayMode'], 'linear'));
        },
        icon: require('@phosphor-icons/core/regular/list-bullets.svg'),
        type: 'radio',
        checked: displayMode === 'linear',
      },
    ];

    if (!displaySpoilers && expandAllStatuses) {
      menu.push(null, {
        text: intl.formatMessage(messages.expandAll),
        action: expandAllStatuses,
        icon: require('@phosphor-icons/core/regular/caret-down.svg'),
      });
    }
    return menu;
  }, [displayMode, expandAllStatuses]);

  if (status?.event) {
    return (
      <Navigate
        to='/@{$username}/events/$statusId'
        params={{ username: status.account.acct, statusId: status.id }}
        replace
      />
    );
  }

  if (username && status && username !== status.account.acct) {
    return (
      <Navigate
        to='/@{$username}/posts/$statusId'
        params={{ username: status.account.acct, statusId: status.id }}
        replace
      />
    );
  }

  if (!status && !isPending) {
    return <MissingIndicator />;
  } else if (!status) {
    return (
      <Column>
        <PlaceholderStatus />
      </Column>
    );
  }

  const titleMessage = () => {
    if (status.visibility === 'direct') return messages.titleDirect;
    return messages.title;
  };

  return (
    <div className='flex flex-col gap-4'>
      <Column
        label={intl.formatMessage(titleMessage())}
        action={
          <DropdownMenu
            items={items}
            src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')}
          />
        }
      >
        <PullToRefresh onRefresh={handleRefresh}>
          <Thread
            key={status.id}
            status={status}
            setExpandAllStatuses={(fn) => {
              setExpandAllStatuses(() => fn);
            }}
          />
        </PullToRefresh>
      </Column>
    </div>
  );
};

export { StatusPage as default };
