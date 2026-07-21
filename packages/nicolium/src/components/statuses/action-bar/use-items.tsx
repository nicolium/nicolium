import React, { useCallback, useMemo } from 'react';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { useFeatures } from '@/hooks/use-features';
import { useModalsActions } from '@/stores/modals';

import { BookmarkButton } from './buttons/bookmark-button';
import { DislikeButton } from './buttons/dislike-button';
import { EmojiPickerButton } from './buttons/emoji-picker-button';
import { FavouriteButton } from './buttons/favourite-button';
import { QuickReactionButtons } from './buttons/quick-reaction-buttons';
import { QuoteButton } from './buttons/quote-button';
import { ReblogButton } from './buttons/reblog-button';
import { ReplyButton } from './buttons/reply-button';
import { ShareButton } from './buttons/share-button';
import { TranslateButton } from './buttons/translate-button';
import { WrenchButton } from './buttons/wrench-button';

import type { StatusAction } from './types';
import type { UnauthorizedModalAction } from '@/modals/unauthorized-modal';
import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { Account } from 'pl-api';

const useItems = (
  items: Readonly<Array<StatusAction>>,
  status: SelectedStatus | undefined,
  withLabels: boolean,
  rebloggedBy?: Account,
  withCounters?: boolean,
) => {
  const features = useFeatures();
  const { openModal } = useModalsActions();
  const me = useCurrentAccount();

  const publicStatus = useMemo(
    () => (status ? ['public', 'unlisted', 'group'].includes(status.visibility) : false),
    [status?.visibility],
  );

  const onOpenUnauthorizedModal = useCallback((action?: UnauthorizedModalAction) => {
    openModal('UNAUTHORIZED', {
      action,
      ap_id: status!.url,
    });
  }, []);

  return useMemo(() => {
    const renderedItems: React.ReactNode[] = [];

    if (!status) return renderedItems;

    for (const item of items) {
      switch (item) {
        case 'reply':
          renderedItems.push(
            <ReplyButton
              key='reply'
              status={status}
              withLabels={withLabels}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              rebloggedBy={rebloggedBy}
              withCounters={withCounters}
            />,
          );
          break;
        case 'reblog':
          renderedItems.push(
            <ReblogButton
              key='reblog'
              status={status}
              withLabels={withLabels}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              publicStatus={publicStatus}
              withQuote={!items.includes('quote')}
              withCounters={withCounters}
            />,
          );
          break;
        case 'favourite':
          renderedItems.push(
            <FavouriteButton
              key='favourite'
              status={status}
              withLabels={withLabels}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              withCounters={withCounters}
            />,
          );
          break;
        case 'dislike':
          if (features.statusDislikes) {
            renderedItems.push(
              <DislikeButton
                key='dislike'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
                withCounters={withCounters}
              />,
            );
          }
          break;
        case 'wrench':
          if (features.emojiReacts) {
            renderedItems.push(
              <WrenchButton
                key='wrench'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
                withCounters={withCounters}
              />,
            );
          }
          break;
        case 'reaction':
          if (features.emojiReacts) {
            renderedItems.push(
              <EmojiPickerButton key='emoji' status={status} withLabels={withLabels} me={me} />,
            );
          }
          break;
        case 'quick-reactions':
          renderedItems.push(
            <QuickReactionButtons
              key='quick-reactions'
              status={status}
              withLabels={withLabels}
              me={me}
            />,
          );
          break;
        case 'bookmark':
          if (features.bookmarks) {
            renderedItems.push(
              <BookmarkButton
                key='bookmark'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              />,
            );
          }
          break;
        case 'quote':
          if (features.quotePosts) {
            renderedItems.push(
              <QuoteButton
                key='quote'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
                withCounters={withCounters}
              />,
            );
          }
          break;
        case 'share':
          renderedItems.push(
            <ShareButton
              key='share'
              status={status}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
            />,
          );
          break;
        case 'translate':
          renderedItems.push(
            <TranslateButton
              key='translate'
              status={status}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
            />,
          );
          break;
        default:
          break;
      }
    }

    return renderedItems;
  }, [items, status, withLabels, me, onOpenUnauthorizedModal]);
};

export { useItems };
