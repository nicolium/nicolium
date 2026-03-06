// TOOD Verify if any of the lesser-known browsers actually need those.
import 'intersection-observer';
import { install as installResizeObserver } from 'resize-observer';

// Needed by Virtuoso.
if (!window.ResizeObserver) {
  installResizeObserver();
}
