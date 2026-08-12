import iconTooth from '@phosphor-icons/core/regular/tooth.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import { BitePopover } from '@/components/bite-popover';
import StatusActionButton from '@/components/statuses/status-action-button';
import Popover from '@/components/ui/popover';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import toast from '@/toast';

import messages from '../messages';

import type { IActionButton } from '../types';

const BiteButton: React.FC<IActionButton> = ({ status }) => {
  const intl = useIntl();
  const client = useClient();
  const features = useFeatures();

  if (!features.biteStatuses) return null;

  const handleBiteClick = () => {
    client.statuses
      .biteStatus(status.id)
      .then(() => {
        toast.success(intl.formatMessage(messages.biteSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.biteFail));
      });
  };

  const biteButton = (
    <StatusActionButton
      title={intl.formatMessage(messages.bite)}
      icon={iconTooth}
      onClick={handleBiteClick}
    />
  );

  if (status.account.can_bite === false) {
    return (
      <Popover
        interaction='click'
        content={<BitePopover biteControls={status.account.bite_controls} />}
      >
        {biteButton}
      </Popover>
    );
  }

  return biteButton;
};

export { BiteButton };
