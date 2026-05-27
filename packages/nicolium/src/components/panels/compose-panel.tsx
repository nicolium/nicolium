import React from 'react';

import Widget from '@/components/ui/widget';
import { ComposeForm } from '@/features/ui/util/async-components';

const ComposePanel: React.FC = () => {
  return (
    <Widget className='compose-panel'>
      <ComposeForm id='home' shouldCondense autoFocus={false} transparent compact />
    </Widget>
  );
};

export { ComposePanel as default };
