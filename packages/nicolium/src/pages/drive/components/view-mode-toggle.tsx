import iconList from '@phosphor-icons/core/regular/list.svg';
import iconSquaresFour from '@phosphor-icons/core/regular/squares-four.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';

const messages = defineMessages({
  gridView: { id: 'drive.view_mode.grid', defaultMessage: 'Grid view' },
  listView: { id: 'drive.view_mode.list', defaultMessage: 'List view' },
});

interface IViewModeToggle {
  viewMode: 'grid' | 'list';
  onChange: (viewMode: 'grid' | 'list') => void;
}

const ViewModeToggle: React.FC<IViewModeToggle> = ({ viewMode, onChange }) => {
  const intl = useIntl();

  return (
    <div className='drive-view-mode-toggle'>
      <button
        onClick={() => onChange('grid')}
        aria-label={intl.formatMessage(messages.gridView)}
        title={intl.formatMessage(messages.gridView)}
        aria-pressed={viewMode === 'grid'}
      >
        <Icon src={iconSquaresFour} aria-hidden />
      </button>
      <button
        onClick={() => onChange('list')}
        aria-label={intl.formatMessage(messages.listView)}
        title={intl.formatMessage(messages.listView)}
        aria-pressed={viewMode === 'list'}
      >
        <Icon src={iconList} aria-hidden />
      </button>
    </div>
  );
};

export { ViewModeToggle };
