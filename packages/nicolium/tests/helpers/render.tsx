import {
  render,
  renderHook,
  type RenderOptions,
  type RenderHookOptions,
} from '@testing-library/react';
import React, { type FC, type ReactElement } from 'react';
import { IntlProvider } from 'react-intl';
import { beforeAll, afterAll } from 'vitest';

import { queryClient } from '@/queries/client';

const TestApp: FC<any> = ({ children }) => {
  const props = {
    locale: 'en',
  };

  return (
    <IntlProvider locale={props.locale}>
      {children}

      {/* <Toaster /> */}
    </IntlProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, {
    wrapper: () => <TestApp>{ui}</TestApp>,
    ...options,
  });

/** Like renderHook, but with access to the Redux store. */
const customRenderHook = <T extends { children?: React.ReactNode }>(
  callback: (props?: any) => any,
  options?: Omit<RenderHookOptions<T>, 'wrapper'>,
) =>
  renderHook(callback, {
    wrapper: ({ children }) => <TestApp>{children}</TestApp>,
    ...options,
  });

const mockWindowProperty = (property: any, value: any) => {
  const { [property]: originalProperty } = window;
  delete window[property];

  beforeAll(() => {
    Object.defineProperty(window, property, {
      configurable: true,
      writable: true,
      value,
    });
  });

  afterAll(() => {
    window[property] = originalProperty;
  });
};

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook, mockWindowProperty, queryClient };
