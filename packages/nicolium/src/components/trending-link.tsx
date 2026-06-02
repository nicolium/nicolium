import iconLinkSimple from '@phosphor-icons/core/regular/link-simple.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';

import { getTextDirection } from '@/utils/rtl';

import { accountsCountRenderer } from './hashtag';
import Blurhash from './media/blurhash';
import Icon from './ui/icon';

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
      <div className='trending-link__media'>
        {trendingLink.blurhash && (
          <Blurhash className='trending-link__blurhash' hash={trendingLink.blurhash} />
        )}
        <img
          className='trending-link__image'
          src={trendingLink.image}
          alt={trendingLink.image_description ?? undefined}
        />
      </div>
    );
  }

  return (
    <a className='trending-link' href={trendingLink.url} target='_blank' rel='noopener noreferrer'>
      {media}
      <div className='trending-link__body'>
        <p className='trending-link__title' style={{ direction }}>
          {trendingLink.title}
        </p>
        {trendingLink.description && (
          <p className='trending-link__description' style={{ direction }}>
            {trendingLink.description}
          </p>
        )}
        <div className='trending-link__meta'>
          <div className='trending-link__provider'>
            <Icon src={iconLinkSimple} />
            <span className='trending-link__provider__name' style={{ direction }}>
              {trendingLink.provider_name}
            </span>
          </div>

          {!!count && (
            <>
              {' · '}
              <Link
                to='/links/$url'
                params={{ url: encodeURIComponent(trendingLink.url) }}
                className='trending-link__count'
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
