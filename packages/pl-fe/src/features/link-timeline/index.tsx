import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { clearTimeline, fetchLinkTimeline } from 'pl-fe/actions/timelines';
import Column from 'pl-fe/components/ui/column';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useTheme } from 'pl-fe/hooks/use-theme';

const messages = defineMessages({
  header: { id: 'column.link_timeline', defaultMessage: 'Posts linking to {url}' },
});

interface ILinkTimeline {
  params?: {
    url?: string;
  };
}

const HashtagTimeline: React.FC<ILinkTimeline> = ({ params }) => {
  const url = decodeURIComponent(params?.url || '');

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useIsMobile();

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
      transparent={!isMobile}
    >
      <Timeline
        className='black:p-0 black:sm:p-4 black:sm:pt-0'
        loadMoreClassName='black:sm:mx-4'
        scrollKey='link_timeline'
        timelineId={`link:${url}`}
        onLoadMore={handleLoadMore}
        emptyMessage={<FormattedMessage id='empty_column.link_timeline' defaultMessage='There are no posts with this link yet.' />}
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export { HashtagTimeline as default };
