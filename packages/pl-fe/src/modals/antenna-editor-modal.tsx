import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import { useAntenna, useCreateAntenna, useUpdateAntenna } from '@/queries/accounts/use-antennas';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

type Tab = 'info' | 'accounts' | 'excludedAccounts';

const messages = defineMessages({
  success: { id: 'antennas.edit.success', defaultMessage: 'Antenna updated successfully' },
  error: { id: 'antennas.edit.error', defaultMessage: 'Error updating antenna' },
});

interface IAntennaMembersForm {
  antennaId?: string;
}

const AntennaMembersForm: React.FC<IAntennaMembersForm> = () => null;

interface IEditAntennaForm {
  antennaId?: string;
  setAntennaId: (id: string | undefined) => void;
  onTabChange: (tab: Tab) => void;
}

const EditAntennaForm: React.FC<IEditAntennaForm> = ({ antennaId, onTabChange }) => {
  const intl = useIntl();

  const { data: antenna } = useAntenna(antennaId);
  const { mutate: updateAntenna, isPending: updateDisabled } = useUpdateAntenna(antennaId!);
  const { mutate: createAntenna, isPending: createDisabled } = useCreateAntenna();

  const disabled = antennaId ? updateDisabled : createDisabled;

  const [title, setTitle] = useState(antenna ? antenna.title : '');

  const handleSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    handleUpdate();
  };

  const handleUpdate = () => {
    (antennaId ? updateAntenna : createAntenna)({ title }, {
      onSuccess: () => {
        toast.success(intl.formatMessage(messages.success));
      },
      onError: () => {
        toast.error(intl.formatMessage(messages.error));
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        labelText={<FormattedMessage id='antennas.edit.title' defaultMessage='Antenna title' />}
      >
        <Input
          outerClassName='grow'
          type='text'
          value={title}
          onChange={(e) =>{
            setTitle(e.target.value);
          }}
        />
      </FormGroup>
      <FormActions>
        <Button onClick={handleUpdate} disabled={disabled}>
          {antennaId
            ? <FormattedMessage id='antennas.edit.save' defaultMessage='Save antenna' />
            : <FormattedMessage id='antennas.create.save' defaultMessage='Create antenna' />}
        </Button>
      </FormActions>
    </Form>
  );
};

interface AntennaEditorModalProps {
  antennaId?: string;
}

const AntennaEditorModal: React.FC<BaseModalProps & AntennaEditorModalProps> = ({ antennaId: initialAntennaId, onClose }) => {
  const [antennaId, setAntennaId] = useState<string | undefined>(initialAntennaId);
  const [tab, setTab] = useState<Tab>('info');

  const { isFetched } = useAntenna(antennaId);

  const onClickClose = () => {
    onClose('ANTENNA_EDITOR');
  };

  return (
    <Modal
      title={antennaId
        ? <FormattedMessage id='antennas.edit' defaultMessage='Edit antenna' />
        : <FormattedMessage id='antennas.create' defaultMessage='Create antenna' />}
      onClose={onClickClose}
      onBack={tab === 'info' ? undefined : () =>{
        setTab('info');
      }}
    >
      {isFetched ? (tab === 'info'
        ? <EditAntennaForm antennaId={antennaId} setAntennaId={setAntennaId} onTabChange={setTab} />
        : <AntennaMembersForm antennaId={antennaId} />
      ) : <Spinner />}
    </Modal>
  );
};

export { AntennaEditorModal as default, type AntennaEditorModalProps };
