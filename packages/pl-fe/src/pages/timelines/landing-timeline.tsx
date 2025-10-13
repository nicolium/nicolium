import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchPublicTimeline } from 'pl-fe/actions/timelines';
import { useCommunityStream } from 'pl-fe/api/hooks/streaming/use-community-stream';
import Markup from 'pl-fe/components/markup';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';
import AboutPage from 'pl-fe/pages/utils/about';
import { getTextDirection } from 'pl-fe/utils/rtl';

interface ILogoText extends Pick<React.HTMLAttributes<HTMLHeadingElement>, 'className' | 'dir'> {
  children: React.ReactNode;
}

/** Big text in site colors, for displaying the site name. Resizes itself according to the screen size. */
const LogoText: React.FC<ILogoText> = ({ children, className, dir }) => (
  <h1
    className={clsx('overflow-hidden text-ellipsis bg-gradient-to-br from-accent-500 via-primary-500 to-gradient-end bg-clip-text text-5xl font-extrabold !leading-tight text-transparent lg:text-6xl xl:text-7xl', className)}
    dir={dir}
  >
    {children}
  </h1>
);

const SiteBanner: React.FC = () => {
  const instance = useInstance();

  return (
    <Stack space={6}>
      <LogoText className='-my-5' dir={getTextDirection(instance.title)}>
        {instance.title}
      </LogoText>

      {instance.description.trim().length > 0 && (
        <Markup
          size='lg'
          direction={getTextDirection(instance.description)}
        >
          <ParsedContent html={instance.description} />
        </Markup>
      )}
    </Stack>
  );
};

const LandingTimelinePage = () => {
  const dispatch = useAppDispatch();
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();

  const [timelineFailed, setTimelineFailed] = useState(false);

  const timelineEnabled = !instance.pleroma.metadata.restrict_unauthenticated.timelines.local;

  const timelineId = 'public:local';

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ local: true }, true));
  };

  const handleRefresh = () => dispatch(fetchPublicTimeline({ local: true }));

  useCommunityStream({ enabled: timelineEnabled });

  useEffect(() => {
    if (timelineEnabled) {
      dispatch(fetchPublicTimeline({ local: true }, false, undefined, () => {
        setTimelineFailed(true);
      }));
    }
  }, []);

  return (
    <Column withHeader={false}>
      <div className='mb-4 mt-12 px-4 lg:mb-12'>
        <SiteBanner />
      </div>

      <HStack className='mb-4 lg:hidden' justifyContent='end' space={4}>
        <Button theme='tertiary' to='/login'>
          <FormattedMessage id='thread_login.login' defaultMessage='Log in' />
        </Button>
        {isOpen && (
          <Button to='/signup'>
            <FormattedMessage id='thread_login.signup' defaultMessage='Sign up' />
          </Button>
        )}
      </HStack>

      {timelineEnabled && !timelineFailed ? (
        <PullToRefresh onRefresh={handleRefresh}>
          <Timeline
            loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
            scrollKey={`${timelineId}_timeline`}
            timelineId={timelineId}
            prefix='home'
            onLoadMore={handleLoadMore}
            emptyMessageText={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
            emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
          />
        </PullToRefresh>
      ) : (
        <AboutPage />
      )}
    </Column>
  );
};

export { LandingTimelinePage as default, LogoText };
