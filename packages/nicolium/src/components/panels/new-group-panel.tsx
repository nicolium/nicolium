import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { useModalsActions } from '@/stores/modals';

const NewGroupPanel = () => {
  const { openModal } = useModalsActions();

  const createGroup = () => {
    openModal('CREATE_GROUP');
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col'>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='new_group_panel.title' defaultMessage='Create group' />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage
            id='new_group_panel.subtitle'
            defaultMessage="Can't find what you're looking for? Start your own private or public group."
          />
        </Text>
      </div>

      <Button onClick={createGroup} theme='secondary' block>
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
      </Button>
    </div>
  );
};

export { NewGroupPanel as default };
