import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { type Language, languages } from '@/features/preferences';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import DropdownMenu from '../dropdown-menu';

import type { NormalizedStatus as Status } from '@/normalizers/status';

const messages = defineMessages({
  languageVersions: {
    id: 'status.language_versions',
    defaultMessage: 'The post has multiple language versions.',
  },
});

interface IStatusLanguagePicker {
  status: Pick<Status, 'id' | 'content_map'>;
  showLabel?: boolean;
}

const StatusLanguagePicker: React.FC<IStatusLanguagePicker> = React.memo(
  ({ status, showLabel }) => {
    const intl = useIntl();

    const { currentLanguage } = useStatusMeta(status.id);
    const { setStatusLanguage } = useStatusMetaActions();

    if (!status.content_map || Object.keys(status.content_map).length < 2) return null;

    const icon = (
      <Icon
        className='size-4 text-gray-700 dark:text-gray-600'
        src={require('@phosphor-icons/core/regular/translate.svg')}
      />
    );

    return (
      <>
        <span className='⁂-separator' />

        <DropdownMenu
          items={Object.keys(status.content_map).map((language) => ({
            text: languages[language as Language] || language,
            action: () => {
              setStatusLanguage(status.id, language);
            },
            active: language === currentLanguage,
          }))}
        >
          <button title={intl.formatMessage(messages.languageVersions)} className='hover:underline'>
            {showLabel ? (
              <HStack space={1} alignItems='center'>
                {icon}
                <Text tag='span' theme='muted' size='sm'>
                  {languages[currentLanguage as Language] || currentLanguage}
                </Text>
              </HStack>
            ) : (
              icon
            )}
          </button>
        </DropdownMenu>
      </>
    );
  },
);

export { StatusLanguagePicker as default };
