import React from 'react';

import { uploadCompose } from '@/actions/compose';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';

import UploadButton from '../components/upload-button';

import type { IntlShape } from 'react-intl';

interface IUploadButtonContainer {
  composeId: string;
}

const UploadButtonContainer: React.FC<IUploadButtonContainer> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const { isUploading, resetFileKey } = useCompose(composeId);

  const onSelectFile = (files: FileList, intl: IntlShape) => {
    dispatch(uploadCompose(composeId, files, intl));
  };

  return (
    <UploadButton disabled={isUploading} resetFileKey={resetFileKey} onSelectFile={onSelectFile} />
  );
};

export { UploadButtonContainer as default };
