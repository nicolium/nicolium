import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useLoggedInAccountUrls } from '@/queries/accounts/use-logged-in-accounts';
import { useAuthActions, useAuthStore } from '@/stores/auth';
import { useModalsActions } from '@/stores/modals';

const moveItem = (items: string[], accountUrl: string, targetIndex: number) => {
  const index = items.indexOf(accountUrl);
  if (index === -1 || targetIndex < 0 || targetIndex >= items.length || index === targetIndex) {
    return items;
  }

  const next = [...items];
  next.splice(targetIndex, 0, ...next.splice(index, 1));
  return next;
};

const useAccountSwitcher = () => {
  const { openModal } = useModalsActions();
  const storedAccountUrls = useLoggedInAccountUrls();
  const { logOutAccount, switchAccount, reorderAccounts } = useAuthActions();

  const [order, setOrder] = useState<string[] | null>(null);
  const [draggedUrl, setDraggedUrl] = useState<string | null>(null);

  const accountUrls = order ?? storedAccountUrls;

  const handleOrder = () => {
    if (order) reorderAccounts(order);
    setOrder(null);
    setDraggedUrl(null);
  };

  const handleSwitch = (accountUrl: string) => {
    const id = useAuthStore.getState().users[accountUrl]?.id;
    if (!id) return;
    switchAccount({ id, url: accountUrl });
  };

  const getDragProps = (accountUrl: string) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', accountUrl);
      setDraggedUrl(accountUrl);
      setOrder(storedAccountUrls);
    },
    onDragOver: (event: React.DragEvent) => {
      if (!draggedUrl) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      if (draggedUrl !== accountUrl) {
        setOrder((current) =>
          moveItem(current ?? storedAccountUrls, draggedUrl, accountUrls.indexOf(accountUrl)),
        );
      }
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      handleOrder();
    },
    onDragEnd: handleOrder,
  });

  const handleLogOut = (accountUrl: string) => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='profile_dropdown.log_out.heading'
          defaultMessage='Remove {account} from logged in accounts?'
          values={{ account: accountUrl }}
        />
      ),
      message: (
        <FormattedMessage
          id='profile_dropdown.log_out.description'
          defaultMessage='Because the account is not currently available, this action will not invalidate the session.'
        />
      ),
      confirm: <FormattedMessage id='profile_dropdown.log_out.confirm' defaultMessage='Remove' />,
      onConfirm: () => {
        logOutAccount(accountUrl);
      },
    });
  };

  return {
    accountUrls,
    draggedUrl,
    handleSwitch,
    getDragProps,
    handleLogOut,
  };
};

export { useAccountSwitcher };
