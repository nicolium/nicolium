import React from 'react';

import Card, { CardBody } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';

const ColumnLoading = () => (
  <Card variant='rounded'>
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
);

export { ColumnLoading as default };
