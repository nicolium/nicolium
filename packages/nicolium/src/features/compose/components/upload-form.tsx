import React, { useCallback, useRef } from 'react';

import { useCompose, useComposeActions } from '@/stores/compose';

import Upload from './upload';
import UploadProgress from './upload-progress';

interface IUploadForm {
  composeId: string;
  onSubmit(): void;
}

const UploadForm: React.FC<IUploadForm> = ({ composeId, onSubmit }) => {
  const { updateCompose } = useComposeActions();

  const { isUploading, mediaAttachments } = useCompose(composeId);

  const mediaIds = mediaAttachments.map((item) => item.id);

  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleDragStart = useCallback(
    (id: string) => {
      dragItem.current = id;
    },
    [dragItem],
  );

  const handleDragEnter = useCallback(
    (id: string) => {
      dragOverItem.current = id;
    },
    [dragOverItem],
  );

  const handleDragEnd = useCallback(() => {
    updateCompose(composeId, (draft) => {
      const indexA = draft.mediaAttachments.findIndex((x) => x.id === dragItem.current!);
      const indexB = draft.mediaAttachments.findIndex((x) => x.id === dragOverItem.current!);
      const item = draft.mediaAttachments.splice(indexA, 1)[0];
      draft.mediaAttachments.splice(indexB, 0, item);
    });
    dragItem.current = null;
    dragOverItem.current = null;
  }, [dragItem, dragOverItem]);

  if (!isUploading && !mediaIds.length) return null;

  return (
    <div className='upload-form'>
      <UploadProgress composeId={composeId} />

      <div className='upload-form__list'>
        {mediaIds.map((id: string) => (
          <Upload
            id={id}
            key={id}
            composeId={composeId}
            onSubmit={onSubmit}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

export { UploadForm as default };
