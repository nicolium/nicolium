import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { NODE_ENV } from '@/build-config';
import Textarea from '@/components/ui/textarea';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLogo } from '@/hooks/use-logo';
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
  const { links, sentryDsn } = useFrontendConfig();
  const { src: logoSrc } = useLogo();
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [browser, setBrowser] = useState<Bowser.Parser.Parser>();
  const [sentryEventId, setSentryEventId] = useState<string>();

  const sentryEnabled = Boolean(sentryDsn);
  const isProduction = NODE_ENV === 'production';
  const errorText = String(error) + (info?.componentStack ?? '');

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
      .then((eventId) => {
        setSentryEventId(eventId);
      })
      .catch(console.error);

    import('bowser')
      .then(({ default: Bowser }) => {
        setBrowser(Bowser.getParser(window.navigator.userAgent));
      })
      .catch(() => {});
  }, []);

  const goHome = () => {
    location.href = '/';
  };

  if (isNetworkError(error)) {
    return (
      <Column label={intl.formatMessage(messages.networkErrorTitle)}>
        <div className='⁂-network-error'>
          <p>
            <FormattedMessage
              id='bundle_column_error.body'
              defaultMessage='Something went wrong while loading this page.'
            />
          </p>
        </div>
      </Column>
    );
  }

  return (
    <div className='⁂-site-error ⁂-card ⁂-card--rounded ⁂-card--md'>
      <main>
        {logoSrc && (
          <a href='/' className='⁂-site-error__logo'>
            <SiteLogo />
          </a>
        )}

        <div className='⁂-site-error__body'>
          <div className='⁂-site-error__message'>
            <h1>
              <FormattedMessage
                id='alert.unexpected.message'
                defaultMessage='Something went wrong.'
              />
            </h1>
            <p className='⁂-site-error__message__body'>
              <FormattedMessage
                id='alert.unexpected.body'
                defaultMessage="We're sorry for the interruption. If the problem persists, please report it in our {issueTracker}. You may also try to {clearCookies} (this will log you out)."
                values={{
                  issueTracker: (
                    <a href={sourceCode.url + '/issues'} target='_blank' rel='noopener noreferrer'>
                      <FormattedMessage
                        id='alert.unexpected.issue_tracker'
                        defaultMessage='issue tracker'
                      />
                    </a>
                  ),
                  clearCookies: (
                    <a href='/' onClick={clearCookies}>
                      <FormattedMessage
                        id='alert.unexpected.clear_cookies'
                        defaultMessage='clear cookies and browser data'
                      />
                    </a>
                  ),
                }}
              />
            </p>

            <p className='⁂-site-error__message__version'>
              <span>{sourceCode.displayName}:</span> {sourceCode.version}
            </p>
          </div>

          <div className='⁂-site-error__form'>
            {isProduction && sentryEnabled && sentryEventId && (
              <SentryFeedbackForm eventId={sentryEventId} />
            )}
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
              <p className='⁂-site-error__browser'>
                <span>
                  <FormattedMessage id='alert.unexpected.browser' defaultMessage='Browser' />
                  {': '}
                </span>
                {browser.getBrowserName()} {browser.getBrowserVersion()}
              </p>
            )}
          </div>
        </div>
      </main>

      {[links.status, links.help, links.support].some(Boolean) && (
        <footer>
          <nav>
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
          </nav>
        </footer>
      )}
    </div>
  );
};

interface ISiteErrorBoundaryLink {
  href: string;
  children: React.ReactNode;
}

const SiteErrorBoundaryLink = ({ href, children }: ISiteErrorBoundaryLink) => (
  <>
    <span aria-hidden='true' />
    <a href={href}>{children}</a>
  </>
);

export { SiteError as default };
