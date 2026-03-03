import React, { useCallback } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import MissingIndicator from '@/components/missing-indicator';
import StatusContent from '@/components/statuses/status-content';
import Icon from '@/components/ui/icon';
import { eventInformationRoute } from '@/features/ui/router';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useStatus } from '@/queries/statuses/use-status';
import { useModalsActions } from '@/stores/modals';

const EventInformationPage: React.FC = () => {
  const { statusId } = eventInformationRoute.useParams();

  const { data: status, isPending } = useStatus(statusId);

  const { openModal } = useModalsActions();
  const { tileServer } = useFrontendConfig();

  const handleShowMap: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();

    openModal('EVENT_MAP', {
      statusId: statusId,
    });
  };

  const renderEventLocation = useCallback(() => {
    if (!status?.event) return null;
    const event = status.event;
    if (!event.location) return null;

    const text = [<React.Fragment key='event-name'>{event.location.name}</React.Fragment>];

    if (event.location.street?.trim()) {
      text.push(
        <React.Fragment key='event-street'>
          <br />
          {event.location.street}
        </React.Fragment>,
      );
    }

    const address = [event.location.postal_code, event.location.locality, event.location.country]
      .filter((text) => text)
      .join(', ');

    if (address) {
      text.push(
        <React.Fragment key='event-address'>
          <br />
          {address}
        </React.Fragment>,
      );
    }

    if (tileServer && event.location.latitude) {
      text.push(
        <React.Fragment key='event-map'>
          <br />
          <a
            href='#'
            className='text-primary-600 hover:underline dark:text-primary-400'
            onClick={handleShowMap}
          >
            <FormattedMessage id='event.show_on_map' defaultMessage='Show on map' />
          </a>
        </React.Fragment>,
      );
    }

    return (
      event.location && (
        <div className='⁂-event-information__location'>
          <h2>
            <FormattedMessage id='event.location' defaultMessage='Location' />
          </h2>
          <div className='⁂-event-information__location__body'>
            <Icon src={require('@phosphor-icons/core/regular/map-pin.svg')} />
            <p>{text}</p>
          </div>
        </div>
      )
    );
  }, [status]);

  const renderEventDate = useCallback(() => {
    if (!status?.event) return null;
    const event = status.event;
    if (!event.start_time) return null;

    const startDate = new Date(event.start_time);
    const endDate = event.end_time && new Date(event.end_time);

    const sameDay =
      endDate &&
      startDate.getDate() === endDate.getDate() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear();

    return (
      <div className='⁂-event-information__date'>
        <h2>
          <FormattedMessage id='event.date' defaultMessage='Date' />
        </h2>
        <div className='⁂-event-information__date__body'>
          <Icon src={require('@phosphor-icons/core/regular/calendar-dots.svg')} />
          <p>
            <FormattedDate
              value={startDate}
              year='numeric'
              month='long'
              day='2-digit'
              weekday='long'
              hour='2-digit'
              minute='2-digit'
            />
            {endDate && (
              <>
                {' - '}
                <FormattedDate
                  value={endDate}
                  year={sameDay ? undefined : 'numeric'}
                  month={sameDay ? undefined : 'long'}
                  day={sameDay ? undefined : '2-digit'}
                  weekday={sameDay ? undefined : 'long'}
                  hour='2-digit'
                  minute='2-digit'
                />
              </>
            )}
          </p>
        </div>
      </div>
    );
  }, [status]);

  const renderLinks = useCallback(() => {
    if (!status?.event?.links?.length) return null;

    return (
      <div className='⁂-event-information__links'>
        <h2>
          <FormattedMessage id='event.website' defaultMessage='External links' />
        </h2>

        <ul>
          {status.event.links.map((link) => (
            <li key={link.id}>
              <Icon src={require('@phosphor-icons/core/regular/link-simple.svg')} />
              <a
                href={link.remote_url ?? link.url}
                className='text-primary-600 hover:underline dark:text-primary-400'
                target='_blank'
              >
                {(link.remote_url ?? link.url).replace(/^https?:\/\//, '')}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }, [status]);

  if (!status && isPending) {
    return <MissingIndicator />;
  } else if (!status) return null;

  return (
    <div className='⁂-event-information'>
      {!!status.content.trim() && (
        <div className='⁂-event-information__content'>
          <h2>
            <FormattedMessage id='event.description' defaultMessage='Description' />
          </h2>

          <StatusContent status={status} translatable withMedia />
        </div>
      )}

      {renderEventLocation()}

      {renderEventDate()}

      {renderLinks()}
    </div>
  );
};

export { EventInformationPage as default };
