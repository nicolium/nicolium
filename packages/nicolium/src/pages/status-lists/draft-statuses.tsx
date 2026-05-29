import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import DraftStatus from '@/features/draft-statuses/components/draft-status';
import { useDraftStatusesQuery } from '@/queries/statuses/use-draft-statuses';

const messages = defineMessages({
  heading: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
});

const DraftStatusesPage = () => {
  const intl = useIntl();

  const { data: drafts = [] } = useDraftStatusesQuery((data) => Object.values(data));

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.draft_statuses'
      defaultMessage='You don’t have any draft posts yet. When you add one, it will show up here.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='draftStatuses'
        emptyMessageText={emptyMessage}
        listClassName='status-list'
      >
        {drafts.toReversed().map((draft) => (
          <DraftStatus key={draft.draft_id} draftStatus={draft} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { DraftStatusesPage as default };
