import iconLock from '@phosphor-icons/core/regular/lock.svg';
import {
  Link,
  type LinkOptions,
  linkOptions,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import ActionButton from '@/components/accounts/action-button';
import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import VerificationBadge from '@/components/accounts/verification-badge';
import Avatar from '@/components/ui/avatar';
import Emoji from '@/components/ui/emoji';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Emojify from '@/features/emoji/emojify';
import { useAcct } from '@/hooks/use-acct';
import { useFeatures } from '@/hooks/use-features';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useSettings } from '@/stores/settings';

import Badge from '../badge';
import RelativeTimestamp from '../relative-timestamp';
import { ParsedContent } from '../statuses/parsed-content';

import type { StatusApprovalStatus } from '@/queries/statuses/normalize';
import type { Account as AccountSchema } from 'pl-api';

interface IInstanceFavicon {
  account: Pick<AccountSchema, 'domain' | 'favicon'>;
  disabled?: boolean;
}

const messages = defineMessages({
  bot: { id: 'account.badges.bot', defaultMessage: 'Bot' },
  timeline: { id: 'account.instance_favicon', defaultMessage: 'Visit {domain} timeline' },
  accountLocked: {
    id: 'account.locked_info',
    defaultMessage: 'This account is locked. The owner manually reviews who can follow them.',
  },
});

const InstanceFavicon: React.FC<IInstanceFavicon> = ({ account, disabled }) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const router = useRouter();

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();

    if (disabled) return;

    const link = linkOptions({ to: '/timeline/$instance', params: { instance: account.domain } });
    if (!(e.ctrlKey || e.metaKey)) {
      navigate(link);
    } else {
      window.open(router.buildLocation(link).href, '_blank');
    }
  };

  if (!account.favicon) {
    return null;
  }

  if (disabled) {
    return (
      <img
        src={account.favicon}
        alt={account.domain}
        title={account.domain}
        className='instance-favicon'
      />
    );
  }

  return (
    <button
      className='instance-favicon'
      onClick={handleClick}
      disabled={disabled}
      title={intl.formatMessage(messages.timeline, { domain: account.domain })}
    >
      <img src={account.favicon} alt={account.domain} title={account.domain} />
    </button>
  );
};

type IAccount = {
  account: AccountSchema;
  action?: React.ReactElement;
  actionAlignment?: 'center' | 'top';
  actionIcon?: string;
  actionTitle?: string;
  /** Override other actions for specificity like mute/unmute. */
  actionType?: 'muting' | 'blocking' | 'follow_request' | 'biting';
  avatarSize?: number;
  hideActions?: boolean;
  id?: string;
  onActionClick?: (account: AccountSchema) => void;
  showAccountHoverCard?: boolean;
  timestamp?: string;
  futureTimestamp?: boolean;
  withAccountNote?: boolean;
  withAvatar?: boolean;
  withDate?: boolean;
  withLinkToProfile?: boolean;
  withRelationship?: boolean;
  withLocked?: boolean;
  approvalStatus?: StatusApprovalStatus | null;
  emoji?: string;
  emojiUrl?: string;
  note?: string;
  items?: React.ReactNode;
  disabled?: boolean;
  muteExpiresAt?: string | null;
  blockExpiresAt?: string | null;
  loading?: boolean;
} & (LinkOptions | {});

const Account = ({
  account,
  actionType,
  action,
  actionIcon,
  actionTitle,
  actionAlignment = 'center',
  avatarSize = 42,
  hideActions = false,
  onActionClick,
  showAccountHoverCard = true,
  timestamp,
  futureTimestamp = false,
  withAccountNote = false,
  withAvatar = true,
  withDate = false,
  withLinkToProfile = true,
  withRelationship = true,
  withLocked = true,
  approvalStatus,
  emoji,
  emojiUrl,
  note,
  items,
  disabled,
  muteExpiresAt,
  blockExpiresAt,
  loading,
  ...params
}: IAccount) => {
  const overflowRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState<React.CSSProperties>({});

  const intl = useIntl();
  const features = useFeatures();
  const me = useCurrentAccount();
  const username = useAcct(account);
  const { disableUserProvidedMedia } = useSettings();
  const { allowDisplayingRemoteNoLogin } = useFrontendConfig();

  const withExternalLink = !me && !allowDisplayingRemoteNoLogin && account && !account.local;

  const handleAction = () => {
    onActionClick!(account);
  };

  const renderAction = () => {
    if (action) {
      return action;
    }

    if (hideActions) {
      return null;
    }

    if (onActionClick && actionIcon) {
      return (
        <IconButton
          src={actionIcon}
          title={actionTitle}
          onClick={handleAction}
          className='account-card__action-button'
          iconClassName='account-card__action-icon'
        />
      );
    }

    if (!withRelationship) return null;

    if (me && account.id !== me) {
      return <ActionButton account={account} actionType={actionType} />;
    }

    return null;
  };

  useLayoutEffect(() => {
    const onResize = () => {
      const style: React.CSSProperties = {};
      const actionWidth = actionRef.current?.clientWidth ?? 0;

      if (overflowRef.current) {
        const maxWidth = overflowRef.current.classList.contains('account-card__inner--fit')
          ? overflowRef.current.parentElement!.clientWidth
          : overflowRef.current.clientWidth;
        style.maxWidth = Math.max(
          0,
          maxWidth - (withAvatar ? avatarSize + 12 : 0) - (actionWidth ? actionWidth + 12 : 0),
        );
      }

      setStyle(style);
    };

    onResize();

    if (overflowRef.current) {
      const targetElement = overflowRef.current;
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(targetElement);

      return () => {
        resizeObserver.unobserve(targetElement);
      };
    }
  }, [overflowRef, actionRef]);

  if (!account) {
    return null;
  }

  if (withDate) timestamp = account.created_at;

  const LinkEl: React.ElementType = withLinkToProfile ? (withExternalLink ? 'a' : Link) : 'div';
  const linkProps = withLinkToProfile
    ? withExternalLink
      ? {
          href: account.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          title: account.acct,
          onClick: (event: React.MouseEvent) => {
            event.stopPropagation();
          },
        }
      : 'to' in params
        ? {
            to: params.to,
            params: params.params,
            search: params.search,
            title: account.acct,
            onClick: (event: React.MouseEvent) => {
              event.stopPropagation();
            },
          }
        : {
            to: '/@{$username}',
            params: { username: account.acct },
            title: account.acct,
            onClick: (event: React.MouseEvent) => {
              event.stopPropagation();
            },
          }
    : {};

  if (disabled)
    return (
      <div
        data-testid='account'
        className={clsx('account-card', {
          'account-card--action-top': actionAlignment === 'top',
        })}
        ref={overflowRef}
      >
        <div>
          <div className='account-card__row'>
            {disableUserProvidedMedia ? (
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                username={account.username}
              />
            ) : (
              <div
                className={clsx(
                  'account-card__avatar',
                  emoji && 'account-card__avatar--emoji',
                  loading && 'placeholder-avatar',
                )}
              >
                <Avatar
                  src={account.avatar}
                  size={avatarSize}
                  alt={account.avatar_description}
                  isCat={account.is_cat}
                  username={account.username}
                />
                {emoji && <Emoji className='account-card__emoji' emoji={emoji} src={emojiUrl} />}
              </div>
            )}

            <div className='account-card__content'>
              <div className='account-card__display-name'>
                <p
                  className={clsx(
                    'account-card__display-name__text',
                    loading && 'placeholder-display-name',
                  )}
                >
                  <Emojify text={account.display_name} emojis={account.emojis} />
                </p>

                {account.verified && <VerificationBadge />}

                {account.bot && (
                  <Badge
                    slug='bot'
                    title={<FormattedMessage id='account.badges.bot' defaultMessage='Bot' />}
                  />
                )}
              </div>

              <div className='account-card__meta'>
                <p className={clsx('account-card__handle', loading && 'placeholder-display-name')}>
                  @{username}
                </p>

                {withLocked && !timestamp && account.locked && (
                  <>
                    <Icon
                      src={iconLock}
                      alt={intl.formatMessage(messages.accountLocked)}
                      className='account-card__lock'
                    />

                    {account.favicon && !disableUserProvidedMedia && <span className='separator' />}
                  </>
                )}

                {account.favicon && !disableUserProvidedMedia && (
                  <InstanceFavicon account={account} disabled />
                )}

                {items}
              </div>
            </div>
          </div>

          <div ref={actionRef}>{renderAction()}</div>
        </div>
      </div>
    );

  const containerClassName = clsx('account-card__row', {
    'account-card__row--top': withAccountNote || note,
  });

  const body = (
    <>
      {withAvatar &&
        (disableUserProvidedMedia ? (
          <Avatar
            src={account.avatar}
            alt={account.avatar_description}
            username={account.username}
          />
        ) : (
          <LinkEl
            className={clsx(
              'account-card__avatar',
              emoji && 'account-card__avatar--emoji',
              loading && 'placeholder-avatar',
            )}
            {...linkProps}
          >
            <Avatar
              src={account.avatar}
              size={avatarSize}
              alt={account.avatar_description}
              isCat={account.is_cat}
              username={account.username}
            />
            {emoji && <Emoji className='account-card__emoji' emoji={emoji} src={emojiUrl} />}
          </LinkEl>
        ))}

      <div className='account-card__content' style={style}>
        <LinkEl {...linkProps}>
          <div className='account-card__display-name'>
            <p
              className={clsx(
                'account-card__display-name__text',
                loading && 'placeholder-display-name',
              )}
            >
              <Emojify text={account.display_name} emojis={account.emojis} />
            </p>

            {account.verified && <VerificationBadge />}

            {account.bot && (
              <Badge
                slug='bot'
                title={<FormattedMessage id='account.badges.bot' defaultMessage='Bot' />}
              />
            )}
          </div>
        </LinkEl>

        <div className='account-card__meta__container'>
          <div className='account-card__meta'>
            <p className={clsx('account-card__handle', loading && 'placeholder-display-name')}>
              @{username}
            </p>

            {withLocked && !timestamp && account.locked && (
              <>
                <Icon
                  src={iconLock}
                  alt={intl.formatMessage(messages.accountLocked)}
                  className='account-card__lock'
                />
                {account.favicon && !disableUserProvidedMedia && <span className='separator' />}
              </>
            )}

            {account.favicon && !disableUserProvidedMedia && (
              <InstanceFavicon
                account={account}
                disabled={!withLinkToProfile || !features.instanceTimeline}
              />
            )}

            {timestamp ? (
              <>
                <span className='separator' />

                <RelativeTimestamp
                  timestamp={timestamp}
                  className='account-card__timestamp'
                  futureDate={futureTimestamp}
                />
              </>
            ) : null}

            {approvalStatus && ['pending', 'rejected'].includes(approvalStatus) && (
              <>
                <span className='separator' />

                <span className='account-card__meta-text'>
                  {approvalStatus === 'pending' ? (
                    <FormattedMessage
                      id='status.approval.pending'
                      defaultMessage='Pending approval'
                    />
                  ) : (
                    <FormattedMessage id='status.approval.rejected' defaultMessage='Rejected' />
                  )}
                </span>
              </>
            )}

            {actionType === 'blocking' && blockExpiresAt ? (
              <>
                <span className='separator' />

                <p className='account-card__meta-text'>
                  <RelativeTimestamp timestamp={blockExpiresAt} futureDate />
                </p>
              </>
            ) : null}

            {actionType === 'muting' && muteExpiresAt ? (
              <>
                <span className='separator' />

                <p className='account-card__meta-text'>
                  <RelativeTimestamp timestamp={muteExpiresAt} futureDate />
                </p>
              </>
            ) : null}

            {items}
          </div>
          {note ? (
            <p className='account-card__note'>{note}</p>
          ) : (
            withAccountNote && (
              <p className='account-card__bio'>
                <ParsedContent
                  html={account.note}
                  emojis={account.emojis}
                  speakAsCat={account.speak_as_cat}
                />
              </p>
            )
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      data-testid='account'
      className={clsx('account-card', {
        'account-card--action-top': actionAlignment === 'top',
      })}
    >
      <div className='account-card__inner account-card__inner--fit' ref={overflowRef}>
        {showAccountHoverCard ? (
          <HoverAccountWrapper accountId={account.id} className={containerClassName}>
            {body}
          </HoverAccountWrapper>
        ) : (
          <div className={containerClassName}>{body}</div>
        )}

        <div ref={actionRef}>{renderAction()}</div>
      </div>
    </div>
  );
};

export { type IAccount, Account as default };
