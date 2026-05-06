import iconList from '@phosphor-icons/core/regular/list.svg';
import iconPlusSquare from '@phosphor-icons/core/regular/plus-square.svg';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useMatch } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ThumbNavigationLink, {
  type IThumbNavigationLink,
} from '@/components/navigation/thumb-navigation-link';
import Icon from '@/components/ui/icon';
import { useLongPress } from '@/hooks/use-long-press';
import { useNavigationItems } from '@/hooks/use-navigation-items';
import { useOwnAccount } from '@/hooks/use-own-account';
import { queryKeys } from '@/queries/keys';
import { layouts } from '@/router';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useIsSidebarOpen, useUiStoreActions } from '@/stores/ui';

import Avatar from '../ui/avatar';

import ProfileDropdown from './profile-dropdown';

const messages = defineMessages({
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  openSidebar: { id: 'navigation.sidebar', defaultMessage: 'Open sidebar' },
  closeSidebar: { id: 'navigation.sidebar.close', defaultMessage: 'Close sidebar' },
});

const SidebarDot: React.FC = () => {
  const navigationItems = useNavigationItems(false);
  const isSidebarOpen = useIsSidebarOpen();
  const { demetricator } = useSettings();

  const [totalCount, setTotalCount] = useState(0);
  const [showDot, setShowDot] = useState(false);

  useMemo(() => {
    const newCount = navigationItems.reduce((acc, item) => {
      if (item && 'count' in item && item.count) return acc + item.count;
      return acc;
    }, 0);

    if (newCount > totalCount) setShowDot(true);
    setTotalCount(newCount);
  }, [navigationItems]);

  useEffect(() => {
    if (isSidebarOpen) setShowDot(false);
  }, [isSidebarOpen]);

  return showDot && !demetricator ? (
    <div className='⁂-thumb-navigation__sidebar-dot' aria-hidden />
  ) : null;
};

const ProfileLink: React.FC<IThumbNavigationLink> = ({
  count,
  countMax,
  icon,
  activeIcon,
  text,
  exact,
  ...props
}) => {
  const { data: account } = useOwnAccount();
  const profileLinkRef = React.useRef<HTMLAnchorElement>(null);

  const bind = useLongPress((e) => {
    if (e.type !== 'touchstart') return;

    e.preventDefault();
    e.stopPropagation();

    if ('vibrate' in navigator) navigator.vibrate(1);
    profileLinkRef.current?.querySelector('button')?.click();
  });

  if (!account) return null;

  return (
    <Link
      ref={profileLinkRef}
      {...bind}
      {...props}
      activeOptions={{ exact }}
      className='⁂-thumb-navigation__item'
      activeProps={{ className: '⁂-thumb-navigation__item--active' }}
      title={text}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();

        profileLinkRef.current?.querySelector('button')?.click();
      }}
    >
      <ProfileDropdown account={account} />
      <Avatar
        src={account.avatar}
        alt={account.avatar_description}
        isCat={account.is_cat}
        size={32}
        username={account.username}
      />
    </Link>
  );
};

const ThumbNavigation: React.FC = React.memo((): React.JSX.Element => {
  const intl = useIntl();
  const queryClient = useQueryClient();

  const match = useMatch({ from: layouts.group.id, shouldThrow: false });

  const isSidebarOpen = useIsSidebarOpen();
  const { openSidebar, closeSidebar } = useUiStoreActions();
  const { openModal } = useModalsActions();
  const { groupComposeModal } = useComposeActions();

  const navigationItems = useNavigationItems(true);

  const orderedNavigationItems = useMemo(() => {
    const composeButtonIndex = navigationItems.findIndex((item) => item?.type === 'compose');

    if (composeButtonIndex === -1) {
      return navigationItems;
    }

    const newNavigationItems = [...navigationItems];
    const [composeButton] = newNavigationItems.splice(composeButtonIndex, 1);
    const newIndex =
      navigationItems.length % 2 === 0 ? navigationItems.length / 2 - 1 : newNavigationItems.length;
    newNavigationItems.splice(newIndex, 0, composeButton);

    return newNavigationItems;
  }, [navigationItems]);

  const handleOpenComposeModal = () => {
    if (match?.params.groupId) {
      const group = queryClient.getQueryData(queryKeys.groups.show(match.params.groupId));
      if (group) groupComposeModal(group);
    } else {
      openModal('COMPOSE');
    }
  };

  return (
    <div
      className={clsx(
        '⁂-thumb-navigation',
        orderedNavigationItems.length === 0 && '⁂-thumb-navigation--no-items',
      )}
    >
      <button
        className='⁂-thumb-navigation__item'
        onClick={isSidebarOpen ? closeSidebar : openSidebar}
        title={intl.formatMessage(isSidebarOpen ? messages.closeSidebar : messages.openSidebar)}
        aria-label={intl.formatMessage(
          isSidebarOpen ? messages.closeSidebar : messages.openSidebar,
        )}
        aria-controls='dropdown-navigation'
        aria-expanded={isSidebarOpen}
      >
        <Icon src={iconList} />
        {orderedNavigationItems.length === 0 && <SidebarDot />}
      </button>

      {orderedNavigationItems.map((item) => {
        if (item === null) return null;

        switch (item.type) {
          case 'compose':
            return (
              <button
                key='compose'
                className='⁂-thumb-navigation__item ⁂-thumb-navigation__item--compose'
                onClick={handleOpenComposeModal}
                title={intl.formatMessage(messages.compose)}
              >
                <Icon src={iconPlusSquare} />
              </button>
            );
          case 'profile-link':
            return <ProfileLink key='profile-link' exact {...item} />;
          case 'link':
            return <ThumbNavigationLink key={item.to} exact {...item} />;
          default:
            return null;
        }
      })}
    </div>
  );
});

ThumbNavigation.displayName = 'ThumbNavigation';

export { ThumbNavigation as default };
