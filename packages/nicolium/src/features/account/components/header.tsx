import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { GOTOSOCIAL, MASTODON, mediaAttachmentSchema } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import Account from '@/components/accounts/account';
import VerificationBadge from '@/components/accounts/verification-badge';
import Badge from '@/components/badge';
import Icon from '@/components/icon';
import AltIndicator from '@/components/media/alt-indicator';
import StillImage from '@/components/still-image';
import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import Popover from '@/components/ui/popover';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import ActionButton from '@/features/ui/components/action-button';
import SubscriptionButton from '@/features/ui/components/subscription-button';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useChats } from '@/queries/chats';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

import { AccountMenu } from './account-menu';

import type { PlfeResponse } from '@/api';
import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  chat: { id: 'account.chat', defaultMessage: 'Chat with @{name}' },
  share: { id: 'account.share', defaultMessage: "Share @{name}'s profile" },
  header: { id: 'account.header.alt', defaultMessage: 'Profile header' },
  subscribeFeed: { id: 'account.rss_feed', defaultMessage: 'Subscribe to RSS feed' },
  headerAlt: { id: 'account.header.alt.popover', defaultMessage: 'Show profile header alt text' },
});

interface IMovedNote {
  from: AccountEntity;
  to: AccountEntity;
}

const MovedNote: React.FC<IMovedNote> = ({ from, to }) => (
  <div className='p-4'>
    <HStack className='mb-2' alignItems='center' space={1.5}>
      <Icon
        src={require('@phosphor-icons/core/regular/suitcase.svg')}
        className='flex-none text-primary-600 dark:text-primary-400'
      />

      <div className='truncate'>
        <Text theme='muted' size='sm' truncate>
          <FormattedMessage
            id='notification.move'
            defaultMessage='{name} moved to {targetName}'
            values={{
              name: (
                <span>
                  <Emojify text={from.display_name} emojis={from.emojis} />
                </span>
              ),
              targetName: to.acct,
            }}
          />
        </Text>
      </div>
    </HStack>

    <Account account={to} withRelationship={false} />
  </div>
);

interface IHeader {
  account?: AccountEntity;
}

const Header: React.FC<IHeader> = ({ account }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();
  const { openModal } = useModalsActions();
  const settings = useSettings();

  const { software } = features.version;

  const { getOrCreateChatByAccountId } = useChats();

  const createAndNavigateToChat = useMutation({
    mutationFn: (accountId: string) => getOrCreateChatByAccountId(accountId),
    onError: (error: { response: PlfeResponse }) => {
      const data = error.response.json;
      toast.error(data?.error);
    },
    onSuccess: (response) => {
      navigate({ to: '/chats/$chatId', params: { chatId: response.id } });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.search,
      });
    },
  });

  if (!account) {
    return (
      <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
        <div>
          <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <div className='px-4 sm:px-6'>
          <HStack alignItems='bottom' space={5} className='-mt-12'>
            <div className='relative flex'>
              <div className='size-24 rounded-lg bg-gray-400 ring-4 ring-white dark:ring-gray-800' />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const onAvatarClick = () => {
    const avatar = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: account.avatar,
    });
    openModal('MEDIA', { media: [avatar], index: 0 });
  };

  const handleAvatarClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAvatarClick();
    }
  };

  const onHeaderClick = () => {
    const header = v.parse(mediaAttachmentSchema, {
      type: 'image',
      url: account.header,
    });
    openModal('MEDIA', { media: [header], index: 0 });
  };

  const handleHeaderClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onHeaderClick();
    }
  };

  const handleShare = () => {
    navigator
      .share({
        text: `@${account.acct}`,
        url: account.url,
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error(e);
      });
  };

  const makeInfo = () => {
    const info: React.ReactNode[] = [];

    if (!account || !ownAccount) return info;

    if (ownAccount.id !== account.id && account.relationship?.followed_by) {
      info.push(
        <Badge
          key='followed_by'
          slug='opaque'
          title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
        />,
      );
    } else if (ownAccount.id !== account.id && account.relationship?.blocking) {
      info.push(
        <Badge
          key='blocked'
          slug='opaque'
          title={<FormattedMessage id='account.blocked' defaultMessage='Blocked' />}
        />,
      );
    }

    if (ownAccount.id !== account.id && account.relationship?.muting) {
      info.push(
        <Badge
          key='muted'
          slug='opaque'
          title={<FormattedMessage id='account.muted' defaultMessage='Muted' />}
        />,
      );
    } else if (ownAccount.id !== account.id && account.relationship?.domain_blocking) {
      info.push(
        <Badge
          key='domain_blocked'
          slug='opaque'
          title={<FormattedMessage id='account.domain_blocked' defaultMessage='Domain hidden' />}
        />,
      );
    }

    return info;
  };

  const renderHeader = () => {
    let header: React.ReactNode;

    if (settings.disableUserProvidedMedia) {
      if (!account.header_description || account.header_default) return null;
      else
        return (
          <Popover
            interaction='hover'
            referenceElementClassName='cursor-pointer'
            content={
              <Stack space={1} className='max-h-[32rem] max-w-96 overflow-auto p-4'>
                <Text weight='semibold'>
                  <FormattedMessage
                    id='account.header.description'
                    defaultMessage='Header description'
                  />
                </Text>
                <Text className='whitespace-pre-wrap'>{account.header_description}</Text>
              </Stack>
            }
            isFlush
            title={intl.formatMessage(messages.headerAlt)}
          >
            <AltIndicator
              className='ml-6 mt-6 w-fit'
              message={<FormattedMessage id='account.header.alt' defaultMessage='Profile header' />}
            />
          </Popover>
        );
    }

    if (account.header) {
      header = (
        <StillImage
          src={account.header}
          alt={account.header_description || intl.formatMessage(messages.header)}
        />
      );

      if (!account.header_default) {
        header = (
          <a href={account.header} onClick={handleHeaderClick} target='_blank'>
            {header}
          </a>
        );
      }
    }

    return header;
  };

  const renderMessageButton = () => {
    if (!ownAccount || !account || account.id === ownAccount?.id) {
      return null;
    }

    if (account.accepts_chat_messages) {
      return (
        <IconButton
          src={require('@phosphor-icons/core/regular/chats-teardrop.svg')}
          onClick={() => {
            createAndNavigateToChat.mutate(account.id);
          }}
          title={intl.formatMessage(messages.chat, { name: account.username })}
          theme='outlined'
          className='px-2'
          iconClassName='h-4 w-4'
        />
      );
    } else {
      return null;
    }
  };

  const renderShareButton = () => {
    const canShare = 'share' in navigator;

    if (!(account && ownAccount?.id && account.id === ownAccount?.id && canShare)) {
      return null;
    }

    return (
      <IconButton
        src={require('@phosphor-icons/core/regular/export.svg')}
        onClick={handleShare}
        title={intl.formatMessage(messages.share, { name: account.username })}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  };

  const renderRssButton = () => {
    if (
      ownAccount ||
      !features.rssFeeds ||
      !account.local ||
      (software === GOTOSOCIAL && !account.enable_rss)
    ) {
      return null;
    }

    const href = software === MASTODON ? `${account.url}.rss` : `${account.url}/feed.rss`;

    return (
      <IconButton
        src={require('@phosphor-icons/core/regular/rss.svg')}
        href={href}
        title={intl.formatMessage(messages.subscribeFeed)}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  };

  const info = makeInfo();

  return (
    <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
      {account.moved && typeof account.moved === 'object' && (
        <MovedNote from={account} to={account.moved as AccountEntity} />
      )}

      <div>
        <div
          className={clsx(
            'relative isolate flex w-full flex-col justify-center overflow-hidden black:rounded-t-none md:rounded-t-xl',
            {
              'h-32 bg-gray-200 dark:bg-gray-900/50 lg:h-48': !settings.disableUserProvidedMedia,
            },
          )}
        >
          {renderHeader()}

          <div className='absolute left-2 top-2'>
            <HStack alignItems='center' space={1}>
              {info}
            </HStack>
          </div>
        </div>
      </div>

      <div className='px-4 sm:px-6'>
        <HStack className='-mt-12' alignItems='bottom' space={5}>
          <div className='relative flex'>
            <a href={account.avatar} onClick={handleAvatarClick} target='_blank'>
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                size={96}
                className='relative size-24 rounded-lg bg-white ring-4 ring-white black:ring-black dark:bg-primary-900 dark:ring-primary-900'
                isCat={account.is_cat}
                username={account.username}
                showAlt
              />
            </a>
            {account.verified && (
              <div className='absolute -bottom-2 -right-2'>
                <VerificationBadge className='!size-[24px] rounded-full !p-[2px] ring-2 ring-white black:ring-black dark:ring-primary-900' />
              </div>
            )}
          </div>

          <div className='mt-6 flex w-full justify-end sm:pb-1'>
            <HStack space={2} className='mt-10' justifyContent='end' wrap>
              {ownAccount && account.id !== ownAccount.id && (
                <SubscriptionButton account={account} />
              )}
              {renderMessageButton()}
              {renderShareButton()}

              <AccountMenu account={account} />

              {renderRssButton()}

              <ActionButton account={account} />
            </HStack>
          </div>
        </HStack>
      </div>
    </div>
  );
};

export { Header as default };
