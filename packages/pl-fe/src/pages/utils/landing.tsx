import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Card, { CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import sourceCode from 'pl-fe/utils/code';

import { LogoText } from '../timelines/landing-timeline';

const LandingPage = () => {
  return (
    <>
      <Column withHeader={false}>
        <Stack space={4}>
          <LogoText>
            pl-fe
          </LogoText>
          <Text><FormattedMessage id='landing.description' defaultMessage='pl-fe is a feature-rich Fediverse web client.' /></Text>
          <HStack justifyContent='end' space={4}>
            <Button href={sourceCode.url}><FormattedMessage id='landing.source_code' defaultMessage='Source code' /></Button>
            <Button to='/login/external' theme='primary'><FormattedMessage id='landing.sign_in' defaultMessage='Sign in' /></Button>
          </HStack>
          <Card variant='rounded'>
            <CardTitle title={<FormattedMessage id='landing.use_with_platform.title' defaultMessage='Use with your favorite Fediverse platform.' />} truncate={false} />
            <Text><FormattedMessage id='landing.use_with_platform.description' defaultMessage='pl-fe works with any backend implementing Mastodon API.' /></Text>
          </Card>
          <Card variant='rounded'>
            <CardTitle title={<FormattedMessage id='landing.feature_rich.title' defaultMessage='Feature-rich.' />} truncate={false} />
            <Text><FormattedMessage id='landing.feature_rich.description' defaultMessage='pl-fe includes a lot features to improve your experience, like WYSIWYG text editor, draft posts and language detection.' /></Text>
          </Card>
          <Card variant='rounded'>
            <CardTitle title={<FormattedMessage id='landing.pl_api.title' defaultMessage='Get the most out of your Fediverse instance.' />} truncate={false} />
            <Text><FormattedMessage id='landing.pl_api.description' defaultMessage='pl-fe implements features not present in standard Mastodon API, like emoji reactions, chats or interaction policies.' /></Text>
          </Card>
          <Card variant='rounded'>
            <CardTitle title={<FormattedMessage id='landing.customizable.title' defaultMessage='Customizable.' />} truncate={false} />
            <Text><FormattedMessage id='landing.customizable.description' defaultMessage='pl-fe lets you choose between three themes and adjust accent color to your liking.' /></Text>
          </Card>
          <Card variant='rounded'>
            <CardTitle title={<FormattedMessage id='landing.private.title' defaultMessage='Stay private.' />} truncate={false} />
            <Text><FormattedMessage id='landing.private.description' defaultMessage='pl-fe includes features which help you maintain online privacy. This includes URL cleaning, which helps you remove unwanted parts of URLs used to mark your online activity.' /></Text>
          </Card>
          <Card variant='rounded'>
            <CardTitle title={<FormattedMessage id='landing.open_source.title' defaultMessage='Open source.' />} truncate={false} />
            <Text><FormattedMessage id='landing.open_source.description' defaultMessage='pl-fe is free and open source software. You can participate in development, contribute to the project or report bugs.' /></Text>
          </Card>
        </Stack>

      </Column>
      <Stack space={4} className='mt-4 px-4 xl:hidden'>
        <LinkFooter />
      </Stack>
    </>
  );
};

export { LandingPage as default };
