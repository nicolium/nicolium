import { IconButton } from '@mkljczk/react-native-paper';
import { FileHtmlIcon } from 'phosphor-react-native/src/icons/FileHtml';
import { MarkdownLogoIcon } from 'phosphor-react-native/src/icons/MarkdownLogo';
import { ParagraphIcon } from 'phosphor-react-native/src/icons/Paragraph';
import { SparkleIcon } from 'phosphor-react-native/src/icons/Sparkle';
import React from 'react';
import { defineMessages, useIntl, type MessageDescriptor } from 'react-intl';

import { useInstance } from '@/contexts/current-account-context';
import { useComposeActions, useComposeContentType } from '@/stores/compose';

import { DropdownMenu, type DropdownMenuItem } from '../ui/dropdown-menu';
import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';
import type { SFSymbol } from 'expo-symbols';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';

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
  changeContentType: {
    id: 'compose_form.content_type.change',
    defaultMessage: 'Change content type',
  },
});

const contentTypes: Array<{
  value: string;
  icon: PhosphorIcon;
  appleIcon: SFSymbol;
  androidIcon: string;
  label: MessageDescriptor;
}> = [
  {
    value: 'text/plain',
    icon: ParagraphIcon,
    appleIcon: 'paragraphsign',
    androidIcon: 'ph_paragraph',
    label: messages.contentTypePlaintext,
  },
  {
    value: 'text/markdown',
    icon: MarkdownLogoIcon,
    appleIcon: 'textformat',
    androidIcon: 'ph_markdown_logo',
    label: messages.contentTypeMarkdown,
  },
  {
    value: 'text/x.misskeymarkdown',
    icon: SparkleIcon,
    appleIcon: 'sparkles',
    androidIcon: 'ph_sparkle',
    label: messages.contentTypeMfm,
  },
  {
    value: 'text/html',
    icon: FileHtmlIcon,
    appleIcon: 'chevron.left.forwardslash.chevron.right',
    androidIcon: 'ph_file_html',
    label: messages.contentTypeHtml,
  },
];

const ComposeContentTypeButton: React.FC<ICompose> = ({ composeId }) => {
  const intl = useIntl();
  const instance = useInstance();
  const { updateCompose } = useComposeActions();

  const contentType = useComposeContentType(composeId);

  const postFormats = instance.pleroma.metadata.post_formats;
  const options = contentTypes.filter(({ value }) => postFormats.includes(value));

  if (options.length < 2) return null;

  const option = options.find(({ value }) => value === contentType);

  const items: Array<DropdownMenuItem> = [
    {
      key: 'content-type',
      type: 'section',
      label: intl.formatMessage(messages.changeContentType),
      children: options.map(({ value, appleIcon, androidIcon, label }) => ({
        key: value,
        type: 'button',
        label: intl.formatMessage(label),
        appleIcon,
        androidIcon,
        checked: contentType === value,
        onPress: () =>
          updateCompose(composeId, (draft) => {
            draft.contentType = value;
          }),
      })),
    },
  ];

  return (
    <DropdownMenu
      trigger={
        <IconButton
          icon={iconHelper(option?.icon ?? ParagraphIcon)}
          style={{ marginHorizontal: 0 }}
          onPress={() => {}}
          accessibilityLabel={intl.formatMessage(messages.changeContentType)}
        />
      }
      items={items}
    />
  );
};

export { ComposeContentTypeButton };
