import iconMapPin from '@phosphor-icons/core/regular/map-pin.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { cancelEventCompose, initEventEdit, submitEvent } from '@/actions/events';
import { uploadFile } from '@/actions/media';
import { fetchStatus } from '@/actions/statuses';
import { ADDRESS_ICONS } from '@/components/autosuggest-location';
import LocationSearch from '@/components/location-search';
import AltIndicator from '@/components/media/alt-indicator';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Toggle from '@/components/ui/toggle';
import { useCurrentAccountContext } from '@/contexts/current-account-context';
import ContentTypeButton from '@/features/compose/components/content-type-button';
import { isCurrentOrFutureDate } from '@/features/compose/components/schedule-form';
import { ComposeEditor, DatePicker } from '@/features/ui/util/async-components';
import { useClient } from '@/hooks/use-client';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { backendUrl } from '@/stores/auth';
import { useChangeUploadCompose, useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import UploadButton from '../components/upload-button';

import type { Location } from 'pl-api';

const messages = defineMessages({
  eventNamePlaceholder: { id: 'compose_event.fields.name.placeholder', defaultMessage: 'Name' },
  eventDescriptionPlaceholder: {
    id: 'compose_event.fields.description.placeholder',
    defaultMessage: 'Description',
  },
  eventStartTimePlaceholder: {
    id: 'compose_event.fields.start_time.placeholder',
    defaultMessage: 'Event begins on…',
  },
  eventEndTimePlaceholder: {
    id: 'compose_event.fields.end_time.placeholder',
    defaultMessage: 'Event ends on…',
  },
  resetLocation: { id: 'compose_event.reset_location', defaultMessage: 'Reset location' },
  eventFetchFail: {
    id: 'compose_event.fetch.fail',
    defaultMessage: 'Failed to fetch edited event information',
  },
  eventHeaderDescription: {
    id: 'compose_event.header.description',
    defaultMessage: 'Add header alt text.',
  },
  eventHeaderDescriptionPlaceholder: {
    id: 'compose_event.header.description.placeholder',
    defaultMessage: 'Event banner',
  },
});

interface IEditEvent {
  statusId: string | null;
}

const EditEvent: React.FC<IEditEvent> = ({ statusId }) => {
  const intl = useIntl();
  const client = useClient();
  const accountOrInstanceUrl = useCurrentAccountContext().meUrl || backendUrl;
  const navigate = useNavigate();
  const { openModal } = useModalsActions();

  const composeId = statusId ? `compose-event-${statusId}` : 'compose-event';
  const { resetCompose } = useComposeActions();
  const changeUploadCompose = useChangeUploadCompose(composeId);

  const { data: status } = useMinimalStatus(statusId ?? undefined);
  const {
    pleroma: {
      metadata: { description_limit: descriptionLimit },
    },
  } = useInstance();

  const [name, setName] = useState(status?.event?.name ?? '');
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(
    status?.event?.start_time ? new Date(status.event.start_time) : new Date(),
  );
  const [endTime, setEndTime] = useState(
    status?.event?.end_time ? new Date(status.event.end_time) : null,
  );
  const [approvalRequired, setApprovalRequired] = useState(status?.event?.join_mode !== 'free');
  const [banner, setBanner] = useState(status?.event?.banner ?? null);
  const [location, setLocation] = useState<Location | null>(null);

  const [isDisabled, setIsDisabled] = useState(!!statusId);
  const [isUploading, setIsUploading] = useState(false);

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setName(target.value);
  };

  const onChangeStartTime = (date: Date | null) => {
    setStartTime(date ?? new Date());
  };

  const onChangeEndTime = (date: Date | null) => {
    setEndTime(date);
  };

  const onChangeHasEndTime: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    if (target.checked) {
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      setEndTime(endTime);
    } else setEndTime(null);
  };

  const onChangeApprovalRequired: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setApprovalRequired(target.checked);
  };

  const onChangeLocation = (location: Location | null) => {
    setLocation(location);
  };

  const handleFiles = (files: FileList) => {
    setIsUploading(true);

    uploadFile(
      client,
      files[0],
      intl,
      (data) => {
        setBanner(data);
        setIsUploading(false);
      },
      () => {
        setIsUploading(false);
      },
    );
  };

  const handleClearBanner = () => {
    setBanner(null);
  };

  const handleChangeDescriptionClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (!banner) return;

    openModal('ALT_TEXT', {
      media: banner,
      previousDescription: banner.description,
      previousPosition: [0, 0],
      descriptionLimit: descriptionLimit,
      onSubmit: (description: string, position: [number, number]) =>
        changeUploadCompose(banner.id, {
          description,
          focus: position
            ? `${((position[0] - 0.5) * 2).toFixed(2)},${((position[1] - 0.5) * -2).toFixed(2)}`
            : undefined,
        }).then((media) => setBanner(media || null)),
    });
  };

  const handleSubmit = () => {
    setIsDisabled(true);

    submitEvent({
      client,
      statusId,
      name,
      status: text,
      banner,
      startTime,
      endTime,
      joinMode: approvalRequired ? 'restricted' : 'free',
      location,
      accountOrInstanceUrl,
    })
      .then((status) => {
        if (status)
          navigate({
            to: '/@{$username}/events/$statusId',
            params: { username: status.account.acct, statusId: status.id },
          });
        resetCompose(composeId);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (statusId) {
      Promise.all([
        initEventEdit(client, statusId),
        fetchStatus(client, statusId, accountOrInstanceUrl),
      ])
        .then(([source, status]) => {
          if (!source || !status) throw new Error();

          setText(source.text);
          setLocation(source.location);

          setName(status?.event?.name ?? '');
          setStartTime(status?.event?.start_time ? new Date(status.event.start_time) : new Date());
          setEndTime(status?.event?.end_time ? new Date(status.event.end_time) : null);
          setApprovalRequired(status?.event?.join_mode !== 'free');
          setBanner(status?.media_attachments[0] || null);

          setIsDisabled(false);
        })
        .catch(() => {
          toast.error(messages.eventFetchFail);
        });
    }

    return () => {
      resetCompose(composeId);
      cancelEventCompose();
    };
  }, [statusId]);

  const renderLocation = () =>
    location && (
      <div className='edit-event__location'>
        <Icon src={ADDRESS_ICONS[location.type] || iconMapPin} />
        <div className='edit-event__location__text'>
          <p className='edit-event__location__name'>{location.description}</p>
          <p className='edit-event__location__address'>
            {[location.street, location.locality, location.country]
              .filter((val) => val?.trim())
              .join(' · ')}
          </p>
        </div>
        <IconButton
          title={intl.formatMessage(messages.resetLocation)}
          src={iconX}
          onClick={() => {
            onChangeLocation(null);
          }}
        />
      </div>
    );

  return (
    <Form className='edit-event' onSubmit={handleSubmit}>
      <FormGroup
        labelText={
          <FormattedMessage id='compose_event.fields.banner.label' defaultMessage='Event banner' />
        }
        hintText={
          <FormattedMessage
            id='compose_event.fields.banner.hint'
            defaultMessage='PNG, GIF or JPG. Landscape format is preferred.'
          />
        }
      >
        <div className='edit-event__banner__container'>
          {banner ? (
            <>
              <img
                src={banner.url}
                alt={
                  banner.description ||
                  intl.formatMessage(messages.eventHeaderDescriptionPlaceholder)
                }
              />
              <IconButton
                src={iconX}
                onClick={handleClearBanner}
                title={intl.formatMessage(messages.resetLocation)}
              />
              <button
                type='button'
                className='edit-event__banner__alt-button'
                onClick={handleChangeDescriptionClick}
                title={intl.formatMessage(messages.eventHeaderDescription)}
              >
                <AltIndicator warning={!banner.description} />
              </button>
            </>
          ) : (
            <UploadButton disabled={isUploading} onSelectFile={handleFiles} />
          )}
        </div>
      </FormGroup>
      <FormGroup
        labelText={
          <FormattedMessage id='compose_event.fields.name.label' defaultMessage='Event name' />
        }
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.eventNamePlaceholder)}
          value={name}
          onChange={onChangeName}
        />
      </FormGroup>
      <FormGroup
        labelText={
          <FormattedMessage
            id='compose_event.fields.description.label'
            defaultMessage='Event description'
          />
        }
      >
        <div className='edit-event__description'>
          <ContentTypeButton composeId={composeId} />
          <ComposeEditor
            key={String(isDisabled)}
            className='edit-event__editor'
            placeholderClassName='compose-form__editor__placeholder'
            composeId={composeId}
            placeholder={intl.formatMessage(messages.eventDescriptionPlaceholder)}
            handleSubmit={handleSubmit}
            onChange={setText}
          />
        </div>
      </FormGroup>
      <FormGroup
        labelText={
          <FormattedMessage
            id='compose_event.fields.location.label'
            defaultMessage='Event location'
          />
        }
      >
        {location ? renderLocation() : <LocationSearch onSelected={onChangeLocation} />}
      </FormGroup>
      <FormGroup
        labelText={
          <FormattedMessage
            id='compose_event.fields.start_time.label'
            defaultMessage='Event start date'
          />
        }
      >
        <DatePicker
          showTimeSelect
          dateFormat='MMMM d, yyyy h:mm aa'
          timeIntervals={15}
          wrapperClassName='react-datepicker-wrapper'
          placeholderText={intl.formatMessage(messages.eventStartTimePlaceholder)}
          filterDate={isCurrentOrFutureDate}
          selected={startTime}
          onChange={onChangeStartTime}
        />
      </FormGroup>
      <div className='edit-event__toggle'>
        <Toggle checked={!!endTime} onChange={onChangeHasEndTime} id='has-end-time-toggle' />
        <label htmlFor='has-end-time-toggle' className='edit-event__toggle__label'>
          <FormattedMessage
            id='compose_event.fields.has_end_time'
            defaultMessage='This event has an end date'
          />
        </label>
      </div>
      {endTime && (
        <FormGroup
          labelText={
            <FormattedMessage
              id='compose_event.fields.end_time.label'
              defaultMessage='Event end date'
            />
          }
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.eventEndTimePlaceholder)}
            filterDate={isCurrentOrFutureDate}
            selected={endTime}
            onChange={onChangeEndTime}
          />
        </FormGroup>
      )}
      {!statusId && (
        <div className='edit-event__toggle'>
          <Toggle
            checked={approvalRequired}
            onChange={onChangeApprovalRequired}
            id='approval-required-toggle'
          />
          <label htmlFor='approval-required-toggle' className='edit-event__toggle__label'>
            <FormattedMessage
              id='compose_event.fields.approval_required'
              defaultMessage='I want to approve participation requests manually'
            />
          </label>
        </div>
      )}
      <FormActions>
        <button type='submit' disabled={isDisabled}>
          {statusId ? (
            <FormattedMessage id='compose_event.update' defaultMessage='Update' />
          ) : (
            <FormattedMessage id='compose_event.create' defaultMessage='Create' />
          )}
        </button>
      </FormActions>
    </Form>
  );
};

export { EditEvent };
