import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import DropdownMenu from 'pl-fe/components/dropdown-menu';
import List, { ListItem } from 'pl-fe/components/list';
import Card from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import { useAntennas } from 'pl-fe/queries/accounts/use-antennas';
import { useModalsActions } from 'pl-fe/stores/modals';

import { getOrderedLists } from './lists';

const messages = defineMessages({
  heading: { id: 'column.antennas', defaultMessage: 'Antennas' },
  subheading: { id: 'antennas.subheading', defaultMessage: 'Your antennas' },
  createAntenna: { id: 'antennas.new.create', defaultMessage: 'Add antenna' },
});

const AntennasPage: React.FC = () => {
  const intl = useIntl();

  const { openModal } = useModalsActions();

  const { data: antennas } = useAntennas(getOrderedLists);

  if (!antennas) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const items = [
    {
      text: intl.formatMessage(messages.createAntenna),
      action: () => openModal('ANTENNA_EDITOR', {}),
      icon: require('@phosphor-icons/core/regular/plus.svg'),
    },
  ];

  const emptyMessage = <FormattedMessage id='empty_column.antennas' defaultMessage="You don't have any antennas yet. When you create one, it will show up here." />;

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      action={<DropdownMenu items={items} src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')} />}
    >
      <Stack space={4}>
        {/* <NewListForm /> */}

        {!Object.keys(antennas).length ? (
          <Card variant='rounded' size='lg'>
            {emptyMessage}
          </Card>
        ) : (
          <List>
            {antennas.map((antenna: any) => (
              <ListItem
                key={antenna.id}
                to='/antennas/$antennaId'
                params={{ antennaId: antenna.id }}
                label={
                  <HStack alignItems='center' space={2}>
                    <Icon src={require('@phosphor-icons/core/regular/list-bullets.svg')} size={20} />
                    <span>{antenna.title}</span>
                  </HStack>
                }
              />
            ))}
          </List>
        )}
      </Stack>
    </Column>
  );
};

export { AntennasPage as default };
