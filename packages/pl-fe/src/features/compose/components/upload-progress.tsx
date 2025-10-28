import React from 'react';

import UploadProgress from 'pl-fe/components/upload-progress';
import { useCompose } from 'pl-fe/hooks/use-compose';

interface IComposeUploadProgress {
  composeId: string;
}

/** File upload progress bar for post composer. */
const ComposeUploadProgress: React.FC<IComposeUploadProgress> = ({ composeId }) => {
  const { isUploading, progress } = useCompose(composeId);

  if (!isUploading) {
    return null;
  }

  return (
    <UploadProgress progress={progress} />
  );
};

export { ComposeUploadProgress as default };
