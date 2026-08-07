import React from 'react';
import { FormattedMessage } from 'react-intl';

import Emojify from '@/emoji/emojify';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import sourceCode from '@/utils/code';

const LinkFooter: React.FC = (): React.JSX.Element => {
  const frontendConfig = useFrontendConfig();

  return (
    <>
      <p className='footer-text'>
        {frontendConfig.linkFooterMessage ? (
          <Emojify text={frontendConfig.linkFooterMessage} />
        ) : (
          <FormattedMessage
            id='getting_started.open_source_notice'
            defaultMessage='{code_name} is free and open source software. You can contribute or report issues at {code_link} (v{code_version}).'
            values={{
              code_name: sourceCode.displayName,
              code_link: (
                <a href={sourceCode.url} rel='noopener noreferrer' target='_blank'>
                  {sourceCode.repository}
                </a>
              ),
              code_version: sourceCode.version,
            }}
          />
        )}
      </p>
      {frontendConfig.copyright.trim() && (
        <p className='footer-text'>
          <Emojify text={frontendConfig.copyright} />
        </p>
      )}
    </>
  );
};

export { LinkFooter as default };
