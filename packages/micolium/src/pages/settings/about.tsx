import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, View } from 'react-native';

import Gayness from '@/assets/gayness.svg';
import Logo from '@/assets/images/icon.png';
import { List } from '@/components/ui/list';

import { EXTRA_GAYNESS_MODE } from '../login';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const AboutScreen = (_: NativeStackScreenProps<SettingsStackParams, 'about'>) => {
  return (
    <>
      <Gayness
        height={520}
        width={340}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          opacity: EXTRA_GAYNESS_MODE ? 1 : 0.4,
        }}
        aria-hidden
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 12,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image source={Logo} accessibilityLabel='Micolium' style={{ height: 80, width: 80 }} />
        </View>
        <List
          sections={[
            {
              items: [],
            },
          ]}
        />
      </ScrollView>
    </>
  );
};

export { AboutScreen };
