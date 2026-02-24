import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeContentType } from '@/actions/compose';
import DropdownMenu from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';
import { useInstance } from '@/hooks/use-instance';

const messages = defineMessages({
  contentTypePlaintext: {
    id: 'preferences.options.content_type_plaintext',
    defaultMessage: 'Plain text',
  },
  contentTypeMarkdown: {
    id: 'preferences.options.content_type_markdown',
    defaultMessage: 'Markdown',
  },
  contentTypeMfm: { id: 'preferences.options.content_type_mfm', defaultMessage: 'MFM' },
  contentTypeHtml: { id: 'preferences.options.content_type_html', defaultMessage: 'HTML' },
  contentTypeWysiwyg: {
    id: 'preferences.options.content_type_wysiwyg',
    defaultMessage: 'WYSIWYG',
  },
  changeContentType: {
    id: 'compose_form.content_type.change',
    defaultMessage: 'Change content type',
  },
});

interface IContentTypeButton {
  composeId: string;
  compact?: boolean;
}

const ContentTypeButton: React.FC<IContentTypeButton> = ({ composeId, compact }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const { contentType } = useCompose(composeId);

  const handleChange = (contentType: string) => () =>
    dispatch(changeComposeContentType(composeId, contentType));

  const postFormats = instance.pleroma.metadata.post_formats;

  const options = [];

  if (postFormats.includes('text/plain')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/paragraph.svg'),
      text: intl.formatMessage(messages.contentTypePlaintext),
      value: 'text/plain',
    });
  }

  if (postFormats.includes('text/markdown')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/markdown-logo.svg'),
      text: intl.formatMessage(messages.contentTypeMarkdown),
      value: 'text/markdown',
    });
  }

  if (postFormats.includes('text/x.misskeymarkdown')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/sparkle.svg'),
      text: intl.formatMessage(messages.contentTypeMfm),
      value: 'text/x.misskeymarkdown',
    });
  }

  if (postFormats.includes('text/html')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/file-html.svg'),
      text: intl.formatMessage(messages.contentTypeHtml),
      value: 'text/html',
    });
  }

  if (postFormats.includes('text/markdown')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/text-indent.svg'),
      text: intl.formatMessage(messages.contentTypeWysiwyg),
      value: 'wysiwyg',
    });
  }

  const option = options.find(({ value }) => value === contentType);

  return (
    <DropdownMenu
      items={options.map(({ icon, text, value }) => ({
        icon,
        text,
        action: handleChange(value),
        active: contentType === value,
      }))}
    >
      <button
        className='⁂-content-type-button'
        title={compact ? option?.text : intl.formatMessage(messages.changeContentType)}
      >
        {option?.icon && <Icon src={option.icon} aria-hidden />}
        {compact ? undefined : option?.text}
        <Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} aria-hidden />
      </button>
    </DropdownMenu>
  );
};

export { ContentTypeButton as default };
