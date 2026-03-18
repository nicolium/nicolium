import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import React from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import Widget from '@/components/ui/widget';
import InstanceRestrictions from '@/features/federation-restrictions/components/instance-restrictions';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useRemoteInstance } from '@/queries/instance/use-remote-instance';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  editFederation: { id: 'remote_instance.edit_federation', defaultMessage: 'Edit federation' },
});

interface IInstanceModerationPanel {
  /** Host (eg "gleasonator.com") of the remote instance to moderate. */
  host: string;
}

/** Widget for moderators to manage a remote instance. */
const InstanceModerationPanel: React.FC<IInstanceModerationPanel> = ({ host }) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const { data: account } = useOwnAccount();
  const remoteInstance = useRemoteInstance(host);

  const handleEditFederation = () => {
    openModal('EDIT_FEDERATION', { host });
  };

  const makeMenu = () => [
    {
      text: intl.formatMessage(messages.editFederation),
      action: handleEditFederation,
      icon: iconPencilSimple,
    },
  ];

  const menu = makeMenu();

  return (
    <Widget
      title={
        <FormattedMessage
          id='remote_instance.federation_panel.heading'
          defaultMessage='Federation restrictions'
        />
      }
      action={
        account?.is_admin ? <DropdownMenu items={menu} src={iconDotsThreeVertical} /> : undefined
      }
    >
      <InstanceRestrictions remoteInstance={remoteInstance} />
    </Widget>
  );
};

export { InstanceModerationPanel as default };
