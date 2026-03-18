import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSuitcase from '@phosphor-icons/core/regular/suitcase.svg';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { GOTOSOCIAL, MASTODON, mediaAttachmentSchema } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import Account from '@/components/accounts/account';
import ActionButton from '@/components/accounts/action-button';
import SubscriptionButton from '@/components/accounts/subscription-button';
import VerificationBadge from '@/components/accounts/verification-badge';
import Badge from '@/components/badge';
import AltIndicator from '@/components/media/alt-indicator';
import StillImage from '@/components/still-image';
import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Popover from '@/components/ui/popover';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useChats } from '@/queries/chats';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

import { AccountMenu } from './account-menu';

import type { NicoliumResponse } from '@/api';
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
  <div className='⁂-moved-note__container'>
    <div className='⁂-moved-note'>
      <Icon src={iconSuitcase} />

      <p>
        <FormattedMessage
          id='notification.move'
          defaultMessage='{name} moved to {targetName}'
          values={{
            name: <Emojify text={from.display_name} emojis={from.emojis} />,
            targetName: to.acct,
          }}
        />
      </p>
    </div>

    <Account account={to} withRelationship={false} />
  </div>
);

interface IAccountHeader {
  account?: AccountEntity;
}

const AccountHeader: React.FC<IAccountHeader> = ({ account }) => {
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
    onError: (error: { response: NicoliumResponse }) => {
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
      <div className='⁂-account-header__container ⁂-account-header__container--placeholder'>
        <div />
        <div className='relative mx-4 -mt-12 size-24 rounded-lg bg-gray-400 ring-4 ring-white dark:ring-gray-800' />
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
              <div className='flex max-h-[32rem] max-w-96 flex-col gap-1 overflow-auto p-4'>
                <Text weight='semibold'>
                  <FormattedMessage
                    id='account.header.description'
                    defaultMessage='Header description'
                  />
                </Text>
                <Text className='whitespace-pre-wrap'>{account.header_description}</Text>
              </div>
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
          src={iconChatsTeardrop}
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
        src={iconExport}
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
        src={iconRss}
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
    <div className='⁂-account-header__container'>
      {account.moved && typeof account.moved === 'object' && (
        <MovedNote from={account} to={account.moved as AccountEntity} />
      )}

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
          <div className='flex items-center gap-1'>{info}</div>
        </div>
      </div>

      <div className='mx-4 -mt-12 flex items-end gap-5'>
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

        <div className='mt-6 flex w-full flex-wrap justify-end gap-2 sm:pb-1'>
          {ownAccount && account.id !== ownAccount.id && <SubscriptionButton account={account} />}
          {renderMessageButton()}
          {renderShareButton()}

          <AccountMenu account={account} />

          {renderRssButton()}

          <ActionButton account={account} />
        </div>
      </div>
    </div>
  );
};

export { AccountHeader as default };
