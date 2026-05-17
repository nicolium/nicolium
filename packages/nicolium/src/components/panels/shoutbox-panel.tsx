import React from 'react';
import { FormattedMessage } from 'react-intl';

import Shoutbox from '@/features/chats/components/shoutbox';
import { useInstance } from '@/stores/instance';

import Widget from '../ui/widget';

const ShoutboxPanel = () => {
  const instance = useInstance();

  return (
    <Widget
      className='⁂-shoutbox-widget'
      title={
        <FormattedMessage
          id='chat_list_item_shoutbox'
          defaultMessage='{instance} shoutbox'
          values={{ instance: instance.title }}
        />
      }
      to='/chats/shoutbox'
    >
      <Shoutbox widget />
    </Widget>
  );
};

export { ShoutboxPanel as default };
