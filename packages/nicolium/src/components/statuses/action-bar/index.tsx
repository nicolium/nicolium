import React, { useCallback, useMemo } from 'react';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import { MenuButton } from './menu-button';
import { useItems } from './use-items';

import type { IStatusActionBar } from './types';
import type { UnauthorizedModalAction } from '@/modals/unauthorized-modal';

const StatusActionBar: React.FC<IStatusActionBar> = ({
  status,
  withLabels = false,
  expandable,
  space = 'sm',
  fromBookmarks = false,
  rebloggedBy,
  withCounters = true,
  withMenu = true,
  actionItems,
}) => {
  const { openModal } = useModalsActions();
  const { statusActionBarItems } = useSettings();

  const me = useCurrentAccount();

  const publicStatus = useMemo(
    () => (status ? ['public', 'unlisted', 'group'].includes(status.visibility) : false),
    [status.visibility],
  );

  const onContainerClick: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const onOpenUnauthorizedModal = useCallback((action?: UnauthorizedModalAction) => {
    openModal('UNAUTHORIZED', {
      action,
      ap_id: status.url,
    });
  }, []);

  const items = useItems(
    actionItems || statusActionBarItems,
    status,
    withLabels,
    rebloggedBy,
    withCounters,
  );

  if (!status || !status.account) {
    return null;
  }

  return (
    <div className={`status-action-bar status-action-bar--${space}`} onClick={onContainerClick}>
      {items}

      {withMenu && (
        <MenuButton
          status={status}
          withLabels={withLabels}
          me={me}
          onOpenUnauthorizedModal={onOpenUnauthorizedModal}
          expandable={expandable}
          fromBookmarks={fromBookmarks}
          publicStatus={publicStatus}
          rebloggedBy={rebloggedBy}
        />
      )}
    </div>
  );
};

export { StatusActionBar as default };
