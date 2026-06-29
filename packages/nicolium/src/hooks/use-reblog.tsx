import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { useReblogStatus, useUnreblogStatus } from '@/queries/statuses/use-status-interactions';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

import type { NormalizedStatus } from '@/queries/statuses/normalize';

type ReblogableStatus = Pick<NormalizedStatus, 'id' | 'reblogged'> &
  Partial<Pick<NormalizedStatus, 'visibility' | 'media_attachments'>>;

const messages = defineMessages({
  reblogApprovalRequired: {
    id: 'status.interaction_policy.reblog.approval_required',
    defaultMessage: 'The author needs to approve your repost.',
  },
});

const getMissingDescriptions = (status: ReblogableStatus) => {
  const attachments = (status.media_attachments ?? []).filter(
    (attachment) => attachment.type !== 'unknown',
  );

  const hasMissingDescriptions = attachments.some((attachment) => !attachment.description);

  const hasFilenameDescriptions = attachments.some((attachment) => {
    const extension = (attachment.remote_url || attachment.url).split('.').pop()?.toLowerCase();
    return attachment.description.trim().endsWith(`.${extension}`);
  });

  return { hasMissingDescriptions, hasFilenameDescriptions };
};

interface ReblogOptions {
  event?: { shiftKey: boolean } | null;
  visibility?: string;
  approvalRequired?: boolean;
}

const useReblog = (status: ReblogableStatus | undefined) => {
  const { boostModal, missingDescriptionBoostModal } = useSettings();
  const { openModal } = useModalsActions();

  const { mutate: reblogStatus } = useReblogStatus(status?.id ?? '');
  const { mutate: unreblogStatus } = useUnreblogStatus(status?.id ?? '');

  return ({ event, visibility, approvalRequired }: ReblogOptions = {}) => {
    if (!status) return;

    if (status.visibility === 'private' || status.visibility === 'mutuals_only') {
      visibility = 'private';
    }

    const doReblog = (selectedVisibility = visibility, scheduledAt?: string) => {
      if (status.reblogged) {
        unreblogStatus();
      } else {
        reblogStatus(
          { visibility: selectedVisibility, scheduledAt },
          {
            onSuccess: () => {
              if (approvalRequired) toast.info(messages.reblogApprovalRequired);
            },
          },
        );
      }
    };

    const { hasMissingDescriptions, hasFilenameDescriptions } = getMissingDescriptions(status);
    const showMissingDescWarning =
      missingDescriptionBoostModal && (hasMissingDescriptions || hasFilenameDescriptions);
    const shiftKey = !!event?.shiftKey;

    if (shiftKey || !boostModal) {
      if (showMissingDescWarning && !shiftKey) {
        openModal('CONFIRM', {
          heading: (
            <FormattedMessage
              id='confirmations.boost_missing_description.heading'
              defaultMessage='Reposting a post with missing description'
            />
          ),
          message: (
            <>
              {hasMissingDescriptions && (
                <FormattedMessage
                  id='confirmations.boost_missing_description.message'
                  defaultMessage='The post does not have a description for all attachments. Do you want to repost it anyway?'
                />
              )}
              {hasFilenameDescriptions && (
                <FormattedMessage
                  id='confirmations.boost_missing_description.filename_warning'
                  defaultMessage="One or more attachments likely has a filename (e.g. 'image.jpg') as its description instead of meaningful alt text. Do you want to repost it anyway?"
                />
              )}
            </>
          ),
          confirm: (
            <FormattedMessage
              id='confirmations.boost_missing_description.confirm'
              defaultMessage='Repost anyway'
            />
          ),
          onConfirm: () => doReblog(),
        });
      } else {
        doReblog();
      }
    } else {
      openModal('BOOST', {
        statusId: status.id,
        onReblog: doReblog,
        visibility,
        hasMissingDescriptions: showMissingDescWarning && hasMissingDescriptions,
        hasFilenameDescriptions: showMissingDescWarning && hasFilenameDescriptions,
      });
    }
  };
};

export { useReblog };
