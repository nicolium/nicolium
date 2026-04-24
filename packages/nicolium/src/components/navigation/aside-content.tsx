import React, { useMemo } from 'react';

import {
  AccountNotePanel,
  AnnouncementsPanel,
  BirthdayPanel,
  CryptoDonatePanel,
  GroupMediaPanel,
  InstanceModerationPanel,
  LatestAccountsPanel,
  MyGroupsPanel,
  NewEventPanel,
  NewGroupPanel,
  NotificationsPanel,
  PinnedAccountsPanel,
  ProfileFieldsPanel,
  ProfileMediaPanel,
  PromoPanel,
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useSettings } from '@/stores/settings';
import { useFederationRestrictionsDisclosed, useIsStandalone } from '@/utils/state';

import LinkFooter from './link-footer';

import type { Account, Group } from 'pl-api';

interface IAsideContent {
  layout?:
    | 'admin'
    | 'chats'
    | 'default'
    | 'empty'
    | 'events'
    | 'external-login'
    | 'group'
    | 'groups'
    | 'home'
    | 'notifications'
    | 'profile'
    | 'remote-instance'
    | 'search';
  group?: Group;
  account?: Account;
  instance?: string;
}

const AsideContent: React.FC<IAsideContent> = ({
  layout = 'default',
  group,
  account,
  instance,
}) => {
  const { sidebarItems } = useSettings();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();
  const disclosed = useFederationRestrictionsDisclosed();
  const standalone = useIsStandalone();
  const frontendConfig = useFrontendConfig();

  return useMemo(() => {
    const items: React.ReactNode[] = [];

    if (!ownAccount && (!standalone || layout !== 'external-login')) {
      items.push(<SignUpPanel key='sign-up' />);
    }

    for (const item of sidebarItems) {
      switch (item) {
        case 'context': {
          switch (layout) {
            case 'admin':
              items.push(<LatestAccountsPanel key='latest-accounts' limit={5} />);
              break;
            case 'events':
              if (ownAccount) items.push(<NewEventPanel key='new-event' />);
              break;
            case 'group':
              if (group && (group.relationship?.member ?? !group.locked))
                items.push(<GroupMediaPanel key='group-media' group={group} />);
              break;
            case 'groups':
              items.push(<NewGroupPanel key='new-group' />);
              items.push(<MyGroupsPanel key='my-groups' />);
              break;
            case 'profile':
              if (features.notes && account && account.id !== ownAccount?.id) {
                items.push(<AccountNotePanel key='account-note' account={account} />);
              }
              items.push(<ProfileMediaPanel key='profile-media' account={account} />);
              if (account && account.fields?.length) {
                items.push(<ProfileFieldsPanel key='profile-fields' account={account} />);
              }
              break;
            case 'remote-instance':
              if ((disclosed || ownAccount?.is_admin) && instance) {
                items.push(<InstanceModerationPanel key='instance-moderation' host={instance} />);
              }
              break;
            default:
              break;
          }
          break;
        }
        case 'announcements': {
          if (layout === 'home') {
            if (features.announcements) items.push(<AnnouncementsPanel key='announcements' />);
            if (features.birthdays) items.push(<BirthdayPanel key='birthday' limit={10} />);
          }
          break;
        }
        case 'recommendations': {
          switch (layout) {
            case 'profile':
              if (features.accountEndorsements && account && account.local) {
                items.push(
                  <PinnedAccountsPanel key='pinned-accounts' account={account} limit={5} />,
                );
              } else if (features.suggestions && ownAccount) {
                items.push(<WhoToFollowPanel key='who-to-follow' limit={3} />);
              }
              break;
            case 'default':
            case 'events':
            case 'external-login':
            case 'home':
            case 'search':
              if (features.trends) items.push(<TrendsPanel key='trends' limit={5} />);
              if (features.suggestions && ownAccount) {
                items.push(<WhoToFollowPanel key='who-to-follow' limit={5} />);
              }
              break;
            default:
              break;
          }
          break;
        }
        case 'promo': {
          if (
            layout === 'home' &&
            typeof frontendConfig.cryptoAddresses[0]?.ticker === 'string' &&
            frontendConfig.cryptoDonatePanel.limit > 0 &&
            ownAccount
          ) {
            items.push(
              <CryptoDonatePanel
                key='crypto-donate'
                limit={frontendConfig.cryptoDonatePanel.limit}
              />,
            );
          }
          if (layout === 'home' || layout === 'remote-instance') {
            items.push(<PromoPanel key='promo' />);
          }
          break;
        }
        case 'notifications': {
          if (layout === 'notifications') break;
          items.push(<NotificationsPanel key='notifications' />);
          break;
        }
        case 'footer': {
          items.push(<LinkFooter key='footer' />);
          break;
        }
      }
    }

    return <>{items}</>;
  }, [sidebarItems, ownAccount?.id, features, disclosed, layout, group, account, instance]);
};

export { AsideContent };
