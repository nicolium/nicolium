import { Appbar, Menu, useTheme } from '@mkljczk/react-native-paper';
import { DotsThreeIcon, DotsThreeVerticalIcon } from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform } from 'react-native';

import { iconHelper } from '@/components/ui/icon';

import { TimelinePicker, type ITimelinePicker } from './timeline-picker';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  announcements: { id: 'announcements.title', defaultMessage: 'Announcements' },
});

const TimelineHeader = ({ navigation, route }: NativeStackHeaderProps) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const [showMenu, setShowMenu] = React.useState(false);

  const closeAfter = (callback: () => void) => () => {
    callback();
    setShowMenu(false);
  };

  const activeKey =
    route.params && 'id' in route.params ? `${route.name}:${route.params.id}` : route.name;

  return (
    <Appbar.Header
      style={{
        backgroundColor: colors.surfaceContainer,
      }}
    >
      <Appbar.Content
        title={
          <TimelinePicker
            navigation={navigation as ITimelinePicker['navigation']}
            active={activeKey as ITimelinePicker['active']}
          />
        }
      />

      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <Appbar.Action
            icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
            onPress={() => setShowMenu((value) => !value)}
          />
        }
        anchorPosition='bottom'
      >
        <Menu.Item
          onPress={closeAfter(() => navigation.navigate('settings' as never))}
          title={intl.formatMessage(messages.settings)}
        />
        <Menu.Item
          onPress={closeAfter(() => {})}
          title={intl.formatMessage(messages.announcements)}
        />
        {/* <Menu.Item onPress={() => {}} title='Edit timelines' /> */}
      </Menu>
    </Appbar.Header>
  );
};

export { TimelineHeader };
