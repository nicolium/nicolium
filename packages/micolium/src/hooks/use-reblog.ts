import { defineMessages, useIntl } from 'react-intl';
import { Alert } from 'react-native';

import { useReblogStatus } from '@/queries/statuses/use-status-interactions';
import { useSetting } from '@/stores/settings';

import type { SelectedStatus } from '@/queries/statuses/use-status';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  reblogMissingDescriptionHeading: {
    id: 'confirmations.boost_missing_description.heading',
    defaultMessage: 'Reposting a post with missing description',
  },
  reblogMissingDescriptionMessage: {
    id: 'confirmations.boost_missing_description.message',
    defaultMessage:
      'The post does not have a description for all attachments. Do you want to repost it anyway?',
  },
  reblogMissingDescriptionFilenameMessage: {
    id: 'confirmations.boost_missing_description.filename_warning',
    defaultMessage:
      "One or more attachments likely has a filename (e.g. 'image.jpg') as its description instead of meaningful alt text. Do you want to repost it anyway?",
  },
  reblogMissingDescriptionConfirm: {
    id: 'confirmations.boost_missing_description.confirm',
    defaultMessage: 'Repost anyway',
  },
  reblogModalTitle: {
    id: 'boost_modal.title',
    defaultMessage: 'Repost?',
  },
  reblogModalTitleUnlisted: {
    id: 'boost_modal.title.unlisted',
    defaultMessage: 'Repost unlisted?',
  },
  reblogModalTitlePrivate: {
    id: 'boost_modal.title.private',
    defaultMessage: 'Repost privately?',
  },
  reblogModalConfirm: { id: 'status.reblog', defaultMessage: 'Repost' },
});

const getMissingDescriptions = (status: SelectedStatus) => {
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

const useReblog = (status: SelectedStatus) => {
  const intl = useIntl();

  const boostModal = useSetting('timelines.boostModal');
  const missingDescriptionBoostModal = useSetting('compose.missingDescriptionModal');

  const { mutate: reblog } = useReblogStatus(status.id);

  return (visibility?: string) => {
    const doReblog = () => reblog({ visibility });

    if (missingDescriptionBoostModal) {
      const { hasMissingDescriptions, hasFilenameDescriptions } = getMissingDescriptions(status);

      if (hasMissingDescriptions || hasFilenameDescriptions) {
        return Alert.alert(
          intl.formatMessage(messages.reblogMissingDescriptionHeading),
          intl.formatMessage(
            hasMissingDescriptions
              ? messages.reblogMissingDescriptionMessage
              : messages.reblogMissingDescriptionFilenameMessage,
          ),
          [
            {
              text: intl.formatMessage(messages.cancel),
              style: 'cancel',
            },
            {
              text: intl.formatMessage(messages.reblogMissingDescriptionConfirm),
              onPress: doReblog,
            },
          ],
        );
      }
    }
    if (boostModal) {
      const modalTitle =
        visibility === 'unlisted'
          ? messages.reblogModalTitleUnlisted
          : visibility === 'private'
            ? messages.reblogModalTitlePrivate
            : messages.reblogModalTitle;

      return Alert.alert(intl.formatMessage(modalTitle), undefined, [
        {
          text: intl.formatMessage(messages.cancel),
          style: 'cancel',
        },
        {
          text: intl.formatMessage(messages.reblogModalConfirm),
          onPress: doReblog,
        },
      ]);
    }

    doReblog();
  };
};

export { useReblog };
