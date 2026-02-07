
import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchWrenchedTimeline } from '@/actions/timelines';
import PullToRefresh from '@/components/pull-to-refresh';
import Column from '@/components/ui/column';
import Timeline from '@/features/ui/components/timeline';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
});

const WrenchedTimelinePage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const onlyMedia = settings.timelines.wrenched?.other.onlyMedia ?? false;

  const timelineId = 'wrenched';

  const handleLoadMore = () => {
    dispatch(fetchWrenchedTimeline({ onlyMedia }, true));
  };

  const handleRefresh = () => dispatch(fetchWrenchedTimeline({ onlyMedia }, true));

  useEffect(() => {
    dispatch(fetchWrenchedTimeline({ onlyMedia }));
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
          emptyMessageText={<FormattedMessage id='empty_column.wrenched' defaultMessage='There is nothing here! 🔧 a public post to fill it up' />}
          emptyMessageIcon={require('@phosphor-icons/core/regular/wrench.svg')}
        />
      </PullToRefresh>
    </Column>
  );
};

export { WrenchedTimelinePage as default };
