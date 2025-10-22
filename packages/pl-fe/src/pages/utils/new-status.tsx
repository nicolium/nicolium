import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import { useModalsActions } from 'pl-fe/stores/modals';

const NewStatusPage = () => {
  const { openModal } = useModalsActions();

  useEffect(() => {
    openModal('COMPOSE');
  }, []);

  return (
    <Redirect to='/' />
  );
};

export { NewStatusPage as default };
