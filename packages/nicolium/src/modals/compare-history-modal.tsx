import { diffWords } from 'diff';
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import Toggle from '@/components/ui/toggle';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useStatusHistory } from '@/queries/statuses/use-status-history';
import { unescapeHTML } from '@/utils/html';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { MinifiedStatusEdit } from '@/queries/statuses/use-status-history';
import type { Change } from 'diff';
import type { CustomEmoji } from 'pl-api';

interface CompareHistoryModalProps {
  statusId: string;
}

interface IDiffText {
  changes: Array<Change>;
  emojis?: Array<CustomEmoji>;
  nyaize?: boolean;
}

const DiffText: React.FC<IDiffText> = ({ changes, emojis, nyaize }) => (
  <>
    {changes.map((change, index) => {
      const text = <Emojify text={change.value} emojis={emojis} nyaize={nyaize} />;

      if (change.added)
        return (
          <ins
            key={index}
            className='status-history-modal__diff status-history-modal__diff--insert'
          >
            {text}
          </ins>
        );

      if (change.removed)
        return (
          <del
            key={index}
            className='status-history-modal__diff status-history-modal__diff--delete'
          >
            {text}
          </del>
        );

      return <React.Fragment key={index}>{text}</React.Fragment>;
    })}
  </>
);

const CompareHistoryModal: React.FC<BaseModalProps & CompareHistoryModalProps> = ({
  onClose,
  statusId,
}) => {
  const { data: versions, isLoading } = useStatusHistory(statusId);

  const { data: status } = useMinimalStatus(statusId);
  const { data: statusAccount } = useAccount(status?.account_id ?? '');

  const [highlightDiff, setHighlightDiff] = React.useState(false);

  const onClickClose = () => {
    onClose('COMPARE_HISTORY');
  };

  let body;

  if (isLoading) {
    body = <Spinner />;
  } else {
    body = (
      <>
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='compare_history_modal.highlight_diff'
                defaultMessage='Highlight difference'
              />
            }
          >
            <Toggle
              checked={highlightDiff}
              onChange={({ target: { checked } }) => setHighlightDiff(checked)}
            />
          </ListItem>
        </List>
        <div className='status-list'>
          {versions?.map((version, index) => {
            let spoiler;
            let content;

            if (highlightDiff) {
              const previous: MinifiedStatusEdit | undefined = versions[index - 1];

              const textContent = unescapeHTML(version.content);

              const contentChanges = diffWords(
                previous ? unescapeHTML(previous.content) : '',
                textContent,
              );

              const spoilerChanges =
                version.spoiler_text.length > 0 || (previous?.spoiler_text.length ?? 0) > 0
                  ? diffWords(previous?.spoiler_text ?? '', version.spoiler_text)
                  : null;

              spoiler = spoilerChanges && (
                <>
                  <span>
                    <DiffText changes={spoilerChanges} emojis={version.emojis} />
                  </span>
                  <hr />
                </>
              );

              if (previous) {
                content = (
                  <DiffText
                    changes={contentChanges}
                    emojis={version.emojis}
                    nyaize={statusAccount?.speak_as_cat}
                  />
                );
              } else {
                content = (
                  <Emojify
                    text={textContent}
                    emojis={version.emojis}
                    nyaize={statusAccount?.speak_as_cat}
                  />
                );
              }
            } else {
              spoiler = <Emojify text={version.spoiler_text} emojis={version.emojis} />;

              content = (
                <ParsedContent
                  html={version.content}
                  mentions={status?.mentions}
                  hasQuote={!!status?.quote_id}
                  emojis={version.emojis}
                  speakAsCat={statusAccount?.speak_as_cat}
                />
              );
            }

            const poll = typeof version.poll !== 'string' && version.poll;

            return (
              <div className='status-history-modal__version' key={version.created_at}>
                {spoiler}

                <div className='status-history-modal__content' data-markup>
                  {content}
                </div>

                {poll && (
                  <div className='status-history-modal__poll'>
                    {poll.options.map((option) => (
                      <div className='status-history-modal__poll__option' key={option.title}>
                        <span className='status-history-modal__poll__option__bar' aria-hidden />

                        <span>
                          <ParsedContent
                            html={option.title}
                            emojis={version.emojis}
                            speakAsCat={statusAccount?.speak_as_cat}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {version.media_attachments.length > 0 && <AttachmentThumbs status={version} />}

                <time>
                  {index === 0 && (
                    <>
                      <span className='status-history-modal__original'>
                        <FormattedMessage
                          id='compare_history_modal.original'
                          defaultMessage='Original'
                        />
                      </span>{' '}
                      <span className='separator' />{' '}
                    </>
                  )}

                  <FormattedDate
                    value={new Date(version.created_at)}
                    hour12
                    year='numeric'
                    month='short'
                    day='2-digit'
                    hour='numeric'
                    minute='2-digit'
                  />
                </time>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='compare_history_modal.header' defaultMessage='Edit history' />}
      onClose={onClickClose}
      className='status-history-modal'
    >
      {body}
    </Modal>
  );
};

export { type CompareHistoryModalProps, CompareHistoryModal as default };
