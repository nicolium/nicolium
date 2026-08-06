import React, { useCallback } from 'react';

import Upload from '@/components/upload';
import { useChangeUploadCompose, useCompose, useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';

interface IUploadCompose {
  id: string;
  index: number;
  composeId: string;
  onSubmit?(): void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
}

const UploadCompose: React.FC<IUploadCompose> = ({
  composeId,
  id,
  index,
  onSubmit,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) => {
  const { updateCompose } = useComposeActions();
  const changeUploadCompose = useChangeUploadCompose(composeId);
  const {
    pleroma: {
      metadata: { description_limit: descriptionLimit },
    },
  } = useInstance();

  const media = useCompose(composeId).mediaAttachments.find((item) => item.id === id)!;

  const handleDescriptionChange = (description: string, position?: [number, number]) => {
    return changeUploadCompose(media.id, {
      description,
      focus: position
        ? `${((position[0] - 0.5) * 2).toFixed(2)},${((position[1] - 0.5) * -2).toFixed(2)}`
        : undefined,
    });
  };

  const handleDelete = () => {
    updateCompose(composeId, (draft) => {
      if (draft.mediaAttachments.length === 1) {
        draft.sensitive = false;
      }
      draft.mediaAttachments.splice(index, 1);
    });
  };

  const handleDragStart = useCallback(() => {
    onDragStart(id);
  }, [onDragStart, id]);

  const handleDragEnter = useCallback(() => {
    onDragEnter(id);
  }, [onDragEnter, id]);

  return (
    <Upload
      media={media}
      onDelete={handleDelete}
      onDescriptionChange={handleDescriptionChange}
      onSubmit={onSubmit}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragEnd={onDragEnd}
      descriptionLimit={descriptionLimit}
      withPreview
    />
  );
};

export { UploadCompose as default };
