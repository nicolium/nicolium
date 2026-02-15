import React, { useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import { loadFrontendConfig } from '@/actions/frontend-config';
import { checkIfStandalone, fetchInstance } from '@/actions/instance';
import { fetchMe } from '@/actions/me';
import LoadingScreen from '@/components/loading-screen';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useLocale } from '@/hooks/use-locale';
import { useOwnAccount } from '@/hooks/use-own-account';
import MESSAGES from '@/messages';

import type { AppDispatch } from '@/store';

/** Load initial data from the backend */
const loadInitial = () => async (dispatch: AppDispatch) => {
  dispatch(checkIfStandalone());
  // Await for authenticated fetch
  await dispatch(fetchMe());
  // Await for feature detection
  await dispatch(fetchInstance());
  // Await for configuration
  await dispatch(loadFrontendConfig());
};

interface IPlFeLoad {
  children: React.ReactNode;
}

/** Initial data loader. */
const PlFeLoad: React.FC<IPlFeLoad> = ({ children }) => {
  const dispatch = useAppDispatch();

  const me = useAppSelector((state) => state.me);
  const { account } = useOwnAccount();
  const locale = useLocale();

  const [messages, setMessages] = useState<Record<string, string>>({});
  const [localeLoading, setLocaleLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  /** Whether to display a loading indicator. */
  const showLoading = [me === null, me && !account, !isLoaded, localeLoading].some(Boolean);

  // Load the user's locale
  useEffect(() => {
    MESSAGES[locale]()
      .then((messages) => {
        setMessages(messages);
        setLocaleLoading(false);
      })
      .catch(() => {});
  }, [locale]);

  // Load initial data from the API
  useEffect(() => {
    dispatch(loadInitial())
      .then(() => {
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  // intl is part of loading.
  // It's important nothing in here depends on intl.
  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export { PlFeLoad as default };
