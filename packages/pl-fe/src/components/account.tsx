import { Link, useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import Avatar from 'pl-fe/components/ui/avatar';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import Emojify from 'pl-fe/features/emoji/emojify';
import ActionButton from 'pl-fe/features/ui/components/action-button';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettings } from 'pl-fe/stores/settings';
import { getAcct } from 'pl-fe/utils/accounts';
import { displayFqn } from 'pl-fe/utils/state';

import Badge from './badge';
import { ParsedContent } from './parsed-content';
import RelativeTimestamp from './relative-timestamp';

import type { Account as AccountSchema } from 'pl-api';
import type { StatusApprovalStatus } from 'pl-fe/normalizers/status';

interface IInstanceFavicon {
  account: Pick<AccountSchema, 'domain' | 'favicon'>;
  disabled?: boolean;
}

const messages = defineMessages({
  bot: { id: 'account.badges.bot', defaultMessage: 'Bot' },
  timeline: { id: 'account.instance_favicon', defaultMessage: 'Visit {domain} timeline' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
});

const InstanceFavicon: React.FC<IInstanceFavicon> = ({ account, disabled }) => {
  const navigate = useNavigate();
  const intl = useIntl();

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();

    if (disabled) return;

    const timelineUrl = `/timeline/${account.domain}`;
    if (!(e.ctrlKey || e.metaKey)) {
      navigate({ to: timelineUrl });
    } else {
      window.open(timelineUrl, '_blank');
    }
  };

  if (!account.favicon) {
    return null;
  }

  return (
    <button
      className='size-4 flex-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
      onClick={handleClick}
      disabled={disabled}
      title={intl.formatMessage(messages.timeline, { domain: account.domain })}
    >
      <img src={account.favicon} alt='' title={account.domain} className='max-h-full w-full' />
    </button>
  );
};

interface IProfilePopper {
  condition: boolean;
  wrapper: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}

const ProfilePopper: React.FC<IProfilePopper> = ({ condition, wrapper, children }) => (
  <>
    {condition ? wrapper(children) : children}
  </>
);

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
  timestampUrl?: string;
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
  timestampUrl,
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
}: IAccount) => {
  const overflowRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState<React.CSSProperties>({});

  const me = useAppSelector((state) => state.me);
  const username = useAppSelector((state) => account ? getAcct(account, displayFqn(state)) : null);
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
      const actionWidth = actionRef.current?.clientWidth || 0;

      if (overflowRef.current) {
        style.maxWidth = Math.max(0, overflowRef.current.clientWidth - (withAvatar ? avatarSize + 12 : 0) - (actionWidth ? actionWidth + 12 : 0));
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

  const LinkEl: any = withLinkToProfile ? Link : 'div';
  const linkProps = withLinkToProfile ? {
    to: `/@${account.acct}`,
    title: account.acct,
    onClick: (event: React.MouseEvent) => event.stopPropagation(),
  } : {};

  if (disabled) return (
    <div data-testid='account' className={clsx('⁂-account-card', { '⁂-account-card--action-top': actionAlignment === 'top' })} ref={overflowRef}>
      <div>
        <HStack alignItems='center' space={3} className='max-w-full'>
          {disableUserProvidedMedia ? (
            <Avatar src={account.avatar} alt={account.avatar_description} username={account.username} />
          ) : (
            <div className='rounded-lg'>
              <Avatar src={account.avatar} size={avatarSize} alt={account.avatar_description} isCat={account.is_cat} username={account.username} />
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

              {account.bot && <Badge slug='bot' title={<FormattedMessage id='account.badges.bot' defaultMessage='Bot' />} />}
            </HStack>

            <Stack space={withAccountNote || note ? 1 : 0}>
              <HStack alignItems='center' space={1}>
                <Text theme='muted' size='sm' direction='ltr' truncate>@{username}</Text>

                {!timestamp && account.locked && (
                  <>
                    <Icon
                      src={require('@phosphor-icons/core/regular/lock.svg')}
                      alt={intl.formatMessage(messages.account_locked)}
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

        <div ref={actionRef}>
          {renderAction()}
        </div>
      </div>
    </div>
  );

  return (
    <div data-testid='account' className={clsx('⁂-account-card', { '⁂-account-card--action-top': actionAlignment === 'top' })} ref={overflowRef}>
      <div>
        <HStack alignItems={withAccountNote || note ? 'top' : 'center'} space={3} className='max-w-full'>
          {withAvatar && (disableUserProvidedMedia ? (
            <Avatar src={account.avatar} alt={account.avatar_description} username={account.username} />
          ) : (
            <ProfilePopper
              condition={showAccountHoverCard}
              wrapper={(children) => <HoverAccountWrapper className='relative' accountId={account.id} element='span'>{children}</HoverAccountWrapper>}
            >
              <LinkEl className='rounded-lg' {...linkProps}>
                <Avatar src={account.avatar} size={avatarSize} alt={account.avatar_description} isCat={account.is_cat} username={account.username} />
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
              wrapper={(children) => <HoverAccountWrapper accountId={account.id} element='span'>{children}</HoverAccountWrapper>}
            >
              <LinkEl {...linkProps}>
                <HStack space={1} alignItems='center' grow>
                  <Text size='sm' weight='semibold' truncate>
                    <Emojify text={account.display_name} emojis={account.emojis} />
                  </Text>

                  {account.verified && <VerificationBadge />}

                  {account.bot && <Badge slug='bot' title={<FormattedMessage id='account.badges.bot' defaultMessage='Bot' />} />}
                </HStack>
              </LinkEl>
            </ProfilePopper>

            <Stack space={withAccountNote || note ? 1 : 0}>
              <HStack alignItems='center' space={1}>
                <Text theme='muted' size='sm' direction='ltr' truncate>@{username}</Text>

                {!timestamp && account.locked && (
                  <>
                    <Icon
                      src={require('@phosphor-icons/core/regular/lock.svg')}
                      alt={intl.formatMessage(messages.account_locked)}
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

                {(timestamp) ? (
                  <>
                    <span className='⁂-separator' />

                    {timestampUrl ? (
                      <Link to={timestampUrl} className='hover:underline' onClick={(event) => event.stopPropagation()}>
                        <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' className='whitespace-nowrap' futureDate={futureTimestamp} />
                      </Link>
                    ) : (
                      <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' className='whitespace-nowrap' futureDate={futureTimestamp} />
                    )}
                  </>
                ) : null}

                {approvalStatus && ['pending', 'rejected'].includes(approvalStatus) && (
                  <>
                    <span className='⁂-separator' />

                    <Text tag='span' theme='muted' size='sm'>
                      {approvalStatus === 'pending'
                        ? <FormattedMessage id='status.approval.pending' defaultMessage='Pending approval' />
                        : <FormattedMessage id='status.approval.rejected' defaultMessage='Rejected' />}
                    </Text>
                  </>
                )}

                {actionType === 'muting' && muteExpiresAt ? (
                  <>
                    <span className='⁂-separator' />

                    <Text theme='muted' size='sm'><RelativeTimestamp timestamp={muteExpiresAt} futureDate /></Text>
                  </>
                ) : null}

                {items}
              </HStack>

              {note ? (
                <Text
                  size='sm'
                  className='mr-2'
                >
                  {note}
                </Text>
              ) : withAccountNote && (
                <Text
                  truncate
                  size='sm'
                  className='line-clamp-2 inline text-ellipsis [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
                >
                  <ParsedContent html={account.note} emojis={account.emojis} speakAsCat={account.speak_as_cat} />
                </Text>
              )}
            </Stack>
          </div>
        </HStack>

        <div ref={actionRef}>
          {renderAction()}
        </div>
      </div>
    </div>
  );
};

export { type IAccount, Account as default };
