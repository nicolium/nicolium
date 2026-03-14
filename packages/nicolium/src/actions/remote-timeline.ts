import { changeSetting } from '@/actions/settings';
import { useSettingsStore } from '@/stores/settings';

const getPinnedHosts = () => {
  const { settings } = useSettingsStore.getState();
  return settings.remote_timeline.pinnedHosts;
};

const pinHost = (host: string) => {
  const pinnedHosts = getPinnedHosts();
  changeSetting(['remote_timeline', 'pinnedHosts'], [...pinnedHosts, host]);
};

const unpinHost = (host: string) => {
  const pinnedHosts = getPinnedHosts();
  changeSetting(
    ['remote_timeline', 'pinnedHosts'],
    pinnedHosts.filter((value) => value !== host),
  );
};

export { pinHost, unpinHost };
