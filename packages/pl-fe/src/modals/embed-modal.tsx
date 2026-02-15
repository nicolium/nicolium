import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from '@/components/copyable-input';
import SafeEmbed from '@/components/safe-embed';
import Divider from '@/components/ui/divider';
import Modal from '@/components/ui/modal';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import useEmbed from '@/queries/embed';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface EmbedModalProps {
  url: string;
  onError: (error: any) => void;
}

const EmbedModal: React.FC<BaseModalProps & EmbedModalProps> = ({ onClose, onError, url }) => {
  const { data: embed, error, isError } = useEmbed(url);

  useEffect(() => {
    if (error && isError) {
      onError(error);
    }
  }, [isError]);

  const handleClose = () => {
    onClose('EMBED');
  };

  return (
    <Modal
      title={<FormattedMessage id='status.embed' defaultMessage='Embed post' />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <Text theme='muted'>
          <FormattedMessage id='embed.instructions' defaultMessage='Embed this post on your website by copying the code below.' />
        </Text>

        <CopyableInput value={embed?.html ?? ''} />
      </Stack>

      <div className='py-9'>
        <Divider />
      </div>

      <SafeEmbed
        className='w-full overflow-hidden rounded-xl'
        sandbox='allow-same-origin allow-scripts'
        title='embedded-status'
        html={embed?.html}
      />
    </Modal>
  );
};

export { EmbedModal as default, type EmbedModalProps };
