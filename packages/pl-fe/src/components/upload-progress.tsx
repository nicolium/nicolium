import React from 'react';
import { FormattedMessage } from 'react-intl';

import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import ProgressBar from '@/components/ui/progress-bar';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';

interface IUploadProgress {
  /** Number between 0 and 100 to represent the percentage complete. */
  progress: number;
}

/** Displays a progress bar for uploading files. */
const UploadProgress: React.FC<IUploadProgress> = ({ progress }) => (
  <HStack alignItems='center' space={2}>
    <Icon
      src={require('@phosphor-icons/core/regular/upload-simple.svg')}
      className='size-7 text-gray-500'
    />

    <Stack space={1}>
      <Text theme='muted'>
        <FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />
      </Text>

      <ProgressBar progress={progress / 100} size='sm' />
    </Stack>
  </HStack>
);

export { UploadProgress as default };
