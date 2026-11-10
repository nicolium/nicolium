import { Host, SnackbarHost, type SnackbarHostRef } from '@expo/ui/jetpack-compose';
import React from 'react';

import type { ToastAction } from 'sonner-native';

const hostRef = React.createRef<SnackbarHostRef>();

const ToastRoot = () => (
  <Host
    matchContents={{ vertical: true }}
    style={{ position: 'absolute', left: 16, right: 16, bottom: 80 }}
  >
    <SnackbarHost ref={hostRef} />
  </Host>
);

type ToastData = {
  action?: ToastAction;
};

const toast: ((message: string, data?: ToastData | undefined) => void) & {
  success: (message: string, data?: ToastData) => void;
  info: (message: string, data?: ToastData) => void;
  error: (message: string, data?: ToastData) => void;
  warning: (message: string, data?: ToastData) => void;
  dismiss: (id?: string | number) => void;
} = (message, data) => {
  hostRef.current
    ?.showSnackbar({
      message,
      actionLabel: data?.action?.label,
      duration: data?.action ? 'long' : 'short',
    })
    .then((result) => {
      if (result === 'actionPerformed') data?.action?.onClick?.();
    });
};

toast.success = toast;
toast.info = toast;
toast.error = toast;
toast.warning = toast;
toast.dismiss = () => {};

export { toast, ToastRoot };
