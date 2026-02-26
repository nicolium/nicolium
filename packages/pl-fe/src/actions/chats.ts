import { changeSetting } from '@/actions/settings';
import { useSettingsStore } from '@/stores/settings';

import type { AppDispatch } from '@/store';

const toggleChatPane = () => (dispatch: AppDispatch) => {
  const main = useSettingsStore.getState().settings.chats.mainWindow;
  const state = main === 'minimized' ? 'open' : 'minimized';
  dispatch(changeSetting(['chats', 'mainWindow'], state));
};

export { toggleChatPane };
