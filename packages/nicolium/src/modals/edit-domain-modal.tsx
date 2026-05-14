import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Toggle from '@/components/ui/toggle';
import { useDomains } from '@/queries/admin/use-domains';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { AdminDomain } from 'pl-api';

const messages = defineMessages({
  save: { id: 'admin.edit_domain.save', defaultMessage: 'Save' },
  domainPlaceholder: {
    id: 'admin.edit_domain.fields.domain.placeholder',
    defaultMessage: 'Domain name',
  },
  domainCreateSuccess: { id: 'admin.edit_domain.created', defaultMessage: 'Domain created' },
  domainUpdateSuccess: { id: 'admin.edit_domain.updated', defaultMessage: 'Domain edited' },
});

interface EditDomainModalProps {
  domainId?: string;
}

const EditDomainModal: React.FC<BaseModalProps & EditDomainModalProps> = ({
  onClose,
  domainId,
}) => {
  const intl = useIntl();

  const { data: domains, createDomain, isCreating, updateDomain, isUpdating } = useDomains();

  const [domain] = useState<AdminDomain | null>(
    domainId ? domains!.find(({ id }) => domainId === id)! : null,
  );
  const [domainName, setDomainName] = useState(domain?.domain ?? '');
  const [isPublic, setPublic] = useState(domain?.public ?? false);

  const onClickClose = () => {
    onClose('EDIT_DOMAIN');
  };

  const handleSubmit = () => {
    if (domainId) {
      updateDomain(
        {
          id: domainId,
          public: isPublic,
        },
        {
          onSuccess: () => {
            toast.success(messages.domainUpdateSuccess);
            onClose('EDIT_DOMAIN');
          },
        },
      );
    } else {
      createDomain(
        {
          domain: domainName,
          public: isPublic,
        },
        {
          onSuccess: () => {
            toast.success(messages.domainCreateSuccess);
            onClose('EDIT_DOMAIN');
          },
        },
      );
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={
        domainId ? (
          <FormattedMessage id='column.admin.edit_domain' defaultMessage='Edit domain' />
        ) : (
          <FormattedMessage id='column.admin.create_domain' defaultMessage='Create domain' />
        )
      }
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
      confirmationDisabled={isCreating || isUpdating}
    >
      <Form>
        <FormGroup
          labelText={
            <FormattedMessage id='admin.edit_domain.fields.domain.label' defaultMessage='Domain' />
          }
        >
          <Input
            autoComplete='off'
            placeholder={intl.formatMessage(messages.domainPlaceholder)}
            value={domainName}
            onChange={({ target }) => {
              setDomainName(target.value);
            }}
            disabled={!!domainId}
          />
        </FormGroup>
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='admin.edit_domain.fields.public.label'
                defaultMessage='Public'
              />
            }
            hint={
              <FormattedMessage
                id='admin.edit_domain.fields.public.hint'
                defaultMessage='When checked, everyone can sign up for a username with this domain'
              />
            }
          >
            <Toggle
              checked={isPublic}
              onChange={({ target }) => {
                setPublic(target.checked);
              }}
            />
          </ListItem>
        </List>
      </Form>
    </Modal>
  );
};

export { EditDomainModal as default, type EditDomainModalProps };
