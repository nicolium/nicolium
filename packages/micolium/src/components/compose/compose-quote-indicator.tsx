import { Card, Icon, IconButton, Text } from '@mkljczk/react-native-paper';
import { QuotesIcon } from 'phosphor-react-native/src/icons/Quotes';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { useStatus } from '@/queries/statuses/use-status';
import { useCompose, useComposeActions } from '@/stores/compose';

import { Status } from '../statuses/status';
import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';

const ComposeQuoteIndicator: React.FC<ICompose> = ({ composeId }) => {
  const { quoteId, editedId } = useCompose(composeId);
  const { updateCompose } = useComposeActions();
  const { data: status } = useStatus(quoteId || undefined);

  if (!status) return null;

  return (
    <Card mode='outlined'>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        <Icon source={iconHelper(QuotesIcon)} size={20} />
        <Text style={{ flex: 1 }}>
          <FormattedMessage
            id='compose.quote_indicator'
            defaultMessage='Quoting @{acct}'
            values={{ acct: status.account.acct }}
          />
        </Text>
        {!editedId && (
          <IconButton
            icon={iconHelper(XIcon)}
            style={{ margin: 0, marginRight: -8 }}
            onPress={() =>
              updateCompose(composeId, (draft) => {
                draft.quoteId = null;
              })
            }
            size={20}
          />
        )}
      </View>
      <View pointerEvents='none'>
        <Status id={quoteId!} compact withActions={false} textOnly style={{ paddingTop: 0 }} />
      </View>
    </Card>
  );
};

export { ComposeQuoteIndicator };
