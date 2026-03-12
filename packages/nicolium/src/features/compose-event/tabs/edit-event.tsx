import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { cancelEventCompose, initEventEdit, submitEvent } from '@/actions/events';
import { uploadFile } from '@/actions/media';
import { fetchStatus } from '@/actions/statuses';
import { ADDRESS_ICONS } from '@/components/autosuggest-location';
import LocationSearch from '@/components/location-search';
import AltIndicator from '@/components/media/alt-indicator';
import Button from '@/components/ui/button';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';
import ContentTypeButton from '@/features/compose/components/content-type-button';
import { isCurrentOrFutureDate } from '@/features/compose/components/schedule-form';
import { ComposeEditor, DatePicker } from '@/features/ui/util/async-components';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useInstance } from '@/hooks/use-instance';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useChangeUploadCompose, useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import UploadButton from '../components/upload-button';

import type { Location } from 'pl-api';

const messages = defineMessages({
  eventNamePlaceholder: { id: 'compose_event.fields.name_placeholder', defaultMessage: 'Name' },
  eventDescriptionPlaceholder: {
    id: 'compose_event.fields.description_placeholder',
    defaultMessage: 'Description',
  },
  eventStartTimePlaceholder: {
    id: 'compose_event.fields.start_time_placeholder',
    defaultMessage: 'Event begins on…',
  },
  eventEndTimePlaceholder: {
    id: 'compose_event.fields.end_time_placeholder',
    defaultMessage: 'Event ends on…',
  },
  resetLocation: { id: 'compose_event.reset_location', defaultMessage: 'Reset location' },
  eventFetchFail: {
    id: 'compose_event.fetch_fail',
    defaultMessage: 'Failed to fetch edited event information',
  },
  eventHeaderDescription: {
    id: 'compose_event.header_description',
    defaultMessage: 'Add header alt text.',
  },
  eventHeaderDescriptionPlaceholder: {
    id: 'compose_event.header_description_placeholder',
    defaultMessage: 'Event banner',
  },
});

interface IEditEvent {
  statusId: string | null;
}

const EditEvent: React.FC<IEditEvent> = ({ statusId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
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

    dispatch(
      uploadFile(
        files[0],
        intl,
        (data) => {
          setBanner(data);
          setIsUploading(false);
        },
        () => {
          setIsUploading(false);
        },
      ),
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

    dispatch(
      submitEvent({
        statusId,
        name,
        status: text,
        banner,
        startTime,
        endTime,
        joinMode: approvalRequired ? 'restricted' : 'free',
        location,
      }),
    )
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
      Promise.all([dispatch(initEventEdit(statusId)), dispatch(fetchStatus(statusId))])
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
      <div className='flex h-[38px] items-center gap-2 text-gray-700 dark:text-gray-500'>
        <Icon
          src={ADDRESS_ICONS[location.type] || require('@phosphor-icons/core/regular/map-pin.svg')}
        />
        <div className='flex grow flex-col'>
          <Text>{location.description}</Text>
          <Text theme='muted' size='xs'>
            {[location.street, location.locality, location.country]
              .filter((val) => val?.trim())
              .join(' · ')}
          </Text>
        </div>
        <IconButton
          title={intl.formatMessage(messages.resetLocation)}
          src={require('@phosphor-icons/core/regular/x.svg')}
          onClick={() => {
            onChangeLocation(null);
          }}
        />
      </div>
    );

  return (
    <Form className='⁂-edit-event' onSubmit={handleSubmit}>
      <FormGroup
        labelText={
          <FormattedMessage id='compose_event.fields.banner_label' defaultMessage='Event banner' />
        }
        hintText={
          <FormattedMessage
            id='compose_event.fields.banner_hint'
            defaultMessage='PNG, GIF or JPG. Landscape format is preferred.'
          />
        }
      >
        <div className='⁂-edit-event__banner__container'>
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
                src={require('@phosphor-icons/core/regular/x.svg')}
                onClick={handleClearBanner}
                title={intl.formatMessage(messages.resetLocation)}
              />
              <button
                type='button'
                className='absolute bottom-1 left-1'
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
          <FormattedMessage id='compose_event.fields.name_label' defaultMessage='Event name' />
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
            id='compose_event.fields.description_label'
            defaultMessage='Event description'
          />
        }
      >
        <div className='relative'>
          <ContentTypeButton composeId={composeId} />
          <ComposeEditor
            key={String(isDisabled)}
            placeholderClassName='⁂-compose-form__editor__placeholder'
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
            id='compose_event.fields.location_label'
            defaultMessage='Event location'
          />
        }
      >
        {location ? renderLocation() : <LocationSearch onSelected={onChangeLocation} />}
      </FormGroup>
      <FormGroup
        labelText={
          <FormattedMessage
            id='compose_event.fields.start_time_label'
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
      <div className='flex items-center gap-2'>
        <Toggle checked={!!endTime} onChange={onChangeHasEndTime} id='has-end-time-toggle' />
        <Text htmlFor='has-end-time-toggle' tag='label' theme='muted'>
          <FormattedMessage
            id='compose_event.fields.has_end_time'
            defaultMessage='This event has an end date'
          />
        </Text>
      </div>
      {endTime && (
        <FormGroup
          labelText={
            <FormattedMessage
              id='compose_event.fields.end_time_label'
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
        <div className='flex items-center gap-2'>
          <Toggle
            checked={approvalRequired}
            onChange={onChangeApprovalRequired}
            id='approval-required-toggle'
          />
          <Text htmlFor='approval-required-toggle' tag='label' theme='muted'>
            <FormattedMessage
              id='compose_event.fields.approval_required'
              defaultMessage='I want to approve participation requests manually'
            />
          </Text>
        </div>
      )}
      <FormActions>
        <Button disabled={isDisabled} theme='primary' type='submit'>
          {statusId ? (
            <FormattedMessage id='compose_event.update' defaultMessage='Update' />
          ) : (
            <FormattedMessage id='compose_event.create' defaultMessage='Create' />
          )}
        </Button>
      </FormActions>
    </Form>
  );
};

export { EditEvent };
