import React from 'react';

import Button from '@/components/ui/button';
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
    <div className='mb-4 flex gap-2 black:mx-2'>
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
    </div>
  );
};

export { PinnedHostsPicker as default };
