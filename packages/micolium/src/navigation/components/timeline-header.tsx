import { Appbar, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Alert, Platform } from 'react-native';
import { toast } from 'sonner-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { CreateListDialog } from '@/components/create-list-dialog';
import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { useDeleteAntenna } from '@/queries/accounts/use-antennas';
import { useDeleteCircle } from '@/queries/accounts/use-circles';
import { useDeleteList } from '@/queries/accounts/use-lists';

import { TimelinePicker, type ITimelinePicker } from './timeline-picker';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  announcements: { id: 'announcements.title', defaultMessage: 'Announcements' },
  deleteConfirm: { id: 'confirmations.delete_list.confirm', defaultMessage: 'Delete' },
  deleteListHeading: { id: 'confirmations.delete_list.heading', defaultMessage: 'Delete list' },
  deleteListMessage: {
    id: 'confirmations.delete_list.message',
    defaultMessage: 'Are you sure you want to permanently delete this list?',
  },
  deleteListSuccess: { id: 'lists.delete.success', defaultMessage: 'List deleted' },
  deleteListFail: { id: 'lists.delete.error', defaultMessage: 'Failed to delete list' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  deleteList: { id: 'lists.delete', defaultMessage: 'Delete list' },
  deleteAntennaHeading: {
    id: 'confirmations.delete_antenna.heading',
    defaultMessage: 'Delete antenna',
  },
  deleteAntennaMessage: {
    id: 'confirmations.delete_antenna.message',
    defaultMessage: 'Are you sure you want to permanently delete this antenna?',
  },
  deleteAntennaSuccess: { id: 'antennas.delete.success', defaultMessage: 'Antenna deleted' },
  deleteAntennaFail: { id: 'antennas.delete.error', defaultMessage: 'Failed to delete antenna' },
  editAntenna: { id: 'antennas.edit', defaultMessage: 'Edit antenna' },
  deleteAntenna: { id: 'antennas.delete', defaultMessage: 'Delete antenna' },
  deleteCircleHeading: {
    id: 'confirmations.delete_circle.heading',
    defaultMessage: 'Delete circle',
  },
  deleteCircleMessage: {
    id: 'confirmations.delete_circle.message',
    defaultMessage: 'Are you sure you want to permanently delete this circle?',
  },
  deleteCircleSuccess: { id: 'circles.delete.success', defaultMessage: 'Circle deleted' },
  deleteCircleFail: { id: 'circles.delete.error', defaultMessage: 'Failed to delete circle' },
  editCircle: { id: 'circles.edit', defaultMessage: 'Edit circle' },
  deleteCircle: { id: 'circles.delete', defaultMessage: 'Delete circle' },
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
  id: string;
  navigation: ITimelinePicker['navigation'];
}

const ListHeaderMenu: React.FC<IListHeaderMenu> = ({ type, id, navigation }) => {
  const intl = useIntl();

  const { mutate: deleteList } = useDeleteList();
  const { mutate: deleteAntenna } = useDeleteAntenna();
  const { mutate: deleteCircle } = useDeleteCircle();

  const [editDialog, setEditDialog] = React.useState(false);

  let deleteHeading;
  let deleteMessage;
  let deleteSuccess;
  let deleteFail;
  let editLabel;
  let deleteLabel;

  switch (type) {
    case 'antenna':
      deleteHeading = messages.deleteAntennaHeading;
      deleteMessage = messages.deleteAntennaMessage;
      deleteSuccess = messages.deleteAntennaSuccess;
      deleteFail = messages.deleteAntennaFail;
      editLabel = messages.editAntenna;
      deleteLabel = messages.deleteAntenna;
      break;
    case 'circle':
      deleteHeading = messages.deleteCircleHeading;
      deleteMessage = messages.deleteCircleMessage;
      deleteSuccess = messages.deleteCircleSuccess;
      deleteFail = messages.deleteCircleFail;
      editLabel = messages.editCircle;
      deleteLabel = messages.deleteCircle;
      break;
    case 'list':
      deleteHeading = messages.deleteListHeading;
      deleteMessage = messages.deleteListMessage;
      deleteSuccess = messages.deleteListSuccess;
      deleteFail = messages.deleteListFail;
      editLabel = messages.editList;
      deleteLabel = messages.deleteList;
      break;
  }

  const handleDelete = () => {
    Alert.alert(intl.formatMessage(deleteHeading), intl.formatMessage(deleteMessage), [
      {
        text: intl.formatMessage(messages.cancel),
        style: 'cancel',
      },
      {
        text: intl.formatMessage(messages.deleteConfirm),
        style: 'destructive',
        onPress: () =>
          ({ list: deleteList, antenna: deleteAntenna, circle: deleteCircle })[type](id, {
            onSuccess: () => {
              toast.success(intl.formatMessage(deleteSuccess));
              navigation.navigate('home');
            },
            onError: () => toast.error(intl.formatMessage(deleteFail)),
          }),
      },
    ]);
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <HeaderIconButton icon={Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item key='edit' onSelect={() => setEditDialog(true)}>
            <DropdownMenu.ItemIcon ios={{ name: 'pencil' }} androidIconName={'ph_pencil_simple'} />
            <DropdownMenu.ItemTitle>{intl.formatMessage(editLabel)}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key='delete' onSelect={handleDelete} destructive>
            <DropdownMenu.ItemIcon ios={{ name: 'trash' }} androidIconName={'ph_trash'} />
            <DropdownMenu.ItemTitle>{intl.formatMessage(deleteLabel)}</DropdownMenu.ItemTitle>
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
      <ListHeaderMenu
        type={route.name as IListHeaderMenu['type']}
        id={route.params.id as string}
        navigation={navigation as ITimelinePicker['navigation']}
      />
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
