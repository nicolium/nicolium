import React from 'react';

import { ComposeForm } from '@/components/async-components';
import Widget from '@/components/ui/widget';

const ComposePanel: React.FC = () => {
  return (
    <Widget className='compose-panel'>
      <ComposeForm id='home' shouldCondense autoFocus={false} transparent compact />
    </Widget>
  );
};

export { ComposePanel as default };
