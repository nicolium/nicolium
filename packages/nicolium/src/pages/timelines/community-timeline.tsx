import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { PublicTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { TimelinePicker } from '@/components/timeline-picker';
import Column from '@/components/ui/column';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';

const messages = defineMessages({
  title: { id: 'column.community', defaultMessage: 'Local timeline' },
});

const CommunityTimelinePage = () => {
  const items = useTimelineFiltersOptions('public');
  const intl = useIntl();

  return (
    <Column
      className='-mt-3 sm:mt-0'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='local' />}
      truncateTitle={false}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />}
    >
      <PublicTimelineColumn
        local
        emptyMessageText={
          <FormattedMessage
            id='empty_column.community'
            defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!'
          />
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { CommunityTimelinePage as default };
