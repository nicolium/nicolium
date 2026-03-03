import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { clearTimeline, fetchLinkTimeline } from '@/actions/timelines';
import { LinkTimelineColumn } from '@/columns/timeline';
import Column from '@/components/ui/column';
import Timeline from '@/features/ui/components/timeline';
import { linkTimelineRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  header: { id: 'column.link_timeline', defaultMessage: 'Posts linking to {url}' },
});

interface ILinkTimeline {
  url: string;
}

const LinkTimeline: React.FC<ILinkTimeline> = ({ url }) => {
  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    dispatch(fetchLinkTimeline(url, true));
  };

  useEffect(() => {
    dispatch(clearTimeline(`link:${url}`));
    dispatch(fetchLinkTimeline(url));
  }, [url]);

  return (
    <Timeline
      loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
      scrollKey='link_timeline'
      timelineId={`link:${url}`}
      onLoadMore={handleLoadMore}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.link_timeline'
          defaultMessage='There are no posts with this link yet.'
        />
      }
      emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
    />
  );
};

const LinkTimelinePage: React.FC = () => {
  const { url } = linkTimelineRoute.useParams();
  const decodedUrl = decodeURIComponent(url || '');

  const intl = useIntl();
  const { experimentalTimeline } = useSettings();

  return (
    <Column
      label={intl.formatMessage(messages.header, { url: decodedUrl.replace(/^https?:\/\//, '') })}
    >
      {experimentalTimeline ? (
        <LinkTimelineColumn url={decodedUrl} />
      ) : (
        <LinkTimeline url={decodedUrl} />
      )}
    </Column>
  );
};

export { LinkTimelinePage as default };
