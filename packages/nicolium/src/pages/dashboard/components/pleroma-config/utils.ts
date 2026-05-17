import type { PleromaConfigDescription, PleromaConfigDescriptionChild } from 'pl-api';

type ConfigDescriptionNode = PleromaConfigDescription | PleromaConfigDescriptionChild;
type ConfigType = ConfigDescriptionNode['type'];
type PrimitiveValue = boolean | number | string;
type TupleValue = { tuple: [unknown, unknown] };
type TupleEntry = { id: string; left: string; right: string };
type DynamicEntry = { id: string; key: string; value: string };
type ConfigEntry = { group: string; key: string; value: unknown };

const containerTypes = new Set(['list', 'dropdown', 'keyword', 'map']);
const textualTypes = new Set(['string', 'atom', 'module', 'charlist', 'image', 'image/png']);
const numericTypes = new Set(['integer', 'float']);
const annotationTypes = new Set(['image', 'image/png']);

const stringifyValue = (value: unknown): string => {
  if (typeof value === 'undefined') return '';
  if (typeof value === 'string') return value;

  const json = JSON.stringify(value, null, 2);
  return json ?? '';
};

const isTupleObject = (value: unknown): value is TupleValue =>
  !!value &&
  typeof value === 'object' &&
  'tuple' in value &&
  Array.isArray((value as { tuple?: unknown }).tuple) &&
  (value as { tuple: unknown[] }).tuple.length === 2;

const tupleArrayToMap = (value: unknown): Record<string, unknown> => {
  if (!Array.isArray(value)) return {};

  return value.reduce<Record<string, unknown>>((result, item) => {
    if (isTupleObject(item) && typeof item.tuple[0] === 'string') {
      result[item.tuple[0]] = item.tuple[1];
    }

    return result;
  }, {});
};

const mapToTupleArray = (value: Record<string, unknown>): TupleValue[] =>
  Object.entries(value).map(([key, itemValue]) => ({
    tuple: [key, itemValue],
  }));

const parseLooseValue = (text: string): unknown => {
  const trimmed = text.trim();

  if (!trimmed.length) return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  try {
    return JSON.parse(trimmed);
  } catch {
    return text;
  }
};

const isContainerDescriptor = (type: ConfigType): type is Array<string | Array<string>> => {
  if (!Array.isArray(type)) return false;
  if (type.length !== 2) return false;

  return typeof type[0] === 'string' && containerTypes.has(type[0]);
};

const getUnionOptions = (type: ConfigType): ConfigType[] | null => {
  if (!Array.isArray(type) || !type.length) return null;
  if (isContainerDescriptor(type)) return null;

  const options = [...type].filter(
    (item) => typeof item === 'string' || Array.isArray(item),
  ) as ConfigType[];
  if (options.length <= 1) return null;

  if (
    options.length === 2 &&
    options.some((item) => item === 'string') &&
    options.some((item) => typeof item === 'string' && annotationTypes.has(item))
  ) {
    return null;
  }

  return options;
};

const getPrimitiveTypeName = (type: ConfigType): string | null => {
  if (typeof type === 'string') return type;

  if (
    Array.isArray(type) &&
    type.length === 2 &&
    type[0] === 'dropdown' &&
    typeof type[1] === 'string'
  ) {
    return type[1];
  }

  return null;
};

const isValueCompatibleWithType = (value: unknown, type: ConfigType): boolean => {
  const unionOptions = getUnionOptions(type);
  if (unionOptions) {
    return unionOptions.some((option) => isValueCompatibleWithType(value, option));
  }

  if (typeof type === 'string') {
    if (type === 'boolean') return typeof value === 'boolean';
    if (numericTypes.has(type)) return typeof value === 'number';
    if (textualTypes.has(type)) return typeof value === 'string';
    if (type === 'tuple') return isTupleObject(value);
    return true;
  }

  if (!isContainerDescriptor(type)) return true;

  const [container, subType] = type;
  if (container === 'dropdown') return isValueCompatibleWithType(value, subType);
  if (container === 'list') return Array.isArray(value);
  if (container === 'keyword')
    return Array.isArray(value) && value.every((item) => isTupleObject(item));
  if (container === 'map')
    return typeof value === 'object' && value !== null && !Array.isArray(value);

  return true;
};

const isStringOrImageType: (type: Exclude<ConfigType, string>) => boolean = (type) => {
  return type.length === 2 && type[0] === 'string' && type[1] === 'image';
};

const getSuggestionValues = (node: ConfigDescriptionNode): unknown[] => {
  const suggestions = (node as Record<string, unknown>).suggestions;
  return Array.isArray(suggestions) ? suggestions : [];
};

const getDefaultValueForType = (type: ConfigType, suggestions: unknown[] = []): unknown => {
  const unionOptions = getUnionOptions(type);
  if (unionOptions) {
    return getDefaultValueForType(unionOptions[0], suggestions);
  }

  if (typeof type === 'string') {
    if (type === 'boolean') return false;
    if (numericTypes.has(type)) return 0;
    if (textualTypes.has(type)) return typeof suggestions[0] === 'string' ? suggestions[0] : '';
    if (type === 'tuple') return { tuple: ['', ''] };
    return typeof suggestions[0] !== 'undefined' ? suggestions[0] : null;
  }

  if (!isContainerDescriptor(type)) return null;

  const [container, subType] = type;
  if (container === 'dropdown') {
    return typeof suggestions[0] !== 'undefined'
      ? suggestions[0]
      : getDefaultValueForType(subType, suggestions);
  }

  if (container === 'list' || container === 'keyword') return [];
  if (container === 'map') return {};

  return null;
};

const getTypeLabel = (type: ConfigType): string => {
  const unionOptions = getUnionOptions(type);
  if (unionOptions) return unionOptions.map(getTypeLabel).join(' / ');

  if (typeof type === 'string') {
    switch (type) {
      case 'image':
      case 'image/png':
        return 'image path';
      default:
        return type;
    }
  }

  if (!isContainerDescriptor(type)) return JSON.stringify(type);

  const [container, subType] = type;
  if (container === 'dropdown') return `dropdown (${getTypeLabel(subType)})`;
  if (container === 'list') return `list of ${getTypeLabel(subType)}`;
  if (container === 'keyword') return `keyword of ${getTypeLabel(subType)}`;
  if (container === 'map') return `map of ${getTypeLabel(subType)}`;

  return JSON.stringify(type);
};

const getValueSignature = (value: unknown): string => stringifyValue(value);

const getTupleSuggestions = (node: ConfigDescriptionNode): Array<[unknown, unknown]> =>
  getSuggestionValues(node)
    .map((value) => {
      if (Array.isArray(value) && value.length === 2)
        return [value[0], value[1]] as [unknown, unknown];
      if (isTupleObject(value)) return value.tuple;
      return null;
    })
    .filter((value): value is [unknown, unknown] => value !== null);

const createTupleEntry = (left = '', right = ''): TupleEntry => ({
  id: crypto.randomUUID(),
  left,
  right,
});

const createDynamicEntry = (key = '', value = ''): DynamicEntry => ({
  id: crypto.randomUUID(),
  key,
  value,
});

const normalizeTupleEntries = (value: unknown, isList: boolean): TupleEntry[] => {
  if (isList) {
    if (!Array.isArray(value)) return [createTupleEntry()];

    const entries = value
      .map((item) => {
        if (!isTupleObject(item)) return null;
        return createTupleEntry(stringifyValue(item.tuple[0]), stringifyValue(item.tuple[1]));
      })
      .filter((item): item is TupleEntry => item !== null);

    return entries.length ? entries : [createTupleEntry()];
  }

  if (isTupleObject(value)) {
    return [createTupleEntry(stringifyValue(value.tuple[0]), stringifyValue(value.tuple[1]))];
  }

  return [createTupleEntry()];
};

const normalizeDynamicEntries = (value: unknown, isKeyword: boolean): DynamicEntry[] => {
  if (isKeyword) {
    if (!Array.isArray(value)) return [createDynamicEntry()];

    const entries = value
      .map((item) => {
        if (!isTupleObject(item)) return null;
        return createDynamicEntry(stringifyValue(item.tuple[0]), stringifyValue(item.tuple[1]));
      })
      .filter((item): item is DynamicEntry => item !== null);

    return entries.length ? entries : [createDynamicEntry()];
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [createDynamicEntry()];
  }

  const entries = Object.entries(value).map(([key, itemValue]) =>
    createDynamicEntry(key, stringifyValue(itemValue)),
  );

  return entries.length ? entries : [createDynamicEntry()];
};

const normalizePrimitiveListEntries = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => stringifyValue(item));
};

const parsePrimitiveListEntries = (entries: string[], typeName: string): PrimitiveValue[] => {
  return entries
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry): PrimitiveValue => {
      if (numericTypes.has(typeName)) return Number(entry);
      if (typeName === 'boolean') return entry === 'true';
      return entry;
    });
};

const getDynamicEntriesValue = (entries: DynamicEntry[], isKeyword: boolean): unknown => {
  const activeEntries = entries.filter((entry) => entry.key.trim().length);

  if (isKeyword) {
    return activeEntries.map((entry) => ({
      tuple: [entry.key, parseLooseValue(entry.value)] as [unknown, unknown],
    }));
  }

  return activeEntries.reduce<Record<string, unknown>>((result, entry) => {
    result[entry.key] = parseLooseValue(entry.value);
    return result;
  }, {});
};

const getConfigEntryId = (group: string, key: string): string => `${group}\u0000${key}`;

const getConfigValueMap = (configs: ConfigEntry[]): Map<string, unknown> => {
  return new Map(configs.map((entry) => [getConfigEntryId(entry.group, entry.key), entry.value]));
};

const getNodeGroup = (group: ConfigDescriptionNode['group']): string | null => {
  if (typeof group === 'string') return group;
  if (Array.isArray(group)) return group[0] ?? null;

  return null;
};

const getFlatGroupValue = (
  description: PleromaConfigDescription,
  configValueMap: Map<string, unknown>,
): TupleValue[] => {
  const childValues = description.children.reduce<Record<string, unknown>>((result, child) => {
    if (!child.key) return result;

    const childGroup = getNodeGroup(child.group) ?? description.group;
    if (!childGroup) return result;

    const childValue = configValueMap.get(getConfigEntryId(childGroup, child.key));
    if (typeof childValue !== 'undefined') {
      result[child.key] = childValue;
    }

    return result;
  }, {});

  return mapToTupleArray(childValues);
};

const getDescriptionValue = (
  description: PleromaConfigDescription,
  configValueMap: Map<string, unknown>,
): unknown => {
  if (!description.group) return undefined;

  if (description.key) {
    return configValueMap.get(getConfigEntryId(description.group, description.key));
  }

  if (description.type === 'group') {
    return getFlatGroupValue(description, configValueMap);
  }

  return undefined;
};

const getDescriptionValueSignature = (
  description: PleromaConfigDescription,
  configValueMap: Map<string, unknown>,
): string => getValueSignature(getDescriptionValue(description, configValueMap));

const getDescriptionUpdates = (
  description: PleromaConfigDescription,
  value: unknown,
): ConfigEntry[] => {
  if (!description.group) return [];

  if (description.key) {
    return [{ group: description.group, key: description.key, value }];
  }

  if (description.type !== 'group') return [];

  const childValues = tupleArrayToMap(value);

  return description.children.flatMap((child) => {
    if (!child.key || !Object.hasOwn(childValues, child.key)) return [];

    const childGroup = getNodeGroup(child.group) ?? description.group;
    if (!childGroup) return [];

    return [{ group: childGroup, key: child.key, value: childValues[child.key] }];
  });
};

const getDescriptionSearchText = (node: ConfigDescriptionNode): string => {
  return [
    getNodeGroup(node.group),
    node.key,
    node.label,
    node.description,
    ...(node.children?.map(getDescriptionSearchText) ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

export {
  createDynamicEntry,
  createTupleEntry,
  getConfigValueMap,
  getDefaultValueForType,
  getDescriptionSearchText,
  getDescriptionUpdates,
  getDescriptionValue,
  getDescriptionValueSignature,
  getDynamicEntriesValue,
  getPrimitiveTypeName,
  getSuggestionValues,
  getTupleSuggestions,
  getTypeLabel,
  getUnionOptions,
  isContainerDescriptor,
  isStringOrImageType,
  isTupleObject,
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
};

export type { ConfigDescriptionNode, ConfigType, DynamicEntry, TupleEntry };
