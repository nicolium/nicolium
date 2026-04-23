import iconCalendarDot from '@phosphor-icons/core/regular/calendar-dot.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Text from '@/components/ui/text';

const NewEventPanel = () => (
  <div className='flex flex-col gap-2'>
    <div className='flex flex-col'>
      <Text size='lg' weight='bold'>
        <FormattedMessage id='new_event_panel.title' defaultMessage='Create new event' />
      </Text>

      <Text theme='muted' size='sm'>
        <FormattedMessage
          id='new_event_panel.subtitle'
          defaultMessage="Can't find what you're looking for? Schedule your own event."
        />
      </Text>
    </div>

    <Button icon={iconCalendarDot} theme='secondary' block to='/events/new'>
      <FormattedMessage id='new_event_panel.action' defaultMessage='Create event' />
    </Button>
  </div>
);

export { NewEventPanel as default };
