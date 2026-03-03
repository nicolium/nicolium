import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchPublicTimeline } from '@/actions/timelines';
import { useCommunityStream } from '@/api/hooks/streaming/use-community-stream';
import { PublicTimelineColumn } from '@/columns/timeline';
import PullToRefresh from '@/components/pull-to-refresh';
import Column from '@/components/ui/column';
import Timeline from '@/features/ui/components/timeline';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.community', defaultMessage: 'Local timeline' },
});

interface ICommunityTimeline {
  onTimelineFailed?: () => void;
}

const CommunityTimeline: React.FC<ICommunityTimeline> = ({ onTimelineFailed }) => {
  const dispatch = useAppDispatch();
  const settings = useSettings();

  const onlyMedia = settings.timelines['public:local']?.other.onlyMedia ?? false;

  const timelineId = 'public:local';

  const handleLoadMore = () => {
    dispatch(
      fetchPublicTimeline({ onlyMedia, local: true }, true, undefined, () => {
        onTimelineFailed?.();
      }),
    );
  };

  const handleRefresh = () => dispatch(fetchPublicTimeline({ onlyMedia, local: true }, true));

  useCommunityStream({ onlyMedia });

  useEffect(() => {
    dispatch(fetchPublicTimeline({ onlyMedia, local: true }));
  }, [onlyMedia]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey={`${timelineId}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
        prefix='home'
        onLoadMore={handleLoadMore}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.community'
            defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!'
          />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </PullToRefresh>
  );
};

const CommunityTimelinePage = () => {
  const intl = useIntl();

  const { experimentalTimeline } = useSettings();

  return (
    <Column className='-mt-3 sm:mt-0' label={intl.formatMessage(messages.title)}>
      {experimentalTimeline ? <PublicTimelineColumn local /> : <CommunityTimeline />}
    </Column>
  );
};

export { CommunityTimeline, CommunityTimelinePage as default };
