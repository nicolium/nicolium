import React from 'react';
import { FormattedMessage } from 'react-intl';

import Shoutbox from '@/features/chats/components/shoutbox';

import Widget from '../ui/widget';

const ShoutboxPanel = () => {
  return (
    <Widget
      className='⁂-shoutbox-widget'
      title={<FormattedMessage id='chat_list_item_shoutbox' defaultMessage='{instance} shoutbox' />}
    >
      <Shoutbox widget />
    </Widget>
  );
};

export { ShoutboxPanel as default };
