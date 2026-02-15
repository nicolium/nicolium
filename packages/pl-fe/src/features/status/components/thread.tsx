import { createSelector } from '@reduxjs/toolkit';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';

import { type ComposeReplyAction, mentionCompose, replyCompose } from '@/actions/compose';
import ScrollableList from '@/components/scrollable-list';
import StatusActionBar from '@/components/status-action-bar';
import Tombstone from '@/components/tombstone';
import Stack from '@/components/ui/stack';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import PendingStatus from '@/features/ui/components/pending-status';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import {
  useFavouriteStatus,
  useReblogStatus,
  useUnfavouriteStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { RootState } from '@/store';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useStatusMetaActions } from '@/stores/status-meta';
import { selectChild } from '@/utils/scroll-utils';
import { textForScreenReader } from '@/utils/status';

import DetailedStatus from './detailed-status';
import ThreadStatus from './thread-status';

import type { Status } from '@/normalizers/status';
import type { SelectedStatus } from '@/selectors';
import type { Account } from 'pl-api';
import type { VirtuosoHandle } from 'react-virtuoso';

const makeGetAncestorsIds = () =>
  createSelector(
    [(_: RootState, statusId: string) => statusId, (state: RootState) => state.contexts.inReplyTos],
    (statusId, inReplyTos) => {
      let ancestorsIds: Array<string> = [];
      let id: string = statusId;

      while (id && !ancestorsIds.includes(id)) {
        ancestorsIds = [id, ...ancestorsIds];
        id = inReplyTos[id];
      }

      return [...new Set(ancestorsIds)];
    },
  );

const makeGetDescendantsIds = () =>
  createSelector(
    [(_: RootState, statusId: string) => statusId, (state: RootState) => state.contexts.replies],
    (statusId, contextReplies) => {
      let descendantsIds: Array<string> = [];
      const ids = [statusId];

      while (ids.length > 0) {
        const id = ids.shift();
        if (!id) break;

        const replies = contextReplies[id];

        if (descendantsIds.includes(id)) {
          break;
        }

        if (statusId !== id) {
          descendantsIds = [...descendantsIds, id];
        }

        if (replies) {
          replies.toReversed().forEach((reply: string) => {
            ids.unshift(reply);
          });
        }
      }

      return [...new Set(descendantsIds)];
    },
  );

const makeGetThreadStatusesIds = () =>
  createSelector(
    [
      (_: RootState, statusId: string) => statusId,
      (state: RootState) => state.contexts.inReplyTos,
      (state: RootState) => state.contexts.replies,
    ],
    (statusId, inReplyTos, replies) => {
      let parentStatus: string = statusId;

      while (inReplyTos[parentStatus]) {
        parentStatus = inReplyTos[parentStatus];
      }

      const threadStatuses = [parentStatus];

      for (let i = 0; i < threadStatuses.length; i++) {
        for (const reply of replies[threadStatuses[i]] || []) {
          if (!threadStatuses.includes(reply)) threadStatuses.push(reply);
        }
      }

      return threadStatuses.toSorted();
    },
  );

const makeGetThread = (linear = false) => {
  if (linear) {
    const getThreadStatusesIds = makeGetThreadStatusesIds();
    return (state: RootState, statusId: string) => getThreadStatusesIds(state, statusId);
  }

  const getAncestorsIds = makeGetAncestorsIds();
  const getDescendantsIds = makeGetDescendantsIds();

  return createSelector(
    [
      (state: RootState, statusId: string) => getAncestorsIds(state, statusId),
      (state: RootState, statusId: string) => getDescendantsIds(state, statusId),
      (_, statusId: string) => statusId,
    ],
    (ancestorsIds, descendantsIds, statusId) => {
      ancestorsIds = ancestorsIds.filter((id) => id !== statusId && !descendantsIds.includes(id));
      descendantsIds = descendantsIds.filter((id) => id !== statusId && !ancestorsIds.includes(id));

      return [...ancestorsIds, statusId, ...descendantsIds];
    },
  );
};

interface IThread {
  status: SelectedStatus;
  withMedia?: boolean;
  isModal?: boolean;
  itemClassName?: string;
  setExpandAllStatuses?: (fn: () => void) => void;
}

const Thread = ({
  itemClassName,
  status,
  isModal,
  withMedia = true,
  setExpandAllStatuses,
}: IThread) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const intl = useIntl();

  const { expandStatuses, revealStatusesMedia, toggleStatusesMediaHidden } = useStatusMetaActions();
  const { openModal } = useModalsActions();
  const {
    boostModal,
    threads: { displayMode },
  } = useSettings();

  const { mutate: favouriteStatus } = useFavouriteStatus(status.id);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(status.id);
  const { mutate: reblogStatus } = useReblogStatus(status.id);
  const { mutate: unreblogStatus } = useUnreblogStatus(status.id);

  const linear = displayMode === 'linear';

  const getThread = useCallback(makeGetThread(linear), [linear]);

  const thread = useAppSelector((state) => getThread(state, status.id));

  const statusIndex = thread.indexOf(status.id);
  const initialIndex = isModal && statusIndex !== 0 ? statusIndex + 1 : statusIndex;

  const node = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle>(null);

  const handleHotkeyReact = () => {
    if (statusRef.current) {
      (node.current?.querySelector('.emoji-picker-dropdown') as HTMLButtonElement)?.click();
    }
  };

  const handleFavouriteClick = (status: SelectedStatus) => {
    if (status.favourited) unfavouriteStatus();
    else favouriteStatus();
  };

  const handleReplyClick = (status: ComposeReplyAction['status']) => {
    dispatch(replyCompose(status));
  };

  const handleReblogClick = (status: SelectedStatus, e?: React.MouseEvent) => {
    if (status.reblogged) {
      unreblogStatus();
    } else if ((e && e.shiftKey) || !boostModal) {
      reblogStatus(undefined);
    } else {
      openModal('BOOST', {
        statusId: status.id,
        onReblog: () => {
          reblogStatus(undefined);
        },
      });
    }
  };

  const handleMentionClick = (account: Pick<Account, 'acct'>) => {
    dispatch(mentionCompose(account));
  };

  const handleHotkeyOpenMedia = (e?: KeyboardEvent) => {
    const media = status.media_attachments;

    e?.preventDefault();

    if (media && media.length) {
      openModal('MEDIA', { media, index: 0, statusId: status.id });
    }
  };

  const handleHotkeyMoveUp = () => {
    handleMoveUp(status.id);
  };

  const handleHotkeyMoveDown = () => {
    handleMoveDown(status.id);
  };

  const handleHotkeyReply = (e?: KeyboardEvent) => {
    e?.preventDefault();
    handleReplyClick(status);
  };

  const handleHotkeyFavourite = () => {
    handleFavouriteClick(status);
  };

  const handleHotkeyBoost = () => {
    handleReblogClick(status);
  };

  const handleHotkeyMention = (e?: KeyboardEvent) => {
    e?.preventDefault();
    const { account } = status;
    if (!account || typeof account !== 'object') return;
    handleMentionClick(account);
  };

  const handleHotkeyOpenProfile = () => {
    navigate({ to: '/@{$username}', params: { username: status.account.acct } });
  };

  const handleHotkeyToggleSensitive = () => {
    toggleStatusesMediaHidden([status.id]);
  };

  const handleMoveUp = (id: string) => {
    const modalOffset = isModal ? 1 : 0;
    if (id === status.id) {
      selectChild(statusIndex - 1 + modalOffset, scroller, node.current ?? undefined);
    } else {
      let index = thread.indexOf(id);

      if (index === -1) {
        index = thread.indexOf(id);
        selectChild(index + modalOffset, scroller, node.current ?? undefined);
      } else {
        selectChild(index - 1 + modalOffset, scroller, node.current ?? undefined);
      }
    }
  };

  const handleMoveDown = (id: string) => {
    const modalOffset = isModal ? 1 : 0;
    if (id === status.id) {
      selectChild(
        statusIndex + 1 + modalOffset,
        scroller,
        node.current ?? undefined,
        thread.length + modalOffset,
      );
    } else {
      let index = thread.indexOf(id);

      if (index === -1) {
        index = thread.indexOf(id);
        selectChild(
          index + modalOffset,
          scroller,
          node.current ?? undefined,
          thread.length + modalOffset,
        );
      } else {
        selectChild(
          index + 1 + modalOffset,
          scroller,
          node.current ?? undefined,
          thread.length + modalOffset,
        );
      }
    }
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
      focusedStatusId={status.id}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      contextType='thread'
      linear={linear}
    />
  );

  const renderPendingStatus = (id: string) => {
    const idempotencyKey = id.replace(/^末pending-/, '');

    return <PendingStatus key={id} idempotencyKey={idempotencyKey} variant='default' />;
  };

  const renderChildren = (list: Array<string>) =>
    list.map((id) => {
      if (id === status.id)
        return (
          <div className={clsx({ 'pb-4': hasDescendants })} key={status.id}>
            {status.deleted ? (
              <Tombstone
                id={status.id}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                deleted
              />
            ) : (
              <Hotkeys handlers={handlers}>
                <div
                  ref={statusRef}
                  className='relative'
                  tabIndex={0}
                  // FIXME: no "reblogged by" text is added for the screen reader
                  aria-label={textForScreenReader(intl, status)}
                >
                  <DetailedStatus
                    status={status}
                    onOpenCompareHistoryModal={handleOpenCompareHistoryModal}
                    withMedia={withMedia}
                  />

                  {!status.rss_feed && (
                    <>
                      <hr className='-mx-4 mb-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />

                      <StatusActionBar status={status} expandable={isModal} space='lg' withLabels />
                    </>
                  )}
                </div>
              </Hotkeys>
            )}

            {hasDescendants && (
              <hr className='-mx-4 mt-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />
            )}
          </div>
        );

      if (id.endsWith('-tombstone')) {
        return renderTombstone(id);
      } else if (id.startsWith('末pending-')) {
        return renderPendingStatus(id);
      } else {
        return renderStatus(id);
      }
    });

  // Scroll focused status into view when thread updates.
  useEffect(() => {
    scroller.current?.scrollToIndex({
      index: statusIndex,
      offset: -146,
    });

    // TODO: Actually fix this
    setTimeout(() => {
      scroller.current?.scrollToIndex({
        index: linear ? 0 : statusIndex,
        offset: -146,
      });

      setTimeout(() => {
        (node.current?.querySelector('.detailed-actualStatus') as HTMLDivElement)?.focus();
      }, 100);
    }, 0);
  }, [status.id, statusIndex]);

  const handleOpenCompareHistoryModal = useCallback(
    (status: Pick<Status, 'id'>) => {
      openModal('COMPARE_HISTORY', {
        statusId: status.id,
      });
    },
    [status.id],
  );

  const hasDescendants = thread.length > statusIndex;

  type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

  const handlers: HotkeyHandlers = {
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    openProfile: handleHotkeyOpenProfile,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  const children = useMemo(() => {
    const children = renderChildren(thread);

    if (isModal) children.unshift(<div key='padding' className='h-4' />);

    return children;
  }, [thread, linear, status, isModal]);

  useEffect(() => {
    setExpandAllStatuses?.(() => {
      expandStatuses(thread);
      revealStatusesMedia(thread);
    });
  }, [thread]);

  return (
    <Stack
      space={2}
      className={clsx({
        'h-full': isModal,
        'mt-2': !isModal,
      })}
    >
      {status.account.local === false && (
        <Helmet>
          <meta content='noindex, noarchive' name='robots' />
        </Helmet>
      )}

      <div
        ref={node}
        className={clsx('bg-white black:bg-black dark:bg-primary-900', {
          'h-full overflow-auto': isModal,
        })}
      >
        <ScrollableList
          key={status.id}
          scrollKey={`thread:${status.id}`}
          id='thread'
          ref={scroller}
          placeholderComponent={() => <PlaceholderStatus variant='slim' />}
          initialTopMostItemIndex={initialIndex}
          itemClassName={itemClassName}
          listClassName={clsx({
            'h-full': isModal,
          })}
          useWindowScroll={!isModal}
          customScrollParent={isModal ? (node.current ?? undefined) : undefined}
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export { makeGetDescendantsIds, Thread as default };
