import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { shortNumberFormat } from '@/utils/numbers';

describe('shortNumberFormat', () => {
  test('handles non-numbers', () => {
    render(<div data-testid='num'>{shortNumberFormat('not-number')}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('•');
  });

  test('handles max argument', () => {
    render(<div data-testid='num'>{shortNumberFormat(25, 20)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('20+');
  });

  test('formats numbers under 1,000', () => {
    render(<div data-testid='num'>{shortNumberFormat(555)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('555');
  });

  test('formats numbers under 1,000,000', () => {
    render(<div data-testid='num'>{shortNumberFormat(5555)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('5.55k');
  });

  test('formats numbers over 1,000,000', () => {
    render(<div data-testid='num'>{shortNumberFormat(5555555)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('5.55M');
  });

  test('formats a multitude of numbers', () => {
    let result = render(<div data-testid='num'>{shortNumberFormat(0)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('0');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1)}</div>);
    expect(screen.getByTestId('num')).toHaveTextContent('1');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(999)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('999');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1000)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1001)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1005)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1006)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1010)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1.01k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1530)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1.53k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(10530)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('10.5k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(999500)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('999k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(999999)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('999k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(999499)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('999k');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1000000)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1M');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(3905558)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('3.9M');
    result.unmount();

    result = render(<div data-testid='num'>{shortNumberFormat(1031511)}</div>, undefined, null);
    expect(screen.getByTestId('num')).toHaveTextContent('1.03M');
    result.unmount();
  });
});
