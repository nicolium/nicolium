import { Icon, IconButton, List as PaperList, useTheme } from '@mkljczk/react-native-paper';
import { ListDashesIcon } from 'phosphor-react-native/src/icons/ListDashes';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  useAddAccountsToList,
  useLists,
  useListsForAccount,
  useRemoveAccountsFromList,
} from '@/queries/accounts/use-lists';
import { haptics } from '@/utils/haptics';
import { getSegmentedMenuStyles } from '@/utils/themes';

import { CreateListDialog } from '../create-list-dialog';
import { DialogOrSheet } from '../ui/dialog-or-sheet';
import { Emoji } from '../ui/emoji';
import { iconHelper } from '../ui/icon';
import { List } from '../ui/list';

import type { List as ListEntity } from 'pl-api';
import type { StyleProp, ViewStyle } from 'react-native';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  title: { id: 'list_adder.header.title', defaultMessage: 'Add or remove from lists' },
  addList: { id: 'lists.new.create', defaultMessage: 'Add list' },
  removeAccount: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  addAccount: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

interface IUserList {
  accountId: string;
  list: ListEntity;
  added: boolean;
  style?: StyleProp<ViewStyle>;
}

const UserList: React.FC<IUserList> = ({ accountId, list, added, style }) => {
  const intl = useIntl();

  const { mutate: addToList } = useAddAccountsToList(list.id);
  const { mutate: removeFromList } = useRemoveAccountsFromList(list.id);

  return (
    <PaperList.Item
      left={(props) => (
        <PaperList.Icon
          {...props}
          icon={(props) =>
            list.emoji ? (
              <Emoji emoji={list.emoji} url={list.emoji_url || undefined} size={24} />
            ) : (
              <Icon {...props} source={ListDashesIcon} />
            )
          }
        />
      )}
      title={list.title}
      right={() => (
        <IconButton
          icon={iconHelper(added ? XIcon : PlusIcon)}
          mode={added ? 'contained-tonal' : 'outlined'}
          onPress={() => {
            (added ? removeFromList : addToList)([accountId]);
            haptics.selection();
          }}
          accessibilityLabel={intl.formatMessage(
            added ? messages.removeAccount : messages.addAccount,
          )}
        />
      )}
      key={list.id}
      style={style}
    />
  );
};

interface IAddToListDialog {
  accountId: string;
  visible: boolean;
  onDismiss: () => void;
}

const AddToListDialog: React.FC<IAddToListDialog> = ({ accountId, visible, onDismiss }) => {
  const theme = useTheme();
  const { data: accountListIds = [] } = useListsForAccount(accountId);
  const { data: lists } = useLists();

  const intl = useIntl();

  const [createListDialog, setCreateListDialog] = React.useState(false);

  return (
    <>
      <DialogOrSheet
        visible={visible}
        handleDismiss={onDismiss}
        actions={[
          null,
          {
            icon: 'checkmark',
            label: intl.formatMessage(messages.close),
            onPress: onDismiss,
            confirm: true,
          },
        ]}
        title={
          <FormattedMessage
            id='list_adder.header.title'
            defaultMessage='Add or remove from lists'
          />
        }
      >
        <PaperList.Subheader style={{ marginHorizontal: -16 }}>
          <FormattedMessage id='lists.subheading' defaultMessage='Your lists' />
        </PaperList.Subheader>
        <PaperList.Section>
          {lists?.map((list, index) => (
            <UserList
              key={list.id}
              accountId={accountId}
              list={list}
              added={accountListIds.includes(list.id)}
              style={getSegmentedMenuStyles(theme, false, index, lists.length, 'low')}
            />
          ))}
        </PaperList.Section>
        <List
          style={{ marginHorizontal: -16 }}
          sections={[
            {
              items: [
                {
                  type: 'button',
                  label: intl.formatMessage(messages.addList),
                  onPress: () => setCreateListDialog(true),
                  // icon: PlusIcon,
                },
              ],
            },
          ]}
          colorVariant='low'
        />
      </DialogOrSheet>
      {createListDialog && (
        <CreateListDialog
          type='list'
          visible
          onDismiss={() => setCreateListDialog(false)}
          backAction
        />
      )}
    </>
  );
};

export { AddToListDialog };
