import { changeSetting } from '@/actions/settings';
import { useSettingsStore } from '@/stores/settings';

import type { AppDispatch, RootState } from '@/store';

const toggleChatPane = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const main = useSettingsStore.getState().settings.chats.mainWindow;
  const state = main === 'minimized' ? 'open' : 'minimized';
  dispatch(changeSetting(['chats', 'mainWindow'], state));
};

export { toggleChatPane };
