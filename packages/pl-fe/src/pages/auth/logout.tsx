import { Navigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { logOut } from '@/actions/auth';
import Spinner from '@/components/ui/spinner';

/** Component that logs the user out when rendered */
const LogoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const [done, setDone] = useState(false);

  useEffect(() => {
    dispatch(logOut() as any)
      .then(() =>{
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
