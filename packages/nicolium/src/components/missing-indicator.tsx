import React from 'react';
import { FormattedMessage } from 'react-intl';

import Card, { CardBody } from '@/components/ui/card';

interface MissingIndicatorProps {
  nested?: boolean;
}

const MissingIndicator = ({ nested = false }: MissingIndicatorProps): React.JSX.Element => (
  <Card variant={nested ? undefined : 'rounded'} size='lg'>
    <CardBody>
      <div className='missing-indicator'>
        <p className='missing-indicator__label'>
          <FormattedMessage
            id='missing_indicator.label'
            tagName='strong'
            defaultMessage='Not found'
          />
        </p>

        <p className='missing-indicator__sublabel'>
          <FormattedMessage
            id='missing_indicator.sublabel'
            defaultMessage='This resource could not be found'
          />
        </p>
      </div>
    </CardBody>
  </Card>
);

export { MissingIndicator as default };
