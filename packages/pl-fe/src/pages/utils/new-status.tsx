import { Navigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { useModalsActions } from 'pl-fe/stores/modals';

const NewStatusPage = () => {
  const { openModal } = useModalsActions();

  useEffect(() => {
    openModal('COMPOSE');
  }, []);

  return (
    <Navigate to='/' replace />
  );
};

export { NewStatusPage as default };
