import { BookIcon } from 'phosphor-react-native/src/icons/Book';
import { FileArchiveIcon } from 'phosphor-react-native/src/icons/FileArchive';
import { FileCodeIcon } from 'phosphor-react-native/src/icons/FileCode';
import { FileCssIcon } from 'phosphor-react-native/src/icons/FileCss';
import { FileDocIcon } from 'phosphor-react-native/src/icons/FileDoc';
import { FileHtmlIcon } from 'phosphor-react-native/src/icons/FileHtml';
import { FileJsIcon } from 'phosphor-react-native/src/icons/FileJs';
import { FilePdfIcon } from 'phosphor-react-native/src/icons/FilePdf';
import { FilePptIcon } from 'phosphor-react-native/src/icons/FilePpt';
import { FilePyIcon } from 'phosphor-react-native/src/icons/FilePy';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';
import { FileXlsIcon } from 'phosphor-react-native/src/icons/FileXls';
import { FileZipIcon } from 'phosphor-react-native/src/icons/FileZip';
import { ImageIcon } from 'phosphor-react-native/src/icons/Image';
import { MusicNotesSimpleIcon } from 'phosphor-react-native/src/icons/MusicNotesSimple';
import { PresentationIcon } from 'phosphor-react-native/src/icons/Presentation';
import { TableIcon } from 'phosphor-react-native/src/icons/Table';
import { VideoIcon } from 'phosphor-react-native/src/icons/Video';

import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { NativeSyntheticEvent, NativeTouchEvent, View } from 'react-native';

const MIMETYPE_ICONS: Record<string, PhosphorIcon> = {
  'application/x-freearc': FileArchiveIcon,
  'application/x-bzip': FileArchiveIcon,
  'application/x-bzip2': FileArchiveIcon,
  'application/gzip': FileArchiveIcon,
  'application/vnd.rar': FileArchiveIcon,
  'application/x-tar': FileArchiveIcon,
  'application/zip': FileZipIcon,
  'application/x-7z-compressed': FileArchiveIcon,
  'application/x-csh': FileCssIcon,
  'application/html': FileHtmlIcon,
  'text/javascript': FileJsIcon,
  'application/javascript': FileJsIcon,
  'application/json': FileCodeIcon,
  'application/ld+json': FileCodeIcon,
  'application/x-httpd-php': FileCodeIcon,
  'application/x-sh': FileCodeIcon,
  'application/xhtml+xml': FileCodeIcon,
  'application/xml': FileCodeIcon,
  'text/x-script.python': FilePyIcon,
  'application/epub+zip': BookIcon,
  'application/vnd.oasis.opendocument.spreadsheet': TableIcon,
  'application/vnd.ms-excel': FileXlsIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileXlsIcon,
  'application/pdf': FilePdfIcon,
  'application/vnd.oasis.opendocument.presentation': PresentationIcon,
  'application/vnd.ms-powerpoint': FilePptIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': PresentationIcon,
  'text/plain': FileTextIcon,
  'application/rtf': FileTextIcon,
  'application/msword': FileDocIcon,
  'application/x-abiword': FileTextIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileDocIcon,
  'application/vnd.oasis.opendocument.text': FileTextIcon,
  image: ImageIcon,
  video: VideoIcon,
  gifv: VideoIcon,
  audio: MusicNotesSimpleIcon,
};

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

export { formatBytes, getPointerPosition, MIMETYPE_ICONS };
