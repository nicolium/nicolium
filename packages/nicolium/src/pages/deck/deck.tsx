import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React from 'react';

import Icon from '@/components/ui/icon';
import { useSettings } from '@/stores/settings';

import { DeckColumn } from './components/deck-column';

interface IErrorBoundary {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<IErrorBoundary, { hasError: boolean }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // componentDidCatch(error, info) {
  // }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const DeckPage = () => {
  const { deck } = useSettings();

  return (
    <div className='deck'>
      <div className='deck__columns'>
        {deck.columns.map((column) => (
          <ErrorBoundary
            key={column.id}
            fallback={
              <div
                className={`deck__column deck__column__error deck__column--${column.columnWidth}`}
              >
                Failed to load column
              </div>
            }
          >
            <DeckColumn column={column} />
          </ErrorBoundary>
        ))}
      </div>
      <button className='deck__add-column-button'>
        <Icon src={iconPlus} aria-hidden />
        Add column
      </button>
    </div>
  );
};

export { DeckPage as default };
