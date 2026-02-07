import React from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import Widget from '@/components/ui/widget';
import InstanceRestrictions from '@/features/federation-restrictions/components/instance-restrictions';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useOwnAccount } from '@/hooks/use-own-account';
import { makeGetRemoteInstance } from '@/selectors';
import { useModalsActions } from '@/stores/modals';

const getRemoteInstance = makeGetRemoteInstance();

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

  const { account } = useOwnAccount();
  const remoteInstance = useAppSelector(state => getRemoteInstance(state, host));

  const handleEditFederation = () => {
    openModal('EDIT_FEDERATION', { host });
  };

  const makeMenu = () => [{
    text: intl.formatMessage(messages.editFederation),
    action: handleEditFederation,
    icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
  }];

  const menu = makeMenu();

  return (
    <Widget
      title={<FormattedMessage id='remote_instance.federation_panel.heading' defaultMessage='Federation restrictions' />}
      action={account?.is_admin ? (
        <DropdownMenu items={menu} src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')} />
      ) : undefined}
    >
      <InstanceRestrictions remoteInstance={remoteInstance} />
    </Widget>
  );
};

export { InstanceModerationPanel as default };
