import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from '@/components/copyable-input';
import SafeEmbed from '@/components/safe-embed';
import Divider from '@/components/ui/divider';
import Modal from '@/components/ui/modal';
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
      <div className='embed-modal'>
        <p className='embed-modal__instructions'>
          <FormattedMessage
            id='embed.instructions'
            defaultMessage='Embed this post on your website by copying the code below.'
          />
        </p>

        <CopyableInput value={embed?.html ?? ''} />

        <Divider />

        <SafeEmbed
          sandbox='allow-same-origin allow-scripts'
          title='embedded-status'
          html={embed?.html}
        />
      </div>
    </Modal>
  );
};

export { EmbedModal as default, type EmbedModalProps };
