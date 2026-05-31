import iconUploadSimple from '@phosphor-icons/core/regular/upload-simple.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import ProgressBar from '@/components/ui/progress-bar';

interface IUploadProgress {
  /** Number between 0 and 100 to represent the percentage complete. */
  progress: number;
}

/** Displays a progress bar for uploading files. */
const UploadProgress: React.FC<IUploadProgress> = ({ progress }) => (
  <div className='upload-progress'>
    <Icon src={iconUploadSimple} />

    <div className='upload-progress__bar'>
      <p>
        <FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />
      </p>

      <ProgressBar progress={progress / 100} size='sm' />
    </div>
  </div>
);

export { UploadProgress as default };
