import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchDraftStatuses } from 'pl-fe/actions/draft-statuses';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import DraftStatus from 'pl-fe/features/draft-statuses/components/draft-status';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const messages = defineMessages({
  heading: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
});

const DraftStatusesPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const drafts = useAppSelector((state) => state.draft_statuses);

  useEffect(() => {
    dispatch(fetchDraftStatuses());
  }, []);

  const emptyMessage = <FormattedMessage id='empty_column.draft_statuses' defaultMessage="You don't have any draft statuses yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='draftStatuses'
        emptyMessage={emptyMessage}
        listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
      >
        {Object.values(drafts).toReversed().map((draft) => <DraftStatus key={draft.draft_id} draftStatus={draft} />)}
      </ScrollableList>
    </Column>
  );
};

export { DraftStatusesPage as default };
