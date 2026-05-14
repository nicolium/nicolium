import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import RelativeTimestamp from '@/components/relative-timestamp';
import ScrollableList from '@/components/scrollable-list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
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
  deleteSuccess: {
    id: 'column.filters.delete.success',
    defaultMessage: 'Filter deleted successfully',
  },
  deleteError: { id: 'column.filters.delete.error', defaultMessage: 'Error deleting filter' },
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
      onSuccess: () => {
        toast.success(messages.deleteSuccess);
      },
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
      <div className='mb-4 flex justify-end gap-2'>
        <Button to='/filters/$filterId' params={{ filterId: 'new' }} theme='primary' size='sm'>
          <FormattedMessage id='filters.create_filter' defaultMessage='Create filter' />
        </Button>
      </div>

      <ScrollableList
        scrollKey='filters'
        emptyMessageText={emptyMessage}
        itemClassName='pb-4 last:pb-0'
      >
        {filters.map((filter) => (
          <div key={filter.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
            <div className='flex flex-col gap-2'>
              <div className='flex grow flex-col gap-1'>
                <Text weight='medium'>
                  <FormattedMessage
                    id='filters.filters_list_phrases.label'
                    defaultMessage='Keywords or phrases:'
                  />{' '}
                  <Text theme='muted' tag='span'>
                    {filter.keywords.map((keyword) => keyword.keyword).join(', ')}
                  </Text>
                </Text>
                <Text weight='medium'>
                  <FormattedMessage
                    id='filters.filters_list_context.label'
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
                <div className='flex flex-wrap gap-4'>
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
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button theme='primary' to='/filters/$filterId' params={{ filterId: filter.id }}>
                  <FormattedMessage id='column.filters.edit' defaultMessage='Edit filter' />
                </Button>
                <Button theme='danger' onClick={handleFilterDelete(filter.id)}>
                  <FormattedMessage id='column.filters.delete' defaultMessage='Delete' />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </ScrollableList>
    </Column>
  );
};

export { FiltersPage as default };
