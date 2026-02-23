import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import RelativeTimestamp from '@/components/relative-timestamp';
import ScrollableList from '@/components/scrollable-list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useFeatures } from '@/hooks/use-features';
import { useDeleteFilter, useFilters } from '@/queries/settings/use-filters';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.filters', defaultMessage: 'Muted words' },
  homeTimeline: { id: 'column.filters.home_timeline', defaultMessage: 'Home timeline' },
  publicTimeline: { id: 'column.filters.public_timeline', defaultMessage: 'Public timeline' },
  notifications: { id: 'column.filters.notifications', defaultMessage: 'Notifications' },
  conversations: { id: 'column.filters.conversations', defaultMessage: 'Conversations' },
  accounts: { id: 'column.filters.accounts', defaultMessage: 'Accounts' },
  deleteError: { id: 'column.filters.delete_error', defaultMessage: 'Error deleting filter' },
  edit: { id: 'column.filters.edit', defaultMessage: 'Edit filter' },
  delete: { id: 'column.filters.delete', defaultMessage: 'Delete' },
});

const contexts = {
  home: messages.homeTimeline,
  public: messages.publicTimeline,
  notifications: messages.notifications,
  thread: messages.conversations,
  account: messages.accounts,
};

const FiltersPage = () => {
  const intl = useIntl();
  const { filtersV2 } = useFeatures();

  const { data: filters = [] } = useFilters();
  const { mutate: deleteFilter } = useDeleteFilter();

  const handleFilterDelete = (id: string) => () => {
    deleteFilter(id, {
      onError: () => {
        toast.error(intl.formatMessage(messages.deleteError));
      },
    });
  };

  const emptyMessage = (
    <FormattedMessage id='empty_column.filters' defaultMessage="You haven't muted any word yet." />
  );

  return (
    <Column className='filter-settings-panel' label={intl.formatMessage(messages.heading)}>
      <HStack className='mb-4' space={2} justifyContent='end'>
        <Button to='/filters/$filterId' params={{ filterId: 'new' }} theme='primary' size='sm'>
          <FormattedMessage id='filters.create_filter' defaultMessage='Create filter' />
        </Button>
      </HStack>

      <ScrollableList
        scrollKey='filters'
        emptyMessageText={emptyMessage}
        itemClassName='pb-4 last:pb-0'
      >
        {filters.map((filter) => (
          <div key={filter.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
            <Stack space={2}>
              <Stack className='grow' space={1}>
                <Text weight='medium'>
                  <FormattedMessage
                    id='filters.filters_list_phrases_label'
                    defaultMessage='Keywords or phrases:'
                  />{' '}
                  <Text theme='muted' tag='span'>
                    {filter.keywords.map((keyword) => keyword.keyword).join(', ')}
                  </Text>
                </Text>
                <Text weight='medium'>
                  <FormattedMessage
                    id='filters.filters_list_context_label'
                    defaultMessage='Filter contexts:'
                  />{' '}
                  <Text theme='muted' tag='span'>
                    {filter.context
                      .map((context) =>
                        contexts[context] ? intl.formatMessage(contexts[context]) : context,
                      )
                      .join(', ')}
                  </Text>
                </Text>
                <HStack space={4} wrap>
                  <Text weight='medium'>
                    {filtersV2 ? (
                      filter.filter_action === 'hide' ? (
                        <FormattedMessage
                          id='filters.filters_list_hide_completely'
                          defaultMessage='Hide content'
                        />
                      ) : filter.filter_action === 'blur' ? (
                        <FormattedMessage
                          id='filters.filters_list_blur'
                          defaultMessage='Hide media with a warning'
                        />
                      ) : (
                        <FormattedMessage
                          id='filters.filters_list_warn'
                          defaultMessage='Display warning'
                        />
                      )
                    ) : filter.filter_action === 'hide' ? (
                      <FormattedMessage id='filters.filters_list_drop' defaultMessage='Drop' />
                    ) : (
                      <FormattedMessage id='filters.filters_list_hide' defaultMessage='Hide' />
                    )}
                  </Text>
                  {filter.expires_at && (
                    <Text weight='medium'>
                      {new Date(filter.expires_at).getTime() <= Date.now() ? (
                        <FormattedMessage
                          id='filters.filters_list_expired'
                          defaultMessage='Expired'
                        />
                      ) : (
                        <RelativeTimestamp
                          timestamp={filter.expires_at}
                          className='whitespace-nowrap'
                          futureDate
                        />
                      )}
                    </Text>
                  )}
                </HStack>
              </Stack>
              <HStack space={2} justifyContent='end'>
                <Button theme='primary' to='/filters/$filterId' params={{ filterId: filter.id }}>
                  {intl.formatMessage(messages.edit)}
                </Button>
                <Button theme='danger' onClick={handleFilterDelete(filter.id)}>
                  {intl.formatMessage(messages.delete)}
                </Button>
              </HStack>
            </Stack>
          </div>
        ))}
      </ScrollableList>
    </Column>
  );
};

export { FiltersPage as default };
