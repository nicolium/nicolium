import clsx from 'clsx';
import React, { useEffect, useMemo, useRef } from 'react';

import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import ScrollableList from '@/components/scrollable-list';
import PendingStatus from '@/components/statuses/pending-status';
import Status from '@/components/statuses/status';
import Tombstone from '@/components/statuses/tombstone';
import { useAsyncRefreshHeader, useThread, useThreadDepths } from '@/stores/contexts';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';
import { selectChild } from '@/utils/scroll-utils';

import RefreshController from './refresh-controller';
import ThreadStatus from './thread-status';

import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { VirtuosoHandle } from 'react-virtuoso';

const PlaceholderStatusSlim: React.FC = () => <PlaceholderStatus variant='slim' />;

interface IThread {
  status: SelectedStatus;
  withMedia?: boolean;
  isModal?: boolean;
  itemClassName?: string;
  setExpandAllStatuses?: (fn: () => void) => void;
  refetchContext?: () => Promise<void>;
}

const Thread = ({
  itemClassName,
  status,
  isModal,
  withMedia = true,
  setExpandAllStatuses,
  refetchContext,
}: IThread) => {
  const { deleted } = useStatusMeta(status.id);
  const { expandStatusSpoilers, revealStatusesMedia } = useStatusMetaActions();
  const {
    threads: { displayMode },
  } = useSettings();

  const asyncRefreshHeader = useAsyncRefreshHeader(status.id);

  const linear = displayMode === 'linear';
  const treeIndent = displayMode === 'tree-indent';
  const thread = useThread(status.id, linear);
  // non-pleromas don't return entire threads, just ancestors and descendants
  useThread(linear && thread[0] === status.id ? undefined : thread[0]);
  const depths = useThreadDepths(treeIndent ? status.id : undefined);

  const statusIndex = thread.indexOf(status.id);
  const initialIndex = isModal && statusIndex !== 0 ? statusIndex + 1 : statusIndex;

  const node = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle | null>(null);

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
    <div className='thread__deleted-status'>
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

    return (
      <div key={id} className={clsx('thread__status', { 'thread__status--linear': linear })}>
        <PendingStatus idempotencyKey={idempotencyKey} variant='default' />
      </div>
    );
  };

  const renderChildren = (list: Array<string>) =>
    list.map((id) => {
      if (id === status.id) {
        return (
          <div
            className={clsx('thread__focused', {
              'thread__focused--has-descendants': hasDescendants,
            })}
            key={status.id}
          >
            <div className='thread__detailed'>
              <Status
                status={status}
                detailed
                variant='default'
                contextType='thread'
                withMedia={withMedia}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            </div>

            {hasDescendants && <hr className='thread__divider' />}
          </div>
        );
      }

      if (id.endsWith('-tombstone') || id.endsWith('-unavailable')) {
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
        node.current?.querySelector<HTMLElement>('.thread__focused article')?.focus();
      }, 100);
    }, 0);
  }, [status.id, statusIndex]);

  const hasDescendants = thread.length > statusIndex + 1;

  const children = useMemo(() => {
    const children = renderChildren(thread);

    if (isModal) children.unshift(<div key='padding' className='thread__padding' />);

    return children;
  }, [thread, displayMode, status, isModal, deleted]);

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
      expandStatusSpoilers(thread);
      revealStatusesMedia(thread);
    });
  }, [thread]);

  return (
    <div className={clsx('thread', { 'thread--modal': isModal })}>
      {meta}

      <div
        ref={node}
        className={clsx('thread__container', { 'thread__container--modal': isModal })}
      >
        <ScrollableList
          key={status.id}
          scrollKey={`thread:${status.id}`}
          id='thread'
          ref={scroller}
          placeholderComponent={PlaceholderStatusSlim}
          initialTopMostItemIndex={initialIndex}
          itemClassName={itemClassName}
          listClassName={clsx({ 'thread__list--modal': isModal })}
          useWindowScroll={!isModal}
          customScrollParent={isModal ? (node.current ?? undefined) : undefined}
        >
          {children}
        </ScrollableList>
        {!isModal && refetchContext && (
          <RefreshController
            statusId={status.id}
            statusCreatedAt={status.created_at}
            isLocal={status.account.local ?? false}
            asyncRefreshHeader={asyncRefreshHeader}
            onLoadContext={refetchContext!}
          />
        )}
      </div>
    </div>
  );
};

export { Thread as default };
