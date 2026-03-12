import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { submitReport, ReportableEntities } from '@/actions/reports';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import StatusContent from '@/components/statuses/status-content';
import Modal from '@/components/ui/modal';
import ProgressBar from '@/components/ui/progress-bar';
import Text from '@/components/ui/text';
import AccountContainer from '@/containers/account-container';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useInstance } from '@/hooks/use-instance';
import { useAccount } from '@/queries/accounts/use-account';
import { useBlockAccountMutation } from '@/queries/accounts/use-relationship';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useAccountTimeline } from '@/queries/timelines/use-timelines';

import ConfirmationStep from './steps/confirmation-step';
import OtherActionsStep from './steps/other-actions-step';
import ReasonStep from './steps/reason-step';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
}

const reportSteps = {
  ONE: ReasonStep,
  TWO: OtherActionsStep,
  THREE: ConfirmationStep,
};

const SelectedStatus = ({ statusId }: { statusId: string }) => {
  const { data: status } = useMinimalStatus(statusId);

  if (!status) {
    return null;
  }

  return (
    <div className='flex flex-col gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
      <AccountContainer
        id={status.account_id}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        timestamp={status.created_at}
        hideActions
      />

      <StatusContent status={status} />

      {status.media_attachments.length > 0 && <AttachmentThumbs status={status} />}
    </div>
  );
};

interface ReportModalProps {
  accountId: string;
  entityType: ReportableEntities;
  statusIds: Array<string>;
}

const ReportModal: React.FC<BaseModalProps & ReportModalProps> = ({
  onClose,
  accountId,
  entityType,
  statusIds,
}) => {
  const dispatch = useAppDispatch();

  const { data: account } = useAccount(accountId || undefined);

  const { mutate: blockAccount } = useBlockAccountMutation(accountId);

  const [block, setBlock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rules } = useInstance();
  const [ruleIds, setRuleIds] = useState<Array<string>>([]);
  const [selectedStatusIds, setSelectedStatusIds] = useState(statusIds);
  const [comment, setComment] = useState('');
  const [forward, setForward] = useState(false);

  const shouldRequireRule = rules.length > 0;

  const isReportingAccount = entityType === ReportableEntities.ACCOUNT;
  const isReportingStatus = entityType === ReportableEntities.STATUS;

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ONE);

  const handleSubmit = () => {
    setIsSubmitting(true);

    dispatch(submitReport(accountId, selectedStatusIds, [...ruleIds], comment, forward))
      .then(() => {
        setIsSubmitting(false);
        setCurrentStep(Steps.THREE);
      })
      .catch(() => {
        setIsSubmitting(false);
      });

    if (block && account) {
      blockAccount(undefined);
    }
  };

  const renderSelectedStatuses = useCallback(() => {
    switch (selectedStatusIds.length) {
      case 0:
        return (
          <div className='flex w-full items-center justify-center rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
            <Text theme='muted'>
              <FormattedMessage
                id='report.reason.blankslate'
                defaultMessage='You have removed all statuses from being selected.'
              />
            </Text>
          </div>
        );
      default:
        return <SelectedStatus statusId={selectedStatusIds[0]} />;
    }
  }, [selectedStatusIds.length]);

  const cancelText = useMemo(() => {
    switch (currentStep) {
      case Steps.ONE:
        return <FormattedMessage id='common.cancel' defaultMessage='Cancel' />;
      default:
        return <FormattedMessage id='report.previous' defaultMessage='Previous' />;
    }
  }, [currentStep]);

  const cancelAction = () => {
    switch (currentStep) {
      case Steps.ONE:
        onClose('REPORT');
        break;
      case Steps.TWO:
        setCurrentStep(Steps.ONE);
        break;
      default:
        break;
    }
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.ONE:
        return <FormattedMessage id='report.next' defaultMessage='Next' />;
      case Steps.TWO:
        return <FormattedMessage id='report.submit' defaultMessage='Submit' />;
      case Steps.THREE:
        return <FormattedMessage id='report.done' defaultMessage='Done' />;
      default:
        return <FormattedMessage id='report.next' defaultMessage='Next' />;
    }
  }, [currentStep]);

  const handleNextStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        setCurrentStep(Steps.TWO);
        break;
      case Steps.TWO:
        handleSubmit();
        break;
      case Steps.THREE:
        onClose('REPORT');
        break;
      default:
        break;
    }
  };

  const renderSelectedEntity = () => {
    if (entityType === ReportableEntities.STATUS) return renderSelectedStatuses();
    return null;
  };

  const renderTitle = () => (
    <FormattedMessage
      id='report.target'
      defaultMessage='Reporting {target}'
      values={{ target: <strong>@{account?.acct}</strong> }}
    />
  );

  const isConfirmationButtonDisabled = useMemo(() => {
    if (currentStep === Steps.THREE) {
      return false;
    }

    return (
      isSubmitting ||
      (shouldRequireRule && ruleIds.length === 0) ||
      (isReportingStatus && selectedStatusIds.length === 0)
    );
  }, [
    currentStep,
    isSubmitting,
    shouldRequireRule,
    ruleIds.length,
    selectedStatusIds.length,
    isReportingStatus,
  ]);

  const calculateProgress = useCallback(() => {
    switch (currentStep) {
      case Steps.ONE:
        return 0.33;
      case Steps.TWO:
        return 0.66;
      case Steps.THREE:
        return 1;
      default:
        return 0;
    }
  }, [currentStep]);

  useAccountTimeline(accountId, { exclude_replies: false });

  if (!account) {
    return null;
  }

  const StepToRender = reportSteps[currentStep];

  return (
    <Modal
      title={renderTitle()}
      onClose={onClose}
      cancelText={cancelText}
      cancelAction={currentStep === Steps.THREE ? undefined : cancelAction}
      confirmationAction={handleNextStep}
      confirmationText={confirmationText}
      confirmationDisabled={isConfirmationButtonDisabled}
      skipFocus
    >
      <div className='flex flex-col gap-4'>
        <ProgressBar progress={calculateProgress()} />

        {currentStep !== Steps.THREE && !isReportingAccount && renderSelectedEntity()}

        {StepToRender && (
          <StepToRender
            account={account}
            selectedStatusIds={selectedStatusIds}
            setSelectedStatusIds={setSelectedStatusIds}
            block={block}
            setBlock={setBlock}
            forward={forward}
            setForward={setForward}
            comment={comment}
            setComment={setComment}
            ruleIds={ruleIds}
            setRuleIds={setRuleIds}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  );
};

export { ReportModal as default, type ReportModalProps };
