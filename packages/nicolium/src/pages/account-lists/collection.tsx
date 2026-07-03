import React from 'react';

import CollectionColumn from '@/columns/collection';
import MissingIndicator from '@/components/missing-indicator';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useCollection } from '@/queries/accounts/use-collections';
import { collectionRoute } from '@/router';

const CollectionPage: React.FC = () => {
  const { collectionId } = collectionRoute.useParams();

  const { data: collection, isLoading } = useCollection(collectionId);

  if (isLoading) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (!collection) {
    return (
      <Column>
        <MissingIndicator />
      </Column>
    );
  }

  return (
    <Column label={collection.name} truncateTitle>
      <CollectionColumn collectionId={collectionId} />
    </Column>
  );
};

export { CollectionPage as default };
