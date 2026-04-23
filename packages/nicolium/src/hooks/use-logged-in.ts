import { useCurrentAccount } from '@/contexts/current-account-context';
const useLoggedIn = () => {
  const me = useCurrentAccount();

  return {
    isLoggedIn: typeof me === 'string',
    me,
  };
};

export { useLoggedIn };
