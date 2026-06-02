import React, { memo, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Accordion from '@/components/ui/accordion';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';

import { ConfigValueEditor } from './config-value-editor';
import { getDescriptionValue, getDescriptionValueSignature } from './utils';

import type { PleromaConfigDescription } from 'pl-api';

interface IConfigGroupEditor {
  description: PleromaConfigDescription;
  currentValue: unknown;
  currentValueSignature: string;
  onSave: (description: PleromaConfigDescription, value: unknown) => void;
  isPending: boolean;
}

const ConfigGroupEditor = memo(
  ({
    description,
    currentValue,
    currentValueSignature: _currentValueSignature,
    onSave,
    isPending,
  }: IConfigGroupEditor) => {
    const [draftValue, setDraftValue] = useState(currentValue);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      setDraftValue(currentValue);
      setHasError(false);
    }, [currentValue]);

    const isDirty = useMemo(
      () => JSON.stringify(draftValue) !== JSON.stringify(currentValue),
      [currentValue, draftValue],
    );

    if (!description.group) return null;

    return (
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(description, draftValue);
        }}
      >
        <fieldset className='admin-config__fieldset' disabled={isPending}>
          <ConfigValueEditor
            node={description}
            value={draftValue}
            onChange={setDraftValue}
            onValidityChange={setHasError}
          />
        </fieldset>

        <FormActions>
          {!isDirty ? (
            <p className='admin-config__feedback'>
              <FormattedMessage
                id='admin.pleroma_config.no_changes'
                defaultMessage='No changes yet'
              />
            </p>
          ) : null}

          <button
            type='button'
            disabled={isPending || !isDirty}
            className='admin-config__reset-button'
            onClick={() => {
              setDraftValue(currentValue);
              setHasError(false);
            }}
          >
            <FormattedMessage id='admin.pleroma_config.reset' defaultMessage='Reset' />
          </button>

          <button
            type='submit'
            disabled={isPending || hasError || !isDirty}
            className='admin-config__submit-button'
          >
            <FormattedMessage id='admin.pleroma_config.save' defaultMessage='Save' />
          </button>
        </FormActions>
      </Form>
    );
  },
  (prevProps, nextProps) =>
    prevProps.description === nextProps.description &&
    prevProps.currentValueSignature === nextProps.currentValueSignature &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.isPending === nextProps.isPending,
);

ConfigGroupEditor.displayName = 'ConfigGroupEditor';

interface IConfigSection {
  group: string;
  descriptions: PleromaConfigDescription[];
  configValueMap: Map<string, unknown>;
  onSave: (description: PleromaConfigDescription, value: unknown) => void;
  isPending: boolean;
}

const ConfigSection = memo(
  ({ group, descriptions, configValueMap, onSave, isPending }: IConfigSection) => {
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    return (
      <section className='admin-config__section'>
        <div className='admin-config__section-header'>
          <h2 className='admin-config__section-title'>{group}</h2>
        </div>

        <div className='admin-config__accordion-list'>
          {descriptions.map((description) => {
            const accordionKey =
              description.key ?? description.label ?? `${group}-${description.type}`;
            const currentValue = getDescriptionValue(description, configValueMap);

            return (
              <Accordion
                key={accordionKey}
                expanded={expandedKey === accordionKey}
                onToggle={(open) => setExpandedKey(open ? accordionKey : null)}
                headline={
                  <div className='admin-config__accordion-headline'>
                    <p className='admin-config__headline-title'>
                      {description.label ?? description.key}
                    </p>

                    {description.description ? (
                      <p className='admin-config__meta'>{description.description}</p>
                    ) : null}
                  </div>
                }
              >
                {expandedKey === accordionKey && (
                  <ConfigGroupEditor
                    description={description}
                    currentValue={currentValue}
                    currentValueSignature={getDescriptionValueSignature(
                      description,
                      configValueMap,
                    )}
                    onSave={onSave}
                    isPending={isPending}
                  />
                )}
              </Accordion>
            );
          })}
        </div>
      </section>
    );
  },
  (prevProps, nextProps) => {
    if (
      prevProps.group !== nextProps.group ||
      prevProps.descriptions !== nextProps.descriptions ||
      prevProps.onSave !== nextProps.onSave ||
      prevProps.isPending !== nextProps.isPending
    ) {
      return false;
    }

    return prevProps.descriptions.every((description) => {
      return (
        getDescriptionValueSignature(description, prevProps.configValueMap) ===
        getDescriptionValueSignature(description, nextProps.configValueMap)
      );
    });
  },
);

ConfigSection.displayName = 'ConfigSection';

export { ConfigSection };
