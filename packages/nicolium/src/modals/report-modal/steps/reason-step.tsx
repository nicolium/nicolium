import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import FormGroup from '@/components/ui/form-group';
import Textarea from '@/components/ui/textarea';
import { useInstance } from '@/stores/instance';

import type { Account } from 'pl-api';

const messages = defineMessages({
  placeholder: { id: 'report.placeholder', defaultMessage: 'Additional comments' },
});

interface IReasonStep {
  account?: Account;
  comment: string;
  setComment: (value: string) => void;
  ruleIds: Array<string>;
  setRuleIds: (value: Array<string>) => void;
}

const RULES_HEIGHT = 385;

const ReasonStep: React.FC<IReasonStep> = ({ comment, setComment, ruleIds, setRuleIds }) => {
  const intl = useIntl();

  const rulesListRef = useRef(null);

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const { rules } = useInstance();
  const shouldRequireRule = rules.length > 0;

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleRuleChange = (ruleId: string) => {
    let newRuleIds;
    if (ruleIds.includes(ruleId)) newRuleIds = ruleIds.filter((id) => id !== ruleId);
    else newRuleIds = [...ruleIds, ruleId];
    setRuleIds(newRuleIds);
  };

  const handleRulesScrolling = () => {
    if (rulesListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = rulesListRef.current;

      if (scrollTop + clientHeight > scrollHeight - 24) {
        setNearBottom(true);
      } else {
        setNearBottom(false);
      }

      if (scrollTop < 24) {
        setNearTop(true);
      } else {
        setNearTop(false);
      }
    }
  };

  useEffect(() => {
    if (rules.length > 0 && rulesListRef.current) {
      const { clientHeight } = rulesListRef.current;

      if (clientHeight <= RULES_HEIGHT) {
        setNearBottom(true);
      }
    }
  }, [rules]);

  return (
    <div className='report-modal__reason-step'>
      {shouldRequireRule && (
        <div className='report-modal__reason-step__rules'>
          <h1 className='report-modal__reason-step__title'>
            <FormattedMessage id='report.reason.title' defaultMessage='Reason for reporting' />
          </h1>

          <div className='report-modal__reason-step__rules-wrapper'>
            <div
              style={{ maxHeight: RULES_HEIGHT }}
              className='report-modal__reason-step__rules-list'
              onScroll={handleRulesScrolling}
              ref={rulesListRef}
            >
              {rules.map((rule, idx) => {
                const isSelected = ruleIds.includes(rule.id);

                return (
                  <button
                    key={idx}
                    data-testid={`rule-${rule.id}`}
                    onClick={() => {
                      handleRuleChange(rule.id);
                    }}
                    className={clsx('report-modal__reason-step__rule', {
                      'report-modal__reason-step__rule--selected': isSelected,
                    })}
                  >
                    <div className='report-modal__reason-step__rule__content'>
                      <span
                        className={clsx('report-modal__reason-step__rule__text', {
                          'report-modal__reason-step__rule__text--selected': isSelected,
                        })}
                      >
                        {rule.text}
                      </span>
                      <span className='report-modal__reason-step__rule__hint'>{rule.hint}</span>
                    </div>

                    <input
                      name='reason'
                      type='checkbox'
                      value={rule.id}
                      checked={isSelected}
                      readOnly
                      className='report-modal__reason-step__rule__checkbox'
                    />
                  </button>
                );
              })}
            </div>

            <div
              className={clsx(
                'report-modal__reason-step__rules-fade report-modal__reason-step__rules-fade--top',
                {
                  'report-modal__reason-step__rules-fade--hidden': isNearTop,
                },
              )}
            />
            <div
              className={clsx(
                'report-modal__reason-step__rules-fade report-modal__reason-step__rules-fade--bottom',
                {
                  'report-modal__reason-step__rules-fade--hidden': isNearBottom,
                },
              )}
            />
          </div>
        </div>
      )}

      <FormGroup labelText={intl.formatMessage(messages.placeholder)}>
        <Textarea
          placeholder={intl.formatMessage(messages.placeholder)}
          value={comment}
          onChange={handleCommentChange}
        />
      </FormGroup>
    </div>
  );
};

export { ReasonStep as default };
