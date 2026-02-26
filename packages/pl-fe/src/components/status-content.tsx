import clsx from 'clsx';
import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import Stack from '@/components/ui/stack';
import Emojify from '@/features/emoji/emojify';
import QuotedStatus from '@/features/status/containers/quoted-status-container';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLocalStatusTranslation } from '@/queries/statuses/use-local-status-translation';
import { useStatusTranslation } from '@/queries/statuses/use-status-translation';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';
import { onlyEmoji as isOnlyEmoji } from '@/utils/rich-content';

import { getTextDirection } from '../utils/rtl';

import HashtagsBar from './hashtags-bar';
import Markup from './markup';
import OutlineBox from './outline-box';
import { parseContent } from './parsed-content';
import { ParsedMfm } from './parsed-mfm';
import Poll from './polls/poll';
import QuotedStatusIndicator from './quoted-status-indicator';
import StatusMedia from './status-media';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';
import TranslateButton from './translate-button';

import type { Sizes } from '@/components/ui/text';
import type { MinifiedStatus } from '@/reducers/statuses';

const BIG_EMOJI_LIMIT = 10;

interface IReadMoreButton {
  onClick?: React.MouseEventHandler;
  preview?: boolean;
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick, preview }) => (
  <div className='⁂-read-more-button__container'>
    <div className='⁂-read-more-button__gradient' />
    {!preview && (
      <button className='⁂-read-more-button' onClick={onClick}>
        <FormattedMessage id='status.read_more' defaultMessage='Read more' />
        <Icon
          className='inline-block size-5'
          src={require('@phosphor-icons/core/regular/caret-right.svg')}
        />
      </button>
    )}
  </div>
);

interface IStatusContent {
  status: MinifiedStatus;
  onClick?: () => void;
  collapsable?: boolean;
  translatable?: boolean;
  textSize?: Sizes;
  isQuote?: boolean;
  preview?: boolean;
  withMedia?: boolean;
  compose?: boolean;
}

/** Renders the text content of a status */
const StatusContent: React.FC<IStatusContent> = React.memo(
  ({
    status,
    onClick,
    collapsable = false,
    translatable,
    textSize = 'md',
    isQuote = false,
    preview,
    withMedia,
    compose = false,
  }) => {
    const { urlPrivacy, displaySpoilers, renderMfm } = useSettings();
    const { greentext } = useFrontendConfig();

    const [collapsed, setCollapsed] = useState<boolean | null>(null);
    const [onlyEmoji, setOnlyEmoji] = useState(false);
    const [lineClamp, setLineClamp] = useState(true);

    const contentNode = useRef<HTMLDivElement>(null);
    const spoilerNode = useRef<HTMLSpanElement>(null);

    const { collapseStatuses, expandStatuses } = useStatusMetaActions();
    const statusMeta = useStatusMeta(status.id);
    const { data: translation } = useStatusTranslation(status.id, statusMeta.targetLanguage);
    const { data: localTranslation } = useLocalStatusTranslation(
      status.id,
      statusMeta.localTargetLanguage,
    );

    const withSpoiler = status.spoiler_text?.length > 0;
    const expanded = !withSpoiler || (statusMeta.expanded ?? false);

    const maybeSetCollapsed = (): void => {
      if (!contentNode.current) return;

      if (collapsable || preview) {
        // 20px * x lines (+ 2px padding at the top)
        setCollapsed(
          contentNode.current.clientHeight >= (preview ? 82 : isQuote ? 202 : 282) ||
            contentNode.current.scrollWidth > contentNode.current.clientWidth,
        );
      }
    };

    const maybeSetOnlyEmoji = (): void => {
      if (!contentNode.current) return;
      const only = isOnlyEmoji(contentNode.current, BIG_EMOJI_LIMIT, true);

      if (only !== onlyEmoji) {
        setOnlyEmoji(only);
      }
    };

    const toggleExpanded: React.MouseEventHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (expanded) {
        collapseStatuses([status.id]);
        setCollapsed(null);
      } else expandStatuses([status.id]);
    };

    useLayoutEffect(() => {
      maybeSetCollapsed();
      maybeSetOnlyEmoji();
    }, [expanded]);

    const content = useMemo(
      (): string =>
        localTranslation
          ? localTranslation.content
          : translation
            ? translation.content
            : status.content_map && statusMeta.currentLanguage
              ? status.content_map[statusMeta.currentLanguage] || status.content
              : status.content,
      [status.content, localTranslation, translation, statusMeta.currentLanguage],
    );

    const { content: parsedContent, hashtags } = useMemo(() => {
      if (
        renderMfm &&
        !localTranslation &&
        !translation &&
        status.content_type === 'text/x.misskeymarkdown' &&
        status.text
      ) {
        return {
          content: (
            <ParsedMfm text={status.text} emojis={status.emojis} mentions={status.mentions} />
          ),
          hashtags: [],
        };
      }

      return parseContent(
        {
          html: content,
          mentions: status.mentions,
          hasQuote: !!status.quote_id,
          emojis: status.emojis,
          cleanUrls: urlPrivacy.clearLinksInContent,
          redirectUrls: urlPrivacy.redirectLinksMode !== 'off',
          displayTargetHost: urlPrivacy.displayTargetHost,
          greentext,
          speakAsCat: status.account.speak_as_cat,
        },
        true,
      );
    }, [content, renderMfm]);

    const spoilerText =
      status.spoiler_text_map && statusMeta.currentLanguage
        ? status.spoiler_text_map[statusMeta.currentLanguage] || status.spoiler_text
        : status.spoiler_text;

    useLayoutEffect(() => {
      setLineClamp(!spoilerNode.current || spoilerNode.current.clientHeight >= 96);
    }, [spoilerText]);

    const direction = getTextDirection(status.search_index);
    const className = useMemo(
      () =>
        clsx('⁂-status-content', {
          'overflow-hidden': collapsed,
          'max-h-[200px]': collapsed && !isQuote && !preview,
          'max-h-[120px]': collapsed && isQuote,
          'max-h-[80px]': collapsed && preview,
          'max-h-[282px]': collapsable && collapsed === null && !isQuote && !preview,
          'max-h-[202px]': collapsable && collapsed === null && isQuote,
          'max-h-[82px]': collapsed === null && preview,
          'big-emoji leading-normal': onlyEmoji,
          '⁂-status-content--expanded': !collapsable,
          '⁂-status-content--quote': isQuote,
          '⁂-status-content--preview': preview,
          '⁂-status-content--poll': !!status.poll_id,
        }),
      [collapsed, onlyEmoji],
    );

    const expandable = !displaySpoilers;

    const output = [];

    if (spoilerText) {
      output.push(
        <h2
          className={clsx('⁂-status-title', {
            '⁂-status-title--clamp': !expanded && lineClamp,
          })}
          key='spoiler'
          {...(expandable
            ? { onClick: toggleExpanded, role: 'button', 'aria-expanded': expanded }
            : {})}
        >
          <span ref={spoilerNode}>
            <Emojify text={spoilerText} emojis={status.emojis} />
          </span>
          {expandable && (
            <button onClick={toggleExpanded}>
              <Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} />
              <span>
                {expanded ? (
                  <FormattedMessage id='status.spoiler.collapse' defaultMessage='Collapse' />
                ) : (
                  <FormattedMessage id='status.spoiler.expand' defaultMessage='Expand' />
                )}
              </span>
            </button>
          )}
        </h2>,
      );
    }

    if (!expandable || expanded) {
      let quote;

      if (withMedia && status.quote_id) {
        if (isQuote) {
          quote = <QuotedStatusIndicator statusId={status.quote_id} statusUrl={status.quote_url} />;
        } else if (!(status.quote_visible ?? true)) {
          quote = (
            <OutlineBox>
              <p>
                <FormattedMessage
                  id='statuses.quote_tombstone'
                  defaultMessage='Post is unavailable.'
                />
              </p>
            </OutlineBox>
          );
        } else {
          quote = <QuotedStatus statusId={status.quote_id} />;
        }
      }

      const media = (quote ||
        status.card ||
        (withMedia && status.media_attachments.length > 0)) && (
        <Stack space={4} key='media'>
          {((withMedia && status.media_attachments.length > 0) || (status.card && !quote)) && (
            <div className='relative has-[div[data-testid="sensitive-overlay"]]:min-h-24'>
              <SensitiveContentOverlay status={status} />
              {withMedia && <StatusMedia status={status} muted={compose} />}
            </div>
          )}

          {quote}
        </Stack>
      );

      if (status.content) {
        output.push(
          <Markup
            ref={contentNode}
            tabIndex={0}
            key='content'
            className={className}
            direction={direction}
            lang={status.language ?? undefined}
            size={textSize}
          >
            {parsedContent}
          </Markup>,
        );
      }

      if (collapsed) {
        output.push(<ReadMoreButton onClick={onClick} key='read-more' preview={preview} />);
      }

      if (status.poll_id) {
        output.push(
          <Poll
            id={status.poll_id}
            key='poll'
            status={status}
            language={statusMeta.currentLanguage}
            truncate={collapsable}
          />,
        );
      }

      if (translatable) {
        output.push(<TranslateButton status={status} key='translate' />);
      }

      if (media) {
        output.push(media);
      }

      if (hashtags.length) {
        output.push(<HashtagsBar key='hashtags' hashtags={hashtags} />);
      }
    }

    if (onClick) {
      return <div className='⁂-status-content__container'>{output}</div>;
    } else {
      return <>{output}</>;
    }
  },
);

export { StatusContent as default };
