import { settingsSchema } from '@/schemas/frontend-settings';

import type { UnauthorizedModalAction } from '@/modals/unauthorized-modal';
import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { Me } from '@/stores/auth';
import type { Account } from 'pl-api';

const STATUS_ACTIONS = settingsSchema.entries.statusActionBarItems.item.options;

type StatusAction = (typeof STATUS_ACTIONS)[number];

interface IStatusActionBar {
  status: SelectedStatus;
  rebloggedBy?: Account;
  withLabels?: boolean;
  expandable?: boolean;
  space?: 'sm' | 'md' | 'lg';
  fromBookmarks?: boolean;
  withCounters?: boolean;
  withMenu?: boolean;
  actionItems?: Readonly<Array<StatusAction>>;
}

interface IActionButton extends Pick<IStatusActionBar, 'status' | 'withLabels'> {
  me: Me;
  onOpenUnauthorizedModal: (action?: UnauthorizedModalAction) => void;
  withCounters?: boolean;
}

export { STATUS_ACTIONS, type StatusAction, type IStatusActionBar, type IActionButton };
