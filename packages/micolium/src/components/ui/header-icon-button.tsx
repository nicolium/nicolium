import { Appbar, Icon } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import { ArrowLeftIcon, CaretLeftIcon, type Icon as PhosphorIcon } from 'phosphor-react-native';
import React from 'react';
import { Platform, Pressable, type PressableProps } from 'react-native';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

import { iconHelper } from './icon';

interface IHeaderIconButton extends PressableProps {
  icon: PhosphorIcon;
}

const HeaderIconButton: React.FC<IHeaderIconButton> = ({ icon, ...props }) => {
  const glassEffect = useEnableLiquidGlass();

  if (glassEffect) {
    return (
      <Pressable {...props} style={{ marginHorizontal: 8 }}>
        <GlassView
          style={{ borderRadius: 20, padding: 8, opacity: props.disabled ? 0.5 : 1 }}
          isInteractive={!props.disabled}
        >
          <Icon size={24} source={iconHelper(icon)} />
        </GlassView>
      </Pressable>
    );
  }

  return <Appbar.Action icon={iconHelper(icon)} size={32} {...props} />;
};

const HeaderBackButton: React.FC<PressableProps> = (props) => (
  <HeaderIconButton icon={Platform.OS === 'ios' ? CaretLeftIcon : ArrowLeftIcon} {...props} />
);

export { HeaderIconButton, HeaderBackButton };
