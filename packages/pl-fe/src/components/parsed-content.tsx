/* eslint-disable no-redeclare */
import { Link } from '@tanstack/react-router';
import parse, {
  Element,
  type HTMLReactParserOptions,
  domToReact,
  type DOMNode,
} from 'html-react-parser';
import { sanitize } from 'isomorphic-dompurify';
import groupBy from 'lodash/groupBy';
import minBy from 'lodash/minBy';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Emojify from '@/features/emoji/emojify';
import { useSettings } from '@/stores/settings';
import { makeEmojiMap } from '@/utils/normalizers';
import nyaize from '@/utils/nyaize';
import Purify from '@/utils/url-purify';

import HashtagLink from './hashtag-link';
import HoverAccountWrapper from './hover-account-wrapper';
import StatusMention from './status-mention';

import type { CustomEmoji, Mention } from 'pl-api';

const GREENTEXT_CLASS = 'dark:text-accent-green text-lime-600';

const checkSuspiciousUrl = (url: string): boolean => {
  try {
    const { host } = new URL(url);
    return host.startsWith('verify.form');
  } catch (e) {
    return false;
  }
};

const nodesToText = (nodes: Array<DOMNode>): string =>
  nodes
    .map((node) =>
      node.type === 'text'
        ? node.data
        : node.type === 'tag'
          ? nodesToText(node.children as Array<DOMNode>)
          : '',
    )
    .join('');

const isHostNotVisible = (href: string, text?: string): false | string => {
  try {
    let { host } = new URL(href);
    host = host.replace(/^www\./, '');
    if (!text) return host;

    if (new RegExp(`^(https?://)?(www.)?${host}(/|$)`, 'i').test(text)) {
      return false;
    } else {
      return host;
    }
  } catch (e) {
    return false;
  }
};

interface IParsedUrl extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Whether to call a function to remove tracking parameters from URLs. */
  cleanUrls?: boolean;
  /** Whether to call a function to redirect URLs to popular websites to privacy-respecting proxy services. */
  redirectUrls?: boolean;
  /** Whether to display link target domain when it's not part of the text. */
  displayTargetHost?: boolean;
  href: string;
  childrenPlain?: string;
}

const ParsedUrl: React.FC<IParsedUrl> = React.memo((props) => {
  const { urlPrivacy } = useSettings();

  // eslint-disable-next-line prefer-const
  let { cleanUrls, redirectUrls, displayTargetHost, childrenPlain, ...anchorProps } = props;

  cleanUrls ??= urlPrivacy.clearLinksInContent;
  redirectUrls ??= urlPrivacy.redirectLinksMode !== 'off';
  displayTargetHost ??= urlPrivacy.displayTargetHost;

  let href = props.href;

  if (cleanUrls) {
    try {
      href = Purify.clearUrl(href, props.cleanUrls, props.redirectUrls);
    } catch (_) {
      //
    }
  }

  const host = displayTargetHost && isHostNotVisible(href, childrenPlain);

  return (
    <a
      {...anchorProps}
      href={href}
      onClick={(e) => {
        e.stopPropagation();
      }}
      rel='nofollow noopener noreferrer'
      target='_blank'
      title={props.href}
    >
      {props.children}
      {host && <span className='text-xs lowercase'> [{host}]</span>}
    </a>
  );
});

interface IParsedContent {
  /** HTML content to display. */
  html: string;
  /** Array of mentioned accounts. */
  mentions?: Array<Mention>;
  /** Whether it's a status which has a quote. */
  hasQuote?: boolean;
  /** Related custom emojis. */
  emojis?: Array<CustomEmoji>;
  /** Whether to call a function to remove tracking parameters from URLs. */
  cleanUrls?: boolean;
  /** Whether to call a function to redirect URLs to popular websites to privacy-respecting proxy services. */
  redirectUrls?: boolean;
  /** Whether to display link target domain when it's not part of the text. */
  displayTargetHost?: boolean;
  greentext?: boolean;
  speakAsCat?: boolean;
}

// Adapted from Mastodon https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/components/hashtag_bar.tsx
const normalizeHashtag = (hashtag: string) =>
  (!!hashtag && hashtag.startsWith('#') ? hashtag.slice(1) : hashtag).normalize('NFKC');

const uniqueHashtagsWithCaseHandling = (hashtags: string[]) => {
  const groups = groupBy(hashtags, (tag) => tag.normalize('NFKD').toLowerCase());

  return Object.values(groups).map((tags) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know that the array has at least one element
    const firstTag = tags[0];

    if (tags.length === 1) return firstTag;

    // The best match is the one where we have the less difference between upper and lower case letter count
    const best = minBy(tags, (tag) => {
      const upperCase = Array.from(tag).reduce(
        (acc, char) => (acc += char.toUpperCase() === char ? 1 : 0),
        0,
      );

      const lowerCase = tag.length - upperCase;

      return Math.abs(lowerCase - upperCase);
    });

    return best ?? firstTag;
  });
};

function parseContent(
  props: IParsedContent,
  extractHashtags?: false,
): ReturnType<typeof domToReact>;
function parseContent(
  props: IParsedContent,
  extractHashtags: true,
): {
  hashtags: Array<string>;
  content: ReturnType<typeof domToReact>;
};

function parseContent(
  {
    html,
    mentions,
    hasQuote,
    emojis,
    cleanUrls = false,
    redirectUrls = false,
    displayTargetHost = true,
    greentext = false,
    speakAsCat = false,
  }: IParsedContent,
  extractHashtags = false,
) {
  if (html.length === 0) {
    return extractHashtags ? { content: null, hashtags: [] } : null;
  }

  const emojiMap = emojis ? makeEmojiMap(emojis) : undefined;

  const selectors: Array<string> = [];

  // Explicit mentions
  if (mentions) selectors.push('recipients-inline');

  // Quote posting
  if (hasQuote) selectors.push('quote-inline');

  let hashtags: Array<string> = [];

  let hasSuspiciousUrl = false;

  const transformText = (data: string, key?: React.Key) => {
    const text = speakAsCat ? nyaize(data) : data;

    return <Emojify key={key} text={text} emojis={emojiMap} />;
  };

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (!(domNode instanceof Element)) {
        // @ts-expect-error
        domNode.preGreentext =
          // @ts-expect-error
          (!domNode.prev || domNode.prev.preGreentext) && !domNode.data.trim().length;

        // @ts-expect-error
        const data = domNode.prev?.preGreentext ? domNode.data.trim() : domNode.data;
        // @ts-expect-error
        if (greentext && (data.startsWith('>') || domNode.prev?.greentext)) {
          // @ts-expect-error
          domNode.greentext = true;
          return <span className={GREENTEXT_CLASS}>{transformText(domNode.data)}</span>;
        }

        return;
      }

      if (['script', 'iframe'].includes(domNode.name)) {
        return <></>;
      }

      if (domNode.attribs.class?.split(' ').some((className) => selectors.includes(className))) {
        return <></>;
      }

      if (domNode.attribs.class?.split(' ').includes('h-card')) {
        // @ts-expect-error
        domNode.preGreentext = !domNode.prev || domNode.prev.preGreentext;
      }

      // @ts-expect-error
      if (domNode.name !== 'br' && domNode.prev?.greentext) {
        domNode.attribs.class = `${domNode.attribs.class || ''} ${GREENTEXT_CLASS}`;
        // @ts-expect-error
        domNode.greentext = true;
      }

      if (domNode.name === 'a') {
        const classes = domNode.attribs.class?.split(' ');

        // @ts-expect-error
        if (domNode.prev?.greentext) {
          classes.push(GREENTEXT_CLASS);
          // @ts-expect-error
          domNode.greentext = true;
        }

        const fallback = (
          <ParsedUrl
            {...(domNode.attribs as any)}
            childrenPlain={nodesToText(domNode.children as Array<DOMNode>).trim()}
          >
            {domToReact(domNode.children as Array<DOMNode>, options)}
          </ParsedUrl>
        );

        if (classes?.includes('mention')) {
          if (mentions) {
            const mention = mentions.find(({ url }) => domNode.attribs.href === url);
            if (mention) {
              return (
                <Link
                  to='/@{$username}'
                  params={{ username: mention.acct }}
                  className='text-primary-600 hover:underline dark:text-primary-400'
                  dir='ltr'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <HoverAccountWrapper accountId={mention.id} element='span'>
                    @{mention.username}
                  </HoverAccountWrapper>
                </Link>
              );
            }
          } else if (domNode.attribs['data-user']) {
            return <StatusMention accountId={domNode.attribs['data-user']} fallback={fallback} />;
          }
        }

        if (classes?.includes('hashtag') || domNode.attribs.rel === 'tag') {
          const hashtag = nodesToText(domNode.children as Array<DOMNode>);
          if (hashtag) {
            return <HashtagLink hashtag={hashtag.replace(/^#/, '')} />;
          }
        }

        if (checkSuspiciousUrl(domNode.attribs.href)) {
          hasSuspiciousUrl = true;
        }

        return fallback;
      }

      if (
        extractHashtags &&
        domNode.type === 'tag' &&
        domNode.parent === null &&
        domNode.next === null
      ) {
        for (const child of domNode.children) {
          switch (child.type) {
            case 'text':
              if (child.data.trim().length) {
                hashtags = [];
                return;
              }
              break;
            case 'tag':
              if (child.name !== 'a') {
                hashtags = [];
                return;
              }
              if (!child.attribs.class?.split(' ').includes('hashtag')) {
                hashtags = [];
                return;
              }
              hashtags.push(normalizeHashtag(nodesToText([child])));
              break;
            default:
              hashtags = [];
              return;
          }
        }

        return <></>;
      }
    },

    transform(reactNode, _domNode, index) {
      if (typeof reactNode === 'string') {
        return transformText(reactNode, index);
      }

      return reactNode as React.JSX.Element;
    },
  };

  let content = parse(
    sanitize(html, { ADD_ATTR: ['target'], USE_PROFILES: { html: true } }),
    options,
  );

  if (hasSuspiciousUrl) {
    content = (
      <>
        <div className='mb-2 rounded border border-solid border-gray-400 px-2.5 py-2 text-xs text-gray-900 dark:border-gray-800 dark:text-white'>
          <FormattedMessage
            id='suspicious_url_warning.body'
            defaultMessage='This post might include a suspicious link. Please be cautious before entering any personal data or payment information.'
          />
        </div>
        {content}
      </>
    );
  }

  if (extractHashtags)
    return {
      content,
      hashtags: uniqueHashtagsWithCaseHandling(hashtags),
    };

  return content;
}

const ParsedContent: React.FC<IParsedContent> = React.memo(
  (props) => {
    const { urlPrivacy } = useSettings();

    props = { ...props };

    props.cleanUrls ??= urlPrivacy.clearLinksInContent;
    props.redirectUrls ??= urlPrivacy.redirectLinksMode !== 'off';
    props.displayTargetHost ??= urlPrivacy.displayTargetHost;

    return parseContent(props, false);
  },
  (prevProps, nextProps) => prevProps.html === nextProps.html,
);

export { ParsedContent, ParsedUrl, parseContent };
