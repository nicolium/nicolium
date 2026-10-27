import type { NativeSyntheticEvent, NativeTouchEvent, View } from 'react-native';

type Position = { x: number; y: number };

const findElementPosition = (el: View) => {
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

  return {
    left: Math.round(box.left),
    top: Math.round(box.top),
  };
};

const getPointerPosition = (
  el: View,
  event: Pick<MouseEvent, 'pageX' | 'pageY'> | NativeSyntheticEvent<NativeTouchEvent>,
): Position => {
  const box = findElementPosition(el);
  const boxW = el.offsetWidth;
  const boxH = el.offsetHeight;
  const boxY = box.top;
  const boxX = box.left;

  let pageX, pageY;

  if ('pageX' in event) {
    pageX = event.pageX;
    pageY = event.pageY;
  } else {
    pageX = event.nativeEvent.pageX;
    pageY = event.nativeEvent.pageY;
  }

  return {
    y: (Math.max(0, Math.min(1, (pageY - boxY) / boxH)) - 0.5) * 2,
    x: (Math.max(0, Math.min(1, (pageX - boxX) / boxW)) - 0.5) * 2,
  };
};

const formatBytes = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export { formatBytes, getPointerPosition };
