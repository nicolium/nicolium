import React from 'react';

import Card, { CardBody } from '@/components/ui/card';

interface IBigCard {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

const BigCard: React.FC<IBigCard> = ({ title, subtitle, children }) => (
  <Card variant='rounded' size='xl'>
    <CardBody>
      <div className='⁂-big-card__header'>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className='⁂-big-card__body'>
        {children}
      </div>
    </CardBody>
  </Card>
);

export { BigCard };
