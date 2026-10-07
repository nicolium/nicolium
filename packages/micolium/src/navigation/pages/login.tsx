import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Text,
  TextInput,
  type TextInputHandles,
  useTheme,
} from '@mkljczk/react-native-paper';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { AtIcon, GlobeIcon, LockIcon } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { KeyboardAvoidingView, Platform, ScrollView, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Gayness from '@/assets/gayness.svg';
import Logo from '@/assets/logo.svg';
import { UIAccount } from '@/components/ui/account';
import { Header } from '@/components/ui/header';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useAuthStore, useAuthStoreActions } from '@/stores/auth';
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
  addAccountHeadline: {
    id: 'landing_mobile.add_account.headline',
    defaultMessage: 'Add account',
  },
  credentialsHeadline: {
    id: 'landing_mobile.credentials.headline',
    defaultMessage: 'Sign in to {instance}',
  },
  interruptMessage: {
    id: 'landing_mobile.interrupt',
    defaultMessage: 'Authentication interrupted.',
  },
});

interface ILoginLayout {
  children: React.ReactNode;
  footer: React.ReactNode;
}

const LoginLayout: React.FC<ILoginLayout> = ({ children, footer }) => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
        keyboardVerticalOffset={headerHeight - bottomInset}
      >
        <ScrollView
          style={{ flex: 1, marginTop: headerHeight ? 0 : topInset }}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='interactive'
        >
          {children}
        </ScrollView>
        <Appbar
          style={{
            paddingHorizontal: 16,
            height: 64 + bottomInset,
            backgroundColor: colors.surfaceContainer,
          }}
          safeAreaInsets={{ bottom: bottomInset }}
        >
          {footer}
        </Appbar>
      </KeyboardAvoidingView>
    </View>
  );
};

const LoginScreen = ({ navigation }: NativeStackScreenProps<LoginStackParams, 'instance'>) => {
  const { colors } = useTheme();
  const intl = useIntl();

  const isLoggedIn = !!useCurrentAccount();
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
      if (!useAuthStore.getState().pendingAuthClient?.features.grantTypePassword) {
        await createApp('authorization_code');
        navigation.navigate('oauth_flow');
      } else {
        navigation.navigate('credentials');
      }
    } catch (e) {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) setError(false);
  }, [instance]);

  return (
    <LoginLayout
      footer={
        <Button
          mode='contained'
          onPress={submit}
          loading={loading}
          style={{ width: '100%', marginVertical: 8 }}
          disabled={!canSubmit}
        >
          <FormattedMessage id='landing_mobile.next' defaultMessage='Next' />
        </Button>
      }
    >
      <View style={{ alignItems: 'center' }}>
        <Logo width={78} height={78} accessibilityLabel='Nicolium' />
      </View>

      {!isLoggedIn && (
        <>
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
        </>
      )}

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
    </LoginLayout>
  );
};

const CredentialsScreen = ({
  navigation,
}: NativeStackScreenProps<LoginStackParams, 'credentials'>) => {
  const { colors } = useTheme();
  const intl = useIntl();

  const pendingAuthClient = useAuthStore(({ pendingAuthClient }) => pendingAuthClient);
  const { createApp, signIn } = useAuthStoreActions();

  const features = pendingAuthClient?.features;

  const passwordNode = React.useRef<TextInputHandles>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [shouldForceAuthCodeFlow, setShouldForceAuthCodeFlow] = React.useState(false);

  const canSubmit = username.trim() && password.trim();

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await createApp('password');
      await signIn(username, password);
      setLoading(false);
      navigation.getParent()?.navigate('app');
    } catch (e) {
      setError(true);
      setLoading(false);
    }
  };

  const forceAuthCodeFlow = async () => {
    setShouldForceAuthCodeFlow(true);
    setLoading(true);
    await createApp('authorization_code');
    navigation.navigate('oauth_flow');
    setLoading(false);
  };

  return (
    <LoginLayout
      footer={
        <View style={{ flex: 1, flexDirection: 'row', gap: 8, marginVertical: 8 }}>
          <Button
            mode='contained'
            onPress={submit}
            loading={loading && !shouldForceAuthCodeFlow}
            style={{ flex: 1 }}
            disabled={!canSubmit}
          >
            <FormattedMessage id='landing_mobile.sign_in' defaultMessage='Sign in' />
          </Button>
          {features?.grantTypePassword && !shouldForceAuthCodeFlow && (
            <Button
              mode='outlined'
              onPress={forceAuthCodeFlow}
              loading={loading && shouldForceAuthCodeFlow}
              style={{ flex: 1 }}
              disabled={loading}
            >
              <FormattedMessage id='landing_mobile.sign_in' defaultMessage='Use browser auth' />
            </Button>
          )}
        </View>
      }
    >
      <TextInput
        label={intl.formatMessage(features?.logInWithUsername ? messages.username : messages.email)}
        startAccessory={(props) => <AtIcon color={colors.onPrimaryContainer} {...props} />}
        value={username}
        onChangeText={setUsername}
        enterKeyHint='next'
        onSubmitEditing={() => passwordNode.current?.focus()}
        textContentType={features?.logInWithUsername ? 'username' : 'emailAddress'}
      />
      <TextInput
        ref={passwordNode}
        label={intl.formatMessage(messages.password)}
        startAccessory={(props) => <LockIcon color={colors.onPrimaryContainer} {...props} />}
        value={password}
        onChangeText={setPassword}
        textContentType='password'
        secureTextEntry
        returnKeyType='done'
        onSubmitEditing={submit}
        error={error}
        supportingText={error ? intl.formatMessage(messages.invalidCredentials) : undefined}
      />
    </LoginLayout>
  );
};

const OauthFlowScreen = ({
  navigation,
}: NativeStackScreenProps<LoginStackParams, 'oauth_flow'>) => {
  const intl = useIntl();
  const { pendingAuth, pendingAuthClient } = useAuthStore();
  const { signInWithCode } = useAuthStoreActions();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: pendingAuth?.client_id!,
      clientSecret: pendingAuth?.client_secret!,
      redirectUri: makeRedirectUri({
        scheme: 'nicolium',
        path: 'redirect',
      }),
      scopes: getInstanceScopes(pendingAuthClient!.instanceInformation).split(' '),
    },
    {
      authorizationEndpoint: `${pendingAuth?.instance}/oauth/authorize`,
    },
  );

  React.useEffect(() => {
    if (request) {
      promptAsync();
    }
  }, [!!request]);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      signInWithCode(code, request?.codeVerifier!).then(() => {
        navigation.getParent()?.navigate('app');
      });
    } else if (response && ['locked', 'cancel', 'dismiss', 'error'].includes(response.type)) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(intl.formatMessage(messages.interruptMessage), ToastAndroid.SHORT);
        // TODO: support non-android
      }
      navigation.goBack();
    }
  }, [response]);

  return (
    <View style={{ padding: 16 }}>
      <ActivityIndicator size='large' />
    </View>
  );
};

const LoginStack = createNativeStackNavigator<LoginStackParams>();

const LoginStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'login'>) => {
  const instanceUrl = useAuthStore(({ pendingAuth }) => pendingAuth?.instance);
  const isLoggedIn = !!useCurrentAccount();
  const intl = useIntl();

  return (
    <LoginStack.Navigator screenOptions={{ header: Header }}>
      <LoginStack.Screen
        name='instance'
        component={LoginScreen}
        options={{
          headerShown: isLoggedIn,
          title: intl.formatMessage(messages.addAccountHeadline),
        }}
      />
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
      <LoginStack.Screen
        name='oauth_flow'
        component={OauthFlowScreen}
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
