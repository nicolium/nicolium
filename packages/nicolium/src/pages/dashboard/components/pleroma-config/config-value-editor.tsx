import isEqual from 'lodash/isEqual';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Streamfield from '@/components/ui/streamfield';
import Textarea from '@/components/ui/textarea';
import Toggle from '@/components/ui/toggle';

import {
  createDynamicEntry,
  createTupleEntry,
  getDefaultValueForType,
  getDynamicEntriesValue,
  getPrimitiveTypeName,
  getSuggestionValues,
  getTupleSuggestions,
  getTypeLabel,
  getUnionOptions,
  isContainerDescriptor,
  isStringOrImageType,
  isValueCompatibleWithType,
  mapToTupleArray,
  normalizeDynamicEntries,
  normalizePrimitiveListEntries,
  normalizeTupleEntries,
  numericTypes,
  parsePrimitiveListEntries,
  parseLooseValue,
  stringifyValue,
  textualTypes,
  tupleArrayToMap,
} from './utils';

import type { ConfigDescriptionNode, ConfigType, DynamicEntry, TupleEntry } from './utils';
import type { StreamfieldComponent } from '@/components/ui/streamfield';

const messages = defineMessages({
  placeholderValue: {
    id: 'admin.pleroma_config.placeholder_value',
    defaultMessage: 'value',
  },
  placeholderValueLeft: {
    id: 'admin.pleroma_config.placeholder_value.left',
    defaultMessage: 'left',
  },
  placeholderValueRight: {
    id: 'admin.pleroma_config.placeholder_value.right',
    defaultMessage: 'right',
  },
  placeholderValueKVKey: {
    id: 'admin.pleroma_config.placeholder_value.kv_key',
    defaultMessage: 'key',
  },
  placeholderValueKVValue: {
    id: 'admin.pleroma_config.placeholder_value.kv_value',
    defaultMessage: 'value',
  },
  valueType: {
    id: 'admin.pleroma_config.value_type',
    defaultMessage: 'Value type',
  },
});

interface ISuggestions {
  suggestions: unknown[];
  onSelect: (value: unknown) => void;
}

interface IConfigValueEditor {
  node: ConfigDescriptionNode;
  value: unknown;
  onChange: (value: unknown) => void;
  onValidityChange?: (value: boolean) => void;
}

const Suggestions = memo(({ suggestions, onSelect }: ISuggestions) => {
  if (!suggestions.length) return null;

  return (
    <div className='⁂-admin-config__suggestions'>
      <p className='⁂-admin-config__suggestions-label'>
        <FormattedMessage id='admin.pleroma_config.suggestions' defaultMessage='Suggestions' />
      </p>
      {suggestions.map((suggestion) => (
        <button
          key={`${typeof suggestion}-${stringifyValue(suggestion)}`}
          type='button'
          className='⁂-admin-config__suggestion-button'
          onClick={() => onSelect(suggestion)}
        >
          {typeof suggestion === 'string' ? suggestion : stringifyValue(suggestion)}
        </button>
      ))}
    </div>
  );
});

Suggestions.displayName = 'Suggestions';

const PrimitiveValueEditor = memo(({ node, value, onChange }: IConfigValueEditor) => {
  const typeName = getPrimitiveTypeName(node.type) ?? 'string';
  const suggestions = getSuggestionValues(node);
  const [textValue, setTextValue] = useState(
    typeof value === 'string' || typeof value === 'number' ? String(value) : '',
  );

  useEffect(() => {
    if (typeName === 'boolean') return;
    setTextValue(typeof value === 'string' || typeof value === 'number' ? String(value) : '');
  }, [typeName, value]);

  if (typeName === 'boolean') {
    return (
      <div className='⁂-admin-config__toggle-field'>
        <Toggle checked={value === true} onChange={(event) => onChange(event.target.checked)} />
      </div>
    );
  }

  if (numericTypes.has(typeName)) {
    return (
      <>
        <Input
          type='number'
          value={textValue}
          onChange={(event) => {
            setTextValue(event.target.value);

            if (!event.target.value.length) {
              onChange(getDefaultValueForType(typeName));
              return;
            }

            const parsed = Number(event.target.value);
            if (!Number.isNaN(parsed)) onChange(parsed);
          }}
        />

        <Suggestions
          suggestions={suggestions}
          onSelect={(suggestion) => {
            const nextValue =
              typeof suggestion === 'number' ? suggestion : Number.parseFloat(String(suggestion));
            if (Number.isNaN(nextValue)) return;

            setTextValue(String(nextValue));
            onChange(nextValue);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Input
        type='text'
        value={textValue}
        placeholder={typeName === 'atom' ? ':value' : undefined}
        onChange={(event) => {
          setTextValue(event.target.value);
          onChange(event.target.value);
        }}
      />

      <Suggestions
        suggestions={suggestions}
        onSelect={(suggestion) => {
          const nextValue = String(suggestion);
          setTextValue(nextValue);
          onChange(nextValue);
        }}
      />
    </>
  );
});

PrimitiveValueEditor.displayName = 'PrimitiveValueEditor';

const JsonValueEditor = memo(({ value, onChange, onValidityChange }: IConfigValueEditor) => {
  const [jsonText, setJsonText] = useState(stringifyValue(value));
  const [jsonError, setJsonError] = useState(false);

  useEffect(() => {
    setJsonText(stringifyValue(value));
    setJsonError(false);
    onValidityChange?.(false);
  }, [onValidityChange, value]);

  return (
    <div className='⁂-admin-config__editor-stack'>
      <Textarea
        isCodeEditor
        value={jsonText}
        hasError={jsonError}
        onChange={(event) => {
          const nextText = event.target.value;
          setJsonText(nextText);

          if (!nextText.trim().length) {
            setJsonError(false);
            onValidityChange?.(false);
            onChange(null);
            return;
          }

          try {
            onChange(JSON.parse(nextText));
            setJsonError(false);
            onValidityChange?.(false);
          } catch {
            setJsonError(true);
            onValidityChange?.(true);
          }
        }}
      />

      {jsonError ? (
        <p className='⁂-admin-config__feedback ⁂-admin-config__feedback--danger'>
          <FormattedMessage id='admin.pleroma_config.json_invalid' defaultMessage='Invalid JSON' />
        </p>
      ) : null}
    </div>
  );
});

JsonValueEditor.displayName = 'JsonValueEditor';

const PrimitiveListStreamfieldInput: StreamfieldComponent<string> = memo(({ value, onChange }) => {
  const intl = useIntl();

  return (
    <Input
      type='text'
      outerClassName='⁂-admin-config__streamfield-row__input'
      value={value}
      placeholder={intl.formatMessage(messages.placeholderValue)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
});

PrimitiveListStreamfieldInput.displayName = 'PrimitiveListStreamfieldInput';

const PrimitiveListEditor = memo(
  ({ node, itemType, value, onChange }: IConfigValueEditor & { itemType: ConfigType }) => {
    const suggestions = getSuggestionValues(node);
    const typeName = typeof itemType === 'string' ? itemType : 'string';
    const [entries, setEntries] = useState<string[]>(() => normalizePrimitiveListEntries(value));

    useEffect(() => {
      if (isEqual(parsePrimitiveListEntries(entries, typeName), value)) return;

      setEntries(normalizePrimitiveListEntries(value));
    }, [typeName, value]);

    const syncEntries = (nextEntries: string[]) => {
      setEntries(nextEntries);

      const nextValue = parsePrimitiveListEntries(nextEntries, typeName);
      if (isEqual(nextValue, value)) return;

      onChange(nextValue);
    };

    return (
      <div className='⁂-admin-config__editor-stack'>
        <Streamfield
          values={entries}
          onChange={syncEntries}
          onAddItem={() => syncEntries([...entries, ''])}
          onRemoveItem={(index) =>
            syncEntries(entries.filter((_, currentIndex) => currentIndex !== index))
          }
          component={PrimitiveListStreamfieldInput}
        />

        <Suggestions
          suggestions={suggestions}
          onSelect={(suggestion) => {
            syncEntries([...entries, stringifyValue(suggestion)]);
          }}
        />
      </div>
    );
  },
);

PrimitiveListEditor.displayName = 'PrimitiveListEditor';

const DropdownValueEditor = memo(({ node, value, onChange }: IConfigValueEditor) => {
  const suggestions = getSuggestionValues(node).map(String);
  const currentValue = typeof value === 'string' ? value : String(value ?? suggestions[0] ?? '');
  const options = suggestions.includes(currentValue) ? suggestions : [currentValue, ...suggestions];

  return (
    <Select value={currentValue} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
});

DropdownValueEditor.displayName = 'DropdownValueEditor';

const TupleStreamfieldInput: StreamfieldComponent<TupleEntry> = memo(({ value, onChange }) => {
  const intl = useIntl();
  return (
    <div className='⁂-admin-config__streamfield-row'>
      <Input
        type='text'
        outerClassName='⁂-admin-config__streamfield-row__input'
        value={value.left}
        placeholder={intl.formatMessage(messages.placeholderValueLeft)}
        onChange={(event) => onChange({ ...value, left: event.target.value })}
      />
      <Input
        type='text'
        outerClassName='⁂-admin-config__streamfield-row__input'
        value={value.right}
        placeholder={intl.formatMessage(messages.placeholderValueRight)}
        onChange={(event) => onChange({ ...value, right: event.target.value })}
      />
    </div>
  );
});

TupleStreamfieldInput.displayName = 'TupleStreamfieldInput';

const DynamicStreamfieldInput: StreamfieldComponent<DynamicEntry> = memo(({ value, onChange }) => {
  const intl = useIntl();

  return (
    <div className='⁂-admin-config__streamfield-row ⁂-admin-config__streamfield-row--dynamic'>
      <Input
        type='text'
        outerClassName='⁂-admin-config__streamfield-row__input'
        value={value.key}
        placeholder={intl.formatMessage(messages.placeholderValueKVKey)}
        onChange={(event) => onChange({ ...value, key: event.target.value })}
      />
      <Textarea
        isCodeEditor
        rows={1}
        autoGrow
        value={value.value}
        placeholder={intl.formatMessage(messages.placeholderValueKVValue)}
        onChange={(event) => onChange({ ...value, value: event.target.value })}
      />
    </div>
  );
});

DynamicStreamfieldInput.displayName = 'DynamicStreamfieldInput';

const TupleEditor = memo(
  ({ node, value, onChange, isList }: IConfigValueEditor & { isList: boolean }) => {
    const [entries, setEntries] = useState<TupleEntry[]>(() =>
      normalizeTupleEntries(value, isList),
    );
    const suggestions = getTupleSuggestions(node);

    useEffect(() => {
      setEntries(normalizeTupleEntries(value, isList));
    }, [isList, value]);

    const syncEntries = (nextEntries: TupleEntry[]) => {
      setEntries(nextEntries);

      const tuples = nextEntries.map((entry) => ({
        tuple: [parseLooseValue(entry.left), parseLooseValue(entry.right)] as [unknown, unknown],
      }));

      onChange(isList ? tuples : (tuples[0] ?? { tuple: ['', ''] }));
    };

    return (
      <div className='⁂-admin-config__editor-stack'>
        <p className='⁂-admin-config__feedback'>
          <FormattedMessage
            id='admin.pleroma_config.tuple_hint'
            defaultMessage='Values are parsed as JSON when possible, otherwise kept as strings.'
          />
        </p>

        <Streamfield
          values={entries}
          onChange={syncEntries}
          onAddItem={() => syncEntries([...entries, createTupleEntry()])}
          onRemoveItem={(index) => {
            const nextEntries = entries.filter((_, currentIndex) => currentIndex !== index);
            syncEntries(nextEntries.length ? nextEntries : [createTupleEntry()]);
          }}
          component={TupleStreamfieldInput}
        />

        <Suggestions
          suggestions={suggestions}
          onSelect={(suggestion) => {
            if (!Array.isArray(suggestion) || suggestion.length !== 2) return;

            const nextEntry = createTupleEntry(
              stringifyValue(suggestion[0]),
              stringifyValue(suggestion[1]),
            );
            syncEntries(isList ? [...entries, nextEntry] : [nextEntry]);
          }}
        />
      </div>
    );
  },
);

TupleEditor.displayName = 'TupleEditor';

const DynamicEntriesEditor = memo(
  ({ node, value, onChange, isKeyword }: IConfigValueEditor & { isKeyword: boolean }) => {
    const [entries, setEntries] = useState<DynamicEntry[]>(() =>
      normalizeDynamicEntries(value, isKeyword),
    );
    const suggestions = getSuggestionValues(node);

    useEffect(() => {
      if (isEqual(getDynamicEntriesValue(entries, isKeyword), value)) return;

      setEntries(normalizeDynamicEntries(value, isKeyword));
    }, [isKeyword, value]);

    const syncEntries = (nextEntries: DynamicEntry[]) => {
      setEntries(nextEntries);
      const nextValue = getDynamicEntriesValue(nextEntries, isKeyword);
      if (isEqual(nextValue, value)) return;

      onChange(nextValue);
    };

    return (
      <div className='⁂-admin-config__editor-stack'>
        <Streamfield
          values={entries}
          onChange={syncEntries}
          onAddItem={() => syncEntries([...entries, createDynamicEntry()])}
          onRemoveItem={(index) => {
            const nextEntries = entries.filter((_, currentIndex) => currentIndex !== index);
            syncEntries(nextEntries.length ? nextEntries : [createDynamicEntry()]);
          }}
          component={DynamicStreamfieldInput}
        />

        <Suggestions
          suggestions={suggestions}
          onSelect={(suggestion) => {
            if (!Array.isArray(suggestion) || suggestion.length !== 2) return;

            syncEntries([
              ...entries,
              createDynamicEntry(String(suggestion[0]), stringifyValue(suggestion[1])),
            ]);
          }}
        />
      </div>
    );
  },
);

DynamicEntriesEditor.displayName = 'DynamicEntriesEditor';

const GroupChildrenEditor = memo(
  ({ node, value, onChange, onValidityChange }: IConfigValueEditor) => {
    const childValues = useMemo(() => tupleArrayToMap(value), [value]);
    const [invalidChildren, setInvalidChildren] = useState<Record<string, boolean>>({});
    const hasInvalidChildren = useMemo(
      () => Object.values(invalidChildren).some(Boolean),
      [invalidChildren],
    );

    useEffect(() => {
      setInvalidChildren({});
    }, [node, value]);

    useEffect(() => {
      onValidityChange?.(hasInvalidChildren);
    }, [hasInvalidChildren, onValidityChange]);

    if (!node.children?.length) {
      return (
        <JsonValueEditor
          node={node}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
        />
      );
    }

    return (
      <div className='⁂-admin-config__editor-stack'>
        {node.children.map((child) => {
          if (!child.key) return null;
          const childKey = child.key;

          return (
            <FormGroup
              key={[child.group].flat().join('|') + '|' + childKey}
              labelText={child.label ?? childKey}
              hintText={child.description}
            >
              <ConfigValueEditor
                node={child}
                value={childValues[childKey]}
                onChange={(nextValue) =>
                  onChange(
                    mapToTupleArray({
                      ...childValues,
                      [childKey]: nextValue,
                    }),
                  )
                }
                onValidityChange={(isInvalid) =>
                  setInvalidChildren((current) =>
                    current[childKey] === isInvalid
                      ? current
                      : { ...current, [childKey]: isInvalid },
                  )
                }
              />
            </FormGroup>
          );
        })}
      </div>
    );
  },
);

GroupChildrenEditor.displayName = 'GroupChildrenEditor';

const UnionValueEditor = memo(
  ({
    node,
    value,
    onChange,
    onValidityChange,
    options,
  }: IConfigValueEditor & { options: ConfigType[] }) => {
    const intl = useIntl();
    const [selectedType, setSelectedType] = useState<ConfigType>(() => {
      return options.find((option) => isValueCompatibleWithType(value, option)) ?? options[0];
    });

    useEffect(() => {
      setSelectedType(
        options.find((option) => isValueCompatibleWithType(value, option)) ?? options[0],
      );
    }, [options, value]);

    return (
      <div className='⁂-admin-config__editor-stack'>
        <FormGroup labelText={intl.formatMessage(messages.valueType)}>
          <Select
            value={JSON.stringify(selectedType)}
            onChange={(event) => {
              const nextType =
                options.find((option) => JSON.stringify(option) === event.target.value) ??
                options[0];

              setSelectedType(nextType);
              if (!isValueCompatibleWithType(value, nextType)) {
                onChange(getDefaultValueForType(nextType, getSuggestionValues(node)));
              }
            }}
          >
            {options.map((option) => (
              <option key={JSON.stringify(option)} value={JSON.stringify(option)}>
                {getTypeLabel(option)}
              </option>
            ))}
          </Select>
        </FormGroup>

        <ConfigValueEditor
          node={{ ...node, type: selectedType }}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
        />
      </div>
    );
  },
);

UnionValueEditor.displayName = 'UnionValueEditor';

const ConfigValueEditor = memo(
  ({ node, value, onChange, onValidityChange }: IConfigValueEditor) => {
    const unionOptions = getUnionOptions(node.type);
    if (unionOptions) {
      return (
        <UnionValueEditor
          node={node}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
          options={unionOptions}
        />
      );
    }

    if (node.type === 'group') {
      return (
        <GroupChildrenEditor
          node={node}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
        />
      );
    }

    if (typeof node.type === 'string' || isStringOrImageType(node.type)) {
      if (node.type === 'tuple') {
        return (
          <TupleEditor
            node={node}
            value={value}
            onChange={onChange}
            onValidityChange={onValidityChange}
            isList={false}
          />
        );
      }

      if (node.type === 'keyword') {
        return (
          <DynamicEntriesEditor
            node={node}
            value={value}
            onChange={onChange}
            onValidityChange={onValidityChange}
            isKeyword
          />
        );
      }

      if (node.type === 'map') {
        return (
          <DynamicEntriesEditor
            node={node}
            value={value}
            onChange={onChange}
            onValidityChange={onValidityChange}
            isKeyword={false}
          />
        );
      }

      return (
        <PrimitiveValueEditor
          node={node}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
        />
      );
    }

    if (!isContainerDescriptor(node.type)) {
      return (
        <div className='⁂-admin-config__editor-stack'>
          <p className='⁂-admin-config__feedback'>
            <FormattedMessage
              id='admin.pleroma_config.complex_hint'
              defaultMessage='Edit this value as JSON.'
            />
          </p>
          <JsonValueEditor
            node={node}
            value={value}
            onChange={onChange}
            onValidityChange={onValidityChange}
          />
        </div>
      );
    }

    const [container, subType] = node.type;
    if (container === 'dropdown') {
      return (
        <DropdownValueEditor
          node={node}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
        />
      );
    }

    if (container === 'list') {
      if (subType === 'tuple') {
        return (
          <TupleEditor
            node={node}
            value={value}
            onChange={onChange}
            onValidityChange={onValidityChange}
            isList
          />
        );
      }

      if (
        typeof subType === 'string' &&
        (textualTypes.has(subType) || numericTypes.has(subType) || subType === 'boolean')
      ) {
        return (
          <PrimitiveListEditor
            node={node}
            itemType={subType}
            value={value}
            onChange={onChange}
            onValidityChange={onValidityChange}
          />
        );
      }

      return (
        <JsonValueEditor
          node={node}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
        />
      );
    }

    if (container === 'keyword') {
      return (
        <DynamicEntriesEditor
          node={node}
          value={value}
          onChange={onChange}
          onValidityChange={onValidityChange}
          isKeyword
        />
      );
    }

    return (
      <DynamicEntriesEditor
        node={node}
        value={value}
        onChange={onChange}
        onValidityChange={onValidityChange}
        isKeyword={false}
      />
    );
  },
);

ConfigValueEditor.displayName = 'ConfigValueEditor';

export { ConfigValueEditor };
