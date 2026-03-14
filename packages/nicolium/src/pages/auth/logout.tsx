import { Navigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';

import { logOut } from '@/actions/auth';
import Spinner from '@/components/ui/spinner';

/** Component that logs the user out when rendered */
const LogoutPage: React.FC = () => {
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
