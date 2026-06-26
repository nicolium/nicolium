import iconArrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg';
import iconArrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg';
import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconEnvelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg';
import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconFlag from '@phosphor-icons/core/regular/flag.svg';
import iconGavel from '@phosphor-icons/core/regular/gavel.svg';
import iconLinkSimpleHorizontal from '@phosphor-icons/core/regular/link-simple-horizontal.svg';
import iconListBullets from '@phosphor-icons/core/regular/list-bullets.svg';
import iconList from '@phosphor-icons/core/regular/list.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconNotePencil from '@phosphor-icons/core/regular/note-pencil.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import iconSpeakerSimpleX from '@phosphor-icons/core/regular/speaker-simple-x.svg';
import iconTag from '@phosphor-icons/core/regular/tag.svg';
import iconTooth from '@phosphor-icons/core/regular/tooth.svg';
import iconUserCheck from '@phosphor-icons/core/regular/user-check.svg';
import iconUserMinus from '@phosphor-icons/core/regular/user-minus.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import { GOTOSOCIAL, MASTODON } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import IconButton from '@/components/ui/icon-button';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import {
  usePinAccountMutation,
  useRemoveAccountFromFollowersMutation,
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
  useUnpinAccountMutation,
  useUpdateAccountNoteMutation,
} from '@/queries/accounts/use-relationship';
import { useBlockDomainMutation, useUnblockDomainMutation } from '@/queries/settings/domain-blocks';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';
import copy from '@/utils/copy';

import type { Account } from 'pl-api';

const messages = defineMessages({
  editProfile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  mention: { id: 'account.mention', defaultMessage: 'Mention' },
  direct: { id: 'account.direct', defaultMessage: 'Direct message @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  copySuccess: { id: 'account.copy.success', defaultMessage: 'Profile URL copied to clipboard' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Hide everything from {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  blocks: { id: 'column.blocks', defaultMessage: 'Blocks' },
  mutes: { id: 'column.mutes', defaultMessage: 'Mutes' },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: { id: 'account.unendorse', defaultMessage: 'Don’t feature on profile' },
  bite: { id: 'account.bite', defaultMessage: 'Bite @{name}' },
  removeFromFollowers: {
    id: 'account.remove_from_followers',
    defaultMessage: 'Remove this follower',
  },
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  addOrRemoveFromList: {
    id: 'account.add_or_remove_from_list',
    defaultMessage: 'Add or remove from lists',
  },
  search: { id: 'account.search', defaultMessage: 'Search from @{name}' },
  searchSelf: { id: 'account.search_self', defaultMessage: 'Search your posts' },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
  blockDomainConfirm: {
    id: 'confirmations.domain_block.confirm',
    defaultMessage: 'Hide entire domain',
  },
  removeFromFollowersConfirm: {
    id: 'confirmations.remove_from_followers.confirm',
    defaultMessage: 'Remove',
  },
  userEndorsed: {
    id: 'account.endorse.success',
    defaultMessage: 'You are now featuring @{acct} on your profile',
  },
  userUnendorsed: {
    id: 'account.unendorse.success',
    defaultMessage: 'You are no longer featuring @{acct}',
  },
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bitten @{acct}' },
  userBiteFail: { id: 'account.bite.fail', defaultMessage: 'Failed to bite @{acct}' },
  profileExternal: { id: 'account.profile_external', defaultMessage: 'View profile on {domain}' },
  loadActivities: { id: 'account.load_activities', defaultMessage: 'Fetch latest posts' },
  loadActivitiesSuccess: {
    id: 'account.load_activities.success',
    defaultMessage: 'Scheduled fetching latest posts',
  },
  loadActivitiesFail: {
    id: 'account.load_activities.fail',
    defaultMessage: 'Failed to fetch latest posts',
  },
  nickname: { id: 'account.nickname.modal.header', defaultMessage: 'Set nickname for @{name}' },
  nicknamePlaceholder: { id: 'account.nickname.placeholder', defaultMessage: 'Enter a nickname' },
  nicknameSave: { id: 'account.nickname.save', defaultMessage: 'Save nickname' },
  nicknameSaved: { id: 'account.nickname.success', defaultMessage: 'Nickname saved' },
  note: { id: 'account_note.modal.header', defaultMessage: 'Edit note for @{name}' },
  notePlaceholder: { id: 'account_note.placeholder', defaultMessage: 'Add a note' },
  noteSaved: { id: 'account_note.success', defaultMessage: 'Note saved' },
  noteSaveFailed: { id: 'account_note.fail', defaultMessage: 'Failed to save note' },
  share: { id: 'account.share', defaultMessage: 'Share @{name}’s profile' },
  subscribeFeed: { id: 'account.rss_feed', defaultMessage: 'Subscribe to RSS feed' },
  subscribeByEmail: { id: 'account.email_subscription', defaultMessage: 'Subscribe by e-mail' },
  emailSubscriptionHeader: {
    id: 'account.email_subscription.modal.header',
    defaultMessage: 'Sign up for e-mail updates from @{name}',
  },
  emailSubscriptionMessage: {
    id: 'account.email_subscription.modal.message',
    defaultMessage: 'Get posts in your inbox without creating an account. Unsubscribe at any time.',
  },
  emailSubscriptionPlaceholder: {
    id: 'account.email_subscription.placeholder',
    defaultMessage: 'E-mail address',
  },
  emailSubscriptionConfirm: {
    id: 'account.email_subscription.confirm',
    defaultMessage: 'Subscribe',
  },
  emailSubscriptionSuccess: {
    id: 'account.email_subscription.success',
    defaultMessage: 'Check your inbox for an email to finish signing up for e-mail updates.',
  },
  emailSubscriptionFail: {
    id: 'account.email_subscription.fail',
    defaultMessage: 'Failed to subscribe',
  },
  emailSubscriptionFailBlocked: {
    id: 'account.email_subscription.fail.blocked',
    defaultMessage: 'Blocked e-mail provider',
  },
  emailSubscriptionFailInvalid: {
    id: 'account.email_subscription.fail.invalid',
    defaultMessage: 'Invalid e-mail address',
  },
  addToNavigationItems: {
    id: 'account.add_to_navigation_items',
    defaultMessage: 'Add to navigation items',
  },
  addToNavigationItemsSuccess: {
    id: 'account.add_to_navigation_items.success',
    defaultMessage: 'Added to navigation items',
  },
  removeFromNavigationItems: {
    id: 'account.remove_from_navigation_items',
    defaultMessage: 'Remove from navigation items',
  },
  removeFromNavigationItemsSuccess: {
    id: 'account.remove_from_navigation_items.success',
    defaultMessage: 'Removed from navigation items',
  },
  addToSidebarItems: {
    id: 'account.add_to_sidebar_items',
    defaultMessage: 'Show latest post in sidebar',
  },
  addToSidebarItemsSuccess: {
    id: 'account.add_to_sidebar_items.success',
    defaultMessage: 'Added to sidebar items',
  },
  removeFromSidebarItems: {
    id: 'account.remove_from_sidebar_items',
    defaultMessage: 'Don’t show latest post in sidebar',
  },
  removeFromSidebarItemsSuccess: {
    id: 'account.remove_from_sidebar_items.success',
    defaultMessage: 'Removed from sidebar items',
  },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

interface IAccountMenu {
  account: Account;
}

const AccountMenu: React.FC<IAccountMenu> = ({ account }) => {
  const intl = useIntl();
  const { mentionCompose, directCompose } = useComposeActions();
  const client = useClient();

  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();
  const { mutate: unblockAccount } = useUnblockAccountMutation(account?.id!);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(account?.id!);
  const { mutate: pinAccount } = usePinAccountMutation(account?.id!);
  const { mutate: unpinAccount } = useUnpinAccountMutation(account?.id!);
  const { mutate: removeFromFollowers } = useRemoveAccountFromFollowersMutation(account?.id!);
  const { mutate: updateAccountNote } = useUpdateAccountNoteMutation(account?.id!);
  const { mutate: blockDomain } = useBlockDomainMutation();
  const { mutate: unblockDomain } = useUnblockDomainMutation();
  const { openModal } = useModalsActions();
  const settings = useSettings();

  const { software } = features.version;

  const onBlock = () => {
    if (account.relationship?.blocking) {
      unblockAccount();
    } else {
      openModal('BLOCK_MUTE', { accountId: account.id, action: 'BLOCK' });
    }
  };

  const onMention = () => {
    mentionCompose(account);
  };

  const onDirect = () => {
    directCompose(account);
  };

  const onEndorseToggle = () => {
    if (account.relationship?.endorsed) {
      unpinAccount(undefined, {
        onSuccess: () => {
          toast.success(intl.formatMessage(messages.userUnendorsed, { acct: account.acct }));
        },
      });
    } else {
      pinAccount(undefined, {
        onSuccess: () => {
          toast.success(intl.formatMessage(messages.userEndorsed, { acct: account.acct }));
        },
      });
    }
  };

  const onBite = () => {
    client.accounts
      .biteAccount(account.id)
      .then(() => {
        toast.success(intl.formatMessage(messages.userBit, { acct: account.acct }));
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.userBiteFail, { acct: account.acct }));
      });
  };

  const onLoadActivities = () => {
    client.accounts
      .loadActivities(account.id)
      .then(() => {
        toast.success(messages.loadActivitiesSuccess);
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.loadActivitiesFail));
      });
  };

  const onSubscribeByEmail = () => {
    openModal('TEXT_FIELD', {
      heading: intl.formatMessage(messages.emailSubscriptionHeader, { name: account.acct }),
      message: intl.formatMessage(messages.emailSubscriptionMessage),
      placeholder: intl.formatMessage(messages.emailSubscriptionPlaceholder),
      confirm: intl.formatMessage(messages.emailSubscriptionConfirm),
      onConfirm: (value) => {
        client.accounts
          .subscribeByEmail(account.id, value)
          .then(() => {
            toast.success(messages.emailSubscriptionSuccess);
          })
          .catch((error) => {
            if (error.response?.json?.error === 'ERR_BLOCKED') {
              toast.error(messages.emailSubscriptionFailBlocked);
            } else if (error.response?.json?.error === 'ERR_INVALID') {
              toast.error(messages.emailSubscriptionFailInvalid);
            } else {
              toast.error(messages.emailSubscriptionFail);
            }
          });
      },
      singleLine: true,
    });
  };

  const onEditNote = () => {
    openModal('TEXT_FIELD', {
      heading: (
        <FormattedMessage
          id='account_note.modal.header'
          defaultMessage='Edit note for @{name}'
          values={{ name: account.acct }}
        />
      ),
      placeholder: intl.formatMessage(messages.notePlaceholder),
      confirm: <FormattedMessage id='account_note.save' defaultMessage='Save note' />,
      onConfirm: (value) => {
        updateAccountNote(value, {
          onSuccess: () => {
            toast.success(messages.noteSaved);
          },
          onError: () => {
            toast.error(messages.noteSaveFailed);
          },
        });
      },
      text: account.relationship?.note ?? '',
    });
  };

  const onEditNickname = () => {
    const currentNickname = settings.accountNicknames[account.id] ?? '';
    openModal('TEXT_FIELD', {
      heading: (
        <FormattedMessage
          id='account.nickname.modal.header'
          defaultMessage='Set nickname for @{name}'
          values={{ name: account.acct }}
        />
      ),
      placeholder: intl.formatMessage(messages.nicknamePlaceholder),
      confirm: <FormattedMessage id='account.nickname.save' defaultMessage='Save nickname' />,
      onConfirm: (value) => {
        const trimmed = value.trim();
        changeSetting(['accountNicknames', account.id], trimmed || undefined);
        toast.success(messages.nicknameSaved);
      },
      clear: <FormattedMessage id='account.nickname.clear' defaultMessage='Reset' />,
      onClear: () => {
        changeSetting(['accountNicknames', account.id], undefined);
        toast.success(messages.nicknameSaved);
      },
      text: currentNickname,
      singleLine: true,
    });
  };

  const onAddToNavigationItems = () => {
    changeSetting(['navigationItems'], [...settings.navigationItems, `account:${account.id}`]);
    toast.success(messages.addToNavigationItemsSuccess, {
      actionLinkOptions: { to: '/settings/navigation' },
      actionLabel: intl.formatMessage(messages.view),
    });
  };

  const onRemoveFromNavigationItems = () => {
    changeSetting(
      ['navigationItems'],
      settings.navigationItems.filter((item) => item !== `account:${account.id}`),
    );
    changeSetting(
      ['pinnedNavigationItems'],
      settings.pinnedNavigationItems.filter((id) => id !== `account:${account.id}`),
    );
    toast.success(messages.removeFromNavigationItemsSuccess, {
      actionLinkOptions: { to: '/settings/navigation' },
      actionLabel: intl.formatMessage(messages.view),
    });
  };

  const onAddToSidebarItems = () => {
    changeSetting(['sidebarItems'], [...settings.sidebarItems, `account:${account.id}`]);
    toast.success(messages.addToSidebarItemsSuccess, {
      actionLinkOptions: { to: '/settings/sidebar' },
      actionLabel: intl.formatMessage(messages.view),
    });
  };

  const onRemoveFromSidebarItems = () => {
    changeSetting(
      ['sidebarItems'],
      settings.sidebarItems.filter((item) => item !== `account:${account.id}`),
    );
    toast.success(messages.removeFromSidebarItemsSuccess, {
      actionLinkOptions: { to: '/settings/sidebar' },
      actionLabel: intl.formatMessage(messages.view),
    });
  };

  const onReport = () => {
    openModal('REPORT', { accountId: account.id });
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
      heading: (
        <FormattedMessage
          id='confirmations.domain_block.heading'
          defaultMessage='Block {domain}'
          values={{ domain }}
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.domain_block.message'
          defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable. You will not see content from that domain in any public timelines or your notifications.'
          values={{ domain: <strong>{domain}</strong> }}
        />
      ),
      confirm: intl.formatMessage(messages.blockDomainConfirm),
      onConfirm: () => {
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
        heading: (
          <FormattedMessage
            id='confirmations.remove_from_followers.heading'
            defaultMessage='Remove {name} from followers'
            values={{ name: <strong className='break-words'>@{account.acct}</strong> }}
          />
        ),
        message: (
          <FormattedMessage
            id='confirmations.remove_from_followers.message'
            defaultMessage='Are you sure you want to remove {name} from your followers?'
            values={{ name: <strong className='break-words'>@{account.acct}</strong> }}
          />
        ),
        confirm: intl.formatMessage(messages.removeFromFollowersConfirm),
        onConfirm: () => {
          removeFromFollowers();
        },
      });
    } else {
      removeFromFollowers();
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

  const handleCopy: React.EventHandler<React.MouseEvent> = () => {
    copy(account.url, () => toast.success(messages.copySuccess));
  };

  const makeMenu = () => {
    const menu: Menu = [];

    if (!account) {
      return [];
    }

    if (features.rssFeeds && account.local && (software !== GOTOSOCIAL || account.enable_rss)) {
      menu.push({
        text: intl.formatMessage(messages.subscribeFeed),
        icon: iconRss,
        href: software === MASTODON ? `${account.url}.rss` : `${account.url}/feed.rss`,
        target: '_blank',
      });
    }

    if (account.email_subscriptions) {
      menu.push({
        text: intl.formatMessage(messages.subscribeByEmail),
        action: onSubscribeByEmail,
        icon: iconEnvelopeSimple,
      });
    }

    if ('share' in navigator) {
      menu.push({
        text: intl.formatMessage(messages.share, { name: account.username }),
        action: handleShare,
        icon: iconExport,
      });
    }

    if (features.federating && !account.local) {
      const domain = account.fqn.split('@')[1];

      menu.push({
        text: intl.formatMessage(messages.profileExternal, { domain }),
        href: account.url,
        icon: iconArrowSquareOut,
      });
    }

    menu.push({
      text: intl.formatMessage(messages.copy),
      action: handleCopy,
      icon: iconLinkSimpleHorizontal,
    });

    if (!ownAccount) return menu;

    if (features.searchFromAccount) {
      menu.push({
        text: intl.formatMessage(
          account.id === ownAccount.id ? messages.searchSelf : messages.search,
          { name: account.username },
        ),
        to: '/search',
        search: { type: 'statuses', accountId: account.id },
        icon: iconMagnifyingGlass,
      });
    }

    if (menu.length) {
      menu.push(null);
    }

    if (account.id === ownAccount.id) {
      menu.push({
        text: intl.formatMessage(messages.editProfile),
        to: '/settings/profile',
        icon: iconUser,
      });
      menu.push({
        text: intl.formatMessage(messages.settings),
        to: '/settings',
        icon: iconSlidersHorizontal,
      });
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mutes),
        to: '/mutes',
        icon: iconSpeakerSimpleX,
      });
      menu.push({
        text: intl.formatMessage(messages.blocks),
        to: '/blocks',
        icon: iconProhibit,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: account.username }),
        action: onMention,
        icon: iconAt,
      });

      if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: account.username }),
          action: onDirect,
          icon: iconEnvelopeSimple,
        });
      }

      if (account.relationship?.following) {
        if (features.lists) {
          menu.push({
            text: intl.formatMessage(messages.addOrRemoveFromList),
            action: onAddToList,
            icon: iconListBullets,
          });
        }

        if (features.accountEndorsements) {
          menu.push({
            text: intl.formatMessage(
              account.relationship?.endorsed ? messages.unendorse : messages.endorse,
            ),
            action: onEndorseToggle,
            icon: account.relationship?.endorsed ? iconUserMinus : iconUserCheck,
          });
        }
      } else if (features.lists && features.unrestrictedLists) {
        menu.push({
          text: intl.formatMessage(messages.addOrRemoveFromList),
          action: onAddToList,
          icon: iconListBullets,
        });
      }

      if (features.bites) {
        menu.push({
          text: intl.formatMessage(messages.bite, { name: account.username }),
          action: onBite,
          icon: iconTooth,
        });
      }

      if (features.loadActivities && !account.local) {
        menu.push({
          text: intl.formatMessage(messages.loadActivities),
          action: onLoadActivities,
          icon: iconArrowsClockwise,
        });
      }

      if (account.relationship && features.notes) {
        menu.push({
          text: intl.formatMessage(messages.note, { name: account.acct }),
          action: onEditNote,
          icon: iconNotePencil,
        });
      }

      menu.push({
        text: intl.formatMessage(messages.nickname, { name: account.acct }),
        action: onEditNickname,
        icon: iconTag,
      });

      if (!settings.navigationItems.includes(`account:${account.id}`)) {
        menu.push({
          text: intl.formatMessage(messages.addToNavigationItems),
          action: onAddToNavigationItems,
          icon: iconList,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.removeFromNavigationItems),
          action: onRemoveFromNavigationItems,
          icon: iconList,
        });
      }

      if (!settings.sidebarItems.includes(`account:${account.id}`)) {
        menu.push({
          text: intl.formatMessage(messages.addToSidebarItems),
          action: onAddToSidebarItems,
          icon: iconUser,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.removeFromSidebarItems),
          action: onRemoveFromSidebarItems,
          icon: iconUser,
        });
      }

      menu.push(null);

      if (features.removeFromFollowers && account.relationship?.followed_by) {
        menu.push({
          text: intl.formatMessage(messages.removeFromFollowers),
          action: onRemoveFromFollowers,
          icon: iconUserMinus,
        });
      }

      if (account.relationship?.muting) {
        menu.push({
          text: intl.formatMessage(messages.unmute, { name: account.username }),
          action: onMute,
          icon: iconSpeakerSimpleX,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.mute, { name: account.username }),
          action: onMute,
          icon: iconSpeakerSimpleX,
        });
      }

      if (account.relationship?.blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblock, { name: account.username }),
          action: onBlock,
          icon: iconProhibit,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.block, { name: account.username }),
          action: onBlock,
          icon: iconProhibit,
        });
      }

      menu.push({
        text: intl.formatMessage(messages.report, { name: account.username }),
        action: onReport,
        icon: iconFlag,
      });
    }

    if (!account.local) {
      const domain = account.fqn.split('@')[1];

      menu.push(null);

      if (account.relationship?.domain_blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblockDomain, { domain }),
          action: () => {
            onUnblockDomain(domain);
          },
          icon: iconProhibit,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.blockDomain, { domain }),
          action: () => {
            onBlockDomain(domain);
          },
          icon: iconProhibit,
        });
      }
    }

    if (ownAccount.is_admin || ownAccount.is_moderator) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: account.username }),
        to: '/nicolium/admin/accounts/$accountId',
        params: { accountId: account.id },
        icon: iconGavel,
      });
    }

    return menu;
  };

  const menu = makeMenu();

  if (!menu.length) return null;

  return (
    <DropdownMenu items={menu} placement='bottom-end'>
      <IconButton src={iconDotsThree} theme='outlined' className='account-menu__button' />
    </DropdownMenu>
  );
};

export { AccountMenu };
