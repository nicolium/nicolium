import { DotsThreeVerticalIcon } from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Appbar, Menu } from 'react-native-paper';

import { iconHelper } from '@/components/ui/icon';

import { TimelinePicker, type ITimelinePicker } from './timeline-picker';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  announcements: { id: 'announcements.title', defaultMessage: 'Announcements' },
});

const TimelineHeader = ({ navigation, route }: NativeStackHeaderProps) => {
  const intl = useIntl();
  const [showMenu, setShowMenu] = React.useState(false);

  const activeKey =
    route.params && 'id' in route.params ? `${route.name}:${route.params.id}` : route.name;

  return (
    <Appbar.Header>
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
            icon={iconHelper(DotsThreeVerticalIcon)}
            onPress={() => setShowMenu((value) => !value)}
          />
        }
        anchorPosition='bottom'
      >
        <Menu.Item
          onPress={() => navigation.navigate('settings' as never)}
          title={intl.formatMessage(messages.settings)}
        />
        <Menu.Item onPress={() => {}} title={intl.formatMessage(messages.announcements)} />
        {/* <Menu.Item onPress={() => {}} title='Edit timelines' /> */}
      </Menu>
    </Appbar.Header>
  );
};

export { TimelineHeader };
