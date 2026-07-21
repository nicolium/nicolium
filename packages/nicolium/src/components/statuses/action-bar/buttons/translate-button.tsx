import iconTranslate from '@phosphor-icons/core/regular/translate.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import StatusActionButton from '@/components/statuses/status-action-button';
import { useTranslate } from '@/hooks/use-translate';

import messages from '../messages';

import type { IActionButton } from '../types';

const TranslateButton: React.FC<IActionButton> = ({ status }) => {
  const intl = useIntl();
  const translateInformation = useTranslate(status);
  if (!translateInformation) return null;

  const { translate, state } = translateInformation;

  let title;

  switch (state) {
    case 'translated':
      title = intl.formatMessage(messages.hideTranslation);
      break;
    case 'translatable':
    case 'translating':
      title = intl.formatMessage(messages.translate);
      break;
    case 'downloadable':
      title = intl.formatMessage(messages.downloadModelAndTranslate);
      break;
    case 'downloading':
      title = intl.formatMessage(messages.loadConversation);
      break;
  }

  return (
    <StatusActionButton
      title={title}
      icon={iconTranslate}
      onClick={translate}
      loading={state === 'translating' || state === 'downloading'}
      active={state === 'translated'}
    />
  );
};

export { TranslateButton };
