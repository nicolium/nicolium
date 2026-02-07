import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchBubbleTimeline } from '@/actions/timelines';
import { useBubbleStream } from '@/api/hooks/streaming/use-bubble-stream';
import PullToRefresh from '@/components/pull-to-refresh';
import Column from '@/components/ui/column';
import Timeline from '@/features/ui/components/timeline';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
});

const BubbleTimelinePage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const features = useFeatures();
  const settings = useSettings();
  const onlyMedia = settings.timelines.bubble?.other.onlyMedia ?? false;

  const timelineId = 'bubble';

  const handleLoadMore = () => {
    dispatch(fetchBubbleTimeline({ onlyMedia }, true));
  };

  const handleRefresh = () => dispatch(fetchBubbleTimeline({ onlyMedia }, true));

  useBubbleStream({ onlyMedia, enabled: features.bubbleTimelineStreaming });

  useEffect(() => {
    dispatch(fetchBubbleTimeline({ onlyMedia }));
  }, [onlyMedia]);

  return (
    <Column className='-mt-3 sm:mt-0' label={intl.formatMessage(messages.title)}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessageText={<FormattedMessage id='empty_column.bubble' defaultMessage='There is nothing here! Write something publicly to fill it up' />}
          emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
        />
      </PullToRefresh>
    </Column>
  );
};

export { BubbleTimelinePage as default };
