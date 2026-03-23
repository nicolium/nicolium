import iconBellSimpleFill from '@phosphor-icons/core/fill/bell-simple-fill.svg';
import iconChatsTeardropFill from '@phosphor-icons/core/fill/chats-teardrop-fill.svg';
import iconHouseFill from '@phosphor-icons/core/fill/house-fill.svg';
import iconMagnifyingGlassFill from '@phosphor-icons/core/fill/magnifying-glass-fill.svg';
import iconBellSimple from '@phosphor-icons/core/regular/bell-simple.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconList from '@phosphor-icons/core/regular/list.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconPlusSquare from '@phosphor-icons/core/regular/plus-square.svg';
import { useQueryClient } from '@tanstack/react-query';
import { useMatch } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ThumbNavigationLink from '@/components/navigation/thumb-navigation-link';
import Icon from '@/components/ui/icon';
import { useStatContext } from '@/contexts/stat-context';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { queryKeys } from '@/queries/keys';
import { useNotificationsUnreadCount } from '@/queries/notifications/use-notifications';
import { layouts } from '@/router';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useIsSidebarOpen, useUiStoreActions } from '@/stores/ui';
import { useIsStandalone } from '@/utils/state';

const messages = defineMessages({
  home: { id: 'column.home', defaultMessage: 'Home' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  chats: { id: 'column.chats', defaultMessage: 'Chats' },
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  openSidebar: { id: 'navigation.sidebar', defaultMessage: 'Open sidebar' },
  closeSidebar: { id: 'navigation.sidebar.close', defaultMessage: 'Close sidebar' },
});

const ThumbNavigation: React.FC = React.memo((): React.JSX.Element => {
  const intl = useIntl();
  const { data: account } = useOwnAccount();
  const features = useFeatures();
  const queryClient = useQueryClient();

  const match = useMatch({ from: layouts.group.id, shouldThrow: false });

  const isSidebarOpen = useIsSidebarOpen();
  const { openSidebar, closeSidebar } = useUiStoreActions();
  const { openModal } = useModalsActions();
  const { groupComposeModal } = useComposeActions();
  const { unreadChatsCount } = useStatContext();

  const standalone = useIsStandalone();
  const notificationCount = useNotificationsUnreadCount();

  const handleOpenComposeModal = () => {
    if (match?.params.groupId) {
      const group = queryClient.getQueryData(queryKeys.groups.show(match.params.groupId));
      if (group) groupComposeModal(group);
    } else {
      openModal('COMPOSE');
    }
  };

  const composeButton = (
    <button
      className='⁂-thumb-navigation__item ⁂-thumb-navigation__item--compose'
      onClick={handleOpenComposeModal}
      title={intl.formatMessage(messages.compose)}
    >
      <Icon src={iconPlusSquare} />
    </button>
  );

  return (
    <div className='⁂-thumb-navigation'>
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
      </button>

      <ThumbNavigationLink
        src={iconHouse}
        activeSrc={iconHouseFill}
        text={intl.formatMessage(messages.home)}
        to='/'
        exact
      />

      {/* {features.groups && (
        <ThumbNavigationLink
          src={iconUsersThree}
          activeSrc={iconUsersThreeFill}
          text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
          to='/groups'
          exact
        />
      )} */}

      {account && !features.chats && composeButton}

      {(!standalone || account) && (
        <ThumbNavigationLink
          src={iconMagnifyingGlass}
          activeSrc={iconMagnifyingGlassFill}
          text={intl.formatMessage(messages.search)}
          to='/search'
          exact
        />
      )}

      {account && (
        <ThumbNavigationLink
          src={iconBellSimple}
          activeSrc={iconBellSimpleFill}
          text={intl.formatMessage(messages.notifications)}
          to='/notifications'
          exact
          count={notificationCount}
        />
      )}

      {account && features.chats && (
        <>
          <ThumbNavigationLink
            src={iconChatsTeardrop}
            activeSrc={iconChatsTeardropFill}
            text={intl.formatMessage(messages.chats)}
            to='/chats'
            exact
            count={unreadChatsCount}
            countMax={9}
          />

          {composeButton}
        </>
      )}
    </div>
  );
});

ThumbNavigation.displayName = 'ThumbNavigation';

export { ThumbNavigation as default };
