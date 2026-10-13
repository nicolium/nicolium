import { isGlassEffectAPIAvailable } from 'expo-glass-effect';

import { useSetting } from '@/stores/settings';

const useEnableLiquidGlass = () => {
  const glassEffect = isGlassEffectAPIAvailable();
  const enableLiquidGlass = useSetting('appearance.enableLiquidGlass');

  return glassEffect && enableLiquidGlass;
};

export { useEnableLiquidGlass };
