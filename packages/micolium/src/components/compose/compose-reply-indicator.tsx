import { Card, Icon, IconButton, Text } from '@mkljczk/react-native-paper';
import { ArrowBendUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowBendUpLeft';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { useStatus } from '@/queries/statuses/use-status';
import { useCompose, useComposeActions } from '@/stores/compose';

import { Status } from '../statuses/status';
import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';

const ComposeReplyIndicator: React.FC<ICompose> = ({ composeId }) => {
  const { inReplyToId, editedId } = useCompose(composeId);
  const { updateCompose } = useComposeActions();
  const { data: status } = useStatus(inReplyToId || undefined);

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
        <Icon source={iconHelper(ArrowBendUpLeftIcon)} size={20} />
        <Text style={{ flex: 1 }}>
          <FormattedMessage
            id='compose.reply_indicator'
            defaultMessage='Reply to @{acct}'
            values={{ acct: status.account.acct }}
          />
        </Text>
        {!editedId && (
          <IconButton
            icon={iconHelper(XIcon)}
            style={{ margin: 0, marginRight: -8 }}
            onPress={() =>
              updateCompose(composeId, (draft) => {
                draft.inReplyToId = null;
              })
            }
            size={20}
          />
        )}
      </View>
      <View pointerEvents='none'>
        <Status id={inReplyToId!} compact withActions={false} textOnly style={{ paddingTop: 0 }} />
      </View>
    </Card>
  );
};

export { ComposeReplyIndicator };
