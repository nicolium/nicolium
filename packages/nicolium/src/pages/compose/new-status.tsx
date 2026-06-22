import { useNavigate } from '@tanstack/react-router';
import React, { Suspense, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchStatus } from '@/actions/statuses';
import { Column } from '@/components/ui/column';
import { buildPoll, buildStatus } from '@/features/draft-statuses/builder';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useClient } from '@/hooks/use-client';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useDraftStatusQuery } from '@/queries/statuses/use-draft-statuses';
import { newStatusRoute } from '@/router';
import { useComposeActions } from '@/stores/compose';

const messages = defineMessages({
  heading: { id: 'compose.heading', defaultMessage: 'Compose' },
});

const NewStatusPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { data: ownAccount } = useOwnAccount();
  const search = newStatusRoute.useSearch();
  const { data: draftStatus } = useDraftStatusQuery(search.draftId ?? '');
  const { approvalRequired, inReplyTo, quote, text, visibility } = search;
  const { quoteCompose, replyCompose, resetCompose, setComposeToStatus, updateCompose } =
    useComposeActions();

  useEffect(() => {
    resetCompose('compose-modal');

    if (text || visibility) {
      updateCompose('compose-modal', (draft) => {
        draft.text = text ?? '';
        draft.visibility = visibility ?? draft.visibility;
      });
    }

    if (inReplyTo) {
      fetchStatus(client, inReplyTo, scopeUrl).then(() => {
        const status = queryClient.getQueryData(queryKeys.statuses.show(inReplyTo));
        if (!status) return;

        replyCompose(status, undefined, approvalRequired, false);
      });
      return;
    }

    if (quote) {
      fetchStatus(client, quote, scopeUrl).then(() => {
        const status = queryClient.getQueryData(queryKeys.statuses.show(quote));
        if (!status) return;

        quoteCompose(status, approvalRequired, false);
      });
    }
  }, [
    scopeUrl,
    approvalRequired,
    client,
    inReplyTo,
    quote,
    quoteCompose,
    resetCompose,
    replyCompose,
    text,
    updateCompose,
    visibility,
  ]);

  useEffect(() => {
    if (!draftStatus || !ownAccount) return;

    const status = buildStatus(ownAccount, draftStatus);
    const poll = buildPoll(draftStatus.poll);

    if (status.in_reply_to_id) {
      fetchStatus(client, status.in_reply_to_id, scopeUrl).catch(() => {});
    }

    setComposeToStatus(
      status,
      poll,
      { ...draftStatus, location: null },
      false,
      draftStatus.draft_id,
      draftStatus.editorState,
    );
  }, [scopeUrl, client, draftStatus, ownAccount, setComposeToStatus]);

  return (
    <Column withBack={false} label={intl.formatMessage(messages.heading)}>
      <Suspense>
        <ComposeForm
          fullScreen
          id='compose-modal'
          onSubmit={() => {
            window.close();
            navigate({ replace: true, to: '/' });
          }}
          transparent
        />
      </Suspense>
    </Column>
  );
};

export { NewStatusPage as default };
