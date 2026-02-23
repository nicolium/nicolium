import { Link, LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AnimatedNumber from '@/components/animated-number';
import HStack from '@/components/ui/hstack';
import Text from '@/components/ui/text';
import { useFeatures } from '@/hooks/use-features';
import { useModalsActions } from '@/stores/modals';

import type { Status } from '@/normalizers/status';

interface IStatusInteractionBar {
  status: Pick<
    Status,
    | 'id'
    | 'account'
    | 'dislikes_count'
    | 'favourited'
    | 'favourites_count'
    | 'reblogs_count'
    | 'quotes_count'
  >;
}

const StatusInteractionBar: React.FC<IStatusInteractionBar> = ({ status }): JSX.Element | null => {
  const { openModal } = useModalsActions();
  const features = useFeatures();
  const { account } = status;

  if (!account || typeof account !== 'object') return null;

  const onOpenReblogsModal = (statusId: string): void => {
    openModal('REBLOGS', { statusId });
  };

  const onOpenFavouritesModal = (statusId: string): void => {
    openModal('FAVOURITES', { statusId });
  };

  const onOpenDislikesModal = (statusId: string): void => {
    openModal('DISLIKES', { statusId });
  };

  const handleOpenReblogsModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    // if (!me) onOpenUnauthorizedModal();
    onOpenReblogsModal(status.id);
  };

  const getReposts = () => {
    if (status.reblogs_count) {
      return (
        <InteractionCounter count={status.reblogs_count} onClick={handleOpenReblogsModal}>
          <FormattedMessage
            id='status.interactions.reblogs'
            defaultMessage='{count, plural, one {Repost} other {Reposts}}'
            values={{ count: status.reblogs_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const getQuotes = () => {
    if (status.quotes_count) {
      return (
        <InteractionCounter
          count={status.quotes_count}
          to='/@{$username}/posts/$statusId/quotes'
          params={{ username: status.account.acct, statusId: status.id }}
        >
          <FormattedMessage
            id='status.interactions.quotes'
            defaultMessage='{count, plural, one {Quote} other {Quotes}}'
            values={{ count: status.quotes_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const handleOpenFavouritesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (
    e,
  ) => {
    e.preventDefault();

    // if (!me) onOpenUnauthorizedModal();
    onOpenFavouritesModal(status.id);
  };

  const handleOpenDislikesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    // if (!me) onOpenUnauthorizedModal();
    onOpenDislikesModal(status.id);
  };

  const getFavourites = () => {
    if (status.favourites_count) {
      return (
        <InteractionCounter
          count={status.favourites_count}
          onClick={features.exposableReactions ? handleOpenFavouritesModal : undefined}
        >
          <FormattedMessage
            id='status.interactions.favourites'
            defaultMessage='{count, plural, one {Like} other {Likes}}'
            values={{ count: status.favourites_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const getDislikes = () => {
    const dislikesCount = status.dislikes_count;

    if (dislikesCount) {
      return (
        <InteractionCounter
          count={status.dislikes_count}
          onClick={features.exposableReactions ? handleOpenDislikesModal : undefined}
        >
          <FormattedMessage
            id='status.interactions.dislikes'
            defaultMessage='{count, plural, one {Dislike} other {Dislikes}}'
            values={{ count: dislikesCount }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  return (
    <HStack space={3}>
      {getReposts()}
      {getQuotes()}
      {getFavourites()}
      {getDislikes()}
    </HStack>
  );
};

type IInteractionCounter = {
  count: number;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & (LinkOptions | {});

const InteractionCounter: React.FC<IInteractionCounter> = ({
  count,
  children,
  onClick,
  ...rest
}) => {
  const features = useFeatures();

  const className = clsx({
    'text-gray-600 dark:text-gray-700': true,
    'hover:underline': features.exposableReactions,
    'cursor-default': !features.exposableReactions,
  });

  const body = (
    <HStack space={1} alignItems='center'>
      <Text weight='bold'>
        <AnimatedNumber value={count} short />
      </Text>

      <Text tag='div' theme='muted'>
        {children}
      </Text>
    </HStack>
  );

  if ('to' in rest) {
    return (
      <Link className={className} {...rest}>
        {body}
      </Link>
    );
  }

  return (
    <button type='button' onClick={onClick} className={className}>
      {body}
    </button>
  );
};

export { StatusInteractionBar as default };
