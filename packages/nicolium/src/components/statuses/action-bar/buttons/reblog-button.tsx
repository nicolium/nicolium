import iconLockFill from '@phosphor-icons/core/fill/lock-fill.svg';
import iconRocketLaunchFill from '@phosphor-icons/core/fill/rocket-launch-fill.svg';
import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconQuotes from '@phosphor-icons/core/regular/quotes.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconRocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import StatusActionButton from '@/components/statuses/status-action-button';
import Popover from '@/components/ui/popover';
import { useColumnId } from '@/contexts/deck-column-id-context';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useFeatures } from '@/hooks/use-features';
import { useReblog } from '@/hooks/use-reblog';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import { InteractionPopover } from '../interaction-popover';
import messages from '../messages';

import type { IActionButton } from '../types';

interface IReblogButton extends IActionButton {
  publicStatus: boolean;
  withQuote: boolean;
}

const ReblogButton: React.FC<IReblogButton> = ({
  status,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  publicStatus,
  withQuote,
  withCounters,
}) => {
  const { quoteCompose } = useComposeActions();
  const scopeUrl = useScopeUrl();
  const columnId = useColumnId();
  const features = useFeatures();
  const intl = useIntl();

  const { useRocketIconForReblogs } = useSettings();
  const { openModal } = useModalsActions();
  const canReblog = useCanInteract(status, 'can_reblog');
  const canQuote = useCanInteract(status, 'can_quote');

  const reblog = useReblog(status);

  let reblogIcon = useRocketIconForReblogs ? iconRocketLaunch : iconRepeat;
  let reblogFilledIcon = useRocketIconForReblogs ? iconRocketLaunchFill : iconRepeat;

  if (status.visibility === 'direct') {
    reblogIcon = iconAt;
    reblogFilledIcon = iconAt;
  } else if (status.visibility === 'private' || status.visibility === 'mutuals_only') {
    reblogIcon = iconLock;
    reblogFilledIcon = iconLockFill;
  }

  const handleReblogClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      reblog({ event: e, approvalRequired: canReblog.approvalRequired ?? false });
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const handleReblogLongPress = status.reblogs_count
    ? (event: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>) => {
        openModal('REBLOGS', { statusId: status.id }, event.target as HTMLElement);
      }
    : undefined;

  const reblogButton = (
    <StatusActionButton
      className='status-action-bar__button--reblog'
      icon={reblogIcon}
      filledIcon={reblogFilledIcon}
      disabled={!publicStatus}
      title={
        !publicStatus
          ? intl.formatMessage(messages.cannotReblog)
          : intl.formatMessage(messages.reblog)
      }
      active={status.reblogged}
      onClick={handleReblogClick}
      onLongPress={handleReblogLongPress}
      count={
        withCounters ? status.reblogs_count + (withQuote ? status.quotes_count : 0) : undefined
      }
      text={withLabels ? intl.formatMessage(messages.reblog) : undefined}
    />
  );

  if (me && !canReblog.canInteract)
    return (
      <Popover
        interaction='click'
        content={<InteractionPopover allowed={canReblog.allowed} type='reblog' />}
      >
        {reblogButton}
      </Popover>
    );

  if (!features.quotePosts || !me || !withQuote) return reblogButton;

  const handleQuoteClick: React.EventHandler<React.MouseEvent> = () => {
    if (me) {
      quoteCompose(status, scopeUrl, columnId, canQuote.approvalRequired || false);
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const reblogMenu = [
    {
      text: intl.formatMessage(status.reblogged ? messages.cancelReblogPrivate : messages.reblog),
      action: handleReblogClick,
      icon: useRocketIconForReblogs ? iconRocketLaunch : iconRepeat,
    },
    {
      text: intl.formatMessage(messages.quotePost),
      action: handleQuoteClick,
      icon: iconQuotes,
      disabled: !canQuote.canInteract,
    },
  ];

  return (
    <DropdownMenu
      items={reblogMenu}
      disabled={!publicStatus}
      onShiftClick={handleReblogClick}
      forceDropdown
    >
      {reblogButton}
    </DropdownMenu>
  );
};

export { ReblogButton, type IReblogButton };
