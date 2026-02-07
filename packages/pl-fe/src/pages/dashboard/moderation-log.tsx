import React from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useModerationLog } from '@/queries/admin/use-moderation-log';

import type { AdminModerationLogEntry } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.moderation_log', defaultMessage: 'Moderation log' },
});

const ModerationLogPage = () => {
  const intl = useIntl();

  const {
    data,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = useModerationLog();

  const showLoading = isLoading && data.length === 0;

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='moderationLog'
        isLoading={isLoading}
        showLoading={showLoading}
        emptyMessageText={<FormattedMessage id='admin.moderation_log.empty_message' defaultMessage='You have not performed any moderation actions yet. When you do, a history will be shown here.' />}
        hasMore={hasNextPage}
        onLoadMore={handleLoadMore}
        listClassName='divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800'
      >
        {data.map(item => item && (
          <LogItem key={item.id} log={item} />
        ))}
      </ScrollableList>
    </Column>
  );
};

interface ILogItem {
  log: AdminModerationLogEntry;
}

const LogItem: React.FC<ILogItem> = ({ log }) => (
  <Stack space={2} className='p-4'>
    <Text>{log.message}</Text>

    <Text theme='muted' size='xs'>
      <FormattedDate
        value={new Date(log.time * 1000)}
        hour12
        year='numeric'
        month='short'
        day='2-digit'
        hour='numeric'
        minute='2-digit'
      />
    </Text>
  </Stack>
);

export { ModerationLogPage as default };
