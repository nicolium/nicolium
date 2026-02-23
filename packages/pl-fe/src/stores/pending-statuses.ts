import { CreateStatusParams } from 'pl-api';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import type { StatusVisibility } from '@/normalizers/status';

interface PendingStatus {
  content_type: string;
  in_reply_to_id: string | null;
  media_ids: Array<string> | null;
  quote_id: string | null;
  poll: Exclude<CreateStatusParams['poll'], undefined> | null;
  sensitive: boolean;
  spoiler_text: string;
  status: string;
  to: Array<string> | null;
  visibility: StatusVisibility;
}

type State = {
  statuses: Record<string, PendingStatus>;
  actions: {
    importStatus: (params: Partial<CreateStatusParams>, idempotencyKey: string) => void;
    deleteStatus: (idempotencyKey: string) => void;
  };
};

const usePendingStatusesStore = create<State>()(
  mutative((set) => ({
    statuses: {},
    actions: {
      importStatus: (params, idempotencyKey) => {
        set((state: State) => {
          state.statuses[idempotencyKey] = {
            content_type: '',
            in_reply_to_id: null,
            media_ids: null,
            quote_id: null,
            poll: null,
            sensitive: false,
            spoiler_text: '',
            status: '',
            to: null,
            visibility: 'public',
            ...params,
          };
        });
      },
      deleteStatus: (idempotencyKey) => {
        set((state: State) => {
          delete state.statuses[idempotencyKey];
        });
      },
    },
  })),
);

const usePendingStatus = (id: string) => usePendingStatusesStore((state) => state.statuses[id]);
const usePendingStatusesActions = () => usePendingStatusesStore((state) => state.actions);

export { usePendingStatusesStore, usePendingStatus, usePendingStatusesActions };
