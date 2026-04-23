import { useInstance } from '@/stores/instance';

import { useFeatures } from './use-features';

const useRegistrationStatus = () => {
  const instance = useInstance();
  const features = useFeatures();

  return {
    /** Registrations are open. */
    isOpen: features.accountCreation && instance.registrations.enabled,
  };
};

export { useRegistrationStatus };
