import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AnimatedNumber from '@/components/animated-number';
import { useFeatures } from '@/hooks/use-features';
import { useAccount } from '@/queries/accounts/use-account';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';

interface IStatusInteractionBar {
  status: Pick<
    Status,
    | 'id'
    | 'account_id'
    | 'dislikes_count'
    | 'favourited'
    | 'favourites_count'
    | 'emoji_reactions'
    | 'reblogs_count'
    | 'quotes_count'
  >;
}

const StatusInteractionBar: React.FC<IStatusInteractionBar> = ({
  status,
}): React.JSX.Element | null => {
  const { openModal } = useModalsActions();
  const features = useFeatures();
  const { data: account } = useAccount(status.account_id);
  const { demetricator } = useSettings();

  if (!account || typeof account !== 'object') return null;

  const handleOpenReblogsModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    openModal('REBLOGS', { statusId: status.id });
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
          params={{ username: account?.acct ?? '', statusId: status.id }}
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

    openModal('FAVOURITES', { statusId: status.id });
  };

  const handleOpenDislikesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    openModal('DISLIKES', { statusId: status.id });
  };

  const handleOpenReactionsModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    openModal('REACTIONS', { statusId: status.id });
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

  const getReactions = () => {
    if (demetricator !== 'always') return null;

    const reactionsCount = status.emoji_reactions.reduce(
      (sum, reaction) => sum + (reaction.count || 0),
      0,
    );

    if (reactionsCount) {
      return (
        <InteractionCounter
          count={reactionsCount}
          onClick={features.exposableReactions ? handleOpenReactionsModal : undefined}
        >
          <FormattedMessage
            id='status.interactions.reactions'
            defaultMessage='{count, plural, one {Reaction} other {Reactions}}'
            values={{ count: reactionsCount }}
          />
        </InteractionCounter>
      );
    }
    return null;
  };

  return (
    <div className='status-interaction-bar'>
      {getReposts()}
      {getQuotes()}
      {getFavourites()}
      {getDislikes()}
      {getReactions()}
    </div>
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
  const { demetricator } = useSettings();

  const className = clsx('status-interaction-bar__counter', {
    'status-interaction-bar__counter--hoverable': features.exposableReactions,
    'status-interaction-bar__counter--static': !features.exposableReactions,
  });

  const body = (
    <div className='status-interaction-bar__body'>
      <span className='status-interaction-bar__count'>
        <AnimatedNumber value={count} obfuscate={demetricator === 'always'} short />
      </span>

      <div className='status-interaction-bar__label'>{children}</div>
    </div>
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
