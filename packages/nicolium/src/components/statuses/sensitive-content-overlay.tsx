import iconEyeSlash from '@phosphor-icons/core/regular/eye-slash.svg';
import iconEye from '@phosphor-icons/core/regular/eye.svg';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';
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
        className={clsx('sensitive-content-overlay__container', {
          'sensitive-content-overlay__container--visible': visible,
        })}
        data-testid='sensitive-overlay'
      >
        {visible ? (
          <button onClick={toggleVisibility} type='button'>
            <Icon src={iconEyeSlash} aria-hidden />
            <FormattedMessage id='moderation_overlay.hide' defaultMessage='Hide content' />
          </button>
        ) : (
          <div className='sensitive-content-overlay'>
            <div ref={ref}>
              <div className='sensitive-content-overlay__content'>
                <p>
                  <FormattedMessage
                    id='status.sensitive_warning'
                    defaultMessage='Sensitive content'
                  />
                </p>

                <p>
                  {filters.length ? (
                    <FormattedMessage
                      id='status.sensitive_warning.matches_filter'
                      defaultMessage='Matches filter “<span>{title}</span>”'
                      values={{
                        title: matchedFilters.join(', '),
                        span: (chunks) => <span>{chunks}</span>,
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      id='status.sensitive_warning.subtitle'
                      defaultMessage='This content may not be suitable for all audiences.'
                    />
                  )}
                </p>
              </div>

              <div className='sensitive-content-overlay__actions'>
                <button type='button' onClick={toggleVisibility}>
                  <Icon src={iconEye} aria-hidden />
                  <FormattedMessage id='moderation_overlay.show' defaultMessage='Show content' />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

SensitiveContentOverlay.displayName = 'SensitiveContentOverlay';

export { SensitiveContentOverlay as default, useMediaVisible };
