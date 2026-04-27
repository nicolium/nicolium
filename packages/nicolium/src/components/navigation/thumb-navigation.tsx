import iconList from '@phosphor-icons/core/regular/list.svg';
import iconPlusSquare from '@phosphor-icons/core/regular/plus-square.svg';
import { useQueryClient } from '@tanstack/react-query';
import { useMatch } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ThumbNavigationLink from '@/components/navigation/thumb-navigation-link';
import Icon from '@/components/ui/icon';
import { useNavigationItems } from '@/hooks/use-navigation-items';
import { queryKeys } from '@/queries/keys';
import { layouts } from '@/router';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useIsSidebarOpen, useUiStoreActions } from '@/stores/ui';

const messages = defineMessages({
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  openSidebar: { id: 'navigation.sidebar', defaultMessage: 'Open sidebar' },
  closeSidebar: { id: 'navigation.sidebar.close', defaultMessage: 'Close sidebar' },
});

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
    const newIndex = composeButtonIndex % 2 === 0 ? composeButtonIndex + 1 : composeButtonIndex - 1;
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
