import React from 'react';
import { FormattedMessage } from 'react-intl';

import Card, { CardBody } from '@/components/ui/card';
import Text from '@/components/ui/text';

interface MissingIndicatorProps {
  nested?: boolean;
}

const MissingIndicator = ({ nested = false }: MissingIndicatorProps): React.JSX.Element => (
  <Card variant={nested ? undefined : 'rounded'} size='lg'>
    <CardBody>
      <div className='flex flex-col gap-2'>
        <Text weight='medium' align='center' size='lg'>
          <FormattedMessage
            id='missing_indicator.label'
            tagName='strong'
            defaultMessage='Not found'
          />
        </Text>

        <Text theme='muted' align='center'>
          <FormattedMessage
            id='missing_indicator.sublabel'
            defaultMessage='This resource could not be found'
          />
        </Text>
      </div>
    </CardBody>
  </Card>
);

export { MissingIndicator as default };
