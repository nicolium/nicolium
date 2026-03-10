import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { pinHost, unpinHost } from '@/actions/remote-timeline';
import Widget from '@/components/ui/widget';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useRemoteInstance } from '@/selectors';
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
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const remoteInstance = useRemoteInstance(host);
  const pinned = settings.remote_timeline.pinnedHosts.includes(host);

  const handlePinHost = () => {
    if (!pinned) {
      dispatch(pinHost(host));
    } else {
      dispatch(unpinHost(host));
    }
  };

  if (!remoteInstance) return null;

  return (
    <Widget
      title={remoteInstance.host}
      onActionClick={handlePinHost}
      actionIcon={
        pinned
          ? require('@phosphor-icons/core/regular/push-pin-slash.svg')
          : require('@phosphor-icons/core/regular/push-pin.svg')
      }
      actionTitle={intl.formatMessage(pinned ? messages.unpinHost : messages.pinHost, { host })}
    />
  );
};

export { InstanceInfoPanel as default };
