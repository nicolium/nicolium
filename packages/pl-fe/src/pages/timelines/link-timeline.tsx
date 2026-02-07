import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { clearTimeline, fetchLinkTimeline } from '@/actions/timelines';
import Column from '@/components/ui/column';
import Timeline from '@/features/ui/components/timeline';
import { linkTimelineRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';

const messages = defineMessages({
  header: { id: 'column.link_timeline', defaultMessage: 'Posts linking to {url}' },
});

const LinkTimelinePage: React.FC = () => {
  const { url } = linkTimelineRoute.useParams();
  const decodedUrl = decodeURIComponent(url || '');

  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    dispatch(fetchLinkTimeline(decodedUrl, true));
  };

  useEffect(() => {
    dispatch(clearTimeline(`link:${decodedUrl}`));
    dispatch(fetchLinkTimeline(decodedUrl));
  }, [decodedUrl]);

  return (
    <Column
      label={intl.formatMessage(messages.header, { url: decodedUrl.replace(/^https?:\/\//, '') })}
    >
      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey='link_timeline'
        timelineId={`link:${decodedUrl}`}
        onLoadMore={handleLoadMore}
        emptyMessageText={<FormattedMessage id='empty_column.link_timeline' defaultMessage='There are no posts with this link yet.' />}
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { LinkTimelinePage as default };
