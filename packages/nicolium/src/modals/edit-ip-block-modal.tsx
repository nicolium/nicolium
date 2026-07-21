import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Select from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { useCreateIpBlockMutation, useUpdateIpBlockMutation } from '@/queries/admin/use-ip-blocks';
import toast from '@/toast';

import type { BaseModalProps } from '@/modals/modal-root';
import type { AdminIpBlock } from 'pl-api';

const messages = defineMessages({
  updateSuccess: { id: 'admin.edit_ip_block.update.success', defaultMessage: 'IP block updated' },
  updateError: {
    id: 'admin.edit_ip_block.update.error',
    defaultMessage: 'Failed to update IP block',
  },
  createSuccess: { id: 'admin.edit_ip_block.create.success', defaultMessage: 'IP block created' },
  createError: {
    id: 'admin.edit_ip_block.create.error',
    defaultMessage: 'Failed to create IP block',
  },
  ipPlaceholder: {
    id: 'admin.edit_ip_block.fields.ip.placeholder',
    defaultMessage: '192.0.2.0/24',
  },
  commentPlaceholder: {
    id: 'admin.edit_ip_block.fields.comment.placeholder',
    defaultMessage: 'Only visible to admins',
  },
  expiresNever: { id: 'admin.edit_ip_block.fields.expires_in.never', defaultMessage: 'Never' },
  expiresDay: { id: 'admin.edit_ip_block.fields.expires_in.day', defaultMessage: '1 day' },
  expiresTwoWeeks: {
    id: 'admin.edit_ip_block.fields.expires_in.two_weeks',
    defaultMessage: '2 weeks',
  },
  expiresMonth: { id: 'admin.edit_ip_block.fields.expires_in.month', defaultMessage: '1 month' },
  expiresSixMonths: {
    id: 'admin.edit_ip_block.fields.expires_in.six_months',
    defaultMessage: '6 months',
  },
  expiresYear: { id: 'admin.edit_ip_block.fields.expires_in.year', defaultMessage: '1 year' },
  expiresThreeYears: {
    id: 'admin.edit_ip_block.fields.expires_in.three_years',
    defaultMessage: '3 years',
  },
});

const expiryOptions = [
  { value: 86400, message: messages.expiresDay },
  { value: 1209600, message: messages.expiresTwoWeeks },
  { value: 2629746, message: messages.expiresMonth },
  { value: 15778476, message: messages.expiresSixMonths },
  { value: 31556952, message: messages.expiresYear },
  { value: 94670856, message: messages.expiresThreeYears },
];

interface EditIpBlockModalProps {
  ipBlock?: AdminIpBlock;
}

const EditIpBlockModal: React.FC<BaseModalProps & EditIpBlockModalProps> = ({
  onClose,
  ipBlock,
}) => {
  const intl = useIntl();

  const [ip, setIp] = useState(ipBlock?.ip ?? '');
  const [severity, setSeverity] = useState<AdminIpBlock['severity']>(
    ipBlock?.severity ?? 'no_access',
  );
  const [comment, setComment] = useState(ipBlock?.comment ?? '');
  const [expiresIn, setExpiresIn] = useState('');

  const { mutate: createIpBlock } = useCreateIpBlockMutation();
  const { mutate: updateIpBlock } = useUpdateIpBlockMutation(ipBlock?.id || '');

  const onClickClose = () => {
    onClose('EDIT_IP_BLOCK');
  };

  const handleSubmit = () => {
    const params = {
      ip,
      severity,
      comment,
      expires_in: expiresIn ? Number(expiresIn) : undefined,
    };

    if (ipBlock) {
      updateIpBlock(params, {
        onSuccess: () => {
          toast.success(messages.updateSuccess);
          onClose('EDIT_IP_BLOCK');
        },
        onError: () => {
          toast.error(messages.updateError);
        },
      });
    } else {
      createIpBlock(params, {
        onSuccess: () => {
          toast.success(messages.createSuccess);
          onClose('EDIT_IP_BLOCK');
        },
        onError: () => {
          toast.error(messages.createError);
        },
      });
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={
        ipBlock ? (
          <FormattedMessage
            id='column.admin.edit_ip_block'
            defaultMessage='Edit {ip} block'
            values={{ ip: ipBlock.ip }}
          />
        ) : (
          <FormattedMessage id='column.admin.create_ip_block' defaultMessage='Create IP block' />
        )
      }
      confirmationAction={handleSubmit}
      confirmationText={<FormattedMessage id='admin.edit_ip_block.save' defaultMessage='Save' />}
      confirmationDisabled={!ip}
    >
      <Form>
        <FormGroup
          labelText={
            <FormattedMessage id='admin.edit_ip_block.fields.ip.label' defaultMessage='IP range' />
          }
        >
          <Input
            autoComplete='off'
            placeholder={intl.formatMessage(messages.ipPlaceholder)}
            value={ip}
            onChange={({ target }) => {
              setIp(target.value);
            }}
          />
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_ip_block.fields.severity.label'
              defaultMessage='Rule'
            />
          }
        >
          <Select
            value={severity}
            onChange={({ target }) => setSeverity(target.value as AdminIpBlock['severity'])}
          >
            <option value='sign_up_requires_approval'>
              <FormattedMessage
                id='admin.edit_ip_block.fields.severity.sign_up_requires_approval'
                defaultMessage='Require approval for sign-ups'
              />
            </option>
            <option value='sign_up_block'>
              <FormattedMessage
                id='admin.edit_ip_block.fields.severity.sign_up_block'
                defaultMessage='Block sign-ups'
              />
            </option>
            <option value='no_access'>
              <FormattedMessage
                id='admin.edit_ip_block.fields.severity.no_access'
                defaultMessage='Block access'
              />
            </option>
          </Select>
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_ip_block.fields.expires_in.label'
              defaultMessage='Expires after'
            />
          }
        >
          <Select value={expiresIn} onChange={({ target }) => setExpiresIn(target.value)}>
            <option value=''>
              <FormattedMessage
                id='admin.edit_ip_block.fields.expires_in.never'
                defaultMessage='Never'
              />
            </option>
            {expiryOptions.map(({ value, message }) => (
              <option key={value} value={value}>
                {intl.formatMessage(message)}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_ip_block.fields.comment.label'
              defaultMessage='Comment'
            />
          }
        >
          <Textarea
            placeholder={intl.formatMessage(messages.commentPlaceholder)}
            value={comment}
            onChange={({ target }) => setComment(target.value)}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { EditIpBlockModal as default, type EditIpBlockModalProps };
