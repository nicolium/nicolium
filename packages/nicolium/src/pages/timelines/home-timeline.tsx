import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { fetchHomeTimeline } from '@/actions/timelines';
import { Link } from '@/components/link';
import PullToRefresh from '@/components/pull-to-refresh';
import Column from '@/components/ui/column';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Timeline from '@/features/ui/components/timeline';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useInstance } from '@/hooks/use-instance';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

const HomeTimelinePage: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const instance = useInstance();

  const polling = useRef<NodeJS.Timeout | null>(null);

  const isPartial = useAppSelector((state) => state.timelines.home?.isPartial);

  // Mastodon generates the feed in Redis, and can return a partial timeline
  // (HTTP 206) for new users. Poll until we get a full page of results.
  const checkIfReloadNeeded = useCallback((isPartial: boolean) => {
    if (isPartial) {
      polling.current = setInterval(() => {
        dispatch(fetchHomeTimeline());
      }, 3000);
    } else if (polling.current) {
      clearInterval(polling.current);
      polling.current = null;
    }

    return () => {
      if (polling.current) {
        clearInterval(polling.current);
        polling.current = null;
      }
    };
  }, []);

  const handleLoadMore = useCallback(() => dispatch(fetchHomeTimeline(true)), []);

  const handleRefresh = useCallback(() => dispatch(fetchHomeTimeline(false)), []);

  useEffect(() => checkIfReloadNeeded(isPartial), [isPartial]);

  return (
    <Column className='py-0' label={intl.formatMessage(messages.title)} withHeader={false}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
          scrollKey='home_timeline'
          onLoadMore={handleLoadMore}
          timelineId='home'
          emptyMessageText={
            <Stack space={1}>
              <Text size='xl' weight='medium' align='center'>
                <FormattedMessage
                  id='empty_column.home.title'
                  defaultMessage="You're not following anyone yet"
                />
              </Text>

              <Text theme='muted' align='center'>
                <FormattedMessage
                  id='empty_column.home.subtitle'
                  defaultMessage='{siteTitle} gets more interesting once you follow other users.'
                  values={{ siteTitle: instance.title }}
                />
              </Text>

              {features.federating && (
                <Text theme='muted' align='center'>
                  <FormattedMessage
                    id='empty_column.home'
                    defaultMessage='Or you can visit {public} to get started and meet other users.'
                    values={{
                      public: (
                        <Link to='/timeline/local'>
                          <FormattedMessage
                            id='empty_column.home.local_tab'
                            defaultMessage='the Local tab'
                          />
                        </Link>
                      ),
                    }}
                  />
                </Text>
              )}
            </Stack>
          }
          emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
        />
      </PullToRefresh>
    </Column>
  );
};

export { HomeTimelinePage as default };
