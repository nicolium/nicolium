import clsx from 'clsx';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import Text from '@/components/ui/text';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import type { Status } from '@/normalizers/status';
import type { FilterResult } from 'pl-api';

const useMediaVisible = (
  status: Pick<Status, 'media_attachments' | 'sensitive'> &
    Partial<Pick<Status, 'filtered' | 'id'>>,
  displayMedia: 'default' | 'show_all' | 'hide_all',
): [boolean, Array<FilterResult>] => {
  const { mediaVisible } = useStatusMeta(status.id as string);

  return useMemo(() => {
    let visible = !status.sensitive;

    const filterResults =
      status.filtered?.filter(({ filter }) => filter.filter_action === 'blur') ?? [];

    if (filterResults.length) return [mediaVisible ?? false, filterResults];

    if (mediaVisible !== undefined) visible = mediaVisible;
    else if (displayMedia === 'show_all') visible = true;
    else if (displayMedia === 'hide_all' && status.media_attachments.length) visible = false;

    return [visible, []];
  }, [status.sensitive, status.filtered, mediaVisible]);
};

const useShowOverlay = (
  status: Pick<Status, 'id' | 'filtered' | 'media_attachments' | 'sensitive'>,
  displayMedia: 'default' | 'show_all' | 'hide_all',
) => {
  const [visible] = useMediaVisible(status, displayMedia);

  const showHideButton =
    status.sensitive || (status.media_attachments.length && displayMedia === 'hide_all');

  return !visible || showHideButton;
};

interface ISensitiveContentOverlay {
  status: Pick<Status, 'id' | 'filtered' | 'sensitive' | 'media_attachments'>;
}

const SensitiveContentOverlay = React.forwardRef<HTMLDivElement, ISensitiveContentOverlay>(
  (props, ref) => {
    const { status } = props;

    const { displayMedia } = useSettings();

    const [visible, filters] = useMediaVisible(status, displayMedia);

    const matchedFilters = useMemo(() => filters.map(({ filter }) => filter.title), [filters]);

    const { hideStatusesMedia, revealStatusesMedia } = useStatusMetaActions();

    const toggleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (visible) hideStatusesMedia([status.id]);
      else revealStatusesMedia([status.id]);
    };

    if (!useShowOverlay(status, displayMedia)) return null;

    return (
      <div
        className={clsx('absolute z-[1]', {
          'flex h-full w-full cursor-default justify-center rounded-md border-0 backdrop-blur-lg':
            !visible,
          'inset-0 bg-gray-800/75': !visible,
          'bottom-1 right-1': visible,
        })}
        data-testid='sensitive-overlay'
      >
        {visible ? (
          <Button
            text={<FormattedMessage id='moderation_overlay.hide' defaultMessage='Hide content' />}
            icon={require('@phosphor-icons/core/regular/eye-slash.svg')}
            onClick={toggleVisibility}
            theme='primary'
            size='sm'
          />
        ) : (
          <div className='flex max-h-screen items-center justify-center'>
            <div className='mx-auto space-y-4 text-center' ref={ref}>
              <div className='space-y-1'>
                <Text theme='white' weight='semibold'>
                  <FormattedMessage
                    id='status.sensitive_warning'
                    defaultMessage='Sensitive content'
                  />
                </Text>

                <Text theme='white' size='sm' weight='medium'>
                  {filters.length ? (
                    <FormattedMessage
                      id='status.sensitive_warning.matches_filter'
                      defaultMessage='Matches filter “<span>{title}</span>”'
                      values={{
                        title: matchedFilters.join(', '),
                        span: (chunks) => <span className='filter-name'>{chunks}</span>,
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      id='status.sensitive_warning.subtitle'
                      defaultMessage='This content may not be suitable for all audiences.'
                    />
                  )}
                </Text>
              </div>

              <HStack alignItems='center' justifyContent='center' space={2}>
                <Button
                  type='button'
                  theme='outlined'
                  size='sm'
                  icon={require('@phosphor-icons/core/regular/eye.svg')}
                  onClick={toggleVisibility}
                >
                  <FormattedMessage id='moderation_overlay.show' defaultMessage='Show content' />
                </Button>
              </HStack>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export { SensitiveContentOverlay as default, useMediaVisible };
