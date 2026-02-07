import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Emojify from '@/features/emoji/emojify';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import sourceCode from '@/utils/code';

const messages = defineMessages({
  meow: { id: 'footer.meow', defaultMessage: 'meow :3 {emoji}' },
});

const LinkFooter: React.FC = (): JSX.Element => {
  const intl = useIntl();
  const frontendConfig = useFrontendConfig();

  return (
    <>
      <p className='⁂-footer-text'>
        {frontendConfig.linkFooterMessage ? (
          <Emojify text={frontendConfig.linkFooterMessage} />
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
