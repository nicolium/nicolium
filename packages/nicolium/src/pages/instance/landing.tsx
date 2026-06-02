import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import LinkFooter from '@/components/navigation/link-footer';
import Column from '@/components/ui/column';
import sourceCode from '@/utils/code';

import { LogoText } from '../timelines/landing-timeline';

const LandingPage = () => (
  <>
    <Column withHeader={false}>
      <div className='landing-page'>
        <LogoText>
          <FormattedMessage id='landing.logo' defaultMessage='Nicolium' />
        </LogoText>
        <p className='landing-page__heading'>
          <FormattedMessage
            id='landing.description'
            defaultMessage='Nicolium is a feature-rich Fediverse web client.'
          />
        </p>
        <div className='landing-page__links'>
          <a href={sourceCode.url} target='_blank' rel='noopener noreferrer'>
            <FormattedMessage id='landing.source_code' defaultMessage='Source code' />
          </a>
          <Link to='/login/external'>
            <FormattedMessage id='landing.sign_in' defaultMessage='Sign in' />
          </Link>
        </div>
        <div className='landing-page__feature'>
          <h2>
            <FormattedMessage
              id='landing.use_with_platform.title'
              defaultMessage='Use with your favorite Fediverse platform.'
            />
          </h2>
          <p>
            <FormattedMessage
              id='landing.use_with_platform.description'
              defaultMessage='Nicolium works with any backend implementing Mastodon API.'
            />
          </p>
        </div>
        <div className='landing-page__feature'>
          <h2>
            <FormattedMessage id='landing.feature_rich.title' defaultMessage='Feature-rich.' />
          </h2>
          <p>
            <FormattedMessage
              id='landing.feature_rich.description'
              defaultMessage='Nicolium includes a lot of features to improve your experience, like WYSIWYG text editor, draft posts and language detection.'
            />
          </p>
        </div>
        <div className='landing-page__feature'>
          <h2>
            <FormattedMessage
              id='landing.pl_api.title'
              defaultMessage='Get the most out of your Fediverse instance.'
            />
          </h2>
          <p>
            <FormattedMessage
              id='landing.pl_api.description'
              defaultMessage='Nicolium implements features not present in standard Mastodon API, like emoji reactions, chats or interaction policies.'
            />
          </p>
        </div>
        <div className='landing-page__feature'>
          <h2>
            <FormattedMessage id='landing.customizable.title' defaultMessage='Customizable.' />
          </h2>
          <p>
            <FormattedMessage
              id='landing.customizable.description'
              defaultMessage='Nicolium lets you choose between three themes and adjust accent color to your liking. You can customize the UI elements like sidebar, navigation menu and post action bar.'
            />
          </p>
        </div>
        <div className='landing-page__feature'>
          <h2>
            <FormattedMessage id='landing.private.title' defaultMessage='Stay private.' />
          </h2>
          <p>
            <FormattedMessage
              id='landing.private.description'
              defaultMessage='Nicolium includes features which help you maintain online privacy. This includes URL cleaning, which helps you remove unwanted parts of URLs used to mark your online activity.'
            />
          </p>
        </div>
        <div className='landing-page__feature'>
          <h2>
            <FormattedMessage id='landing.open_source.title' defaultMessage='Open source.' />
          </h2>
          <p>
            <FormattedMessage
              id='landing.open_source.description'
              defaultMessage='Nicolium is free and open source software. You can participate in development, contribute to the project or report bugs.'
            />
          </p>
        </div>
      </div>
    </Column>
    <div className='landing-page__footer'>
      <LinkFooter />
    </div>
  </>
);

export { LandingPage as default };
