import iconArrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg';
import iconLinkSimple from '@phosphor-icons/core/regular/link-simple.svg';
import iconMagnifyingGlassPlus from '@phosphor-icons/core/regular/magnifying-glass-plus.svg';
import iconPlay from '@phosphor-icons/core/regular/play.svg';
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
import Emojify from '@/features/emoji/emojify';
import { useSettings } from '@/stores/settings';
import { getTextDirection } from '@/utils/rtl';
import Purify from '@/utils/url-purify';

import { AccountLink } from './accounts/account-link';
import HoverAccountWrapper from './accounts/hover-account-wrapper';
import StillImage from './still-image';
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
    disableUserProvidedMedia,
    displayPreviewCards,
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
    'status-card',
    { 'status-card--horizontal': horizontal, 'status-card--compact': compact },
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
    <div className='status-card__description'>
      {trimmedTitle && (
        <p className='status-card__title' style={{ direction }}>
          {title}
        </p>
      )}
      {trimmedDescription && <p style={{ direction }}>{trimmedDescription}</p>}
      <div className='status-card__provider'>
        <span className='status-card__provider__icon'>
          <Icon src={iconLinkSimple} />
        </span>
        <span className='status-card__provider__name' style={{ direction }}>
          {card.provider_name}
        </span>
      </div>
    </div>
  );

  let embed: React.ReactNode = null;

  const canvas = <Blurhash className='status-card__blur' hash={card.blurhash} />;

  const thumbnail = card.image ? (
    <StillImage
      src={card.image}
      style={{
        width: horizontal ? width : undefined,
        height: horizontal ? height : undefined,
        aspectRatio: ratio,
      }}
      alt={card.image_description || card.title}
      className='status-card__image-image'
    />
  ) : null;

  if (displayPreviewCards === 'default' && interactive && !disableUserProvidedMedia) {
    if (embedded) {
      embed = <PreviewCardVideo card={card} />;
    } else {
      const iconVariant = card.type === 'photo' ? iconMagnifyingGlassPlus : iconPlay;

      embed = (
        <div className='status-card__image'>
          {canvas}
          {thumbnail}

          <div className='status-card__overlay'>
            <div className='status-card__controls'>
              <button
                onClick={handleEmbedClick}
                className='status-card__embed-button'
                title={intl.formatMessage(card.type === 'photo' ? messages.expand : messages.play)}
              >
                <Icon src={iconVariant} />
              </button>

              {horizontal && (
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='status-card__embed-button'
                  title={intl.formatMessage(messages.externalLink)}
                >
                  <Icon src={iconArrowSquareOut} />
                </a>
              )}
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
  } else if (displayPreviewCards === 'default' && card.image && !disableUserProvidedMedia) {
    embed = (
      <div className='status-card__image status-card__image--link'>
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
      <div className='status-card__container'>
        {link}
        <div className='status-card__attribution'>
          <p>
            <FormattedMessage
              id='link_preview.more_from_author'
              defaultMessage='From {name}'
              values={{
                name: card.authors.map((author) => {
                  const linkBody = (
                    <span className='status-card__author'>
                      {author.account && (
                        <Avatar
                          src={author.account?.avatar}
                          size={16}
                          username={author.account.username}
                        />
                      )}
                      <span className='status-card__author__name'>
                        <Emojify
                          text={author.account?.display_name ?? author.name}
                          emojis={author.account?.emojis}
                        />
                      </span>
                    </span>
                  );
                  return (
                    <HoverAccountWrapper
                      key={author.url}
                      accountId={author.account?.id}
                      element='bdi'
                    >
                      {author.account ? (
                        <AccountLink account={author.account}>{linkBody}</AccountLink>
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
          </p>
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
