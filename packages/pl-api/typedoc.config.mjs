/** @type {Partial<import('typedoc').TypeDocOptions>} */

const config = {
  entryPoints: ['./lib/main.ts'],
  plugin: ['typedoc-material-theme', 'typedoc-plugin-valibot'],
  themeColor: '#d80482',
  navigation: {
    includeCategories: true,
  },
  categorizeByGroup: true,
  sort: ['kind', 'alphabetical'],
  kindSortOrder: ['Function', 'Class', 'Interface', 'TypeAlias', 'Variable', 'Enum'],
  intentionallyNotExported: [
    'CreateStatusOptionalParams',
    'CreateStatusWithContent',
    'CreateStatusWithMedia',
    'EditStatusOptionalParams',
    'GetTrends',
    'LanguageParam',
    'OnlyEventsParam',
    'OnlyMediaParam',
    'Params',
    'PlApiClientConstructorOpts',
    'WithMutedParam',
    'WithRelationshipsParam',
  ],
  groupReferencesByType: true,
  suppressCommentWarningsInDeclarationFiles: true,
};

export default config;
