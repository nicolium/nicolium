import { changeSetting } from '@/actions/settings';
import { useSettingsStore } from '@/stores/settings';

import type { AppDispatch } from '@/store';

const getPinnedHosts = () => {
  const { settings } = useSettingsStore.getState();
  return settings.remote_timeline.pinnedHosts;
};

const pinHost = (host: string) => (dispatch: AppDispatch) => {
  const pinnedHosts = getPinnedHosts();

  dispatch(changeSetting(['remote_timeline', 'pinnedHosts'], [...pinnedHosts, host]));
};

const unpinHost = (host: string) => (dispatch: AppDispatch) => {
  const pinnedHosts = getPinnedHosts();

  dispatch(
    changeSetting(
      ['remote_timeline', 'pinnedHosts'],
      pinnedHosts.filter((value) => value !== host),
    ),
  );
};

export { pinHost, unpinHost };
