import iconExport from '@phosphor-icons/core/regular/export.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import StatusActionButton from '@/components/statuses/status-action-button';

import messages from '../messages';

import type { IActionButton } from '../types';

const ShareButton: React.FC<IActionButton> = ({ status }) => {
  const intl = useIntl();

  const handleShare = () => {
    navigator
      .share({
        text: status.search_index,
        url: status.uri,
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error(e);
      });
  };

  if (!('share' in navigator)) return null;

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.share)}
      icon={iconExport}
      onClick={handleShare}
    />
  );
};

export { ShareButton };
