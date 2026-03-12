import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import ProgressBar from '@/components/ui/progress-bar';
import Text from '@/components/ui/text';

interface IUploadProgress {
  /** Number between 0 and 100 to represent the percentage complete. */
  progress: number;
}

/** Displays a progress bar for uploading files. */
const UploadProgress: React.FC<IUploadProgress> = ({ progress }) => (
  <div className='flex items-center gap-2'>
    <Icon
      src={require('@phosphor-icons/core/regular/upload-simple.svg')}
      className='size-7 text-gray-500'
    />

    <div className='flex flex-col gap-1'>
      <Text theme='muted'>
        <FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />
      </Text>

      <ProgressBar progress={progress / 100} size='sm' />
    </div>
  </div>
);

export { UploadProgress as default };
