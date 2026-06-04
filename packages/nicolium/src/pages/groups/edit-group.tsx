import iconLock from '@phosphor-icons/core/regular/lock.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import Textarea from '@/components/ui/textarea';
import { useImageField } from '@/hooks/forms/use-image-field';
import { useTextField } from '@/hooks/forms/use-text-field';
import AvatarPicker from '@/pages/settings/components/avatar-picker';
import HeaderPicker from '@/pages/settings/components/header-picker';
import { useGroupQuery, useUpdateGroupMutation } from '@/queries/groups/use-group';
import { editGroupRoute } from '@/router';
import { useInstance } from '@/stores/instance';
import toast from '@/toast';
import { unescapeHTML } from '@/utils/html';

import type { NicoliumResponse } from '@/api';

const messages = defineMessages({
  heading: { id: 'navigation_bar.edit_group', defaultMessage: 'Edit group' },
  groupNamePlaceholder: {
    id: 'manage_group.fields.name.placeholder',
    defaultMessage: 'Group name',
  },
  groupDescriptionPlaceholder: {
    id: 'manage_group.fields.description.placeholder',
    defaultMessage: 'Description',
  },
  groupSaved: { id: 'group.update.success', defaultMessage: 'Group saved' },
});

const EditGroup: React.FC = () => {
  const { groupId } = editGroupRoute.useParams();

  const intl = useIntl();
  const instance = useInstance();

  const { data: group, isLoading } = useGroupQuery(groupId);
  const { mutate: updateGroup, isPending: isUpdatePending } = useUpdateGroupMutation(groupId);

  const avatar = useImageField({
    maxPixels: 400 * 400,
    preview: group?.avatar_default === false ? group.avatar : undefined,
  });
  const header = useImageField({
    maxPixels: 1920 * 1080,
    preview: group?.header_default === false ? group.header : undefined,
  });

  const displayName = useTextField(group?.display_name);
  const note = useTextField(unescapeHTML(group?.note));

  const maxName = Number(instance.configuration.groups.max_characters_name);
  const maxNote = Number(instance.configuration.groups.max_characters_description);

  const attachmentTypes = instance.configuration.media_attachments.supported_mime_types
    ?.filter((type) => type.startsWith('image/'))
    .join(',');

  const handleSubmit = async () => {
    await updateGroup(
      {
        display_name: displayName.value,
        note: note.value,
        avatar: avatar.file === null ? '' : avatar.file,
        header: header.file === null ? '' : header.file,
      },
      {
        onSuccess() {
          toast.success(messages.groupSaved);
        },
        onError(error) {
          const response = (error as { response?: NicoliumResponse })?.response;
          const message = response?.json?.error;

          if (response?.status === 422 && typeof message !== 'undefined') {
            toast.error(message);
          }
        },
      },
    );
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <div className='profile-images'>
          <HeaderPicker accept={attachmentTypes} disabled={isUpdatePending} {...header} />
          <AvatarPicker accept={attachmentTypes} disabled={isUpdatePending} {...avatar} />
        </div>
        <FormGroup
          labelText={
            <FormattedMessage
              id='manage_group.fields.name.label_optional'
              defaultMessage='Group name'
            />
          }
          hintText={
            <FormattedMessage
              id='manage_group.fields.cannot_change.hint'
              defaultMessage='This cannot be changed after the group is created.'
            />
          }
        >
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
            maxLength={maxName}
            {...displayName}
            append={<Icon className='edit-group__locked-icon' src={iconLock} />}
            disabled
          />
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='manage_group.fields.description.label'
              defaultMessage='Description'
            />
          }
        >
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
            maxLength={maxNote}
            {...note}
          />
        </FormGroup>

        <FormActions>
          <button className='edit-group__submit' type='submit' disabled={isUpdatePending}>
            <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
          </button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { EditGroup as default };
