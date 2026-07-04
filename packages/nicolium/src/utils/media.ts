import type React from 'react';

const truncateFilename = (url: string, maxLength: number) => {
  const filename = url.split('/').pop();

  if (!filename) {
    return filename;
  }

  if (filename.length <= maxLength) return filename;

  return [filename.slice(0, maxLength / 2), filename.slice(filename.length - maxLength / 2)].join(
    '…',
  );
};

const formatBytes = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatTime = (secondsNum: number): string => {
  const hours = Math.floor(secondsNum / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((secondsNum % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsNum % 60).toString().padStart(2, '0');

  return (hours === '00' ? '' : `${hours}:`) + `${minutes}:${seconds}`;
};

type Position = { x: number; y: number };

const findElementPosition = (el: HTMLElement) => {
  let box;

  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect();
  }

  if (!box) {
    return {
      left: 0,
      top: 0,
    };
  }

  const docEl = document.documentElement;
  const body = document.body;

  const clientLeft = docEl.clientLeft || body.clientLeft || 0;
  const scrollLeft = window.pageXOffset || body.scrollLeft;
  const left = box.left + scrollLeft - clientLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const scrollTop = window.pageYOffset || body.scrollTop;
  const top = box.top + scrollTop - clientTop;

  return {
    left: Math.round(left),
    top: Math.round(top),
  };
};

const getPointerPosition = (
  el: HTMLElement,
  event:
    | Pick<MouseEvent, 'pageX' | 'pageY'>
    | Pick<TouchEvent, 'changedTouches'>
    | Pick<React.TouchEvent, 'changedTouches'>,
): Position => {
  const box = findElementPosition(el);
  const boxW = el.offsetWidth;
  const boxH = el.offsetHeight;
  const boxY = box.top;
  const boxX = box.left;

  let pageX, pageY;

  if ('changedTouches' in event) {
    pageX = event.changedTouches[0].pageX;
    pageY = event.changedTouches[0].pageY;
  } else {
    pageX = event.pageX;
    pageY = event.pageY;
  }

  return {
    y: Math.max(0, Math.min(1, (pageY - boxY) / boxH)),
    x: Math.max(0, Math.min(1, (pageX - boxX) / boxW)),
  };
};

const getVideoDuration = (file: File): Promise<number> => {
  const video = document.createElement('video');

  const promise = new Promise<number>((resolve, reject) => {
    video.addEventListener('loadedmetadata', () => {
      // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
      if (video.duration === Infinity) {
        video.currentTime = Number.MAX_SAFE_INTEGER;
        video.ontimeupdate = () => {
          video.ontimeupdate = null;
          resolve(video.duration);
          video.currentTime = 0;
        };
      } else {
        resolve(video.duration);
      }
    });

    video.onerror = (event: any) => {
      reject(event.target.error);
    };
  });

  video.src = window.URL.createObjectURL(file);

  return promise;
};

export { getVideoDuration, formatBytes, formatTime, getPointerPosition, truncateFilename };
