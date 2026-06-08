import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useSettings } from '@/stores/settings';

import { DeckColumn } from './components/deck-column';

interface IColumnErrorBoundary {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

class ColumnErrorBoundary extends React.Component<IColumnErrorBoundary, { hasError: boolean }> {
  constructor(props: IColumnErrorBoundary) {
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
          <ColumnErrorBoundary
            key={column.id}
            fallback={
              <div
                className={`deck__column deck__column--error deck__column--${column.columnWidth}`}
              >
                <FormattedMessage id='column.deck.error' defaultMessage='Failed to load column' />
              </div>
            }
          >
            <DeckColumn column={column} />
          </ColumnErrorBoundary>
        ))}
      </div>
      <button className='deck__add-column-button'>
        <Icon src={iconPlus} aria-hidden />
        <FormattedMessage id='column.deck.add' defaultMessage='Add column' />
      </button>
    </div>
  );
};

export { DeckPage as default };
