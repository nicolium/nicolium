import React from 'react';

import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import { useSettings } from '@/stores/settings';

interface IPinnedHostsPicker {
  /** The active host among pinned hosts. */
  host?: string;
}

const PinnedHostsPicker: React.FC<IPinnedHostsPicker> = ({ host: activeHost }) => {
  const settings = useSettings();
  const pinnedHosts = settings.remote_timeline.pinnedHosts;

  if (!pinnedHosts.length) return null;

  return (
    <HStack className='mb-4 black:mx-2' space={2}>
      {pinnedHosts.map((host) => (
        <Button
          key={host}
          to='/timeline/$instance'
          params={{ instance: host }}
          size='sm'
          theme={host === activeHost ? 'accent' : 'secondary'}
        >
          {host}
        </Button>
      ))}
    </HStack>
  );
};

export { PinnedHostsPicker as default };
