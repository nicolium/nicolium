import { Appbar, Button, Divider, Text, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { GlobeIcon } from 'phosphor-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Gayness from '@/assets/gayness.svg';
import Logo from '@/assets/logo.svg';
import { UIAccount } from '@/components/ui/account';
import { useAuthStoreActions } from '@/stores/auth';

const EXTRA_GAYNESS_MODE = new Date().getMonth() === 5;

const LoginScreen = () => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();

  const { signIn } = useAuthStoreActions();
  const [instance, setInstance] = React.useState('');
  const [token, setToken] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const canSubmit = instance.trim().length > 0 && token.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await signIn(`https://${instance.trim()}`, token.trim());
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <>
      <Gayness
        height={520}
        width={340}
        style={{
          position: 'absolute',
          right: 0,
          bottom: bottomInset + 64,
          opacity: EXTRA_GAYNESS_MODE ? 1 : 0.4,
        }}
        aria-hidden
      />
      <ScrollView style={{ padding: 16, marginTop: topInset, flex: 1 }}>
        <View style={{ gap: 12, flex: 1 }}>
          <View style={{ alignItems: 'center' }}>
            <Logo width={78} height={78} accessibilityLabel='Nicolium' />
          </View>

          <UIAccount displayName='Nicolium' acct='nicolium' />

          <View style={{ gap: 12 }}>
            <Text variant='headlineSmall'>Welcome!</Text>
            <Text variant='bodyLarge'>
              To get started, please enter your home instance’s domain name below.
            </Text>
          </View>

          <Divider style={{ marginHorizontal: -16 }} />

          <TextInput
            label='Instance domain'
            style={{ borderRadius: 24 }}
            startAccessory={(props) => <GlobeIcon color={colors.onPrimaryContainer} {...props} />}
            value={instance}
            onChangeText={setInstance}
            returnKeyType='done'
            onSubmitEditing={submit}
          />
          <TextInput
            label='Access token'
            value={token}
            onChangeText={setToken}
            textContentType='password'
            secureTextEntry
            returnKeyType='done'
            onSubmitEditing={submit}
          />
        </View>
      </ScrollView>
      <Appbar
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          height: 64 + bottomInset,
          backgroundColor: colors.surfaceContainer,
        }}
        safeAreaInsets={{ bottom: bottomInset }}
      >
        <Button
          mode='contained'
          onPress={submit}
          loading={loading}
          style={{ width: '100%', marginVertical: 8 }}
          disabled={!canSubmit}
        >
          Next
        </Button>
      </Appbar>
    </>
  );
};

export { LoginScreen };
