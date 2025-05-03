import clsx from 'clsx';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchPublicTimeline } from 'pl-fe/actions/timelines';
import { useCommunityStream } from 'pl-fe/api/hooks/streaming/use-community-stream';
import Markup from 'pl-fe/components/markup';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useTheme } from 'pl-fe/hooks/use-theme';
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
  const theme = useTheme();
  const isMobile = useIsMobile();

  const timelineEnabled = !instance.pleroma.metadata.restrict_unauthenticated.timelines.local;

  const timelineId = 'public:local';

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ local: true }, true));
  };

  const handleRefresh = () => dispatch(fetchPublicTimeline({ local: true }));

  useCommunityStream({ enabled: timelineEnabled });

  useEffect(() => {
    if (timelineEnabled) {
      dispatch(fetchPublicTimeline({ local: true }));
    }
  }, []);

  return (
    <Column transparent={!isMobile} withHeader={false}>
      <div className='my-12 mb-16 px-4 sm:mb-20'>
        <SiteBanner />
      </div>

      {timelineEnabled ? (
        <PullToRefresh onRefresh={handleRefresh}>
          <Timeline
            className='black:p-0 black:sm:p-4 black:sm:pt-0'
            loadMoreClassName='black:sm:mx-4'
            scrollKey={`${timelineId}_timeline`}
            timelineId={timelineId}
            prefix='home'
            onLoadMore={handleLoadMore}
            emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
            divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
          />
        </PullToRefresh>
      ) : (
        <AboutPage />
      )}
    </Column>
  );
};

export { LandingTimelinePage as default, LogoText };
