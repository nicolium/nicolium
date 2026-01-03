import { Navigate } from '@tanstack/react-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from 'pl-fe/actions/settings';
import { fetchStatusWithContext } from 'pl-fe/actions/statuses';
import DropdownMenu, { type Menu } from 'pl-fe/components/dropdown-menu';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import Thread from 'pl-fe/features/status/components/thread';
import { statusRoute } from 'pl-fe/features/ui/router';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetStatus } from 'pl-fe/selectors';
import { useSettings } from 'pl-fe/stores/settings';

const messages = defineMessages({
  title: { id: 'status.title', defaultMessage: 'Post details' },
  titleDirect: { id: 'status.title_direct', defaultMessage: 'Direct message' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this post?' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftHeading: { id: 'confirmations.redraft.heading', defaultMessage: 'Delete & redraft' },
  redraftMessage: { id: 'confirmations.redraft.message', defaultMessage: 'Are you sure you want to delete this post and re-draft it? Favorites and reposts will be lost, and replies to the original post will be orphaned.' },
  revealAll: { id: 'status.show_more_all', defaultMessage: 'Show more for all' },
  hideAll: { id: 'status.show_less_all', defaultMessage: 'Show less for all' },
  detailedStatus: { id: 'status.detailed_status', defaultMessage: 'Detailed conversation view' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  treeView: { id: 'status.thread.tree_view', defaultMessage: 'Tree view' },
  linearView: { id: 'status.thread.linear_view', defaultMessage: 'Linear view' },
  expandAll: { id: 'status.thread.expand_all', defaultMessage: 'Expand all posts' },
});

const StatusPage: React.FC = () => {
  const { statusId } = statusRoute.useParams();

  const dispatch = useAppDispatch();
  const intl = useIntl();

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector((state) => getStatus(state, { id: statusId }));
  const [expandAllStatuses, setExpandAllStatuses] = useState<() => void>();
  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);

  const { displaySpoilers, threads: { displayMode } } = useSettings();

  /** Fetch the status (and context) from the API. */
  const fetchData = () => {
    return dispatch(fetchStatusWithContext(statusId, intl));
  };

  // Load data.
  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [statusId]);

  const handleRefresh = () => fetchData();

  const items = useMemo(() => {
    const menu: Menu = [
      {
        text: intl.formatMessage(messages.treeView),
        action: () => dispatch(changeSetting(['threads', 'displayMode'], 'tree')),
        icon: require('@phosphor-icons/core/regular/tree-view.svg'),
        type: 'radio',
        checked: displayMode === 'tree',
      },
      {
        text: intl.formatMessage(messages.linearView),
        action: () => dispatch(changeSetting(['threads', 'displayMode'], 'linear')),
        icon: require('@phosphor-icons/core/regular/list-bullets.svg'),
        type: 'radio',
        checked: displayMode === 'linear',
      },
    ];

    if (!displaySpoilers && expandAllStatuses) {
      menu.push(
        null,
        {
          text: intl.formatMessage(messages.expandAll),
          action: expandAllStatuses,
          icon: require('@phosphor-icons/core/regular/caret-down.svg'),
        },
      );
    }
    return menu;
  }, [displayMode, expandAllStatuses]);

  if (status?.event) {
    return (
      <Navigate to='/@{$username}/events/$statusId' params={{ username: status.account.acct, statusId: status.id }} replace />
    );
  }

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
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
    <Stack space={4}>
      <Column
        label={intl.formatMessage(titleMessage())}
        action={<DropdownMenu items={items} src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')} />}
      >
        <PullToRefresh onRefresh={handleRefresh}>
          <Thread key={status.id} status={status} setExpandAllStatuses={(fn) => setExpandAllStatuses(() => fn)} />
        </PullToRefresh>
      </Column>
    </Stack>
  );
};

export { StatusPage as default };
