import { changeSetting } from '@/actions/settings';
import { useSettingsStore } from '@/stores/settings';

const toggleChatPane = () => {
  const main = useSettingsStore.getState().settings.chats.mainWindow;
  const state = main === 'minimized' ? 'open' : 'minimized';
  changeSetting(['chats', 'mainWindow'], state);
};

export { toggleChatPane };
