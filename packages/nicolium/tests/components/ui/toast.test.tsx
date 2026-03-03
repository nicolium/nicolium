import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import Toast from '@/components/ui/toast';

import type { Toast as RHToast } from 'react-hot-toast';

vi.mock('@/components/ui/icon', () => ({
  default: (props: { className?: string }) => (
    <span data-testid='icon' className={props.className} />
  ),
}));

const createToast = (id: string): RHToast =>
  ({
    id,
    visible: true,
  }) as RHToast;

describe('Toast accessibility', () => {
  it('uses polite status live-region semantics for non-error toasts', () => {
    render(
      <IntlProvider locale='en'>
        <Toast
          t={createToast('success-toast')}
          message='Settings saved.'
          type='success'
          summary='Your changes were synced.'
        />
      </IntlProvider>,
    );

    const toast = screen.getByTestId('toast');

    expect(toast).toHaveAttribute('role', 'status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
    expect(toast).toHaveAttribute(
      'aria-describedby',
      'toast-message-success-toast toast-summary-success-toast',
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('uses assertive alert semantics for error toasts', () => {
    render(
      <IntlProvider locale='en'>
        <Toast t={createToast('error-toast')} message='Something went wrong.' type='error' />
      </IntlProvider>,
    );

    const toast = screen.getByTestId('toast');

    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
    expect(toast).toHaveAttribute('aria-describedby', 'toast-message-error-toast');
  });
});
