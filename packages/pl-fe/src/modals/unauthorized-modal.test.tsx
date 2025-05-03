import React from 'react';

import { storeOpen } from 'pl-fe/jest/mock-stores';
import { render, screen } from 'pl-fe/jest/test-helpers';

import UnauthorizedModal from './unauthorized-modal';

describe('<UnauthorizedModal />', () => {
  it('successfully renders', () => {
    render(<UnauthorizedModal onClose={vi.fn} action='FOLLOW' />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('doesn\'t display the signup button by default', () => {
    render(<UnauthorizedModal onClose={vi.fn} action='FOLLOW' />);
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('displays the signup button', () => {
      render(<UnauthorizedModal onClose={vi.fn} action='FOLLOW' />, undefined, storeOpen);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });
});
