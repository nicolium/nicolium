import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Emojify from '@/features/emoji/emojify';
import { usePlFeConfig } from '@/hooks/use-pl-fe-config';
import sourceCode from '@/utils/code';

const messages = defineMessages({
  meow: { id: 'footer.meow', defaultMessage: 'meow :3 {emoji}' },
});

const LinkFooter: React.FC = (): JSX.Element => {
  const intl = useIntl();
  const plFeConfig = usePlFeConfig();

  return (
    <>
      <p className='⁂-footer-text'>
        {plFeConfig.linkFooterMessage ? (
          <Emojify text={plFeConfig.linkFooterMessage} />
        ) : (
          <FormattedMessage
            id='getting_started.open_source_notice'
            defaultMessage='{code_name} is open source software. You can contribute or report issues at {code_link} (v{code_version}).'
            values={{
              code_name: sourceCode.displayName,
              code_link: <a href={sourceCode.url} rel='noopener' target='_blank'>{sourceCode.repository}</a>,
              code_version: sourceCode.version,
            }}
          />
        )}
      </p>
      <p className='⁂-footer-text' aria-hidden>
        <Emojify text={intl.formatMessage(messages.meow, { emoji: '🐱' })} />
      </p>
    </>
  );
};

export { LinkFooter as default };
