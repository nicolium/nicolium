import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useCompose } from '@/hooks/use-compose';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useSettings } from '@/stores/settings';

import Warning from '../components/warning';

const APPROX_HASHTAG_RE = /(?:^|[^/)\w])#(\w*[a-zA-Z·]\w*)/i;
const HASHTAG_WARNING_VISIBILITIES = ['unlisted', 'private', 'mutuals_only'];

interface IWarningWrapper {
  composeId: string;
}

const WarningWrapper: React.FC<IWarningWrapper> = ({ composeId }) => {
  const compose = useCompose(composeId);
  const { data: account } = useOwnAccount();
  const { defaultPrivacy } = useSettings();

  const needsLockWarning =
    (compose.visibility === 'private' || compose.visibility === 'mutuals_only') && !account?.locked;
  const hashtagWarning =
    HASHTAG_WARNING_VISIBILITIES.includes(
      compose.visibility === 'default' ? defaultPrivacy : compose.visibility,
    ) && APPROX_HASHTAG_RE.test(compose.text);
  const directMessageWarning = compose.visibility === 'direct';

  if (needsLockWarning) {
    return (
      <Warning
        message={
          <FormattedMessage
            id='compose_form.lock_disclaimer'
            defaultMessage='Your account is not {locked}. Anyone can follow you to view your follower-only posts.'
            values={{
              locked: (
                <Link className='underline' to='/settings/profile'>
                  <FormattedMessage
                    id='compose_form.lock_disclaimer.lock'
                    defaultMessage='locked'
                  />
                </Link>
              ),
            }}
          />
        }
        animated
      />
    );
  }

  if (hashtagWarning) {
    return (
      <Warning
        message={
          <FormattedMessage
            id='compose_form.hashtag_warning'
            defaultMessage='This post won’t be listed under any hashtag as it is unlisted. Only public posts can be searched by hashtag.'
          />
        }
        animated
      />
    );
  }

  if (directMessageWarning) {
    const message = (
      <span>
        <FormattedMessage
          id='compose_form.direct_message_warning'
          defaultMessage='This post will only be sent to the mentioned users.'
        />
      </span>
    );

    return <Warning message={message} animated />;
  }

  return null;
};

export { WarningWrapper as default };
