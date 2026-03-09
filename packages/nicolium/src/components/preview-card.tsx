import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import {
  type MediaAttachment,
  type PreviewCard as CardEntity,
  mediaAttachmentSchema,
} from 'pl-api';
import React, { useState, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import Blurhash from '@/components/media/blurhash';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useSettings } from '@/stores/settings';
import { getTextDirection } from '@/utils/rtl';
import Purify from '@/utils/url-purify';

import HoverAccountWrapper from './accounts/hover-account-wrapper';
import Avatar from './ui/avatar';

const messages = defineMessages({
  play: { id: 'preview_card.play', defaultMessage: 'Play' },
  expand: { id: 'preview_card.expand', defaultMessage: 'Enlarge image' },
  externalLink: { id: 'preview_card.external_link', defaultMessage: 'Open in new tab' },
});

const domParser = new DOMParser();

const handleIframeUrl = (html: string, url: string, providerName: string) => {
  const document = domParser.parseFromString(html, 'text/html').documentElement;
  const iframe = document.querySelector('iframe');
  const startTime = new URL(url).searchParams.get('t');

  if (iframe) {
    const iframeUrl = new URL(iframe.src);

    iframeUrl.searchParams.set('autoplay', '1');
    iframeUrl.searchParams.set('auto_play', '1');

    if (providerName === 'YouTube') {
      iframeUrl.searchParams.set('start', startTime ?? '');
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    }

    iframe.allow = 'autoplay';

    iframe.src = iframeUrl.href;

    return iframe.outerHTML;
  }

  return '';
};

const getRatio = (card: CardEntity): number => {
  const ratio = card.width / card.height || 16 / 9;

  // Constrain to a sane limit
  // https://en.wikipedia.org/wiki/Aspect_ratio_(image)
  return Math.min(Math.max(9 / 16, ratio), 4);
};

interface IPreviewCardVideo {
  card: CardEntity;
}

const PreviewCardVideo: React.FC<IPreviewCardVideo> = React.memo(
  React.forwardRef<HTMLDivElement, IPreviewCardVideo>(({ card }, ref) => {
    const html = DOMPurify.sanitize(handleIframeUrl(card.html, card.url, card.provider_name), {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'referrerpolicy'],
    });
    const content = { __html: html };

    const ratio = getRatio(card);

    return (
      <div
        ref={ref}
        className='status-card__image status-card-video'
        dangerouslySetInnerHTML={content}
        style={{ aspectRatio: ratio }}
      />
    );
  }),
);

/** Props for `PreviewCard`. */
interface IPreviewCard {
  card: CardEntity;
  maxTitle?: number;
  maxDescription?: number;
  onOpenMedia: (attachments: Array<MediaAttachment>, index: number) => void;
  compact?: boolean;
  defaultWidth?: number;
  cacheWidth?: (width: number) => void;
  horizontal?: boolean;
}

/** Displays a Mastodon link preview. Similar to OEmbed. */
const PreviewCard: React.FC<IPreviewCard> = ({
  card,
  defaultWidth = 467,
  maxTitle = 120,
  maxDescription = 200,
  compact = false,
  cacheWidth,
  onOpenMedia,
}): React.JSX.Element => {
  const intl = useIntl();
  const {
    urlPrivacy: { clearLinksInContent, redirectLinksMode },
  } = useSettings();
  const [width, setWidth] = useState(defaultWidth);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(false);
  }, [card.url]);

  let href = card.url;

  if (clearLinksInContent) {
    try {
      href = Purify.clearUrl(href, clearLinksInContent, redirectLinksMode !== 'off');
    } catch (_) {
      //
    }
  }
  const direction = getTextDirection(card.title + card.description);

  const trimmedTitle = trim(card.title, maxTitle);
  const trimmedDescription = trim(card.description, maxDescription);

  const handlePhotoClick = () => {
    const attachment = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: card.embed_url,
      description: trimmedTitle,
      meta: {
        original: {
          width: card.width,
          height: card.height,
        },
      },
    });

    onOpenMedia([attachment], 0);
  };

  const handleEmbedClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();

    if (card.type === 'photo') {
      handlePhotoClick();
    } else {
      setEmbedded(true);
    }
  };

  const setRef: React.RefCallback<HTMLElement> = (c) => {
    if (c) {
      if (cacheWidth) {
        cacheWidth(c.offsetWidth);
      }

      setWidth(c.offsetWidth);
    }
  };

  const interactive = card.type !== 'link';
  const horizontal = interactive || embedded;
  const className = clsx(
    'status-card relative z-[1] flex-col bg-white black:bg-black dark:bg-primary-900 md:flex-row',
    { horizontal, compact, interactive },
    `status-card--${card.type}`,
  );
  const ratio = getRatio(card);
  const height = compact && !embedded ? width / (16 / 9) : width / ratio;

  const title = interactive ? (
    <a
      onClick={(e) => {
        e.stopPropagation();
      }}
      href={href}
      title={trimmedTitle}
      rel='noopener noreferrer'
      target='_blank'
      dir={direction}
    >
      <span dir={direction}>{trimmedTitle}</span>
    </a>
  ) : (
    <span title={trimmedTitle} dir={direction}>
      {trimmedTitle}
    </span>
  );

  const description = (
    <div className='flex flex-1 flex-col overflow-hidden p-4'>
      {trimmedTitle && (
        <Text weight='bold' direction={direction}>
          {title}
        </Text>
      )}
      {trimmedDescription && <Text direction={direction}>{trimmedDescription}</Text>}
      <div className='flex items-center gap-1'>
        <Text tag='span' theme='muted'>
          <Icon src={require('@phosphor-icons/core/regular/link-simple.svg')} />
        </Text>
        <Text tag='span' theme='muted' size='sm' direction={direction}>
          {card.provider_name}
        </Text>
      </div>
    </div>
  );

  let embed: React.ReactNode = null;

  const canvas = <Blurhash className='absolute inset-0 -z-10 size-full' hash={card.blurhash} />;

  const thumbnail = (
    <div
      style={{
        backgroundImage: `url(${card.image})`,
        width: horizontal ? width : undefined,
        height: horizontal ? height : undefined,
        aspectRatio: ratio,
      }}
      className='status-card__image-image'
      title={card.image_description || undefined}
    />
  );

  if (interactive) {
    if (embedded) {
      embed = <PreviewCardVideo card={card} />;
    } else {
      let iconVariant = require('@phosphor-icons/core/regular/play.svg');

      if (card.type === 'photo') {
        iconVariant = require('@phosphor-icons/core/regular/magnifying-glass-plus.svg');
      }

      embed = (
        <div className='status-card__image'>
          {canvas}
          {thumbnail}

          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='flex items-center justify-center rounded-full bg-gray-500/90 px-4 py-3 shadow-md dark:bg-gray-700/90'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={handleEmbedClick}
                  className='appearance-none text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                  title={intl.formatMessage(
                    card.type === 'photo' ? messages.expand : messages.play,
                  )}
                >
                  <Icon src={iconVariant} className='size-6 text-inherit' />
                </button>

                {horizontal && (
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                    title={intl.formatMessage(messages.externalLink)}
                  >
                    <Icon
                      src={require('@phosphor-icons/core/regular/arrow-square-out.svg')}
                      className='size-6 text-inherit'
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={className} ref={setRef}>
        {embed}
        {description}
      </div>
    );
  } else if (card.image) {
    embed = (
      <div
        className={clsx(
          'status-card__image',
          'w-full flex-none rounded-l md:size-auto md:flex-auto',
          {
            'h-auto': horizontal,
            'h-[200px]': !horizontal,
          },
        )}
      >
        {canvas}
        {thumbnail}
      </div>
    );
  }

  const link = (
    <a
      href={href}
      className={className}
      target='_blank'
      rel='noopener noreferrer'
      ref={setRef}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {embed}
      {description}
    </a>
  );

  if (card.authors.length) {
    return (
      <div className='flex flex-col'>
        {link}
        <div className='-mt-4 rounded-lg border border-t-0 border-solid border-gray-200 bg-gray-100 p-2 pt-6 black:bg-primary-900 dark:border-gray-800 dark:bg-primary-700'>
          <Text theme='muted' className='flex items-center gap-2'>
            <FormattedMessage
              id='link_preview.more_from_author'
              defaultMessage='From {name}'
              values={{
                name: card.authors.map((author) => {
                  const linkBody = (
                    <div className='flex items-center gap-1'>
                      {author.account && (
                        <Avatar
                          src={author.account?.avatar}
                          size={16}
                          username={author.account.username}
                        />
                      )}
                      <Text weight='medium'>
                        <Emojify
                          text={author.account?.display_name ?? author.name}
                          emojis={author.account?.emojis}
                        />
                      </Text>
                    </div>
                  );
                  return (
                    <HoverAccountWrapper
                      key={author.url}
                      accountId={author.account?.id}
                      element='bdi'
                    >
                      {author.account ? (
                        <Link to='/@{$username}' params={{ username: author.account?.acct ?? '' }}>
                          {linkBody}
                        </Link>
                      ) : (
                        <a href={author.url} target='_blank' rel='noopener noreferrer'>
                          {linkBody}
                        </a>
                      )}
                    </HoverAccountWrapper>
                  );
                }),
              }}
            />
          </Text>
        </div>
      </div>
    );
  }

  return link;
};

/** Trim the text, adding ellipses if it's too long. */
const trim = (text: string, len: number): string => {
  const cut = text.indexOf(' ', len);

  if (cut === -1) {
    return text;
  }

  return text.slice(0, cut) + (text.length > len ? '…' : '');
};

export { PreviewCard as default };
