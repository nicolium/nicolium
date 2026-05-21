import iconLinkSimple from '@phosphor-icons/core/regular/link-simple.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';

import { getTextDirection } from '@/utils/rtl';

import { accountsCountRenderer } from './hashtag';
import Blurhash from './media/blurhash';
import Icon from './ui/icon';
import Text from './ui/text';

import type { TrendsLink } from 'pl-api';

interface ITrendingLink {
  trendingLink: TrendsLink;
}

const TrendingLink: React.FC<ITrendingLink> = ({ trendingLink }) => {
  const count = Number(trendingLink.history?.[0]?.accounts);

  const direction = getTextDirection(trendingLink.title + trendingLink.description);

  let media;

  if (trendingLink.image) {
    media = (
      <div className='relative size-32 overflow-hidden rounded-md'>
        {trendingLink.blurhash && (
          <Blurhash className='absolute inset-0 z-0 size-full' hash={trendingLink.blurhash} />
        )}
        <img
          className='relative size-full object-cover'
          src={trendingLink.image}
          alt={trendingLink.image_description ?? undefined}
        />
      </div>
    );
  }

  return (
    <a
      className='flex cursor-pointer gap-4 overflow-hidden rounded-lg border border-solid border-gray-200 p-4 text-sm text-gray-800 no-underline hover:bg-gray-100 hover:no-underline dark:border-gray-800 dark:text-gray-200 dark:hover:bg-primary-800/30'
      href={trendingLink.url}
      target='_blank'
      rel='noopener noreferrer'
    >
      {media}
      <div className='flex flex-1 flex-col gap-2 overflow-hidden'>
        <Text className='line-clamp-2' weight='bold' direction={direction}>
          {trendingLink.title}
        </Text>
        {trendingLink.description && (
          <Text truncate direction={direction}>
            {trendingLink.description}
          </Text>
        )}
        <div className='divide-x-dot flex flex-wrap items-center text-gray-700 dark:text-gray-600'>
          <div className='flex items-center gap-1'>
            <Text tag='span' theme='muted'>
              <Icon src={iconLinkSimple} />
            </Text>
            <Text tag='span' theme='muted' size='sm' direction={direction}>
              {trendingLink.provider_name}
            </Text>
          </div>

          {!!count && (
            <>
              {' · '}
              <Link
                to='/links/$url'
                params={{ url: encodeURIComponent(trendingLink.url) }}
                className='hover:underline'
              >
                {accountsCountRenderer(count)}
              </Link>
            </>
          )}
        </div>
      </div>
    </a>
  );
};

export default TrendingLink;
