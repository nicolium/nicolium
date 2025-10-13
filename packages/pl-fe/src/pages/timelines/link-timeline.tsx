import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { clearTimeline, fetchLinkTimeline } from 'pl-fe/actions/timelines';
import Column from 'pl-fe/components/ui/column';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

const messages = defineMessages({
  header: { id: 'column.link_timeline', defaultMessage: 'Posts linking to {url}' },
});

interface ILinkTimelinePage {
  params?: {
    url?: string;
  };
}

const LinkTimelinePage: React.FC<ILinkTimelinePage> = ({ params }) => {
  const url = decodeURIComponent(params?.url || '');

  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    dispatch(fetchLinkTimeline(url, true));
  };

  useEffect(() => {
    dispatch(clearTimeline(`link:${url}`));
    dispatch(fetchLinkTimeline(url));
  }, [url]);

  return (
    <Column
      label={intl.formatMessage(messages.header, { url: url.replace(/^https?:\/\//, '') })}
    >
      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey='link_timeline'
        timelineId={`link:${url}`}
        onLoadMore={handleLoadMore}
        emptyMessageText={<FormattedMessage id='empty_column.link_timeline' defaultMessage='There are no posts with this link yet.' />}
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { LinkTimelinePage as default };
