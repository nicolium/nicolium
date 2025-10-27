import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeContentType } from 'pl-fe/actions/compose';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import Button from 'pl-fe/components/ui/button';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useInstance } from 'pl-fe/hooks/use-instance';

const messages = defineMessages({
  content_type_plaintext: { id: 'preferences.options.content_type_plaintext', defaultMessage: 'Plain text' },
  content_type_markdown: { id: 'preferences.options.content_type_markdown', defaultMessage: 'Markdown' },
  content_type_mfm: { id: 'preferences.options.content_type_mfm', defaultMessage: 'MFM' },
  content_type_html: { id: 'preferences.options.content_type_html', defaultMessage: 'HTML' },
  content_type_wysiwyg: { id: 'preferences.options.content_type_wysiwyg', defaultMessage: 'WYSIWYG' },
  change_content_type: { id: 'compose_form.content_type.change', defaultMessage: 'Change content type' },
});

interface IContentTypeButton {
  composeId: string;
  compact?: boolean;
}

const ContentTypeButton: React.FC<IContentTypeButton> = ({ composeId, compact }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const contentType = useCompose(composeId).content_type;

  const handleChange = (contentType: string) => () => dispatch(changeComposeContentType(composeId, contentType));

  const postFormats = instance.pleroma.metadata.post_formats;

  const options = [];

  if (postFormats.includes('text/plain')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/paragraph.svg'),
      text: intl.formatMessage(messages.content_type_plaintext),
      value: 'text/plain',
    });
  }

  if (postFormats.includes('text/markdown')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/markdown-logo.svg'),
      text: intl.formatMessage(messages.content_type_markdown),
      value: 'text/markdown',
    });
  }

  if (postFormats.includes('text/x.misskeymarkdown')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/sparkle.svg'),
      text: intl.formatMessage(messages.content_type_mfm),
      value: 'text/x.misskeymarkdown',
    });
  }

  if (postFormats.includes('text/html')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/file-html.svg'),
      text: intl.formatMessage(messages.content_type_html),
      value: 'text/html',
    });
  }

  if (postFormats.includes('text/markdown')) {
    options.push({
      icon: require('@phosphor-icons/core/regular/text-indent.svg'),
      text: intl.formatMessage(messages.content_type_wysiwyg),
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
      <Button
        theme='muted'
        size='xs'
        text={compact ? undefined : option?.text}
        icon={option?.icon}
        secondaryIcon={require('@phosphor-icons/core/regular/caret-down.svg')}
        title={compact ? option?.text : intl.formatMessage(messages.change_content_type)}
      />
    </DropdownMenu>
  );
};

export { ContentTypeButton as default };
