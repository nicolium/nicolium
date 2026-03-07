import { Link, linkOptions, useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import VerificationBadge from '@/components/accounts/verification-badge';
import Avatar from '@/components/ui/avatar';
import Emoji from '@/components/ui/emoji';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import ActionButton from '@/features/ui/components/action-button';
import { useAcct } from '@/hooks/use-acct';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useSettings } from '@/stores/settings';

import Badge from '../badge';
import RelativeTimestamp from '../relative-timestamp';
import { ParsedContent } from '../statuses/parsed-content';

import type { StatusApprovalStatus } from '@/normalizers/status';
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
    defaultMessage:
      'This account privacy status is set to locked. The owner manually reviews who can follow them.',
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

  const className = 'size-4 flex-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

  if (disabled) {
    return (
      <img
        src={account.favicon}
        alt={account.domain}
        title={account.domain}
        className={className}
      />
    );
  }

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={disabled}
      title={intl.formatMessage(messages.timeline, { domain: account.domain })}
    >
      <img
        src={account.favicon}
        alt={account.domain}
        title={account.domain}
        className='max-h-full w-full'
      />
    </button>
  );
};

interface IProfilePopper {
  condition: boolean;
  wrapper: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}

const ProfilePopper: React.FC<IProfilePopper> = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

interface IAccount {
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
  approvalStatus?: StatusApprovalStatus | null;
  emoji?: string;
  emojiUrl?: string;
  note?: string;
  items?: React.ReactNode;
  disabled?: boolean;
  muteExpiresAt?: string | null;
  blockExpiresAt?: string | null;
}

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
  approvalStatus,
  emoji,
  emojiUrl,
  note,
  items,
  disabled,
  muteExpiresAt,
  blockExpiresAt,
}: IAccount) => {
  const overflowRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState<React.CSSProperties>({});

  const me = useAppSelector((state) => state.me);
  const username = useAcct(account);
  const { disableUserProvidedMedia } = useSettings();

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
          className='bg-transparent text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500'
          iconClassName='h-4 w-4'
        />
      );
    }

    if (!withRelationship) return null;

    if (me && account.id !== me) {
      return <ActionButton account={account} actionType={actionType} />;
    }

    return null;
  };

  const intl = useIntl();

  useLayoutEffect(() => {
    const onResize = () => {
      const style: React.CSSProperties = {};
      const actionWidth = actionRef.current?.clientWidth ?? 0;

      if (overflowRef.current) {
        style.maxWidth = Math.max(
          0,
          overflowRef.current.clientWidth -
            (withAvatar ? avatarSize + 12 : 0) -
            (actionWidth ? actionWidth + 12 : 0),
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

  const LinkEl: React.ElementType = withLinkToProfile ? Link : 'div';
  const linkProps = withLinkToProfile
    ? {
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
        className={clsx('⁂-account-card', {
          '⁂-account-card--action-top': actionAlignment === 'top',
        })}
        ref={overflowRef}
      >
        <div>
          <HStack alignItems='center' space={3} className='max-w-full'>
            {disableUserProvidedMedia ? (
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                username={account.username}
              />
            ) : (
              <div className='rounded-lg'>
                <Avatar
                  src={account.avatar}
                  size={avatarSize}
                  alt={account.avatar_description}
                  isCat={account.is_cat}
                  username={account.username}
                />
                {emoji && (
                  <Emoji
                    className='!absolute -right-1.5 bottom-0 size-5'
                    emoji={emoji}
                    src={emojiUrl}
                  />
                )}
              </div>
            )}

            <div className='grow overflow-hidden'>
              <HStack space={1} alignItems='center' grow>
                <Text size='sm' weight='semibold' truncate>
                  <Emojify text={account.display_name} emojis={account.emojis} />
                </Text>

                {account.verified && <VerificationBadge />}

                {account.bot && (
                  <Badge
                    slug='bot'
                    title={<FormattedMessage id='account.badges.bot' defaultMessage='Bot' />}
                  />
                )}
              </HStack>

              <Stack space={withAccountNote || note ? 1 : 0}>
                <HStack alignItems='center' space={1}>
                  <Text theme='muted' size='sm' direction='ltr' truncate>
                    @{username}
                  </Text>

                  {!timestamp && account.locked && (
                    <>
                      <Icon
                        src={require('@phosphor-icons/core/regular/lock.svg')}
                        alt={intl.formatMessage(messages.accountLocked)}
                        className='size-4 text-gray-600'
                      />

                      {account.favicon && !disableUserProvidedMedia && (
                        <span className='⁂-separator' />
                      )}
                    </>
                  )}

                  {account.favicon && !disableUserProvidedMedia && (
                    <InstanceFavicon account={account} disabled />
                  )}

                  {items}
                </HStack>
              </Stack>
            </div>
          </HStack>

          <div ref={actionRef}>{renderAction()}</div>
        </div>
      </div>
    );

  return (
    <div
      data-testid='account'
      className={clsx('⁂-account-card', {
        '⁂-account-card--action-top': actionAlignment === 'top',
      })}
      ref={overflowRef}
    >
      <div>
        <HStack
          alignItems={withAccountNote || note ? 'top' : 'center'}
          space={3}
          className='max-w-full'
        >
          {withAvatar &&
            (disableUserProvidedMedia ? (
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                username={account.username}
              />
            ) : (
              <ProfilePopper
                condition={showAccountHoverCard}
                wrapper={(children) => (
                  <HoverAccountWrapper className='relative' accountId={account.id} element='span'>
                    {children}
                  </HoverAccountWrapper>
                )}
              >
                <LinkEl className='rounded-lg' {...linkProps}>
                  <Avatar
                    src={account.avatar}
                    size={avatarSize}
                    alt={account.avatar_description}
                    isCat={account.is_cat}
                    username={account.username}
                  />
                  {emoji && (
                    <Emoji
                      className='!absolute -right-1.5 bottom-0 size-5'
                      emoji={emoji}
                      src={emojiUrl}
                    />
                  )}
                </LinkEl>
              </ProfilePopper>
            ))}

          <div className='grow overflow-hidden' style={style}>
            <ProfilePopper
              condition={showAccountHoverCard}
              wrapper={(children) => (
                <HoverAccountWrapper accountId={account.id} element='span'>
                  {children}
                </HoverAccountWrapper>
              )}
            >
              <LinkEl {...linkProps}>
                <HStack space={1} alignItems='center' grow>
                  <Text size='sm' weight='semibold' truncate>
                    <Emojify text={account.display_name} emojis={account.emojis} />
                  </Text>

                  {account.verified && <VerificationBadge />}

                  {account.bot && (
                    <Badge
                      slug='bot'
                      title={<FormattedMessage id='account.badges.bot' defaultMessage='Bot' />}
                    />
                  )}
                </HStack>
              </LinkEl>
            </ProfilePopper>

            <Stack space={withAccountNote || note ? 1 : 0}>
              <HStack alignItems='center' space={1}>
                <Text theme='muted' size='sm' direction='ltr' truncate>
                  @{username}
                </Text>

                {!timestamp && account.locked && (
                  <>
                    <Icon
                      src={require('@phosphor-icons/core/regular/lock.svg')}
                      alt={intl.formatMessage(messages.accountLocked)}
                      className='size-4 text-gray-600'
                    />
                    {account.favicon && !disableUserProvidedMedia && (
                      <span className='⁂-separator' />
                    )}
                  </>
                )}

                {account.favicon && !disableUserProvidedMedia && (
                  <InstanceFavicon account={account} disabled={!withLinkToProfile} />
                )}

                {timestamp ? (
                  <>
                    <span className='⁂-separator' />

                    <RelativeTimestamp
                      timestamp={timestamp}
                      theme='muted'
                      size='sm'
                      className='whitespace-nowrap'
                      futureDate={futureTimestamp}
                    />
                  </>
                ) : null}

                {approvalStatus && ['pending', 'rejected'].includes(approvalStatus) && (
                  <>
                    <span className='⁂-separator' />

                    <Text tag='span' theme='muted' size='sm'>
                      {approvalStatus === 'pending' ? (
                        <FormattedMessage
                          id='status.approval.pending'
                          defaultMessage='Pending approval'
                        />
                      ) : (
                        <FormattedMessage id='status.approval.rejected' defaultMessage='Rejected' />
                      )}
                    </Text>
                  </>
                )}

                {actionType === 'blocking' && blockExpiresAt ? (
                  <>
                    <span className='⁂-separator' />

                    <Text theme='muted' size='sm'>
                      <RelativeTimestamp timestamp={blockExpiresAt} futureDate />
                    </Text>
                  </>
                ) : null}

                {actionType === 'muting' && muteExpiresAt ? (
                  <>
                    <span className='⁂-separator' />

                    <Text theme='muted' size='sm'>
                      <RelativeTimestamp timestamp={muteExpiresAt} futureDate />
                    </Text>
                  </>
                ) : null}

                {items}
              </HStack>

              {note ? (
                <Text size='sm' className='mr-2'>
                  {note}
                </Text>
              ) : (
                withAccountNote && (
                  <Text
                    truncate
                    size='sm'
                    className='line-clamp-2 inline text-ellipsis [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
                  >
                    <ParsedContent
                      html={account.note}
                      emojis={account.emojis}
                      speakAsCat={account.speak_as_cat}
                    />
                  </Text>
                )
              )}
            </Stack>
          </div>
        </HStack>

        <div ref={actionRef}>{renderAction()}</div>
      </div>
    </div>
  );
};

export { type IAccount, Account as default };
