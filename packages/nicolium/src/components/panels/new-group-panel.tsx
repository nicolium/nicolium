import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useModalsActions } from '@/stores/modals';

const NewGroupPanel = () => {
  const { openModal } = useModalsActions();

  const createGroup = () => {
    openModal('CREATE_GROUP');
  };

  return (
    <div className='new-group-panel'>
      <div className='new-group-panel__content'>
        <p className='new-group-panel__heading'>
          <FormattedMessage id='new_group_panel.title' defaultMessage='Create group' />
        </p>

        <p className='new-group-panel__text'>
          <FormattedMessage
            id='new_group_panel.subtitle'
            defaultMessage="Can't find what you're looking for? Start your own private or public group."
          />
        </p>
      </div>

      <button onClick={createGroup}>
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
      </button>
    </div>
  );
};

export { NewGroupPanel as default };
