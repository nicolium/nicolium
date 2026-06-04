import iconCheck from '@phosphor-icons/core/regular/check.svg';
import iconEyeSlash from '@phosphor-icons/core/regular/eye-slash.svg';
import iconImageBroken from '@phosphor-icons/core/regular/image-broken.svg';
import iconLockOpen from '@phosphor-icons/core/regular/lock-open.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useInstance } from '@/stores/instance';

import type { RemoteInstance } from '@/queries/instance/use-remote-instance';

const hasRestrictions = (remoteInstance: RemoteInstance): boolean => {
  const { accept, reject_deletes, report_removal, ...federation } = remoteInstance.federation;
  return !!Object.values(federation).reduce((acc, value) => Boolean(acc || value), false);
};

interface IRestriction {
  icon: string;
  children: React.ReactNode;
}

const Restriction: React.FC<IRestriction> = ({ icon, children }) => (
  <div className='instance-restrictions__item'>
    <Icon src={icon} />

    <p>{children}</p>
  </div>
);

interface IInstanceRestrictions {
  remoteInstance: RemoteInstance;
}

const InstanceRestrictions: React.FC<IInstanceRestrictions> = ({ remoteInstance }) => {
  const instance = useInstance();

  const renderRestrictions = () => {
    const items = [];

    const {
      avatar_removal,
      banner_removal,
      federated_timeline_removal,
      followers_only,
      media_nsfw,
      media_removal,
    } = remoteInstance.federation;

    const fullMediaRemoval = media_removal && avatar_removal && banner_removal;
    const partialMediaRemoval = media_removal || avatar_removal || banner_removal;

    if (followers_only) {
      items.push(
        <Restriction key='followersOnly' icon={iconLock}>
          <FormattedMessage
            id='federation_restriction.followers_only'
            defaultMessage='Hidden except to followers'
          />
        </Restriction>,
      );
    } else if (federated_timeline_removal) {
      items.push(
        <Restriction key='federatedTimelineRemoval' icon={iconLockOpen}>
          <FormattedMessage
            id='federation_restriction.federated_timeline_removal'
            defaultMessage='Fediverse timeline removal'
          />
        </Restriction>,
      );
    }

    if (fullMediaRemoval) {
      items.push(
        <Restriction key='fullMediaRemoval' icon={iconImageBroken}>
          <FormattedMessage
            id='federation_restriction.full_media_removal'
            defaultMessage='Full media removal'
          />
        </Restriction>,
      );
    } else if (partialMediaRemoval) {
      items.push(
        <Restriction key='partialMediaRemoval' icon={iconImageBroken}>
          <FormattedMessage
            id='federation_restriction.partial_media_removal'
            defaultMessage='Partial media removal'
          />
        </Restriction>,
      );
    }

    if (!fullMediaRemoval && media_nsfw) {
      items.push(
        <Restriction key='mediaNsfw' icon={iconEyeSlash}>
          <FormattedMessage
            id='federation_restriction.media_nsfw'
            defaultMessage='Attachments marked NSFW'
          />
        </Restriction>,
      );
    }

    return items;
  };

  const renderContent = () => {
    if (!instance || !remoteInstance) return null;

    const host = remoteInstance.host;
    const siteTitle = instance.title;

    if (remoteInstance.federation.reject) {
      return (
        <Restriction icon={iconX}>
          <FormattedMessage
            id='remote_instance.federation_panel.restricted.message'
            defaultMessage='{siteTitle} blocks all activities from {host}.'
            values={{ host, siteTitle }}
          />
        </Restriction>
      );
    } else if (hasRestrictions(remoteInstance)) {
      return (
        <>
          <Restriction icon={iconLock}>
            <FormattedMessage
              id='remote_instance.federation_panel.some_restrictions.message'
              defaultMessage='{siteTitle} has placed some restrictions on {host}.'
              values={{ host, siteTitle }}
            />
          </Restriction>

          {renderRestrictions()}
        </>
      );
    } else {
      return (
        <Restriction icon={iconCheck}>
          <FormattedMessage
            id='remote_instance.federation_panel.no_restrictions.message'
            defaultMessage='{siteTitle} has placed no restrictions on {host}.'
            values={{ host, siteTitle }}
          />
        </Restriction>
      );
    }
  };

  return <div className='instance-restrictions'>{renderContent()}</div>;
};

export { InstanceRestrictions as default };
