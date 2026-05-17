import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { BubbleTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { TimelinePicker } from '@/components/timeline-picker';
import { TimelineRefreshButton } from '@/components/timeline-refresh-button';
import Column from '@/components/ui/column';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';

const messages = defineMessages({
  title: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
});

const BubbleTimelinePage = () => {
  const intl = useIntl();
  const items = useTimelineFiltersOptions('bubble', 'bubble');

  return (
    <Column
      className='-mt-3 sm:mt-0'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='bubble' />}
      truncateTitle={false}
      action={
        <>
          <TimelineRefreshButton timelineId='bubble' />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
    >
      <BubbleTimelineColumn
        emptyMessageText={
          <FormattedMessage
            id='empty_column.bubble'
            defaultMessage='There is nothing here! Write something publicly to fill it up'
          />
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { BubbleTimelinePage as default };
