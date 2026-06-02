import iconArrowsInSimple from '@phosphor-icons/core/regular/arrows-in-simple.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import FormGroup from '@/components/ui/form-group';
import Icon from '@/components/ui/icon';
import Toggle from '@/components/ui/toggle';
import { useFeatures } from '@/hooks/use-features';
import StatusCheckBox from '@/modals/report-modal/components/status-check-box';
import { useAccountTimeline } from '@/queries/timelines/use-timelines';
import { getDomain } from '@/utils/accounts';

import type { Account } from 'pl-api';

interface IOtherActionsStep {
  account: Pick<Account, 'id' | 'acct' | 'local' | 'url'>;
  selectedStatusIds: string[];
  setSelectedStatusIds: (value: string[]) => void;
  block: boolean;
  setBlock: (value: boolean) => void;
  forward: boolean;
  setForward: (value: boolean) => void;
  isSubmitting: boolean;
}

const OtherActionsStep = ({
  account,
  selectedStatusIds,
  setSelectedStatusIds,
  block,
  setBlock,
  forward,
  setForward,
  isSubmitting,
}: IOtherActionsStep) => {
  const features = useFeatures();

  const { entries } = useAccountTimeline(account.id, { exclude_replies: false });

  const statusIds = useMemo(() => {
    const timelineStatusIds = entries
      .map((entry) =>
        entry.type === 'status'
          ? entry.reblogIds.length > 0
            ? entry.reblogIds[0]
            : entry.id
          : null,
      )
      .filter((id): id is string => id !== null);

    return [...new Set([...timelineStatusIds, ...selectedStatusIds])];
  }, [entries, selectedStatusIds]);
  const isBlocked = block;
  const isForward = forward;
  const canForward = !account.local && features.federating && features.reportForwarding;

  const [showAdditionalStatuses, setShowAdditionalStatuses] = useState<boolean>(false);

  const handleBlockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlock(event.target.checked);
  };

  const handleForwardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForward(event.target.checked);
  };

  const toggleStatusReport = (statusId: string) => (value: boolean) => {
    let newStatusIds = selectedStatusIds;
    if (value && !selectedStatusIds.includes(statusId))
      newStatusIds = [...selectedStatusIds, statusId];
    if (!value) newStatusIds = selectedStatusIds.filter((id) => id !== statusId);

    setSelectedStatusIds(newStatusIds);
  };

  return (
    <div className='report-modal__other-actions-step'>
      <div className='report-modal__other-actions-step__section'>
        <h1 className='report-modal__other-actions-step__title'>
          <FormattedMessage
            id='report.other_actions.other_statuses'
            defaultMessage='Include other posts?'
          />
        </h1>

        <FormGroup
          labelText={
            <FormattedMessage
              id='report.other_actions.add_additional'
              defaultMessage='Would you like to add additional posts to this report?'
            />
          }
        >
          {showAdditionalStatuses ? (
            <div className='report-modal__other-actions-step__statuses'>
              <div className='status-list'>
                {statusIds.map((statusId) => (
                  <StatusCheckBox
                    id={statusId}
                    key={statusId}
                    checked={selectedStatusIds.includes(statusId)}
                    toggleStatusReport={toggleStatusReport(statusId)}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  setShowAdditionalStatuses(false);
                }}
              >
                <Icon src={iconArrowsInSimple} />
                <FormattedMessage
                  id='report.other_actions.hide_additional'
                  defaultMessage='Hide additional posts'
                />
              </button>
            </div>
          ) : (
            <div className='report-modal__other-actions-step__statuses'>
              <button
                onClick={() => {
                  setShowAdditionalStatuses(true);
                }}
              >
                <Icon src={iconPlus} />
                <FormattedMessage id='report.other_actions.add_more' defaultMessage='Add more' />
              </button>
            </div>
          )}
        </FormGroup>
      </div>

      <div className='report-modal__other-actions-step__section'>
        <h1 className='report-modal__other-actions-step__title'>
          <FormattedMessage
            id='report.other_actions.further_actions'
            defaultMessage='Further actions:'
          />
        </h1>

        <FormGroup
          labelText={
            <FormattedMessage
              id='report.block.hint'
              defaultMessage='Do you also want to block this account?'
            />
          }
        >
          <div className='report-modal__other-actions-step__toggle'>
            <Toggle checked={isBlocked} onChange={handleBlockChange} id='report-block' />

            <label htmlFor='report-block'>
              <FormattedMessage
                id='report.block'
                defaultMessage='Block {target}'
                values={{ target: `@${account.acct}` }}
              />
            </label>
          </div>
        </FormGroup>

        {canForward && (
          <FormGroup
            labelText={
              <FormattedMessage
                id='report.forward.hint'
                defaultMessage='The account is from another server. Send a copy of the report there as well?'
              />
            }
          >
            <div className='report-modal__other-actions-step__toggle'>
              <Toggle
                checked={isForward}
                onChange={handleForwardChange}
                id='report-forward'
                disabled={isSubmitting}
              />

              <label htmlFor='report-forward'>
                <FormattedMessage
                  id='report.forward'
                  defaultMessage='Forward to {target}'
                  values={{ target: getDomain(account) }}
                />
              </label>
            </div>
          </FormGroup>
        )}
      </div>
    </div>
  );
};

export { OtherActionsStep as default };
