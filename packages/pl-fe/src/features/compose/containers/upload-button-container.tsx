import React from 'react';

import { useCompose, useUploadCompose } from '@/stores/compose';

import UploadButton from '../components/upload-button';

interface IUploadButtonContainer {
  composeId: string;
}

const UploadButtonContainer: React.FC<IUploadButtonContainer> = ({ composeId }) => {
  const { isUploading, resetFileKey } = useCompose(composeId);
  const uploadCompose = useUploadCompose(composeId);

  const onSelectFile = (files: FileList) => {
    uploadCompose(files);
  };

  return (
    <UploadButton disabled={isUploading} resetFileKey={resetFileKey} onSelectFile={onSelectFile} />
  );
};

export { UploadButtonContainer as default };
