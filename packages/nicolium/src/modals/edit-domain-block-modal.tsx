import { AKKOMA, GOTOSOCIAL, PLEROMA, type AdminDomainBlock } from 'pl-api';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';
import Toggle from '@/components/ui/toggle';
import { useFeatures } from '@/hooks/use-features';
import {
  useCreateDomainBlockMutation,
  useUpdateDomainBlockMutation,
} from '@/queries/admin/use-domain-blocks';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  updateSuccess: {
    id: 'admin.edit_domain_block.update.success',
    defaultMessage: 'Domain block updated successfully',
  },
  updateError: {
    id: 'admin.edit_domain_block.update.error',
    defaultMessage: 'Failed to update domain block',
  },
  createSuccess: {
    id: 'admin.edit_domain_block.create.success',
    defaultMessage: 'Domain block created successfully',
  },
  createError: {
    id: 'admin.edit_domain_block.create.error',
    defaultMessage: 'Failed to create domain block',
  },
  save: { id: 'admin.edit_domain_block.save', defaultMessage: 'Save' },
  domainPlaceholder: {
    id: 'admin.edit_domain_block.fields.domain.placeholder',
    defaultMessage: 'Domain',
  },
  privateCommentPlaceholder: {
    id: 'admin.edit_domain_block.fields.private_comment.placeholder',
    defaultMessage: 'Only visible to admins',
  },
  publicCommentPlaceholder: {
    id: 'admin.edit_domain_block.fields.public_comment.placeholder',
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

  const features = useFeatures();

  const [domain, setDomain] = useState('');
  const [suspend, setSuspend] = useState(
    domainBlock ? domainBlock.severity === 'suspend' : features.version.software === GOTOSOCIAL,
  );
  const [silence, setSilence] = useState(domainBlock ? domainBlock.severity === 'silence' : true);
  const [rejectMedia, setRejectMedia] = useState(domainBlock?.reject_media ?? false);
  const [rejectReports, setRejectReports] = useState(domainBlock?.reject_reports ?? false);
  const [obfuscate, setObfuscate] = useState(domainBlock?.obfuscate ?? false);
  const [privateComment, setPrivateComment] = useState(domainBlock?.private_comment ?? '');
  const [publicComment, setPublicComment] = useState(domainBlock?.public_comment ?? '');

  const { mutate: createDomainBlock } = useCreateDomainBlockMutation();
  const { mutate: updateDomainBlock } = useUpdateDomainBlockMutation(domainBlock?.id || '');

  const onClickClose = () => {
    onClose('EDIT_DOMAIN_BLOCK');
  };

  const handleSubmit = () => {
    if (domainBlock) {
      updateDomainBlock(
        {
          severity: suspend ? 'suspend' : silence ? 'silence' : 'noop',
          reject_media: rejectMedia,
          reject_reports: rejectReports,
          obfuscate,
          private_comment: privateComment,
          public_comment: publicComment,
        },
        {
          onSuccess: () => {
            toast.success(intl.formatMessage(messages.updateSuccess));
            onClose('EDIT_DOMAIN_BLOCK');
          },
          onError: () => {
            toast.error(intl.formatMessage(messages.updateError));
          },
        },
      );
    } else {
      createDomainBlock(
        {
          domain,
          severity: suspend ? 'suspend' : silence ? 'silence' : 'noop',
          reject_media: rejectMedia,
          reject_reports: rejectReports,
          obfuscate,
          private_comment: privateComment,
          public_comment: publicComment,
        },
        {
          onSuccess: () => {
            toast.success(intl.formatMessage(messages.createSuccess));
            onClose('EDIT_DOMAIN_BLOCK');
          },
          onError: () => {
            toast.error(intl.formatMessage(messages.createError));
          },
        },
      );
    }
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
              <FormattedMessage
                id='admin.edit_domain_block.fields.domain.label'
                defaultMessage='Domain'
              />
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
          {features.version.software !== GOTOSOCIAL && !features.iceshrimpAdmin && (
            <>
              <ListItem
                label={
                  <FormattedMessage
                    id='admin.edit_domain_block.fields.suspend.label'
                    defaultMessage='Suspend'
                  />
                }
                hint={
                  <FormattedMessage
                    id='admin.edit_domain_block.fields.suspend.hint'
                    defaultMessage='When checked, all incoming data from this domain will be rejected'
                  />
                }
              >
                <Toggle
                  checked={suspend}
                  onChange={({ target }) => setSuspend(target.checked)}
                  disabled={silence}
                />
              </ListItem>
              <ListItem
                label={
                  <FormattedMessage
                    id='admin.edit_domain_block.fields.silence.label'
                    defaultMessage='Silence'
                  />
                }
                hint={
                  <FormattedMessage
                    id='admin.edit_domain_block.fields.silence.hint'
                    defaultMessage='When checked, incoming data from this domain will be accepted but hidden from users by default'
                  />
                }
              >
                <Toggle
                  checked={silence}
                  onChange={({ target }) => setSilence(target.checked)}
                  disabled={suspend}
                />
              </ListItem>
            </>
          )}
          {features.mastodonAdmin && (
            <ListItem
              label={
                <FormattedMessage
                  id='admin.edit_domain_block.fields.obfuscate.label'
                  defaultMessage='Obfuscate'
                />
              }
              hint={
                <FormattedMessage
                  id='admin.edit_domain_block.fields.obfuscate.hint'
                  defaultMessage='When checked, the domain name will be obfuscated in the public display'
                />
              }
            >
              <Toggle checked={obfuscate} onChange={({ target }) => setObfuscate(target.checked)} />
            </ListItem>
          )}
          {features.version.software !== GOTOSOCIAL && !features.iceshrimpAdmin && (
            <>
              <ListItem
                label={
                  <FormattedMessage
                    id='admin.edit_domain_block.fields.reject_media.label'
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
                    id='admin.edit_domain_block.fields.reject_reports.label'
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
            </>
          )}
        </List>
        {features.version.software !== PLEROMA &&
          features.version.software !== AKKOMA &&
          !features.iceshrimpAdmin && (
            <FormGroup
              labelText={
                <FormattedMessage
                  id='admin.edit_domain_block.fields.private_comment.label'
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
          )}
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_domain_block.fields.public_comment.label'
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
