import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';

const NewEventPanel = () => (
  <Stack space={2}>
    <Stack>
      <Text size='lg' weight='bold'>
        <FormattedMessage id='new_event_panel.title' defaultMessage='Create new event' />
      </Text>

      <Text theme='muted' size='sm'>
        <FormattedMessage id='new_event_panel.subtitle' defaultMessage="Can't find what you're looking for? Schedule your own event." />
      </Text>
    </Stack>

    <Button
      icon={require('@phosphor-icons/core/regular/calendar-dot.svg')}
      theme='secondary'
      block
      to='/events/new'
    >
      <FormattedMessage id='new_event_panel.action' defaultMessage='Create event' />
    </Button>
  </Stack>
);

export { NewEventPanel as default };
