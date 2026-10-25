import { ActivityIndicator } from '@mkljczk/react-native-paper';
import React from 'react';
import { View } from 'react-native';

const LoadingIndicator = () => (
  <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
    <ActivityIndicator size='large' />
  </View>
);

export { LoadingIndicator };
