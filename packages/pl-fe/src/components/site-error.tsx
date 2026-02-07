import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { NODE_ENV } from '@/build-config';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Textarea from '@/components/ui/textarea';
import { useLogo } from '@/hooks/use-logo';
import { usePlFeConfig } from '@/hooks/use-pl-fe-config';
import { captureSentryException } from '@/sentry';
import KVStore from '@/storage/kv-store';
import sourceCode from '@/utils/code';
import { isNetworkError } from '@/utils/errors';
import { unregisterSW } from '@/utils/sw';

import SentryFeedbackForm from './sentry-feedback-form';
import SiteLogo from './site-logo';
import Column from './ui/column';

import type { ErrorRouteComponent } from '@tanstack/react-router';

const messages = defineMessages({
  networkErrorTitle: { id: 'bundle_column_error.title', defaultMessage: 'Network error' },
  networkErrorRetry: { id: 'bundle_column_error.retry', defaultMessage: 'Try again' },
});

/** Application-level error boundary. Fills the whole screen. */
const SiteError: ErrorRouteComponent = ({ error, info }) => {
  const intl = useIntl();
  const { links, sentryDsn } = usePlFeConfig();
  const { src: logoSrc } = useLogo();
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [browser, setBrowser] = useState<Bowser.Parser.Parser>();
  const [sentryEventId, setSentryEventId] = useState<string>();

  const sentryEnabled = Boolean(sentryDsn);
  const isProduction = NODE_ENV === 'production';
  const errorText = String(error) + (info?.componentStack || '');

  const clearCookies: React.MouseEventHandler = (e) => {
    localStorage.clear();
    sessionStorage.clear();
    KVStore.clear();

    if ('serviceWorker' in navigator) {
      e.preventDefault();
      unregisterSW().then(goHome).catch(goHome);
    }
  };

  const handleCopy: React.MouseEventHandler = () => {
    if (!textarea.current) return;

    textarea.current.select();
    textarea.current.setSelectionRange(0, 99999);

    document.execCommand('copy');
  };

  useEffect(() => {
    captureSentryException(error, {
      tags: {
        // Allow page crashes to be easily searched in Sentry.
        ErrorBoundary: 'yes',
      },
    })
      .then((eventId) => setSentryEventId(eventId))
      .catch(console.error);

    import('bowser')
      .then(({ default: Bowser }) => setBrowser(Bowser.getParser(window.navigator.userAgent)))
      .catch(() => {});
  }, []);

  const goHome = () => {
    location.href = '/';
  };

  if (isNetworkError(error)) {
    return (
      <Column label={intl.formatMessage(messages.networkErrorTitle)}>
        <Stack space={4} alignItems='center' justifyContent='center' className='min-h-[160px] rounded-lg p-10'>
          {/* <IconButton
            iconClassName='h-10 w-10'
            title={intl.formatMessage(messages.networkErrorRetry)}
            src={require('@phosphor-icons/core/regular/arrows-clockwise.svg')}
            onClick={handleRetry}
          /> */}

          <Text align='center' theme='muted'>
            <FormattedMessage id='bundle_column_error.body' defaultMessage='Something went wrong while loading this page.' />
          </Text>
        </Stack>
      </Column>
    );
  }

  return (
    <div className='⁂-site-error'>
      <main>
        {logoSrc && (
          <div className='flex shrink-0 justify-center'>
            <a href='/' className='inline-flex'>
              <SiteLogo className='h-12 w-auto cursor-pointer' />
            </a>
          </div>
        )}

        <div className='py-8'>
          <div className='mx-auto max-w-xl space-y-2 text-center'>
            <h1 className='text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-500 sm:text-4xl'>
              <FormattedMessage id='alert.unexpected.message' defaultMessage='Something went wrong.' />
            </h1>
            <p className='text-lg text-gray-700 dark:text-gray-600'>
              <FormattedMessage
                id='alert.unexpected.body'
                defaultMessage="We're sorry for the interruption. If the problem persists, please report it in our {issueTracker}. You may also try to {clearCookies} (this will log you out)."
                values={{
                  issueTracker: (
                    <a href={sourceCode.url + '/issues'} target='_blank' rel='noopener noreferrer' className='text-primary-600 hover:underline dark:text-primary-400'>
                      <FormattedMessage
                        id='alert.unexpected.issue_tracker'
                        defaultMessage='issue tracker'
                      />
                    </a>
                  ),
                  clearCookies: (
                    <a href='/' onClick={clearCookies} className='text-primary-600 hover:underline dark:text-primary-400'>
                      <FormattedMessage
                        id='alert.unexpected.clear_cookies'
                        defaultMessage='clear cookies and browser data'
                      />
                    </a>
                  ),
                }}
              />
            </p>

            <Text theme='muted'>
              <Text weight='medium' tag='span' theme='muted'>{sourceCode.displayName}:</Text>

              {' '}{sourceCode.version}
            </Text>
          </div>

          <div className='mx-auto max-w-lg space-y-4 py-16'>
            {(isProduction) ? (
              (sentryEnabled && sentryEventId) && (
                <SentryFeedbackForm eventId={sentryEventId} />
              )
            ) : (
              <>
                {errorText && (
                  <Textarea
                    ref={textarea}
                    value={errorText}
                    onClick={handleCopy}
                    isCodeEditor
                    rows={12}
                    readOnly
                  />
                )}

                {browser && (
                  <Stack>
                    <Text weight='semibold'><FormattedMessage id='alert.unexpected.browser' defaultMessage='Browser' /></Text>
                    <Text theme='muted'>{browser.getBrowserName()} {browser.getBrowserVersion()}</Text>
                  </Stack>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer>
        <HStack justifyContent='center' space={4} element='nav'>
          {links.status && (
            <SiteErrorBoundaryLink href={links.status}>
              <FormattedMessage id='alert.unexpected.links.status' defaultMessage='Status' />
            </SiteErrorBoundaryLink>
          )}

          {links.help && (
            <SiteErrorBoundaryLink href={links.help}>
              <FormattedMessage id='alert.unexpected.links.help' defaultMessage='Help Center' />
            </SiteErrorBoundaryLink>
          )}

          {links.support && (
            <SiteErrorBoundaryLink href={links.support}>
              <FormattedMessage id='alert.unexpected.links.support' defaultMessage='Support' />
            </SiteErrorBoundaryLink>
          )}
        </HStack>
      </footer>
    </div>
  );
};

interface ISiteErrorBoundaryLink {
  href: string;
  children: React.ReactNode;
}

const SiteErrorBoundaryLink = ({ href, children }: ISiteErrorBoundaryLink) => (
  <>
    <span className='inline-block border-l border-gray-300' aria-hidden='true' />
    <a href={href} className='text-sm font-medium text-gray-700 hover:underline dark:text-gray-600'>
      {children}
    </a>
  </>
);

export { SiteError as default };
