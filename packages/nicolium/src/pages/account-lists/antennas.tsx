import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconListBullets from '@phosphor-icons/core/regular/list-bullets.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import List, { ListItem } from '@/components/list';
import Card from '@/components/ui/card';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import Spinner from '@/components/ui/spinner';
import { useAntennas } from '@/queries/accounts/use-antennas';
import { useModalsActions } from '@/stores/modals';

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
      action: () => {
        openModal('ANTENNA_EDITOR', {});
      },
      icon: iconPlus,
    },
  ];

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.antennas'
      defaultMessage="You don't have any antennas yet. When you create one, it will show up here."
    />
  );

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />}
    >
      <div className='flex flex-col gap-4'>
        {/* <NewListForm /> */}

        {!Object.keys(antennas).length ? (
          <Card variant='rounded' size='lg'>
            {emptyMessage}
          </Card>
        ) : (
          <List>
            {antennas.map((antenna) => (
              <ListItem
                key={antenna.id}
                to='/antennas/$antennaId'
                params={{ antennaId: antenna.id }}
                label={
                  <div className='flex items-center gap-2'>
                    <Icon src={iconListBullets} size={20} />
                    <span>{antenna.title}</span>
                  </div>
                }
              />
            ))}
          </List>
        )}
      </div>
    </Column>
  );
};

export { AntennasPage as default };
