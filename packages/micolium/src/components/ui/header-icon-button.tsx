import { Appbar, Badge, Icon } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import { ArrowLeftIcon, CaretLeftIcon, type Icon as PhosphorIcon } from 'phosphor-react-native';
import React from 'react';
import { Platform, Pressable, View, type PressableProps } from 'react-native';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

import { iconHelper } from './icon';

interface IHeaderIconButton extends PressableProps {
  icon: PhosphorIcon;
  badge?: number;
}

const HeaderIconButton: React.FC<IHeaderIconButton> = ({ icon, badge, ...props }) => {
  const glassEffect = useEnableLiquidGlass();

  if (glassEffect) {
    return (
      <Pressable {...props} style={{ marginHorizontal: 8 }}>
        <GlassView
          style={{
            position: 'relative',
            borderRadius: 20,
            padding: 8,
            opacity: props.disabled ? 0.5 : 1,
          }}
          isInteractive={!props.disabled}
        >
          <Icon size={24} source={iconHelper(icon)} />
          <Badge
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: badge && badge > 100 ? 32 : undefined,
            }}
            visible={!!badge}
          >
            {badge}
          </Badge>
        </GlassView>
      </Pressable>
    );
  }

  return (
    <View style={{ position: 'relative' }}>
      <Appbar.Action icon={iconHelper(icon)} size={32} {...props} />
      <Badge style={{ position: 'absolute', top: 4, right: 4 }} visible={!!badge}>
        {badge}
      </Badge>
    </View>
  );
};

const HeaderBackButton: React.FC<PressableProps> = (props) => (
  <HeaderIconButton icon={Platform.OS === 'ios' ? CaretLeftIcon : ArrowLeftIcon} {...props} />
);

export { HeaderIconButton, HeaderBackButton };
