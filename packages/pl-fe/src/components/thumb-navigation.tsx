import { useQueryClient } from '@tanstack/react-query';
import { useMatch } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { groupComposeModal } from '@/actions/compose';
import ThumbNavigationLink from '@/components/thumb-navigation-link';
import Icon from '@/components/ui/icon';
import { useStatContext } from '@/contexts/stat-context';
import { layouts } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useModalsActions } from '@/stores/modals';
import { useIsSidebarOpen, useUiStoreActions } from '@/stores/ui';
import { isStandalone } from '@/utils/state';

import type { Group } from 'pl-api';

const messages = defineMessages({
  home: { id: 'column.home', defaultMessage: 'Home' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  chats: { id: 'column.chats', defaultMessage: 'Chats' },
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  openSidebar: { id: 'navigation.sidebar', defaultMessage: 'Open sidebar' },
  closeSidebar: { id: 'navigation.sidebar.close', defaultMessage: 'Close sidebar' },
});

const ThumbNavigation: React.FC = React.memo((): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const features = useFeatures();
  const queryClient = useQueryClient();

  const match = useMatch({ from: layouts.group.id, shouldThrow: false });

  const isSidebarOpen = useIsSidebarOpen();
  const { openSidebar, closeSidebar } = useUiStoreActions();
  const { openModal } = useModalsActions();
  const { unreadChatsCount } = useStatContext();

  const standalone = useAppSelector(isStandalone);
  const notificationCount = useAppSelector((state) => state.notifications.unread);

  const handleOpenComposeModal = () => {
    if (match?.params.groupId) {
      dispatch((_, getState) => {
        const group = queryClient.getQueryData<Group>(['groups', match.params.groupId]);
        if (group) dispatch(groupComposeModal(group));
      });
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
      <Icon src={require('@phosphor-icons/core/regular/plus-square.svg')} />
    </button>
  );

  return (
    <div className='⁂-thumb-navigation'>
      <button
        className='⁂-thumb-navigation__item'
        onClick={isSidebarOpen ? closeSidebar : openSidebar}
        title={intl.formatMessage(isSidebarOpen ? messages.closeSidebar : messages.openSidebar)}
      >
        <Icon src={require('@phosphor-icons/core/regular/list.svg')} />
      </button>

      <ThumbNavigationLink
        src={require('@phosphor-icons/core/regular/house.svg')}
        activeSrc={require('@phosphor-icons/core/fill/house-fill.svg')}
        text={intl.formatMessage(messages.home)}
        to='/'
        exact
      />

      {/* {features.groups && (
        <ThumbNavigationLink
          src={require('@phosphor-icons/core/regular/users-three.svg')}
          activeSrc={require('@phosphor-icons/core/fill/users-three-fill.svg')}
          text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
          to='/groups'
          exact
        />
      )} */}

      {account && !features.chats && composeButton}

      {(!standalone || account) && (
        <ThumbNavigationLink
          src={require('@phosphor-icons/core/regular/magnifying-glass.svg')}
          activeSrc={require('@phosphor-icons/core/fill/magnifying-glass-fill.svg')}
          text={intl.formatMessage(messages.search)}
          to='/search'
          exact
        />
      )}

      {account && (
        <ThumbNavigationLink
          src={require('@phosphor-icons/core/regular/bell-simple.svg')}
          activeSrc={require('@phosphor-icons/core/fill/bell-simple-fill.svg')}
          text={intl.formatMessage(messages.notifications)}
          to='/notifications'
          exact
          count={notificationCount}
        />
      )}

      {account && features.chats && (
        <>
          <ThumbNavigationLink
            src={require('@phosphor-icons/core/regular/chats-teardrop.svg')}
            activeSrc={require('@phosphor-icons/core/fill/chats-teardrop-fill.svg')}
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

export { ThumbNavigation as default };
