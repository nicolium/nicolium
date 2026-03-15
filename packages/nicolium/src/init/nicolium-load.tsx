import React, { useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import { loadFrontendConfig } from '@/actions/frontend-config';
import { checkIfStandalone, fetchInstance } from '@/actions/instance';
import LoadingScreen from '@/components/loading-screen';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useLocale } from '@/hooks/use-locale';
import { useOwnAccount } from '@/hooks/use-own-account';
import MESSAGES from '@/messages';
import { useAuthActions } from '@/stores/auth';

interface INicoliumLoad {
  children: React.ReactNode;
}

/** Initial data loader. */
const NicoliumLoad: React.FC<INicoliumLoad> = ({ children }) => {
  const me = useCurrentAccount();
  const { data: account } = useOwnAccount();
  const locale = useLocale();
  const { fetchMe } = useAuthActions();

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
    /** Load initial data from the backend */
    const loadInitial = async () => {
      checkIfStandalone();
      // Await for authenticated fetch
      await fetchMe();
      // Await for feature detection
      await fetchInstance();
      // Await for configuration
      await loadFrontendConfig();
    };

    loadInitial()
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

export { NicoliumLoad as default };
