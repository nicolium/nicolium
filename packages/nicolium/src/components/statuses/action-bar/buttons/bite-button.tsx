import iconTooth from '@phosphor-icons/core/regular/tooth.svg';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

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
        content={
          <div className='interaction-popover'>
            <p className='interaction-popover__header'>
              <FormattedMessage
                id='account.bite_controls.header'
                defaultMessage='You can’t bite this user.'
              />
            </p>
            <p className='interaction-popover__description'>
              {status.account.bite_controls === 'none' ? (
                <FormattedMessage
                  id='account.bite_controls.none'
                  defaultMessage='This user does not allow bites.'
                />
              ) : (
                <FormattedMessage
                  id='account.bite_controls.followers'
                  defaultMessage='Only followers can bite this user.'
                />
              )}
            </p>
          </div>
        }
      >
        {biteButton}
      </Popover>
    );
  }

  return biteButton;
};

export { BiteButton };
