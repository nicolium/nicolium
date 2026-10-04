import {
  Appbar,
  Button,
  Divider,
  Text,
  TextInput,
  type TextInputHandles,
  useTheme,
} from '@mkljczk/react-native-paper';
import { GlobeIcon } from 'phosphor-react-native';
import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Gayness from '@/assets/gayness.svg';
import Logo from '@/assets/logo.svg';
import { UIAccount } from '@/components/ui/account';
import { useAuthStoreActions } from '@/stores/auth';

const EXTRA_GAYNESS_MODE = new Date().getMonth() === 5;

const messages = defineMessages({
  instanceDomain: { id: 'landing_mobile.instance_domain.label', defaultMessage: 'Instance domain' },
  accessToken: { id: 'landing_mobile.access_token.label', defaultMessage: 'Access token' },
  instanceFetchError: {
    id: 'landing_mobile.instance_domain.error',
    defaultMessage: 'Failed to fetch instance information.',
  },
});

const LoginScreen = () => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const intl = useIntl();

  const { signIn } = useAuthStoreActions();
  const accessTokenNode = React.useRef<TextInputHandles>(null);
  const [instance, setInstance] = React.useState('');
  const [token, setToken] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const canSubmit = instance.trim().length > 0 && token.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await signIn(`https://${instance.trim()}`, token.trim());
    } catch (e) {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) setError(false);
  }, [instance]);

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
            <Text variant='headlineSmall'>
              <FormattedMessage id='landing_mobile.headline' defaultMessage='Welcome!' />
            </Text>
            <Text variant='bodyLarge'>
              <FormattedMessage
                id='landing_mobile.body'
                defaultMessage='To get started, please enter your home instance’s domain name below.'
              />
            </Text>
          </View>

          <Divider style={{ marginHorizontal: -16 }} />

          <TextInput
            label={intl.formatMessage(messages.instanceDomain)}
            style={{ borderRadius: 24 }}
            startAccessory={(props) => <GlobeIcon color={colors.onPrimaryContainer} {...props} />}
            value={instance}
            onChangeText={setInstance}
            error={error}
            supportingText={error ? intl.formatMessage(messages.instanceFetchError) : undefined}
            enterKeyHint='next'
            onSubmitEditing={() => accessTokenNode.current?.focus()}
          />
          <TextInput
            ref={accessTokenNode}
            label={intl.formatMessage(messages.accessToken)}
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
          <FormattedMessage id='landing_mobile.next' defaultMessage='Next' />
        </Button>
      </Appbar>
    </>
  );
};

export { LoginScreen };
