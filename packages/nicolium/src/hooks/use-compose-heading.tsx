import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useCompose } from './use-compose';

const useComposeHeading = (composeId: string, compact?: boolean) => {
  const compose = useCompose(composeId);

  if (compose.draftId) {
    return <FormattedMessage id='navigation_bar.compose_draft' defaultMessage='Edit draft post' />;
  } else if (compose.redacting) {
    return <FormattedMessage id='navigation_bar.compose_redact' defaultMessage='Redact post' />;
  } else if (compose.editedId) {
    return <FormattedMessage id='navigation_bar.compose_edit' defaultMessage='Edit post' />;
  } else if (compose.visibility === 'direct') {
    return <FormattedMessage id='navigation_bar.compose_direct' defaultMessage='Direct message' />;
  } else if (compose.inReplyToId && compose.groupId) {
    return (
      <FormattedMessage
        id='navigation_bar.compose_group_reply'
        defaultMessage='Reply to group post'
      />
    );
  } else if (compose.groupId) {
    return <FormattedMessage id='navigation_bar.compose_group' defaultMessage='Compose to group' />;
  } else if (compose.inReplyToId) {
    return <FormattedMessage id='navigation_bar.compose_reply' defaultMessage='Reply to post' />;
  } else if (compose.quoteId) {
    return <FormattedMessage id='navigation_bar.compose_quote' defaultMessage='Quote post' />;
  } else if (compact) {
    return <FormattedMessage id='navigation.compose' defaultMessage='Compose' />;
  } else {
    return <FormattedMessage id='navigation_bar.compose' defaultMessage='Compose new post' />;
  }
};

export { useComposeHeading };
