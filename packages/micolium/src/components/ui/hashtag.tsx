import { Text, TouchableRipple, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

interface IUIHashtag {
  tag: string;
  accounts?: number;
}

const UIHashtag: React.FC<IUIHashtag> = ({ tag, accounts = 0 }) => {
  const { colors } = useTheme();
  const { navigate } = useNavigation();

  return (
    <TouchableRipple
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        gap: 4,
      }}
      onPress={() => navigate('hashtags', { tag })}
    >
      <View>
        <Text variant='bodyLarge' numberOfLines={1}>
          #{tag}
        </Text>
        {accounts > 0 && (
          <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
            <FormattedMessage
              id='trends.count_by_accounts'
              defaultMessage='{count} {rawCount, plural, one {person} other {people}} are talking'
              values={{ count: accounts || 0, rawCount: accounts || 0 }}
            />
          </Text>
        )}
      </View>
    </TouchableRipple>
  );
};

export { UIHashtag };
