import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { GOTOSOCIAL, MASTODON, mediaAttachmentSchema } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import { mentionCompose, directCompose } from '@/actions/compose';
import { initReport, ReportableEntities } from '@/actions/reports';
import Account from '@/components/account';
import AltIndicator from '@/components/alt-indicator';
import Badge from '@/components/badge';
import DropdownMenu, { Menu } from '@/components/dropdown-menu';
import Icon from '@/components/icon';
import StillImage from '@/components/still-image';
import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import Popover from '@/components/ui/popover';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import VerificationBadge from '@/components/verification-badge';
import Emojify from '@/features/emoji/emojify';
import ActionButton from '@/features/ui/components/action-button';
import SubscriptionButton from '@/features/ui/components/subscription-button';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import {
  useFollowAccountMutation,
  usePinAccountMutation,
  useRemoveAccountFromFollowersMutation,
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
  useUnpinAccountMutation,
  useUpdateAccountNoteMutation,
} from '@/queries/accounts/use-relationship';
import { useChats } from '@/queries/chats';
import { queryClient } from '@/queries/client';
import { blockDomainMutationOptions, unblockDomainMutationOptions } from '@/queries/settings/domain-blocks';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';
import copy from '@/utils/copy';

import type { PlfeResponse } from '@/api';
import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
  mention: { id: 'account.mention', defaultMessage: 'Mention' },
  chat: { id: 'account.chat', defaultMessage: 'Chat with @{name}' },
  direct: { id: 'account.direct', defaultMessage: 'Direct message @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  share: { id: 'account.share', defaultMessage: 'Share @{name}\'s profile' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Hide everything from {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
  hideReblogs: { id: 'account.hide_reblogs', defaultMessage: 'Hide reposts from @{name}' },
  showReblogs: { id: 'account.show_reblogs', defaultMessage: 'Show reposts from @{name}' },
  preferences: { id: 'column.preferences', defaultMessage: 'Preferences' },
  follow_requests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  blocks: { id: 'column.blocks', defaultMessage: 'Blocks' },
  domain_blocks: { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  mutes: { id: 'column.mutes', defaultMessage: 'Mutes' },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: { id: 'account.unendorse', defaultMessage: 'Don\'t feature on profile' },
  bite: { id: 'account.bite', defaultMessage: 'Bite @{name}' },
  removeFromFollowers: { id: 'account.remove_from_followers', defaultMessage: 'Remove this follower' },
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  add_or_remove_from_list: { id: 'account.add_or_remove_from_list', defaultMessage: 'Add or remove from lists' },
  search: { id: 'account.search', defaultMessage: 'Search from @{name}' },
  searchSelf: { id: 'account.search_self', defaultMessage: 'Search your posts' },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
  blockDomainConfirm: { id: 'confirmations.domain_block.confirm', defaultMessage: 'Hide entire domain' },
  removeFromFollowersConfirm: { id: 'confirmations.remove_from_followers.confirm', defaultMessage: 'Remove' },
  userEndorsed: { id: 'account.endorse.success', defaultMessage: 'You are now featuring @{acct} on your profile' },
  userUnendorsed: { id: 'account.unendorse.success', defaultMessage: 'You are no longer featuring @{acct}' },
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bit @{acct}' },
  userBiteFail: { id: 'account.bite.fail', defaultMessage: 'Failed to bite @{acct}' },
  profileExternal: { id: 'account.profile_external', defaultMessage: 'View profile on {domain}' },
  header: { id: 'account.header.alt', defaultMessage: 'Profile header' },
  subscribeFeed: { id: 'account.rss_feed', defaultMessage: 'Subscribe to RSS feed' },
  loadActivities: { id: 'account.load_activities', defaultMessage: 'Fetch latest posts' },
  loadActivitiesSuccess: { id: 'account.load_activities.success', defaultMessage: 'Scheduled fetching latest posts' },
  loadActivitiesFail: { id: 'account.load_activities.fail', defaultMessage: 'Failed to fetch latest posts' },
  note: { id: 'account_note.modal_header', defaultMessage: 'Edit note for @{name}' },
  notePlaceholder: { id: 'account_note.placeholder', defaultMessage: 'Add a note' },
  noteSaved: { id: 'account_note.success', defaultMessage: 'Note saved' },
  noteSaveFailed: { id: 'account_note.fail', defaultMessage: 'Failed to save note' },
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
              name: <span><Emojify text={from.display_name} emojis={from.emojis} /></span>,
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
  const dispatch = useAppDispatch();
  const client = useClient();

  const features = useFeatures();
  const { account: ownAccount } = useOwnAccount();
  const { mutate: followAccount } = useFollowAccountMutation(account?.id!);
  const { mutate: unblockAccount } = useUnblockAccountMutation(account?.id!);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(account?.id!);
  const { mutate: pinAccount } = usePinAccountMutation(account?.id!);
  const { mutate: unpinAccount } = useUnpinAccountMutation(account?.id!);
  const { mutate: removeFromFollowers } = useRemoveAccountFromFollowersMutation(account?.id!);
  const { mutate: updateAccountNote } = useUpdateAccountNoteMutation(account?.id!);
  const { openModal } = useModalsActions();
  const settings = useSettings();

  const { software } = features.version;

  const { getOrCreateChatByAccountId } = useChats();

  const { mutate: blockDomain } = useMutation(blockDomainMutationOptions);
  const { mutate: unblockDomain } = useMutation(unblockDomainMutationOptions);

  const createAndNavigateToChat = useMutation({
    mutationFn: (accountId: string) => getOrCreateChatByAccountId(accountId),
    onError: (error: { response: PlfeResponse }) => {
      const data = error.response.json;
      toast.error(data?.error);
    },
    onSuccess: (response) => {
      navigate({ to: '/chats/$chatId', params: { chatId: response.id } });
      queryClient.invalidateQueries({
        queryKey: ['chats', 'search'],
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
              <div
                className='size-24 rounded-lg bg-gray-400 ring-4 ring-white dark:ring-gray-800'
              />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const onBlock = () => {
    if (account.relationship?.blocking) {
      unblockAccount();
    } else {
      openModal('BLOCK_MUTE', { accountId: account.id, action: 'BLOCK' });
    }
  };

  const onMention = () => {
    dispatch(mentionCompose(account));
  };

  const onDirect = () => {
    dispatch(directCompose(account));
  };

  const onReblogToggle = () => {
    if (account.relationship?.showing_reblogs) {
      followAccount({ reblogs: false });
    } else {
      followAccount({ reblogs: true });
    }
  };

  const onEndorseToggle = () => {
    if (account.relationship?.endorsed) {
      unpinAccount(undefined, {
        onSuccess: () =>{
          toast.success(intl.formatMessage(messages.userUnendorsed, { acct: account.acct }));
        },
      });
    } else {
      pinAccount(undefined, {
        onSuccess: () =>{
          toast.success(intl.formatMessage(messages.userEndorsed, { acct: account.acct }));
        },
      });
    }
  };

  const onBite = () => {
    client.accounts.biteAccount(account.id)
      .then(() =>{
        toast.success(intl.formatMessage(messages.userBit, { acct: account.acct }));
      })
      .catch(() =>{
        toast.error(intl.formatMessage(messages.userBiteFail, { acct: account.acct }));
      });
  };

  const onLoadActivities = () => {
    client.accounts.loadActivities(account.id)
      .then(() =>{
        toast.success(intl.formatMessage(messages.loadActivitiesSuccess));
      })
      .catch(() =>{
        toast.error(intl.formatMessage(messages.loadActivitiesFail));
      });
  };

  const onEditNote = () => {
    openModal('TEXT_FIELD', {
      heading: <FormattedMessage id='account_note.modal_header' defaultMessage='Edit note for @{name}' values={{ name: account.acct }} />,
      placeholder: intl.formatMessage(messages.notePlaceholder),
      confirm: <FormattedMessage id='account_note.save' defaultMessage='Save note' />,
      onConfirm: (value) =>{
        updateAccountNote(value, {
          onSuccess: () =>{
            toast.success(messages.noteSaved);
          },
          onError: () =>{
            toast.error(messages.noteSaveFailed);
          },
        });
      },
      text: account.relationship?.note ?? '',
    });
  };

  const onReport = () => {
    dispatch(initReport(ReportableEntities.ACCOUNT, account));
  };

  const onMute = () => {
    if (account.relationship?.muting) {
      unmuteAccount();
    } else {
      openModal('BLOCK_MUTE', { accountId: account.id, action: 'MUTE' });
    }
  };

  const onBlockDomain = (domain: string) => {
    openModal('CONFIRM', {
      heading: <FormattedMessage id='confirmations.domain_block.heading' defaultMessage='Block {domain}' values={{ domain }} />,
      message: <FormattedMessage id='confirmations.domain_block.message' defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable. You will not see content from that domain in any public timelines or your notifications.' values={{ domain: <strong>{domain}</strong> }} />,
      confirm: intl.formatMessage(messages.blockDomainConfirm),
      onConfirm: () =>{
        blockDomain(domain);
      },
    });
  };

  const onUnblockDomain = (domain: string) => {
    unblockDomain(domain);
  };

  const onAddToList = () => {
    openModal('LIST_ADDER', {
      accountId: account.id,
    });
  };

  const onRemoveFromFollowers = () => {
    const unfollowModal = settings.unfollowModal;
    if (unfollowModal) {
      openModal('CONFIRM', {
        heading: <FormattedMessage id='confirmations.remove_from_followers.heading' defaultMessage='Remove {name} from followers' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />,
        message: <FormattedMessage id='confirmations.remove_from_followers.message' defaultMessage='Are you sure you want to remove {name} from your followers?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />,
        confirm: intl.formatMessage(messages.removeFromFollowersConfirm),
        onConfirm: () =>{
          removeFromFollowers();
        },
      });
    } else {
      removeFromFollowers();
    }
  };

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
    navigator.share({
      text: `@${account.acct}`,
      url: account.url,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  const handleCopy: React.EventHandler<React.MouseEvent> = (e) => {
    copy(account.url);
  };

  const makeMenu = () => {
    const menu: Menu = [];

    if (!account) {
      return [];
    }

    if (features.rssFeeds && account.local && (software !== GOTOSOCIAL || account.enable_rss)) {
      menu.push({
        text: intl.formatMessage(messages.subscribeFeed),
        icon: require('@phosphor-icons/core/regular/rss.svg'),
        href: software === MASTODON ? `${account.url}.rss` : `${account.url}/feed.rss`,
        target: '_blank',
      });
    }

    if ('share' in navigator) {
      menu.push({
        text: intl.formatMessage(messages.share, { name: account.username }),
        action: handleShare,
        icon: require('@phosphor-icons/core/regular/export.svg'),
      });
    }

    if (features.federating && !account.local) {
      const domain = account.fqn.split('@')[1];

      menu.push({
        text: intl.formatMessage(messages.profileExternal, { domain }),
        href: account.url,
        icon: require('@phosphor-icons/core/regular/arrow-square-out.svg'),
      });
    }

    menu.push({
      text: intl.formatMessage(messages.copy),
      action: handleCopy,
      icon: require('@phosphor-icons/core/regular/clipboard.svg'),
    });

    if (!ownAccount) return menu;

    if (features.searchFromAccount) {
      menu.push({
        text: intl.formatMessage(account.id === ownAccount.id ? messages.searchSelf : messages.search, { name: account.username }),
        to: '/search',
        search: { type: 'statuses', accountId: account.id },
        icon: require('@phosphor-icons/core/regular/magnifying-glass.svg'),
      });
    }

    if (menu.length) {
      menu.push(null);
    }

    if (account.id === ownAccount.id) {
      menu.push({
        text: intl.formatMessage(messages.edit_profile),
        to: '/settings/profile',
        icon: require('@phosphor-icons/core/regular/user.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.preferences),
        to: '/settings',
        icon: require('@phosphor-icons/core/regular/sliders-horizontal.svg'),
      });
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mutes),
        to: '/mutes',
        icon: require('@phosphor-icons/core/regular/speaker-simple-x.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.blocks),
        to: '/blocks',
        icon: require('@phosphor-icons/core/regular/prohibit.svg'),
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: account.username }),
        action: onMention,
        icon: require('@phosphor-icons/core/regular/at.svg'),
      });

      if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: account.username }),
          action: onDirect,
          icon: require('@phosphor-icons/core/regular/envelope-simple.svg'),
        });
      }

      if (account.relationship?.following) {
        if (account.relationship?.showing_reblogs) {
          menu.push({
            text: intl.formatMessage(messages.hideReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: require('@phosphor-icons/core/regular/repeat.svg'),
          });
        } else {
          menu.push({
            text: intl.formatMessage(messages.showReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: require('@phosphor-icons/core/regular/repeat.svg'),
          });
        }

        if (features.lists) {
          menu.push({
            text: intl.formatMessage(messages.add_or_remove_from_list),
            action: onAddToList,
            icon: require('@phosphor-icons/core/regular/list-bullets.svg'),
          });
        }

        if (features.accountEndorsements) {
          menu.push({
            text: intl.formatMessage(account.relationship?.endorsed ? messages.unendorse : messages.endorse),
            action: onEndorseToggle,
            icon: account.relationship?.endorsed ? require('@phosphor-icons/core/regular/user-minus.svg') : require('@phosphor-icons/core/regular/user-check.svg'),
          });
        }
      } else if (features.lists && features.unrestrictedLists) {
        menu.push({
          text: intl.formatMessage(messages.add_or_remove_from_list),
          action: onAddToList,
          icon: require('@phosphor-icons/core/regular/list-bullets.svg'),
        });
      }

      if (features.bites) {
        menu.push({
          text: intl.formatMessage(messages.bite, { name: account.username }),
          action: onBite,
          icon: require('@phosphor-icons/core/regular/tooth.svg'),
        });
      }

      if (features.loadActivities && !account.local) {
        menu.push({
          text: intl.formatMessage(messages.loadActivities),
          action: onLoadActivities,
          icon: require('@phosphor-icons/core/regular/arrows-clockwise.svg'),
        });
      }

      if (account.relationship && features.notes) {
        menu.push({
          text: intl.formatMessage(messages.note, { name: account.acct }),
          action: onEditNote,
          icon: require('@phosphor-icons/core/regular/note-pencil.svg'),
        });
      }

      menu.push(null);

      if (features.removeFromFollowers && account.relationship?.followed_by) {
        menu.push({
          text: intl.formatMessage(messages.removeFromFollowers),
          action: onRemoveFromFollowers,
          icon: require('@phosphor-icons/core/regular/user-minus.svg'),
        });
      }

      if (account.relationship?.muting) {
        menu.push({
          text: intl.formatMessage(messages.unmute, { name: account.username }),
          action: onMute,
          icon: require('@phosphor-icons/core/regular/speaker-simple-x.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.mute, { name: account.username }),
          action: onMute,
          icon: require('@phosphor-icons/core/regular/speaker-simple-x.svg'),
        });
      }

      if (account.relationship?.blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblock, { name: account.username }),
          action: onBlock,
          icon: require('@phosphor-icons/core/regular/prohibit.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.block, { name: account.username }),
          action: onBlock,
          icon: require('@phosphor-icons/core/regular/prohibit.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(messages.report, { name: account.username }),
        action: onReport,
        icon: require('@phosphor-icons/core/regular/flag.svg'),
      });
    }

    if (!account.local) {
      const domain = account.fqn.split('@')[1];

      menu.push(null);

      if (account.relationship?.domain_blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblockDomain, { domain }),
          action: () =>{
            onUnblockDomain(domain);
          },
          icon: require('@phosphor-icons/core/regular/prohibit.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.blockDomain, { domain }),
          action: () =>{
            onBlockDomain(domain);
          },
          icon: require('@phosphor-icons/core/regular/prohibit.svg'),
        });
      }
    }

    if (ownAccount.is_admin || ownAccount.is_moderator) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: account.username }),
        to: '/pl-fe/admin/accounts/$accountId',
        params: { accountId: account.id },
        icon: require('@phosphor-icons/core/regular/gavel.svg'),
      });
    }

    return menu;
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
      else return (
        <Popover
          interaction='hover'
          referenceElementClassName='cursor-pointer'
          content={
            <Stack space={1} className='max-h-[32rem] max-w-96 overflow-auto p-4'>
              <Text weight='semibold'>
                <FormattedMessage id='account.header.description' defaultMessage='Header description' />
              </Text>
              <Text className='whitespace-pre-wrap'>
                {account.header_description}
              </Text>
            </Stack>
          }
          isFlush
        >
          <AltIndicator className='ml-6 mt-6 w-fit' message={<FormattedMessage id='account.header.alt' defaultMessage='Profile header' />} />
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
          onClick={() =>{
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
    if (ownAccount || !features.rssFeeds || !account.local || (software === GOTOSOCIAL && !account.enable_rss)) {
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
  const menu = makeMenu();

  return (
    <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
      {(account.moved && typeof account.moved === 'object') && (
        <MovedNote from={account} to={account.moved as AccountEntity} />
      )}

      <div>
        <div
          className={clsx('relative isolate flex w-full flex-col justify-center overflow-hidden black:rounded-t-none md:rounded-t-xl', {
            'h-32 bg-gray-200 dark:bg-gray-900/50 lg:h-48': !settings.disableUserProvidedMedia,
          })}
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
              {(ownAccount && account.id !== ownAccount.id) && <SubscriptionButton account={account} />}
              {renderMessageButton()}
              {renderShareButton()}

              {menu.length > 0 && (
                <DropdownMenu items={menu} placement='bottom-end'>
                  <IconButton
                    src={require('@phosphor-icons/core/regular/dots-three.svg')}
                    theme='outlined'
                    className='px-2'
                    iconClassName='h-4 w-4'
                  />
                </DropdownMenu>
              )}

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
