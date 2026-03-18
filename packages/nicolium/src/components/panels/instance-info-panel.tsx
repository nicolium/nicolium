import iconPushPinSlash from '@phosphor-icons/core/regular/push-pin-slash.svg';
import iconPushPin from '@phosphor-icons/core/regular/push-pin.svg';
import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import Widget from '@/components/ui/widget';
import { useRemoteInstance } from '@/queries/instance/use-remote-instance';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  pinHost: { id: 'remote_instance.pin_host', defaultMessage: 'Pin {host}' },
  unpinHost: { id: 'remote_instance.unpin_host', defaultMessage: 'Unpin {host}' },
});

interface IInstanceInfoPanel {
  /** Hostname (domain) of the remote instance, eg "gleasonator.com" */
  host: string;
}

/** Widget that displays information about a remote instance to users. */
const InstanceInfoPanel: React.FC<IInstanceInfoPanel> = ({ host }) => {
  const intl = useIntl();

  const settings = useSettings();
  const remoteInstance = useRemoteInstance(host);
  const pinnedHosts = settings.remote_timeline.pinnedHosts;
  const isPinned = pinnedHosts.includes(host);

  const pinHost = (host: string) => {
    changeSetting(['remote_timeline', 'pinnedHosts'], [...pinnedHosts, host]);
  };

  const unpinHost = (host: string) => {
    changeSetting(
      ['remote_timeline', 'pinnedHosts'],
      pinnedHosts.filter((value) => value !== host),
    );
  };

  const handlePinHost = () => {
    if (!isPinned) {
      pinHost(host);
    } else {
      unpinHost(host);
    }
  };

  if (!remoteInstance) return null;

  return (
    <Widget
      title={remoteInstance.host}
      onActionClick={handlePinHost}
      actionIcon={isPinned ? iconPushPinSlash : iconPushPin}
      actionTitle={intl.formatMessage(isPinned ? messages.unpinHost : messages.pinHost, { host })}
    />
  );
};

export { InstanceInfoPanel as default };
