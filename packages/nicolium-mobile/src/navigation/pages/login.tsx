import {
  Appbar,
  Button,
  Divider,
  Text,
  TextInput,
  type TextInputHandles,
  useTheme,
} from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { AtIcon, GlobeIcon, LockIcon } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Gayness from '@/assets/gayness.svg';
import Logo from '@/assets/logo.svg';
import { UIAccount } from '@/components/ui/account';
import { useAuthStore, useAuthStoreActions, useFeatures } from '@/stores/auth';
import { getInstanceScopes } from '@/utils/scopes';

import type { LoginStackParams, RootStackParams } from '../router';

const EXTRA_GAYNESS_MODE = new Date().getMonth() === 5;

const messages = defineMessages({
  instanceDomain: { id: 'landing_mobile.instance_domain.label', defaultMessage: 'Instance domain' },
  accessToken: { id: 'landing_mobile.access_token.label', defaultMessage: 'Access token' },
  instanceFetchError: {
    id: 'landing_mobile.instance_domain.error',
    defaultMessage: 'Failed to fetch instance information.',
  },
  username: {
    id: 'login.fields.username.label',
    defaultMessage: 'E-mail or username',
  },
  email: {
    id: 'login.fields.email.label',
    defaultMessage: 'E-mail address',
  },
  password: {
    id: 'login.fields.password.placeholder',
    defaultMessage: 'Password',
  },
  invalidCredentials: {
    id: 'auth.invalid_credentials',
    defaultMessage: 'Wrong username or password',
  },
  invalidAccessToken: {
    id: 'auth.invalid_access_token',
    defaultMessage: 'Wrong access token.',
  },
  credentialsHeadline: {
    id: 'landing_mobile.credentials.headline',
    defaultMessage: 'Sign in to {instance}',
  },
});

const LoginScreen = ({ navigation }: NativeStackScreenProps<LoginStackParams, 'instance'>) => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const intl = useIntl();

  const { fetchInstance, createApp } = useAuthStoreActions();
  const [instance, setInstance] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const canSubmit = instance.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await fetchInstance(`https://${instance.trim()}`);
      setLoading(false);
      if (!useAuthStore.getState().client.features.grantTypePassword) await createApp('authorization_code');
      navigation.navigate('credentials');
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
            startAccessory={(props) => <GlobeIcon color={colors.onPrimaryContainer} {...props} />}
            value={instance}
            onChangeText={setInstance}
            error={error}
            supportingText={error ? intl.formatMessage(messages.instanceFetchError) : undefined}
            returnKeyType='done'
            onSubmitEditing={submit}
          />
        </View>
      </ScrollView>
      <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={-bottomInset}>
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
      </KeyboardAvoidingView>
    </>
  );
};

const CredentialsScreen = () => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const intl = useIntl();
  const features = useFeatures();

  const { client, client_id, client_secret, instance } = useAuthStore();
  const { createApp, signIn, signInWithCode } = useAuthStoreActions();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: client_id!,
      clientSecret: client_secret!,
      redirectUri: makeRedirectUri({
        scheme: 'nicolium',
        path: 'redirect',
      }),
      scopes: getInstanceScopes(client.instanceInformation).split(' '),
    },
    {
      authorizationEndpoint: `${instance}/oauth/authorize`,
    },
  );

  const passwordNode = React.useRef<TextInputHandles>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const canSubmit = !features.grantTypePassword || (username.trim() && password.trim());

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await createApp('password');
      await signIn(username, password);
      setLoading(false);
    } catch (e) {
      setError(true);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (request && !features.grantTypePassword) {
      promptAsync();
    }
  }, [!!request]);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      signInWithCode(code, request?.codeVerifier!);
    }
  }, [response]);

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
          {features.grantTypePassword && (
            <>
              <TextInput
                label={intl.formatMessage(
                  features.logInWithUsername ? messages.username : messages.email,
                )}
                startAccessory={(props) => <AtIcon color={colors.onPrimaryContainer} {...props} />}
                value={username}
                onChangeText={setUsername}
                enterKeyHint='next'
                onSubmitEditing={() => passwordNode.current?.focus()}
                textContentType={features.logInWithUsername ? 'username' : 'emailAddress'}
              />
              <TextInput
                ref={passwordNode}
                label={intl.formatMessage(messages.password)}
                startAccessory={(props) => (
                  <LockIcon color={colors.onPrimaryContainer} {...props} />
                )}
                value={password}
                onChangeText={setPassword}
                textContentType='password'
                secureTextEntry
                returnKeyType='done'
                onSubmitEditing={submit}
                error={error}
                supportingText={error ? intl.formatMessage(messages.invalidCredentials) : undefined}
              />
            </>
          )}
        </View>
      </ScrollView>
      <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={-bottomInset}>
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
            loading={loading || !features.grantTypePassword}
            style={{ width: '100%', marginVertical: 8 }}
            disabled={!canSubmit}
          >
            <FormattedMessage id='landing_mobile.sign_in' defaultMessage='Sign in' />
          </Button>
        </Appbar>
      </KeyboardAvoidingView>
    </>
  );
};

const LoginStack = createNativeStackNavigator<LoginStackParams>();

const LoginStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'login'>) => {
  const instanceUrl = useAuthStore(({ instance }) => instance);
  const intl = useIntl();

  return (
    <LoginStack.Navigator>
      <LoginStack.Screen name='instance' component={LoginScreen} options={{ headerShown: false }} />
      <LoginStack.Screen
        name='credentials'
        component={CredentialsScreen}
        options={{
          headerBackButtonDisplayMode: 'minimal',
          title: intl.formatMessage(messages.credentialsHeadline, {
            instance: instanceUrl ? new URL(instanceUrl).host : '',
          }),
        }}
      />
    </LoginStack.Navigator>
  );
};

export { LoginStackScreen };
