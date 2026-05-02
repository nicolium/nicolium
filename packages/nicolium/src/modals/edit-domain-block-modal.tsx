import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Toggle from '@/components/ui/toggle';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { AdminDomainBlock } from 'pl-api';
import Textarea from '@/components/ui/textarea';

const messages = defineMessages({
  save: { id: 'admin.edit_domain_block.save', defaultMessage: 'Save' },
  domainPlaceholder: { id: 'admin.edit_domain_block.fields.domain_placeholder', defaultMessage: 'Domain' },
  privateCommentPlaceholder: {
    id: 'admin.edit_domain_block.fields.private_comment_placeholder',
    defaultMessage: 'Only visible to admins',
  },
  publicCommentPlaceholder: {
    id: 'admin.edit_domain_block.fields.public_comment_placeholder',
    defaultMessage: 'Visible on public block list',
  },
});

interface EditDomainBlockModalProps {
  domainBlock?: AdminDomainBlock;
}

const EditDomainBlockModal: React.FC<BaseModalProps & EditDomainBlockModalProps> = ({
  onClose,
  domainBlock,
}) => {
  const intl = useIntl();

  const [domain, setDomain] = useState('');
  const [suspend, setSuspend] = useState(domainBlock ? domainBlock.severity === 'suspend' : false);
  const [silence, setSilence] = useState(domainBlock ? domainBlock.severity === 'silence' : true);
  const [rejectMedia, setRejectMedia] = useState(domainBlock?.reject_media ?? false);
  const [rejectReports, setRejectReports] = useState(domainBlock?.reject_reports ?? false);
  const [obfuscate, setObfuscate] = useState(domainBlock?.obfuscate ?? false);
  const [privateComment, setPrivateComment] = useState(domainBlock?.private_comment ?? '');
  const [publicComment, setPublicComment] = useState(domainBlock?.public_comment ?? '');

  const onClickClose = () => {
    onClose('EDIT_DOMAIN_BLOCK');
  };

  const handleSubmit = () => {
    
  };

  return (
    <Modal
      onClose={onClickClose}
      title={
        domainBlock ? (
          <FormattedMessage
            id='column.admin.edit_domain_block'
            defaultMessage='Edit {domain} block'
            values={{ domain: domainBlock.domain }}
          />
        ) : (
          <FormattedMessage
            id='column.admin.create_domain_block'
            defaultMessage='Create domain block'
          />
        )
      }
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
    >
      <Form>
        {!domainBlock && (
          <FormGroup
            labelText={
              <FormattedMessage id='admin.edit_domain_block.fields.domain_label' defaultMessage='Domain' />
            }
          >
            <Input
              autoComplete='off'
              placeholder={intl.formatMessage(messages.domainPlaceholder)}
              value={domain}
              onChange={({ target }) => {
                setDomain(target.value);
              }}
            />
          </FormGroup>
        )}
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='admin.edit_domain_block.fields.suspend_label'
                defaultMessage='Suspend'
              />
            }
            hint={
              <FormattedMessage
                id='admin.edit_domain_block.fields.suspend_hint'
                defaultMessage='When checked, all incoming data from this domain will be rejected'
              />
            }
          >
            <Toggle checked={suspend} onChange={({ target }) => setSuspend(target.checked)} disabled={silence} />
          </ListItem>
          <ListItem
            label={
              <FormattedMessage
                id='admin.edit_domain_block.fields.silence_label'
                defaultMessage='Silence'
              />
            }
            hint={
              <FormattedMessage
                id='admin.edit_domain_block.fields.silence_hint'
                defaultMessage='When checked, incoming data from this domain will be accepted but hidden from users by default'
              />
            }
          >
            <Toggle checked={silence} onChange={({ target }) => setSilence(target.checked)} disabled={suspend} />
          </ListItem>
          <ListItem
            label={
              <FormattedMessage
                id='admin.edit_domain_block.fields.obfuscate_label'
                defaultMessage='Obfuscate'
              />
            }
            hint={
              <FormattedMessage
                id='admin.edit_domain_block.fields.obfuscate_hint'
                defaultMessage='When checked, the domain name will be obfuscated in the public display'
              />
            }
          >
            <Toggle checked={obfuscate} onChange={({ target }) => setObfuscate(target.checked)} />
          </ListItem>
          <ListItem
            label={
              <FormattedMessage
                id='admin.edit_domain_block.fields.reject_media_label'
                defaultMessage='Reject media'
              />
            }
          >
            <Toggle
              checked={rejectMedia}
              onChange={({ target }) => setRejectMedia(target.checked)}
              disabled={suspend}
            />
          </ListItem>
          <ListItem
            label={
              <FormattedMessage
                id='admin.edit_domain_block.fields.reject_reports_label'
                defaultMessage='Reject reports'
              />
            }
          >
            <Toggle
              checked={rejectReports}
              onChange={({ target }) => setRejectReports(target.checked)}
              disabled={suspend}
            />
          </ListItem>
        </List>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_domain_block.fields.private_comment_label'
              defaultMessage='Private comment'
            />
          }
        >
          <Textarea
            placeholder={intl.formatMessage(messages.privateCommentPlaceholder)}
            value={privateComment}
            onChange={({ target }) => setPrivateComment(target.value)}
          />
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_domain_block.fields.public_comment_label'
              defaultMessage='Public comment'
            />
          }
        >
          <Textarea
            placeholder={intl.formatMessage(messages.publicCommentPlaceholder)}
            value={publicComment}
            onChange={({ target }) => setPublicComment(target.value)}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { EditDomainBlockModal as default, type EditDomainBlockModalProps };
