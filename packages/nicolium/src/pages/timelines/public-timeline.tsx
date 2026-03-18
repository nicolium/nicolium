import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { PublicTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { TimelinePicker } from '@/components/timeline-picker';
import Accordion from '@/components/ui/accordion';
import Column from '@/components/ui/column';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  dismiss: { id: 'fediverse_tab.explanation_box.dismiss', defaultMessage: "Don't show again" },
});

const PublicTimelinePage = () => {
  const intl = useIntl();

  const instance = useInstance();
  const settings = useSettings();
  const items = useTimelineFiltersOptions('public');

  const explanationBoxExpanded = settings.explanationBox;
  const showExplanationBox = settings.showExplanationBox;

  const dismissExplanationBox = () => {
    changeSetting(['showExplanationBox'], false);
  };

  const toggleExplanationBox = (setting: boolean) => {
    changeSetting(['explanationBox'], setting);
  };

  return (
    <Column
      className='-mt-3 sm:mt-0'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='federated' />}
      truncateTitle={false}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} />}
    >
      {showExplanationBox && (
        <Accordion
          headline={
            <FormattedMessage
              id='fediverse_tab.explanation_box.title'
              defaultMessage='What is the Fediverse?'
            />
          }
          action={dismissExplanationBox}
          actionIcon={iconX}
          actionLabel={intl.formatMessage(messages.dismiss)}
          expanded={explanationBoxExpanded}
          onToggle={toggleExplanationBox}
        >
          <FormattedMessage
            id='fediverse_tab.explanation_box.explanation'
            defaultMessage={
              '{site_title} is part of the Fediverse, a social network made up of thousands of independent social media sites (aka "servers"). Here, you can see public posts from across the Fediverse, including other servers. Pay attention to the full username after the second @ symbol to know which server a post is from. To see only {site_title} posts, visit {local}.'
            }
            values={{
              site_title: instance.title,
              local: (
                <Link className='underline' to='/timeline/local'>
                  <FormattedMessage
                    id='empty_column.home.local_tab'
                    defaultMessage='the Local tab'
                  />
                </Link>
              ),
            }}
          />
        </Accordion>
      )}
      <PublicTimelineColumn
        emptyMessageText={
          <FormattedMessage
            id='empty_column.public'
            defaultMessage='There is nothing here! Write something publicly, or manually follow users from other servers to fill it up'
          />
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { PublicTimelinePage as default };
