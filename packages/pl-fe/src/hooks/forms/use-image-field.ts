import { useState } from 'react';

import { useSettings } from '@/stores/settings';
import resizeImage from '@/utils/resize-image';

import { usePreview } from './use-preview';

interface UseImageFieldOpts {
  /** Resize the image to the max dimensions, if defined. */
  maxPixels?: number;
  /** Fallback URL before a file is uploaded. */
  preview?: string;
}

/** Returns props for `<input type="file">`, and optionally resizes the file. */
const useImageField = (opts: UseImageFieldOpts = {}) => {
  const { stripMetadata } = useSettings();

  const [file, setFile] = useState<File | null>();
  const src = usePreview(file) || (file === null ? undefined : opts.preview);

  const onChange = async (files: FileList | null) => {
    const file = files?.item(0);
    if (!file) return;

    if (typeof opts.maxPixels === 'number') {
      setFile(await resizeImage(file, opts.maxPixels, stripMetadata));
    } else {
      setFile(file);
    }
  };

  const onClear = () => setFile(null);

  return {
    src,
    file,
    onChange,
    onClear,
  };
};

export { useImageField };
