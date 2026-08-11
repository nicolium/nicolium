import React, { useCallback, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import OpenShockHookForm, {
  type OpenshockHook,
  type OpenShockHookFormHandle,
} from '@/components/openshock-hook-form';
import Modal from '@/components/ui/modal';

import type { BaseModalProps } from '@/modals/modal-root';

interface EditOpenShockHookModalProps {
  hook: OpenshockHook;
  index: number;
}

const EditOpenShockHookModal: React.FC<BaseModalProps & EditOpenShockHookModalProps> = ({
  hook,
  index,
  onClose,
}) => {
  const formRef = useRef<OpenShockHookFormHandle>(null);

  const handleClose = useCallback(() => {
    onClose('EDIT_OPENSHOCK_HOOK');
  }, [onClose]);

  const handleSave = useCallback(
    (nextHook: OpenshockHook) => {
      changeSetting(['openshock', 'hooks'], (hooks: OpenshockHook[] = []) =>
        hooks.map((existingHook, hookIndex) => (hookIndex === index ? nextHook : existingHook)),
      );
      handleClose();
    },
    [handleClose, index],
  );

  return (
    <Modal
      onClose={handleClose}
      title={
        <FormattedMessage
          id='integrations.openshock.edit_hook_form.title'
          defaultMessage='Edit hook'
        />
      }
    >
      <OpenShockHookForm ref={formRef} hook={hook} onSave={handleSave} />
    </Modal>
  );
};

export { EditOpenShockHookModal as default, type EditOpenShockHookModalProps };
