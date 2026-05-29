import iconCalendarDot from '@phosphor-icons/core/regular/calendar-dot.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';

const NewEventPanel = () => (
  <div className='new-event-panel'>
    <div className='new-event-panel__content'>
      <p className='new-event-panel__heading'>
        <FormattedMessage id='new_event_panel.title' defaultMessage='Create new event' />
      </p>

      <p className='new-event-panel__text'>
        <FormattedMessage
          id='new_event_panel.subtitle'
          defaultMessage='Can’t find what you’re looking for? Schedule your own event.'
        />
      </p>
    </div>

    <Link to='/events/new'>
      <Icon src={iconCalendarDot} aria-hidden />
      <FormattedMessage id='new_event_panel.action' defaultMessage='Create event' />
    </Link>
  </div>
);

export { NewEventPanel as default };
