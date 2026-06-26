import clsx from 'clsx';
import React, { useRef } from 'react';

import { useSettings } from '@/stores/settings';

interface IStillImage extends Pick<React.ImgHTMLAttributes<HTMLImageElement>, 'dir'> {
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
}

/** Renders images on a canvas, only playing GIFs if autoPlayGif is enabled. */
const StillImage: React.FC<IStillImage> = ({
  alt,
  className,
  innerClassName,
  src,
  staticSrc,
  style,
  letterboxed = false,
  showExt = false,
  onError,
  onLoad,
  isGif,
  ...props
}) => {
  const { autoPlayGif } = useSettings();

  const canvas = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement>(null);

  const hoverToPlay =
    src &&
    !autoPlayGif &&
    ((isGif ?? src.endsWith('.gif')) ||
      src.startsWith('blob:') ||
      (src && staticSrc && src !== staticSrc));

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

  return (
    <span
      data-testid='still-image-container'
      className={clsx(className, 'still-image', {
        'still-image--hover-to-play': hoverToPlay,
        'still-image--letterboxed': letterboxed,
      })}
      style={style}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        title={alt}
        ref={img}
        onLoad={handleImageLoad}
        onError={onError}
        className={clsx({
          'still-image__image': hoverToPlay,
        })}
      />

      {hoverToPlay &&
        (staticSrc ? (
          <img
            src={staticSrc}
            alt={alt}
            title={alt}
            className={clsx(innerClassName, 'still-image__static-image')}
          />
        ) : (
          <canvas ref={canvas} className={clsx(innerClassName, 'still-image__static-image')} />
        ))}

      {hoverToPlay && showExt && (
        <div className='extension-badge__container'>
          <ExtensionBadge ext='GIF' />
        </div>
      )}
    </span>
  );
};

interface IExtensionBadge {
  /** File extension. */
  ext: string;
}

/** Badge displaying a file extension. */
const ExtensionBadge: React.FC<IExtensionBadge> = ({ ext }) => (
  <div className='extension-badge'>{ext}</div>
);

export { type IStillImage, StillImage as default };
