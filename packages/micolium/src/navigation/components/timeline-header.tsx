import { Appbar, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { CreateListDialog } from '@/components/create-list-dialog';
import { HeaderIconButton } from '@/components/ui/header-icon-button';

import { TimelinePicker, type ITimelinePicker } from './timeline-picker';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  announcements: { id: 'announcements.title', defaultMessage: 'Announcements' },
  deleteHeading: { id: 'confirmations.delete_list.heading', defaultMessage: 'Delete list' },
  deleteMessage: {
    id: 'confirmations.delete_list.message',
    defaultMessage: 'Are you sure you want to permanently delete this list?',
  },
  deleteConfirm: { id: 'confirmations.delete_list.confirm', defaultMessage: 'Delete' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  deleteList: { id: 'lists.delete', defaultMessage: 'Delete list' },
});

const TimelineHeaderMenu = () => {
  const intl = useIntl();
  const navigation = useNavigation('timeline');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <HeaderIconButton icon={Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          key='settings'
          onSelect={() =>
            navigation.navigate('settings', {
              screen: 'index',
            })
          }
        >
          <DropdownMenu.ItemTitle>{intl.formatMessage(messages.settings)}</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        <DropdownMenu.Item key='announcements' onSelect={() => {}}>
          <DropdownMenu.ItemTitle>
            {intl.formatMessage(messages.announcements)}
          </DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

interface IListHeaderMenu {
  type: 'list' | 'antenna' | 'circle';
}

const ListHeaderMenu: React.FC<IListHeaderMenu> = ({ type, id }) => {
  const intl = useIntl();

  const [editDialog, setEditDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <HeaderIconButton icon={Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item key='settings' onSelect={() => setEditDialog(true)}>
            <DropdownMenu.ItemIcon ios={{ name: 'pencil' }} androidIconName={'ph_pencil_simple'} />
            <DropdownMenu.ItemTitle>{intl.formatMessage(messages.editList)}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key='announcements' onSelect={() => {}} destructive>
            <DropdownMenu.ItemIcon ios={{ name: 'trash' }} androidIconName={'ph_trash'} />
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(messages.deleteList)}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {editDialog && (
        <CreateListDialog type={type} id={id} visible onDismiss={() => setEditDialog(false)} />
      )}
    </>
  );
};

const TimelineHeader = ({ navigation, route }: NativeStackHeaderProps) => {
  const { colors } = useTheme();

  const activeKey =
    route.params && 'id' in route.params ? `${route.name}:${route.params.id}` : route.name;

  const menu =
    route.params && 'id' in route.params && ['list', 'circle', 'antenna'].includes(route.name) ? (
      <ListHeaderMenu type={route.name} id={route.params.id} />
    ) : (
      <TimelineHeaderMenu />
    );

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

      {menu}
    </Appbar.Header>
  );
};

export { TimelineHeader };
