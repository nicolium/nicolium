import React from 'react';

import MissingIndicator from 'pl-fe/components/missing-indicator';
import Layout from 'pl-fe/components/ui/layout';

const GenericNotFoundPage = () => (
  <Layout.Main>
    <MissingIndicator />
  </Layout.Main>
);

export { GenericNotFoundPage as default };
