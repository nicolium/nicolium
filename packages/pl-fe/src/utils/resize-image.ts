/* eslint-disable no-case-declarations */
import { hasCanvasExtractPermission } from './favicon-service';

const DEFAULT_MAX_PIXELS = 7680 * 4320;

interface BrowserCanvasQuirks {
  'image-orientation-automatic'?: boolean;
  'canvas-read-unreliable'?: boolean;
}

const _browser_quirks: BrowserCanvasQuirks = {};

// Some browsers will automatically draw images respecting their EXIF orientation
// while others won't, and the safest way to detect that is to examine how it
// is done on a known image.
// See https://github.com/w3c/csswg-drafts/issues/4666
// and https://github.com/blueimp/JavaScript-Load-Image/commit/1e4df707821a0afcc11ea0720ee403b8759f3881
const dropOrientationIfNeeded = (orientation: number) => new Promise<number>(resolve => {
  switch (_browser_quirks['image-orientation-automatic']) {
    case true:
      resolve(1);
      break;
    case false:
      resolve(orientation);
      break;
    default:
    // black 2x1 JPEG, with the following meta information set:
    // - EXIF Orientation: 6 (Rotated 90° CCW)
      const testImageURL =
      'data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAA' +
      'AAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA' +
      'QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE' +
      'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/x' +
      'ABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAA' +
      'AAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==';
      const img = new Image();
      img.onload = () => {
        const automatic = (img.width === 1 && img.height === 2);
        _browser_quirks['image-orientation-automatic'] = automatic;
        resolve(automatic ? 1 : orientation);
      };
      img.onerror = () => {
        _browser_quirks['image-orientation-automatic'] = false;
        resolve(orientation);
      };
      img.src = testImageURL;
  }
});

/** Convert the file into a local blob URL. */
const getImageUrl = (inputFile: File) => new Promise<string>((resolve, reject) => {
  // @ts-ignore: This is a browser capabilities check.
  if (window.URL?.createObjectURL) {
    try {
      resolve(URL.createObjectURL(inputFile));
    } catch (error) {
      reject(error);
    }
    return;
  }

  const reader = new FileReader();
  reader.onerror = (...args) => reject(...args);
  reader.onload = ({ target }) => resolve((target?.result || '') as string);

  reader.readAsDataURL(inputFile);
});

/** Get an image element from a file. */
const loadImage = (inputFile: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  getImageUrl(inputFile).then(url => {
    const img = new Image();

    img.onerror = (...args) => reject([...args]);
    img.onload = () => resolve(img);

    img.src = url;
  }).catch(reject);
});

/** Get the exif orientation for the image. */
const getOrientation = async (img: HTMLImageElement, type = 'image/png'): Promise<number> => {
  if (!['image/jpeg', 'image/webp'].includes(type)) {
    return 1;
  }

  try {
    const exifr = await import('exifr');
    const orientation = await exifr.orientation(img) ?? 1;

    if (orientation !== 1) {
      return await dropOrientationIfNeeded(orientation);
    } else {
      return orientation;
    }
  } catch (error) {
    console.error('Failed to get orientation:', error);
    return 1;
  }
};

const processImage = (
  img: HTMLImageElement,
  {
    width,
    height,
    orientation,
    type = 'image/png',
    name = 'resized.png',
  } : {
    width: number;
    height: number;
    orientation: number;
    type?: string;
    name?: string;
  },
) => new Promise<File>((resolve, reject) => {
  const canvas = document.createElement('canvas');

  if (4 < orientation && orientation < 9) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext('2d');

  if (!context) {
    reject(context);
    return;
  }

  switch (orientation) {
    case 2: context.transform(-1, 0, 0, 1, width, 0); break;
    case 3: context.transform(-1, 0, 0, -1, width, height); break;
    case 4: context.transform(1, 0, 0, -1, 0, height); break;
    case 5: context.transform(0, 1, 1, 0, 0, 0); break;
    case 6: context.transform(0, 1, -1, 0, height, 0); break;
    case 7: context.transform(0, -1, -1, 0, height, width); break;
    case 8: context.transform(0, -1, 1, 0, 0, width); break;
  }

  context.drawImage(img, 0, 0, width, height);

  canvas.toBlob((blob) => {
    if (!blob) {
      reject(blob);
      return;
    }
    resolve(new File([blob], name, { type, lastModified: new Date().getTime() }));
  }, type);
});

const resizeImage = async (
  img: HTMLImageElement,
  inputFile: File,
  maxPixels: number,
  force = false,
) => {
  let { width, height } = img;
  const type = inputFile.type || 'image/png';

  if (!force && width * height <= maxPixels) {
    width = Math.round(Math.sqrt(maxPixels * (width / height)));
    height = Math.round(Math.sqrt(maxPixels * (height / width)));
  }

  const orientation = await getOrientation(img, type);

  return processImage(img, {
    width,
    height,
    name: inputFile.name,
    orientation,
    type,
  });
};

/** Resize an image to the maximum number of pixels. */
const resize = async (inputFile: File, maxPixels = DEFAULT_MAX_PIXELS, force = false): Promise<File> => {
  if (!hasCanvasExtractPermission) return inputFile;

  if (!inputFile.type.match(/image.*/) || inputFile.type === 'image/gif') {
    return inputFile;
  }

  try {
    const img = await loadImage(inputFile);

    if (!force && img.width * img.height <= maxPixels) {
      return inputFile;
    }

    try {
      return await resizeImage(img, inputFile, maxPixels, force);
    } catch (error) {
      console.error(error);
      return (inputFile);
    }
  } catch (error) {
    return inputFile;
  }
};

export { resize as default };
