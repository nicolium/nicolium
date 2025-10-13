import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchPublicTimeline } from 'pl-fe/actions/timelines';
import { useCommunityStream } from 'pl-fe/api/hooks/streaming/use-community-stream';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import Column from 'pl-fe/components/ui/column';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettings } from 'pl-fe/hooks/use-settings';

const messages = defineMessages({
  title: { id: 'column.community', defaultMessage: 'Local timeline' },
});

const CommunityTimelinePage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const onlyMedia = settings.timelines['public:local']?.other.onlyMedia ?? false;

  const timelineId = 'public:local';

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ onlyMedia, local: true }, true));
  };

  const handleRefresh = () => dispatch(fetchPublicTimeline({ onlyMedia, local: true }));

  useCommunityStream({ onlyMedia });

  useEffect(() => {
    dispatch(fetchPublicTimeline({ onlyMedia, local: true }));
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
          emptyMessageText={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
          emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
        />
      </PullToRefresh>
    </Column>
  );
};

export { CommunityTimelinePage as default };
