import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconFileHtml from '@phosphor-icons/core/regular/file-html.svg';
import iconMarkdownLogo from '@phosphor-icons/core/regular/markdown-logo.svg';
import iconParagraph from '@phosphor-icons/core/regular/paragraph.svg';
import iconSparkle from '@phosphor-icons/core/regular/sparkle.svg';
import iconTextIndent from '@phosphor-icons/core/regular/text-indent.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useCompose, useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

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
  const { updateCompose } = useComposeActions();
  const instance = useInstance();
  const { defaultContentType } = useSettings();

  let { contentType } = useCompose(composeId);
  if (contentType === 'default') contentType = defaultContentType;

  const handleChange = (value: string) => () =>
    updateCompose(composeId, (draft) => {
      draft.contentType = value;
    });

  const postFormats = instance.pleroma.metadata.post_formats;

  const options = [];

  if (postFormats.includes('text/plain')) {
    options.push({
      icon: iconParagraph,
      text: intl.formatMessage(messages.contentTypePlaintext),
      value: 'text/plain',
    });
  }

  if (postFormats.includes('text/markdown')) {
    options.push({
      icon: iconMarkdownLogo,
      text: intl.formatMessage(messages.contentTypeMarkdown),
      value: 'text/markdown',
    });
  }

  if (postFormats.includes('text/x.misskeymarkdown')) {
    options.push({
      icon: iconSparkle,
      text: intl.formatMessage(messages.contentTypeMfm),
      value: 'text/x.misskeymarkdown',
    });
  }

  if (postFormats.includes('text/html')) {
    options.push({
      icon: iconFileHtml,
      text: intl.formatMessage(messages.contentTypeHtml),
      value: 'text/html',
    });
  }

  if (postFormats.includes('text/markdown')) {
    options.push({
      icon: iconTextIndent,
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
        type='button'
        className='⁂-content-type-button'
        title={compact ? option?.text : intl.formatMessage(messages.changeContentType)}
      >
        {option?.icon && <Icon src={option.icon} aria-hidden />}
        {compact ? undefined : option?.text}
        <Icon src={iconCaretDown} aria-hidden />
      </button>
    </DropdownMenu>
  );
};

export { ContentTypeButton as default };
