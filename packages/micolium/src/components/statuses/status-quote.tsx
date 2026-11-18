import { ActivityIndicator, Card, Text } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useStatus } from '@/queries/statuses/use-status';

import { Status } from './status';

import type { FilterContext } from 'pl-api';

interface IStatusQuote {
  id: string;
  context?: FilterContext;
}

const StatusQuote: React.FC<IStatusQuote> = ({ id, ...props }) => {
  const { isPending, isError } = useStatus(id);

  return (
    <Card mode='outlined'>
      {isPending ? (
        <ActivityIndicator style={{ margin: 8 }} />
      ) : isError ? (
        <Text>
          <FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' />
        </Text>
      ) : (
        <Status id={id} withLink withActions={false} compact {...props} />
      )}
    </Card>
  );
};

export { StatusQuote };
