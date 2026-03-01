import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { importEntities } from '@/actions/importer';
import { expandTimelineSuccess } from '@/actions/timelines';
import Column from '@/components/ui/column';
import Timeline from '@/features/ui/components/timeline';
import { useAppDispatch } from '@/hooks/use-app-dispatch';

const messages = defineMessages({
  title: { id: 'column.test', defaultMessage: 'Test timeline' },
});

/**
 * List of mock statuses to display in the timeline.
 * These get embedded into the build, but only in this chunk, so it's okay.
 */
const MOCK_STATUSES: any[] = [
  require('@/__fixtures__/pleroma-status.json'),
  require('@/__fixtures__/pleroma-status-with-poll.json'),
  require('@/__fixtures__/pleroma-status-vertical-video-without-metadata.json'),
  require('@/__fixtures__/pleroma-status-with-poll-with-emojis.json'),
  require('@/__fixtures__/pleroma-quote-of-quote-post.json'),
];

const timelineId = 'test';
const onlyMedia = false;

const TestTimelinePage: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    importEntities({ statuses: MOCK_STATUSES });
    dispatch(expandTimelineSuccess(timelineId, MOCK_STATUSES, null, null, false));
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Timeline
        scrollKey={`${timelineId}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
        emptyMessageText={
          <FormattedMessage id='empty_column.test' defaultMessage='The test timeline is empty.' />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { TestTimelinePage as default };
