import React from 'react';

import Column from 'pl-fe/components/ui/column';

import { LogoText } from '../timelines/landing-timeline';

const LandingPage = () => {
  return (
    <Column withHeader={false}>
      <LogoText>
        pl-fe
      </LogoText>
    </Column>
  );
};

export { LandingPage as default };
