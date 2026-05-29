import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import RelativeTimestamp from '@/components/relative-timestamp';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
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
  deleteSuccess: { id: 'column.filters.delete.success', defaultMessage: 'Filter deleted' },
  deleteError: { id: 'column.filters.delete.error', defaultMessage: 'Failed to delete filter' },
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
      onSuccess: () => toast.success(messages.deleteSuccess),
      onError: () => toast.error(intl.formatMessage(messages.deleteError)),
    });
  };

  const emptyMessage = (
    <FormattedMessage id='empty_column.filters' defaultMessage="You haven't muted any word yet." />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='filters'>
        <Link to='/filters/$filterId' params={{ filterId: 'new' }}>
          <FormattedMessage id='filters.create_filter' defaultMessage='Create filter' />
        </Link>
      </div>

      <ScrollableList
        scrollKey='filters'
        emptyMessageText={emptyMessage}
        itemClassName='filter-card__container'
      >
        {filters.map((filter) => (
          <div key={filter.id} className='filter-card'>
            <div className='filter-card__body'>
              <div className='filter-card__meta'>
                <p>
                  <FormattedMessage
                    id='filters.filters_list_phrases.label'
                    defaultMessage='Keywords or phrases:'
                  />{' '}
                  <span>{filter.keywords.map((keyword) => keyword.keyword).join(', ')}</span>
                </p>
                <p>
                  <FormattedMessage
                    id='filters.filters_list_context.label'
                    defaultMessage='Filter contexts:'
                  />{' '}
                  <span>
                    {filter.context
                      .map((context) =>
                        contexts[context] ? intl.formatMessage(contexts[context]) : context,
                      )
                      .join(', ')}
                  </span>
                </p>
                <div className='filter-card__badges'>
                  <p>
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
                  </p>
                  {filter.expires_at && (
                    <p>
                      {new Date(filter.expires_at).getTime() <= Date.now() ? (
                        <FormattedMessage
                          id='filters.filters_list_expired'
                          defaultMessage='Expired'
                        />
                      ) : (
                        <RelativeTimestamp timestamp={filter.expires_at} futureDate />
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className='filter-card__actions'>
                <Link to='/filters/$filterId' params={{ filterId: filter.id }}>
                  <FormattedMessage id='column.filters.edit' defaultMessage='Edit filter' />
                </Link>
                <button onClick={handleFilterDelete(filter.id)}>
                  <FormattedMessage id='column.filters.delete' defaultMessage='Delete' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </ScrollableList>
    </Column>
  );
};

export { FiltersPage as default };
