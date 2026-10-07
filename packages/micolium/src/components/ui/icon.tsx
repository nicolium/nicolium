import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { ColorValue } from 'react-native';

const iconHelper = (
  phosphorIcon: PhosphorIcon,
): ((props: { size: number; allowFontScaling?: boolean; color: ColorValue }) => React.ReactNode) =>
  phosphorIcon as any;

export { iconHelper };
