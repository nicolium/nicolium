import React from 'react';
import { FormattedMessage } from 'react-intl';

import { CollectionCard } from '@/components/collections/collection-card';
import { CollectionMenu } from '@/components/collections/collection-menu';
import { useRevokeCollection } from '@/components/collections/use-revoke-collection';

import type { Collection } from 'pl-api';

const CollectionNotification: React.FC<{ collection: Collection }> = ({ collection }) => {
  const confirmRevoke = useRevokeCollection(collection);

  return (
    <div className='collection-notification'>
      <CollectionCard
        collection={collection}
        sideContent={<CollectionMenu collection={collection} context='notifications' />}
      />
      {confirmRevoke && (
        <button type='button' className='collection-notification__revoke' onClick={confirmRevoke}>
          <FormattedMessage id='collections.revoke_inclusion' defaultMessage='Remove me' />
        </button>
      )}
    </div>
  );
};

export { CollectionNotification };
