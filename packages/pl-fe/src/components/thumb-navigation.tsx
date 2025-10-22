import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { groupComposeModal } from 'pl-fe/actions/compose';
import ThumbNavigationLink from 'pl-fe/components/thumb-navigation-link';
import Icon from 'pl-fe/components/ui/icon';
import { useStatContext } from 'pl-fe/contexts/stat-context';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useModalsActions } from 'pl-fe/stores/modals';
import { useIsSidebarOpen, useUiStoreActions } from 'pl-fe/stores/ui';
import { isStandalone } from 'pl-fe/utils/state';

const messages = defineMessages({
  home: { id: 'navigation.home', defaultMessage: 'Home' },
  search: { id: 'navigation.search', defaultMessage: 'Search' },
  notifications: { id: 'navigation.notifications', defaultMessage: 'Notifications' },
  chats: { id: 'navigation.chats', defaultMessage: 'Chats' },
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  openSidebar: { id: 'navigation.sidebar', defaultMessage: 'Open sidebar' },
  closeSidebar: { id: 'navigation.sidebar.close', defaultMessage: 'Close sidebar' },
});

const ThumbNavigation: React.FC = React.memo((): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const features = useFeatures();

  const match = useRouteMatch<{ groupId: string }>('/groups/:groupId');

  const isSidebarOpen = useIsSidebarOpen();
  const { openSidebar, closeSidebar } = useUiStoreActions();
  const { openModal } = useModalsActions();
  const { unreadChatsCount } = useStatContext();

  const standalone = useAppSelector(isStandalone);
  const notificationCount = useAppSelector((state) => state.notifications.unread);

  const handleOpenComposeModal = () => {
    if (match?.params.groupId) {
      dispatch((_, getState) => {
        const group = getState().entities[Entities.GROUPS]?.store[match.params.groupId];
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
