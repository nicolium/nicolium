import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { LinkTimelineColumn } from '@/columns/timeline';
import { TimelineRefreshButton } from '@/components/timeline-refresh-button';
import Column from '@/components/ui/column';
import { linkTimelineRoute } from '@/router';

const messages = defineMessages({
  header: { id: 'column.link_timeline', defaultMessage: 'Posts linking to {url}' },
});

const LinkTimelinePage: React.FC = () => {
  const { url } = linkTimelineRoute.useParams();
  const decodedUrl = decodeURIComponent(url || '');

  const intl = useIntl();

  return (
    <Column
      label={intl.formatMessage(messages.header, { url: decodedUrl.replace(/^https?:\/\//, '') })}
      action={<TimelineRefreshButton timelineId={`link:${decodedUrl}`} />}
    >
      <LinkTimelineColumn
        url={decodedUrl}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.link_timeline'
            defaultMessage='There are no posts with this link yet.'
          />
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { LinkTimelinePage as default };
