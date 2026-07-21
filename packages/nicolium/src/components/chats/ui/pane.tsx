import clsx from 'clsx';
import React from 'react';

interface IPane {
  /** Whether the pane is open or minimized. */
  isOpen: boolean;
  /** Children to display in the pane. */
  children: React.ReactNode;
}

/** Chat pane UI component for desktop. */
const Pane: React.FC<IPane> = ({ isOpen = false, children }) => (
  <div
    className={clsx('chat-widget', { 'chat-widget--open': isOpen })}
    data-testid='pane'
    aria-expanded={isOpen}
  >
    {children}
  </div>
);

export { Pane };
