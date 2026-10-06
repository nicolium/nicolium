import { FAB } from '@mkljczk/react-native-paper';
import { NotePencilIcon } from 'phosphor-react-native';

import { useUiStoreActions } from '@/stores/ui';

import { iconHelper } from './ui/icon';

const ComposeButton = () => {
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
    />
  );
};

export { ComposeButton };
