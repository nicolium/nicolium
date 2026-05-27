import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PublicTimelineColumn } from '@/columns/timeline';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { About } from '@/pages/instance/about';
import { usePublicTimeline } from '@/queries/timelines/use-timelines';
import { useInstance } from '@/stores/instance';
import { getTextDirection } from '@/utils/rtl';

interface ILogoText extends Pick<React.HTMLAttributes<HTMLHeadingElement>, 'dir'> {
  children: React.ReactNode;
}

/** Big text in site colors, for displaying the site name. Resizes itself according to the screen size. */
const LogoText: React.FC<ILogoText> = ({ children, dir }) => (
  <h1 className='logo-text' dir={dir}>
    {children}
  </h1>
);

const SiteBanner: React.FC = () => {
  const instance = useInstance();

  return (
    <div className='site-banner'>
      <LogoText dir={getTextDirection(instance.title)}>{instance.title}</LogoText>

      {instance.description.trim().length > 0 && (
        <div data-markup dir={getTextDirection(instance.description)}>
          <ParsedContent html={instance.description} />
        </div>
      )}
    </div>
  );
};

const LandingTimelinePage = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();

  const { isError } = usePublicTimeline({ local: true });

  const timelineEnabled = !instance.pleroma.metadata.restrict_unauthenticated.timelines.local;

  return (
    <Column withHeader={false}>
      <div className='mb-4 mt-12 px-4 lg:mb-12'>
        <SiteBanner />
      </div>

      <div className='mb-4 flex justify-end gap-4 lg:hidden'>
        <Button theme='tertiary' to='/login'>
          <FormattedMessage id='account.login' defaultMessage='Log in' />
        </Button>
        {isOpen && (
          <Button to='/signup'>
            <FormattedMessage id='account.register' defaultMessage='Sign up' />
          </Button>
        )}
      </div>

      {timelineEnabled && !isError ? (
        <PublicTimelineColumn
          local
          emptyMessageText={
            <FormattedMessage
              id='empty_column.community'
              defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!'
            />
          }
          emptyMessageIcon={iconChatCenteredText}
        />
      ) : (
        <About slug='index' />
      )}
    </Column>
  );
};

export { LandingTimelinePage as default, LogoText };
