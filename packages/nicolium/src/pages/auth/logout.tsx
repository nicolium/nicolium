import { Navigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';

import Spinner from '@/components/ui/spinner';
import { useAuthActions } from '@/stores/auth';

/** Component that logs the user out when rendered */
const LogoutPage: React.FC = () => {
  const { logOut } = useAuthActions();

  const [done, setDone] = useState(false);

  useEffect(() => {
    logOut()
      .then(() => {
        setDone(true);
      })
      .catch(console.warn);
  }, []);

  if (done) {
    return <Navigate to='/' />;
  } else {
    return <Spinner />;
  }
};

export { LogoutPage as default };
