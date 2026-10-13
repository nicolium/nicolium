import { Appbar, useTheme } from '@mkljczk/react-native-paper';
import { DotsThreeIcon, DotsThreeVerticalIcon } from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

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

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Appbar.Action
            icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item key='settings' onSelect={() => navigation.navigate('settings')}>
            <DropdownMenu.ItemTitle>{intl.formatMessage(messages.settings)}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key='announcements' onSelect={() => {}}>
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(messages.announcements)}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Appbar.Header>
  );
};

export { TimelineHeader };
