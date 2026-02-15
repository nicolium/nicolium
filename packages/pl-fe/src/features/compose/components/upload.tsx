import React, { useCallback } from 'react';

import { undoUploadCompose, changeUploadCompose } from '@/actions/compose';
import Upload from '@/components/upload';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';
import { useInstance } from '@/hooks/use-instance';

interface IUploadCompose {
  id: string;
  composeId: string;
  onSubmit?(): void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
}

const UploadCompose: React.FC<IUploadCompose> = ({
  composeId,
  id,
  onSubmit,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) => {
  const dispatch = useAppDispatch();
  const {
    pleroma: {
      metadata: { description_limit: descriptionLimit },
    },
  } = useInstance();

  const media = useCompose(composeId).mediaAttachments.find((item) => item.id === id)!;

  const handleDescriptionChange = (description: string, position?: [number, number]) => {
    return dispatch(
      changeUploadCompose(composeId, media.id, {
        description,
        focus: position
          ? `${((position[0] - 0.5) * 2).toFixed(2)},${((position[1] - 0.5) * -2).toFixed(2)}`
          : undefined,
      }),
    );
  };

  const handleDelete = () => {
    dispatch(undoUploadCompose(composeId, media.id));
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
