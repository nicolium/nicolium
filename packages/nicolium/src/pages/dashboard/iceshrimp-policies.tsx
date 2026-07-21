import { create } from 'mutative';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Accordion from '@/components/ui/accordion';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Streamfield from '@/components/ui/streamfield';
import Toggle from '@/components/ui/toggle';
import { usePolicies, usePolicy, useSetPolicy } from '@/queries/admin/use-policies';
import toast from '@/toast';

import { PrimitiveListStreamfieldInput } from './components/pleroma-config/config-value-editor';

const messages = defineMessages({
  heading: { id: 'column.admin.iceshrimp_policies', defaultMessage: 'Iceshrimp.NET policies' },
  success: { id: 'admin.iceshrimp_policies.save.success', defaultMessage: 'Policy updated' },
  error: { id: 'admin.iceshrimp_policies.save.error', defaultMessage: 'Failed to update policy' },
});

interface IPolicyField {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

const PolicyField: React.FC<IPolicyField> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;
    onChange(typeof value === 'number' ? Number(newValue) : newValue);
  };

  switch (typeof value) {
    case 'boolean':
      return (
        <div className='admin-config__toggle-field'>
          <Toggle checked={value === true} onChange={(event) => onChange(event.target.checked)} />
        </div>
      );
    case 'string':
      return <Input type='text' value={value} onChange={handleChange} />;
    case 'number':
      return <Input type='number' value={value} onChange={handleChange} />;
    case 'object':
      if (Array.isArray(value)) {
        return (
          <Streamfield
            values={value}
            onChange={(newValue) => onChange(newValue)}
            onAddItem={() => onChange([...value, ''])}
            onRemoveItem={(index) => onChange(value.filter((_, i) => i !== index))}
            component={PrimitiveListStreamfieldInput}
          />
        );
      }
      return (
        <FormattedMessage
          id='admin.iceshrimp_policies.unsupported_field'
          defaultMessage='Unsupported field type'
        />
      );
    default:
      return (
        <FormattedMessage
          id='admin.iceshrimp_policies.unsupported_field'
          defaultMessage='Unsupported field type'
        />
      );
  }
};

interface IPolicy {
  name: string;
}

const Policy: React.FC<IPolicy> = ({ name }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: policy } = usePolicy(name);
  const { mutate, isPending } = useSetPolicy(name);
  const [isDirty, setIsDirty] = useState(false);
  const [draftValue, setDraftValue] = useState<Record<string, unknown> | undefined>(policy);

  useEffect(() => {
    if (policy) setDraftValue(policy);
    setIsDirty(false);
  }, [policy]);

  const handleSave = () => {
    if (!draftValue) return;
    mutate(draftValue, {
      onSuccess: () => {
        setIsDirty(false);
        toast.success(messages.success);
      },
      onError: () => {
        toast.error(messages.error);
      },
    });
  };

  const renderField = (key: string, value: unknown) => {
    const setValue = (newValue: unknown) => {
      setDraftValue(
        create(draftValue, (draft) => {
          if (!draft) draft = {};
          draft[key] = newValue;
        }),
      );
      setIsDirty(true);
    };

    return <PolicyField name={key} value={value} onChange={setValue} />;
  };

  return (
    <Accordion headline={name} expanded={expanded} onToggle={setExpanded}>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <fieldset className='admin-config__fieldset' disabled={isPending}>
          {Object.entries(draftValue || {}).map(([key, value]) => (
            <FormGroup key={key} labelText={key}>
              {renderField(key, value)}
            </FormGroup>
          ))}
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
            type='submit'
            disabled={isPending || !isDirty}
            className='admin-config__submit-button'
          >
            <FormattedMessage id='admin.pleroma_config.save' defaultMessage='Save' />
          </button>
        </FormActions>
      </Form>
    </Accordion>
  );
};

const IceshrimpPoliciesPage: React.FC = () => {
  const intl = useIntl();
  const { data: policies } = usePolicies();

  return (
    <Column className='admin-policies' label={intl.formatMessage(messages.heading)}>
      <div className='admin-config__accordion-list'>
        {policies?.map((policy) => (
          <Policy key={policy} name={policy} />
        ))}
      </div>
    </Column>
  );
};

export { IceshrimpPoliciesPage as default };
