import { ChatCenteredSlashIcon } from 'phosphor-react-native';
import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { iconHelper } from '@/components/ui/icon';

interface IEmptyMessage {
  emptyMessageHeading?: React.JSX.Element;
  emptyMessageText?: React.JSX.Element;
  emptyMessageIcon?: ReturnType<typeof iconHelper> | false;
}

const EmptyMessage: React.FC<IEmptyMessage> = ({
  emptyMessageHeading,
  emptyMessageText,
  emptyMessageIcon: Icon = iconHelper(ChatCenteredSlashIcon),
}) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
      }}
    >
      {Icon && (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            backgroundColor: theme.colors.surfaceContainerHighest,
          }}
        >
          <Icon size={32} color={theme.colors.onSurfaceVariant} />
        </View>
      )}
      {emptyMessageHeading && (
        <Text variant='titleLarge' style={{ textAlign: 'center' }}>
          {emptyMessageHeading}
        </Text>
      )}
      {emptyMessageText && (
        <Text
          variant='bodyMedium'
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
        >
          {emptyMessageText}
        </Text>
      )}
    </View>
  );
};

export { EmptyMessage, type IEmptyMessage };
