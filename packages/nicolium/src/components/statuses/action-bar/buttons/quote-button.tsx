import iconQuotes from '@phosphor-icons/core/regular/quotes.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import StatusActionButton from '@/components/statuses/status-action-button';
import Popover from '@/components/ui/popover';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useFeatures } from '@/hooks/use-features';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useComposeActions } from '@/stores/compose';

import { InteractionPopover } from '../interaction-popover';
import messages from '../messages';

import type { IActionButton } from '../types';

const QuoteButton: React.FC<IActionButton> = ({
  status,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  withCounters,
}) => {
  const { quoteCompose } = useComposeActions();
  const scopeUrl = useScopeUrl();
  const features = useFeatures();
  const intl = useIntl();

  const canQuote = useCanInteract(status, 'can_quote');

  if (!features.quotePosts) return;

  const handleQuoteClick: React.EventHandler<React.MouseEvent> = () => {
    if (me) {
      quoteCompose(status, scopeUrl, canQuote.approvalRequired || false);
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const quoteButton = (
    <StatusActionButton
      title={intl.formatMessage(messages.quotePost)}
      icon={iconQuotes}
      onClick={handleQuoteClick}
      count={withCounters ? status.quotes_count : undefined}
      text={withLabels ? intl.formatMessage(messages.quotePostShort) : undefined}
    />
  );

  if (me && !canQuote.canInteract) {
    return (
      <Popover
        interaction='click'
        content={<InteractionPopover allowed={canQuote.allowed} type='quote' />}
      >
        {quoteButton}
      </Popover>
    );
  }

  return quoteButton;
};

export { QuoteButton };
