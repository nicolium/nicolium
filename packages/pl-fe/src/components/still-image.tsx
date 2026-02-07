import clsx from 'clsx';
import React, { useRef } from 'react';

import { useSettings } from '@/stores/settings';

interface IStillImage {
  /** Image alt text. */
  alt?: string;
  /** Extra class names for the outer <div> container. */
  className?: string;
  /** Extra class names for the inner <img> element. */
  innerClassName?: string;
  /** URL to the image */
  src: string;
  /** URL to the static image */
  staticSrc?: string;
  /** Extra CSS styles on the outer <div> element. */
  style?: React.CSSProperties;
  /** Whether to display the image contained vs filled in its container. */
  letterboxed?: boolean;
  /** Whether to show the file extension in the corner. */
  showExt?: boolean;
  /** Callback function if the image fails to load */
  onError?(): void;
  /** Callback function if the image loads successfully */
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  /** Treat as animated, no matter the extension */
  isGif?: boolean;
  /** Specify that the group is defined by the parent */
  noGroup?: boolean;
}

/** Renders images on a canvas, only playing GIFs if autoPlayGif is enabled. */
const StillImage: React.FC<IStillImage> = ({
  alt, className, innerClassName, src, staticSrc, style, letterboxed = false, showExt = false, onError, onLoad, isGif, noGroup,
}) => {
  const { autoPlayGif } = useSettings();

  const canvas = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement>(null);

  const hoverToPlay = src && !autoPlayGif && (isGif || src.endsWith('.gif') || src.startsWith('blob:') || (src && staticSrc && src !== staticSrc));

  const handleImageLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (hoverToPlay && !staticSrc && canvas.current && img.current) {
      canvas.current.width = img.current.naturalWidth;
      canvas.current.height = img.current.naturalHeight;
      const context = canvas.current.getContext('2d');
      if (context) {
        context.imageSmoothingQuality = 'high';
        context.drawImage(img.current, 0, 0);
      }
    }

    if (onLoad) {
      onLoad(e);
    }
  };

  /** ClassNames shared between the `<img>` and `<canvas>` elements. */
  const baseClassName = clsx('block size-full', innerClassName, {
    'object-contain': letterboxed,
    'object-cover': !letterboxed,
  });

  return (
    <div
      data-testid='still-image-container'
      className={clsx(className, 'relative isolate', { 'group': !noGroup })}
      style={style}
    >
      <img
        src={src}
        alt={alt}
        ref={img}
        onLoad={handleImageLoad}
        onError={onError}
        className={clsx(baseClassName, {
          'invisible group-hover:visible': hoverToPlay,
        })}
      />

      {hoverToPlay && (staticSrc ? (
        <img
          src={staticSrc}
          alt={alt}
          className={clsx(baseClassName, 'absolute top-0 group-hover:invisible')}
        />
      ) : (
        <canvas
          ref={canvas}
          className={clsx(baseClassName, 'absolute top-0 group-hover:invisible')}
        />
      ))}

      {(hoverToPlay && showExt) && (
        <div className='pointer-events-none absolute bottom-2 left-2 opacity-90 group-hover:hidden'>
          <ExtensionBadge ext='GIF' />
        </div>
      )}
    </div>
  );
};

interface IExtensionBadge {
  /** File extension. */
  ext: string;
}

/** Badge displaying a file extension. */
const ExtensionBadge: React.FC<IExtensionBadge> = ({ ext }) => (
  <div className='inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'>
    {ext}
  </div>
);

export {
  type IStillImage,
  StillImage as default,
};
