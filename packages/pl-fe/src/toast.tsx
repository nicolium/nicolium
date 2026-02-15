import React from 'react';
import toast from 'react-hot-toast';
import { defineMessages, MessageDescriptor } from 'react-intl';

import Toast from './components/ui/toast';
import { httpErrorMessages } from './utils/errors';

import type { PlfeResponse } from './api';
import type { LinkOptions } from '@tanstack/react-router';

type ToastText = string | MessageDescriptor
type ToastType = 'success' | 'error' | 'info'

interface IToastOptions {
  action?(): void;
  actionLinkOptions?: LinkOptions;
  actionLabel?: ToastText;
  duration?: number;
  summary?: string;
}

const DEFAULT_DURATION = 4000;

const createToast = (type: ToastType, message: ToastText, opts?: IToastOptions) => {
  const duration = opts?.duration ?? DEFAULT_DURATION;

  toast.custom((t) => <Toast t={t} message={message} type={type} {...opts} />, {
    duration,
  });
};

const info = (message: ToastText, opts?: IToastOptions) => {
  createToast('info', message, opts);
};

const success = (message: ToastText, opts?: IToastOptions) => {
  createToast('success', message, opts);
};

const error = (message: ToastText, opts?: IToastOptions) => {
  createToast('error', message, opts);
};

const messages = defineMessages({
  unexpectedMessage: { id: 'alert.unexpected.message', defaultMessage: 'Something went wrong.' },
});

const showAlertForError = (networkError: { response: PlfeResponse }) => {
  if (networkError?.response) {
    const { json, status, statusText } = networkError.response;

    if (status === 502) {
      error('The server is down'); return;
    }

    if (status === 404 || status === 410) {
      // Skip these errors as they are reflected in the UI
      return null;
    }

    let message: string | undefined = statusText;

    if (json?.error) {
      message = json.error;
    }

    message ??= httpErrorMessages.find((httpError) => httpError.code === status)?.description;

    if (message) {
      error(message); return;
    }
  } else {
    console.error(networkError);
    error(messages.unexpectedMessage); return;
  }
};

export {
  type ToastText,
  type IToastOptions,
  type ToastType,
};

export default {
  info,
  success,
  error,
  showAlertForError,
};
