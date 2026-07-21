import React from 'react';

import MissingIndicator from '@/components/missing-indicator';
import Layout from '@/components/ui/layout';

const GenericNotFoundPage: React.FC = () => (
  <Layout.Main>
    <MissingIndicator />
  </Layout.Main>
);

export { GenericNotFoundPage as default };
