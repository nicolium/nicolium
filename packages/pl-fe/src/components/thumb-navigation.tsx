import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { groupComposeModal } from 'pl-fe/actions/compose';
import ThumbNavigationLink from 'pl-fe/components/thumb-navigation-link';
import Icon from 'pl-fe/components/ui/icon';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useNavigationItems } from 'pl-fe/hooks/use-navigation-items';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { useUiStore } from 'pl-fe/stores/ui';
import { NAVIGATION_ICONS, navigationMessages, getPinnedNavigationItems, type NavigationItemId } from 'pl-fe/utils/navigation';
import { isStandalone } from 'pl-fe/utils/state';

const ThumbNavigation: React.FC = React.memo((): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const { settings } = useSettingsStore();

  const match = useRouteMatch<{ groupId: string }>('/groups/:groupId');

  const { openSidebar, closeSidebar, isSidebarOpen } = useUiStore();
  const { openModal } = useModalsStore();

  const standalone = useAppSelector(isStandalone);

  // Use the navigation items hook
  const { items: allNavigationItems } = useNavigationItems();

  // Get pinned navigation items from settings
  const pinnedItems = useMemo(
    () => getPinnedNavigationItems(settings.navigation.items),
    [settings.navigation.items],
  );

  // Get first 4 pinned items that are available
  const visibleItems = useMemo(() => {
    return pinnedItems
      .map(({ id }) => allNavigationItems.find(item => item.id === id))
      .filter((item): item is typeof allNavigationItems[number] => {
        return item !== undefined && item.show && (!standalone || item.id !== 'search' || !!account);
      })
      .slice(0, 4);
  }, [pinnedItems, allNavigationItems, standalone, account]);

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
      title={intl.formatMessage(navigationMessages.compose)}
    >
      <Icon src={require('@phosphor-icons/core/regular/plus-square.svg')} />
    </button>
  );

  return (
    <div className='⁂-thumb-navigation'>
      <button
        className='⁂-thumb-navigation__item'
        onClick={isSidebarOpen ? closeSidebar : openSidebar}
        title={intl.formatMessage(isSidebarOpen ? navigationMessages.closeSidebar : navigationMessages.openSidebar)}
      >
        <Icon src={require('@phosphor-icons/core/regular/list.svg')} />
      </button>

      {visibleItems.map(item => {
        const navItem = NAVIGATION_ICONS[item.id as NavigationItemId];

        if (!navItem) return null;

        return (
          <ThumbNavigationLink
            key={item.id}
            src={navItem.src}
            activeSrc={navItem.activeSrc}
            text={item.text}
            to={item.to}
            exact
            count={item.count}
            countMax={item.id === 'chats' ? 9 : undefined}
          />
        );
      })}

      {account && composeButton}
    </div>
  );
});

export { ThumbNavigation as default };
