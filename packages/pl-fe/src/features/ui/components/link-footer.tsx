import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { WITH_LANDING_PAGE } from 'pl-fe/build-config';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import sourceCode from 'pl-fe/utils/code';

const messages = defineMessages({
  footerNotice: { id: 'getting_started.footer_notice', defaultMessage: 'Proudly made in Poland. {emoji}' },
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
      {WITH_LANDING_PAGE && (
        <p className='⁂-footer-text'>
          <Emojify text={intl.formatMessage(messages.footerNotice, { emoji: '🇵🇱🏳️‍⚧️' })} />
        </p>
      )}
    </>
  );
};

export { LinkFooter as default };
