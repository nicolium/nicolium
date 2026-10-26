import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { PickedFile } from '@/actions/media';

const DEFAULT_MAX_PIXELS = 7680 * 4320;

const getSaveFormat = (type: string) => {
  switch (type) {
    case 'image/png':
      return SaveFormat.PNG;
    case 'image/webp':
      return SaveFormat.WEBP;
    default:
      return SaveFormat.JPEG;
  }
};

/** Resize an image to the maximum number of pixels. */
const resize = async (
  inputFile: PickedFile,
  maxPixels = DEFAULT_MAX_PIXELS,
  force = false,
): Promise<PickedFile> => {
  if (!/image.*/.test(inputFile.type) || inputFile.type === 'image/gif') {
    return inputFile;
  }

  try {
    let image = await ImageManipulator.manipulate(inputFile.uri).renderAsync();
    const { width, height } = image;

    if (!force && width * height <= maxPixels) {
      return inputFile;
    }

    if (width * height > maxPixels) {
      const scale = Math.sqrt(maxPixels / (width * height));
      image = await ImageManipulator.manipulate(inputFile.uri)
        .resize({ width: Math.floor(width * scale), height: Math.floor(height * scale) })
        .renderAsync();
    }

    const format = getSaveFormat(inputFile.type);
    const { uri } = await image.saveAsync({ format, compress: 0.9 });

    return {
      ...inputFile,
      uri,
      name: inputFile.name.replace(/(\.\w+)?$/, `.${format === SaveFormat.JPEG ? 'jpg' : format}`),
      type: `image/${format}`,
      size: new File(uri).size ?? inputFile.size,
    };
  } catch (error) {
    console.error(error);
    return inputFile;
  }
};

export { resize as default };
