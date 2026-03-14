import { GOTOSOCIAL, MASTODON } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { initReport, ReportableEntities } from '@/actions/reports';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import IconButton from '@/components/ui/icon-button';
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
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Hide everything from {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
  hideReblogs: { id: 'account.hide_reblogs', defaultMessage: 'Hide reposts from @{name}' },
  showReblogs: { id: 'account.show_reblogs', defaultMessage: 'Show reposts from @{name}' },
  preferences: { id: 'column.preferences', defaultMessage: 'Preferences' },
  blocks: { id: 'column.blocks', defaultMessage: 'Blocks' },
  mutes: { id: 'column.mutes', defaultMessage: 'Mutes' },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: { id: 'account.unendorse', defaultMessage: "Don't feature on profile" },
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
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bit @{acct}' },
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
  note: { id: 'account_note.modal_header', defaultMessage: 'Edit note for @{name}' },
  notePlaceholder: { id: 'account_note.placeholder', defaultMessage: 'Add a note' },
  noteSaved: { id: 'account_note.success', defaultMessage: 'Note saved' },
  noteSaveFailed: { id: 'account_note.fail', defaultMessage: 'Failed to save note' },
  share: { id: 'account.share', defaultMessage: "Share @{name}'s profile" },
  subscribeFeed: { id: 'account.rss_feed', defaultMessage: 'Subscribe to RSS feed' },
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

  const { mutate: blockDomain } = useBlockDomainMutation();
  const { mutate: unblockDomain } = useUnblockDomainMutation();

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
        toast.success(intl.formatMessage(messages.loadActivitiesSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.loadActivitiesFail));
      });
  };

  const onEditNote = () => {
    openModal('TEXT_FIELD', {
      heading: (
        <FormattedMessage
          id='account_note.modal_header'
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

  const onReport = () => {
    initReport(ReportableEntities.ACCOUNT, account);
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
        text: intl.formatMessage(
          account.id === ownAccount.id ? messages.searchSelf : messages.search,
          { name: account.username },
        ),
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
        text: intl.formatMessage(messages.editProfile),
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
            text: intl.formatMessage(messages.addOrRemoveFromList),
            action: onAddToList,
            icon: require('@phosphor-icons/core/regular/list-bullets.svg'),
          });
        }

        if (features.accountEndorsements) {
          menu.push({
            text: intl.formatMessage(
              account.relationship?.endorsed ? messages.unendorse : messages.endorse,
            ),
            action: onEndorseToggle,
            icon: account.relationship?.endorsed
              ? require('@phosphor-icons/core/regular/user-minus.svg')
              : require('@phosphor-icons/core/regular/user-check.svg'),
          });
        }
      } else if (features.lists && features.unrestrictedLists) {
        menu.push({
          text: intl.formatMessage(messages.addOrRemoveFromList),
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
          action: () => {
            onUnblockDomain(domain);
          },
          icon: require('@phosphor-icons/core/regular/prohibit.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.blockDomain, { domain }),
          action: () => {
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
        to: '/nicolium/admin/accounts/$accountId',
        params: { accountId: account.id },
        icon: require('@phosphor-icons/core/regular/gavel.svg'),
      });
    }

    return menu;
  };

  const menu = makeMenu();

  if (!menu.length) return null;

  return (
    <DropdownMenu items={menu} placement='bottom-end'>
      <IconButton
        src={require('@phosphor-icons/core/regular/dots-three.svg')}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    </DropdownMenu>
  );
};

export { AccountMenu };
