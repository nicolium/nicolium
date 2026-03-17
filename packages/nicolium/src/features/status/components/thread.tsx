import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import StatusActionBar from '@/components/statuses/status-action-bar';
import Tombstone from '@/components/statuses/tombstone';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import PendingStatus from '@/features/ui/components/pending-status';
import {
  useFavouriteStatus,
  useReblogStatus,
  useUnfavouriteStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { useComposeActions } from '@/stores/compose';
import { useThread, useThreadDepths } from '@/stores/contexts';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';
import { selectChild } from '@/utils/scroll-utils';
import { textForScreenReader } from '@/utils/status';

import DetailedStatus from './detailed-status';
import ThreadStatus from './thread-status';

import type { NormalizedStatus as Status } from '@/normalizers/status';
import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { Account } from 'pl-api';
import type { VirtuosoHandle } from 'react-virtuoso';

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
  const navigate = useNavigate();
  const intl = useIntl();
  const { replyCompose, mentionCompose } = useComposeActions();

  const { deleted } = useStatusMeta(status.id);
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
  const treeIndent = displayMode === 'tree-indent';
  const thread = useThread(status.id, linear);
  const depths = useThreadDepths(treeIndent ? status.id : undefined);

  const statusIndex = thread.indexOf(status.id);
  const initialIndex = isModal && statusIndex !== 0 ? statusIndex + 1 : statusIndex;

  const node = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle | null>(null);

  const handleFavouriteClick = (status: SelectedStatus) => {
    if (status.favourited) unfavouriteStatus();
    else favouriteStatus();
  };

  const handleReplyClick = (status: Parameters<typeof replyCompose>[0]) => {
    replyCompose(status);
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
    mentionCompose(account);
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
    if (status.rss_feed) return;

    e?.preventDefault();
    handleReplyClick(status);
  };

  const handleHotkeyFavourite = () => {
    if (status.rss_feed) return;

    handleFavouriteClick(status);
  };

  const handleHotkeyBoost = () => {
    if (status.rss_feed) return;

    handleReblogClick(status);
  };

  const handleHotkeyMention = (e?: KeyboardEvent) => {
    if (status.rss_feed) return;

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

  const handleHotkeyReact = () => {
    if (status.rss_feed) return;

    if (statusRef.current) {
      (node.current?.querySelector('.emoji-picker-dropdown') as HTMLButtonElement)?.click();
    }
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

  const renderStatus = (id: string) => {
    const isAncestor = treeIndent && thread.indexOf(id) < statusIndex;
    return (
      <ThreadStatus
        key={id}
        id={id}
        focusedStatusId={status.id}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        contextType='thread'
        linear={linear}
        depth={treeIndent ? depths[id] : undefined}
        isAncestor={isAncestor}
      />
    );
  };

  const renderPendingStatus = (id: string) => {
    const idempotencyKey = id.replace(/^末pending-/, '');

    return <PendingStatus key={id} idempotencyKey={idempotencyKey} variant='default' />;
  };

  const renderChildren = (list: Array<string>) =>
    list.map((id) => {
      if (id === status.id)
        return (
          <div className={clsx({ 'pb-4': hasDescendants })} key={status.id}>
            {deleted ? (
              <Tombstone
                id={status.id}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                deleted
              />
            ) : (
              <Hotkeys handlers={handlers} element='article' lang={status.language || undefined}>
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
        (node.current?.querySelector('.⁂-detailed-status') as HTMLDivElement)?.focus();
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
  }, [thread, displayMode, status, isModal]);

  const meta = useMemo(() => {
    const firstAttachment = status.media_attachments && status.media_attachments[0];

    return (
      <>
        {status.spoiler_text && <meta property='og:title' content={status.spoiler_text} />}
        {(firstAttachment?.type === 'image' || firstAttachment?.type === 'gifv') && (
          <>
            <meta property='og:image' content={firstAttachment.preview_url} />
            <meta property='og:image:alt' content={firstAttachment.description || ''} />
            {firstAttachment.mime_type && (
              <meta property='og:type' content={firstAttachment.mime_type} />
            )}
            {firstAttachment.meta.original && (
              <meta
                property='og:image:width'
                content={firstAttachment.meta.original.width.toString()}
              />
            )}
            {firstAttachment.meta.original && (
              <meta
                property='og:image:height'
                content={firstAttachment.meta.original.height.toString()}
              />
            )}
          </>
        )}
        <meta property='og:url' content={status.url} />
        <meta name='author' content={status.account.display_name || status.account.acct} />
        <meta property='article:author' content={status.account.url} />
        <meta property='article:published_time' content={status.created_at} />
        <meta property='fediverse.creator' name='fediverse.creator' content={status.account.acct} />
        {status.edited_at && <meta property='article:modified_time' content={status.edited_at} />}

        {status.account.local === false && <meta content='noindex, noarchive' name='robots' />}
      </>
    );
  }, [status]);

  useEffect(() => {
    setExpandAllStatuses?.(() => {
      expandStatuses(thread);
      revealStatusesMedia(thread);
    });
  }, [thread]);

  return (
    <div
      className={clsx('flex flex-col gap-2', {
        'h-full': isModal,
        'mt-2': !isModal,
      })}
    >
      {meta}

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
    </div>
  );
};

export { Thread as default };
