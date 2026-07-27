// ~~Shamelessly stolen~~ ported to React from Sharkey
// https://activitypub.software/TransFem-org/Sharkey/-/blob/develop/packages/frontend/src/components/global/MkMfm.ts
import iconClock from '@phosphor-icons/core/regular/clock.svg';
import * as mfm from '@transfem-org/sfm-js';
import { clamp } from 'lodash-es';
import React, { useEffect, type CSSProperties } from 'react';
import { FormattedDate } from 'react-intl';

import { Link } from '@/components/link';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';
import { makeEmojiMap } from '@/utils/normalizers';
import nyaize from '@/utils/nyaize';

import { AccountLink } from '../accounts/account-link';
import HoverAccountWrapper from '../accounts/hover-account-wrapper';
import { Formula } from '../async-components';
import { isCurrentOrFutureDate } from '../compose/schedule-form';
import HashtagLink from '../hashtag-link';
import RelativeTimestamp from '../relative-timestamp';
import Emoji from '../ui/emoji';
import Icon from '../ui/icon';

import { ParsedUrl } from './parsed-content';
import StatusMention from './status-mention';

import type { CustomEmoji, Mention } from 'pl-api';

interface IFollowMouse {
  x: boolean;
  y: boolean;
  speed: string;
  rotateByVelocity: boolean;
  children: React.ReactNode;
}

// copy-pasted from https://activitypub.software/TransFem-org/Sharkey/-/blob/develop/packages/frontend/src/components/CkFollowMouse.vue
const FollowMouse: React.FC<IFollowMouse> = ({ x, y, speed, rotateByVelocity, children }) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let oldAngle = 0;

    const lerp = (a: number, b: number, alpha: number) => {
      return a + alpha * (b - a);
    };

    const updatePosition = (mouseEvent: MouseEvent) => {
      const container = ref.current?.closest('.mfm');

      if (!container || !ref.current) return;

      const containerRect = container.getBoundingClientRect();
      const newX = mouseEvent.clientX - containerRect.left;
      const newY = mouseEvent.clientY - containerRect.top;
      let transform = `translate(calc(${x ? newX : 0}px - 50%), calc(${y ? newY : 0}px - 50%))`;
      if (rotateByVelocity) {
        const deltaX = newX - lastX;
        const deltaY = newY - lastY;
        const angle = lerp(oldAngle, Math.atan2(deltaY, deltaX) * (180 / Math.PI), 0.1);
        transform += ` rotate(${angle}deg)`;
        oldAngle = angle;
      }
      ref.current.style.transform = transform;
      ref.current.style.transition = `transform ${speed}`;
      lastX = newX;
      lastY = newY;
    };

    window.addEventListener('mousemove', updatePosition);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
    };
  }, []);

  return (
    <span ref={containerRef} className='mfm-follow-mouse__container'>
      <span ref={ref} className='mfm-follow-mouse'>
        {children}
      </span>
    </span>
  );
};

const safeParseFloat = (str: unknown): number | null => {
  if (typeof str !== 'string' || str === '') return null;
  const num = parseFloat(str);
  if (isNaN(num)) return null;
  return num;
};

const validTime = (t: string | boolean | null | undefined) => {
  if (t === null || t === undefined) return null;
  if (typeof t === 'boolean') return null;
  return /^-?[0-9.]+s$/.test(t) ? t : null;
};

const validColor = (c: unknown): string | null => {
  if (typeof c !== 'string') return null;
  return /^[0-9a-f]{3,6}$/i.test(c) ? c : null;
};

interface IParsedMfm {
  text: string;
  emojis: Array<CustomEmoji>;
  mentions?: Array<Mention>;
  speakAsCat?: boolean;
}

const ParsedMfm: React.FC<IParsedMfm> = React.memo(({ text, emojis, mentions, speakAsCat }) => {
  const rootAst = mfm.parse(text);
  const { domain } = useInstance();
  const { renderAdvancedMfm, renderAnimatedMfm } = useSettings();

  const emojiMap = makeEmojiMap(emojis);

  const genPlainText = (ast: mfm.MfmNode[]) =>
    ast
      .map((token): string => {
        if (token.type === 'text') return token.props.text;
        if (token.children) return genPlainText(token.children);
        return '';
      })
      .join('');

  const genEl = (ast: mfm.MfmNode[], scale: number) =>
    /* eslint-disable react/jsx-key */
    ast
      .map((token): React.JSX.Element | string | (React.JSX.Element | string)[] => {
        switch (token.type) {
          case 'text': {
            let text = token.props.text.replaceAll(/(\r\n|\n|\r)/g, '\n');

            if (speakAsCat) text = nyaize(text);

            const res: (React.JSX.Element | string)[] = [];
            for (const t of text.split('\n')) {
              res.push(<br />);
              res.push(t);
            }
            res.shift();
            return res;
          }

          case 'bold': {
            return <b>{genEl(token.children, scale)}</b>;
          }

          case 'strike': {
            return <del>{genEl(token.children, scale)}</del>;
          }

          case 'italic': {
            return <i>{genEl(token.children, scale)}</i>;
          }

          case 'fn': {
            let style: CSSProperties | undefined;
            switch (token.props.name) {
              case 'tada': {
                const speed = validTime(token.props.args.speed) ?? '1s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                style = {
                  fontSize: '150%',
                  ...(renderAnimatedMfm
                    ? {
                        animation: `global-tada ${speed} linear infinite both`,
                        animationDelay: delay,
                      }
                    : {}),
                };
                break;
              }
              case 'jelly': {
                const speed = validTime(token.props.args.speed) ?? '1s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                if (renderAnimatedMfm)
                  style = {
                    animation: `mfm-rubber-band ${speed} linear infinite both`,
                    animationDelay: delay,
                  };
                break;
              }
              case 'twitch': {
                const speed = validTime(token.props.args.speed) ?? '0.5s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                style = renderAnimatedMfm
                  ? {
                      animation: `mfm-twitch ${speed} ease infinite`,
                      animationDelay: delay,
                    }
                  : {};
                break;
              }
              case 'shake': {
                const speed = validTime(token.props.args.speed) ?? '0.5s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                style = renderAnimatedMfm
                  ? {
                      animation: `mfm-shake ${speed} ease infinite`,
                      animationDelay: delay,
                    }
                  : {};
                break;
              }
              case 'spin': {
                const direction = token.props.args.left
                  ? 'reverse'
                  : token.props.args.alternate
                    ? 'alternate'
                    : 'normal';
                const anime = token.props.args.x
                  ? 'mfm-spin-x'
                  : token.props.args.y
                    ? 'mfm-spin-y'
                    : 'mfm-spin';
                const speed = validTime(token.props.args.speed) ?? '1.5s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                style = renderAnimatedMfm
                  ? {
                      animation: `${anime} ${speed} linear infinite`,
                      animationDirection: direction,
                      animationDelay: delay,
                    }
                  : {};
                break;
              }
              case 'jump': {
                const speed = validTime(token.props.args.speed) ?? '0.75s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                style = renderAnimatedMfm
                  ? { animation: `mfm-jump ${speed} linear infinite`, animationDelay: delay }
                  : {};
                break;
              }
              case 'bounce': {
                const speed = validTime(token.props.args.speed) ?? '0.75s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                style = renderAnimatedMfm
                  ? {
                      animation: `mfm-bounce ${speed} linear infinite`,
                      transformOrigin: 'center bottom',
                      animationDelay: delay,
                    }
                  : {};
                break;
              }
              case 'flip': {
                const transform =
                  token.props.args.h && token.props.args.v
                    ? 'scale(-1, -1)'
                    : token.props.args.v
                      ? 'scaleY(-1)'
                      : 'scaleX(-1)';
                style = { transform };
                break;
              }
              case 'x2': {
                return (
                  <span className={renderAdvancedMfm ? 'mfm-x2' : ''}>
                    {genEl(token.children, scale * 2)}
                  </span>
                );
              }
              case 'x3': {
                return (
                  <span className={renderAdvancedMfm ? 'mfm-x3' : ''}>
                    {genEl(token.children, scale * 3)}
                  </span>
                );
              }
              case 'x4': {
                return (
                  <span className={renderAdvancedMfm ? 'mfm-x4' : ''}>
                    {genEl(token.children, scale * 4)}
                  </span>
                );
              }
              case 'font': {
                const family = token.props.args.serif
                  ? 'serif'
                  : token.props.args.monospace
                    ? 'monospace'
                    : token.props.args.cursive
                      ? 'cursive'
                      : token.props.args.fantasy
                        ? 'fantasy'
                        : token.props.args.emoji
                          ? 'emoji'
                          : token.props.args.math
                            ? 'math'
                            : null;
                if (family) style = { fontFamily: family };
                break;
              }
              case 'blur': {
                return <span className='_mfm_blur_'>{genEl(token.children, scale)}</span>;
              }
              case 'rainbow': {
                if (!renderAnimatedMfm) {
                  return (
                    <span className='_mfm_rainbow_fallback_'>{genEl(token.children, scale)}</span>
                  );
                }
                const speed = validTime(token.props.args.speed) ?? '1s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                style = {
                  animation: `mfm-rainbow ${speed} linear infinite`,
                  animationDelay: delay,
                };
                break;
              }
              case 'sparkle': {
                // if (!renderAnimatedMfm) {
                return genEl(token.children, scale).flat();
                // }
                // return h(MkSparkle, {}, genEl(token.children, scale));
              }
              case 'fade': {
                if (!renderAnimatedMfm) {
                  style = {};
                  break;
                }

                const direction = token.props.args.out ? 'alternate-reverse' : 'alternate';
                const speed = validTime(token.props.args.speed) ?? '1.5s';
                const delay = validTime(token.props.args.delay) ?? '0s';
                const loop = safeParseFloat(token.props.args.loop) ?? 'infinite';
                style = {
                  animation: `mfm-fade ${speed} ${delay} linear ${loop}`,
                  animationDirection: direction,
                };
                break;
              }
              case 'rotate': {
                const degrees = safeParseFloat(token.props.args.deg) ?? 90;
                style = { transform: `rotate(${degrees}deg); transform-origin: center center` };
                break;
              }

              case 'followmouse': {
                if (!renderAnimatedMfm) {
                  style = {};
                  break;
                }

                let x = !!token.props.args.x;
                let y = !!token.props.args.y;

                if (!x && !y) {
                  x = true;
                  y = true;
                }

                return (
                  <FollowMouse
                    x={x}
                    y={y}
                    speed={validTime(token.props.args.speed) ?? '0.1s'}
                    rotateByVelocity={!!token.props.args.rotateByVelocity}
                  >
                    {genEl(token.children, scale)}
                  </FollowMouse>
                );
              }

              case 'position': {
                if (!renderAdvancedMfm) break;
                const x = safeParseFloat(token.props.args.x) ?? 0;
                const y = safeParseFloat(token.props.args.y) ?? 0;
                style = { transform: `translateX(${x}em) translateY(${y}em)` };
                break;
              }
              case 'crop': {
                const top = Number.parseFloat((token.props.args.top ?? '0').toString());
                const right = Number.parseFloat((token.props.args.right ?? '0').toString());
                const bottom = Number.parseFloat((token.props.args.bottom ?? '0').toString());
                const left = Number.parseFloat((token.props.args.left ?? '0').toString());
                style = { clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)` };
                break;
              }
              case 'scale': {
                if (!renderAdvancedMfm) {
                  style = {};
                  break;
                }
                const x = clamp(safeParseFloat(token.props.args.x) ?? 1, -5, 5);
                const y = clamp(safeParseFloat(token.props.args.y) ?? 1, -5, 5);
                style = { transform: `scale(${x}, ${y})` };
                scale = scale * Math.max(Math.abs(x), Math.abs(y));
                break;
              }
              case 'fg': {
                let color = validColor(token.props.args.color);
                color = color ?? 'f00';
                style = { color: `#${color}`, overflowWrap: 'anywhere' };
                break;
              }
              case 'bg': {
                let color = validColor(token.props.args.color);
                color = color ?? 'f00';
                style = { backgroundColor: `#${color}`, overflowWrap: 'anywhere' };
                break;
              }
              case 'border': {
                let color = validColor(token.props.args.color);
                color = color ? `#${color}` : 'var(--MI_THEME-accent)';
                let b_style = token.props.args.style;
                if (
                  typeof b_style !== 'string' ||
                  ![
                    'hidden',
                    'dotted',
                    'dashed',
                    'solid',
                    'double',
                    'groove',
                    'ridge',
                    'inset',
                    'outset',
                  ].includes(b_style)
                )
                  b_style = 'solid';
                const width = safeParseFloat(token.props.args.width) ?? 1;
                const radius = safeParseFloat(token.props.args.radius) ?? 0;
                style = {
                  border: `${width}px ${b_style} ${color}`,
                  borderRadius: `${radius}px`,
                  ...(token.props.args.noclip ? {} : { overflow: 'clip' }),
                };
                break;
              }
              case 'ruby': {
                if (token.children.length === 1) {
                  const child = token.children[0];
                  let text = child.type === 'text' ? child.props.text : '';
                  if (speakAsCat) {
                    text = nyaize(text);
                  }
                  return (
                    <ruby>
                      {text.split(' ')[0]}
                      <rt>{text.split(' ')[1]}</rt>
                    </ruby>
                  );
                } else {
                  const rt = token.children.at(-1)!;
                  let text = rt.type === 'text' ? rt.props.text : '';
                  if (speakAsCat) {
                    text = nyaize(text);
                  }
                  return (
                    <ruby>
                      {genEl(token.children.slice(0, token.children.length - 1), scale)}
                      <rt>{text.trim()}</rt>
                    </ruby>
                  );
                }
              }
              case 'group': {
                // this is mostly a hack for the insides of `ruby`
                style = {};
                break;
              }
              case 'unixtime': {
                const child = token.children[0];
                const unixtime = parseInt(child?.type === 'text' ? child.props.text : '');
                const date = new Date(unixtime * 1000);
                if (Number.isNaN(date.getTime())) break;
                return (
                  <span className='mfm-unixtime'>
                    <Icon src={iconClock} />
                    <span>
                      <time>
                        <FormattedDate
                          value={date}
                          year='numeric'
                          month='short'
                          day='2-digit'
                          hour='2-digit'
                          minute='2-digit'
                        />
                      </time>{' '}
                      (
                      <RelativeTimestamp
                        timestamp={date.toISOString()}
                        absolute={false}
                        futureDate={isCurrentOrFutureDate(date)}
                        long
                      />
                      )
                    </span>
                  </span>
                );
              }
              case 'clickable': {
                // TODO emitting
                return (
                  <span
                    className='mfm-clickable'
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    {genEl(token.children, scale)}
                  </span>
                );
              }
            }
            if (style === undefined) {
              return (
                <span>
                  {`$[${token.props.name} `}
                  {genEl(token.children, scale)}
                </span>
              );
            } else {
              return (
                <span className='fn' style={style}>
                  {genEl(token.children, scale)}
                </span>
              );
            }
          }

          case 'small': {
            return <small>{genEl(token.children, scale)}</small>;
          }

          case 'center': {
            return (
              <div>
                <bdi>{genEl(token.children, scale)}</bdi>
              </div>
            );
          }

          case 'url': {
            return (
              <bdi>
                <ParsedUrl href={token.props.url} childrenPlain={token.props.url}>
                  {token.props.url}
                </ParsedUrl>
              </bdi>
            );
          }

          case 'link': {
            return (
              <bdi>
                <ParsedUrl
                  href={token.props.url}
                  displayTargetHost
                  childrenPlain={genPlainText(token.children)}
                >
                  {genEl(token.children, scale)}
                </ParsedUrl>
              </bdi>
            );
          }

          case 'mention': {
            if (mentions) {
              const acct = token.props.acct.slice(1);
              const mention = mentions.find(
                (mention) => mention.acct === acct || `${mention.acct}@${domain}` === acct,
              );

              if (mention) {
                const fallback = (
                  <AccountLink
                    account={mention}
                    dir='ltr'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <HoverAccountWrapper accountId={mention.id} element='span'>
                      @{mention.username}
                    </HoverAccountWrapper>
                  </AccountLink>
                );

                return (
                  <bdi>
                    <StatusMention accountId={mention.id} fallback={fallback} />
                  </bdi>
                );
              }
            }

            return (
              <bdi>
                <Link
                  to='/@{$username}'
                  params={{ username: token.props.acct.slice(1) }}
                  dir='ltr'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  @{token.props.username}
                </Link>
              </bdi>
            );
          }

          case 'hashtag': {
            return <HashtagLink hashtag={token.props.hashtag} />;
          }

          case 'blockCode': {
            return (
              <bdi className='block'>
                <pre lang={token.props.lang ?? undefined}>{token.props.code}</pre>
              </bdi>
            );
          }

          case 'inlineCode':
            return (
              <bdi>
                <code>{token.props.code}</code>
              </bdi>
            );

          case 'quote': {
            return (
              <blockquote>
                <bdi>{genEl(token.children, scale)}</bdi>
              </blockquote>
            );
          }

          case 'emojiCode': {
            const emoji = emojiMap[`:${token.props.name}:`];
            if (!emoji) return <bdi>{token.props.name}</bdi>;

            const filename = emoji.static_url;

            if (filename?.length > 0) {
              return (
                <img
                  draggable={false}
                  className='emojione emoji'
                  alt={token.props.name}
                  title={token.props.name}
                  src={filename}
                />
              );
            }

            return <bdi>{token.props.name}</bdi>;
          }

          case 'unicodeEmoji': {
            return <Emoji emoji={token.props.emoji} className='emojione emoji' />;
          }

          case 'mathInline': {
            return (
              <bdi>
                <Formula formula={token.props.formula} />
              </bdi>
            );
          }

          case 'mathBlock': {
            return (
              <bdi className='block'>
                <Formula formula={token.props.formula} block />
              </bdi>
            );
          }

          // TODO
          // case 'search':

          case 'plain': {
            return (
              <bdi>
                <span>{genEl(token.children, scale)}</span>
              </bdi>
            );
          }

          default: {
            console.error('unrecognized ast type:', token.type, token);

            return [];
          }
        }
      })
      .flat(Infinity);

  return (
    <bdi className='mfm'>
      <span>{genEl(rootAst, 1)}</span>
    </bdi>
  );
});

ParsedMfm.displayName = 'ParsedMfm';

export { ParsedMfm };
