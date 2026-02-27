import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'intersection-observer';
import { install as installResizeObserver } from 'resize-observer';

// Needed by @tanstack/virtual, I guess
if (!window.ResizeObserver) {
  installResizeObserver();
}
