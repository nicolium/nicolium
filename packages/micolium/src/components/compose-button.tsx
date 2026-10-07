import { FAB } from '@mkljczk/react-native-paper';
import { NotePencilIcon } from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useUiStoreActions } from '@/stores/ui';

import { iconHelper } from './ui/icon';

const messages = defineMessages({
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
});

interface IComposeButton {
  visible: boolean;
}

const ComposeButton: React.FC<IComposeButton> = ({ visible }) => {
  const intl = useIntl();

  const { openCompose } = useUiStoreActions();

  return (
    <FAB
      onPress={openCompose}
      icon={iconHelper(NotePencilIcon)}
      style={{
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
      }}
      visible={visible}
      aria-label={intl.formatMessage(messages.compose)}
    />
  );
};

export { ComposeButton };
