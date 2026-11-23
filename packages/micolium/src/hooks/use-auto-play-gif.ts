import { useReducedMotion } from 'react-native-reanimated';

import { useSetting } from '@/stores/settings';

const useAutoPlayGif = () => {
  const autoPlayGif = useSetting('appearance.autoPlayGif');
  const reducedMotion = useReducedMotion();

  return autoPlayGif && !reducedMotion;
};

export { useAutoPlayGif };
