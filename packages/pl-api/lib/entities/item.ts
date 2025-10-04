import * as v from 'valibot';

import { filteredArray } from './utils';

const externalResourceSchema = v.object({
  url: v.string(),
});

const baseItemSchema = v.object({
  id: v.string(),
  uuid: v.string(),
  url: v.string(),
  api_url: v.string(),
  category: v.picklist(['book', 'movie', 'tv', 'music', 'game', 'podcast', 'performance', 'collection']),
  parent_uuid: v.nullable(v.string()),
  display_title: v.string(),
  external_resources: v.nullable(filteredArray(externalResourceSchema)),
  title: v.string(),
  description: v.string(),
  localized_title: filteredArray(v.object({
    lang: v.string(),
    text: v.string(),
  })),
  localized_description: filteredArray(v.object({
    lang: v.string(),
    text: v.string(),
  })),
  conver_image_url: v.nullable(v.string()),
  rating: v.nullable(v.number()),
  rating_count: v.nullable(v.number()),
  rating_distribution: v.nullable(v.array(v.number())),
  tags: v.nullable(v.array(v.string())),
});

const editionSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('Edition'),
  subtitle: v.nullable(v.string()),
  orig_title: v.nullable(v.string()),
  author: v.array(v.string()),
  translator: v.array(v.string()),
  language: v.array(v.string()),
  pub_house: v.nullable(v.string()),
  pub_year: v.nullable(v.number()),
  pub_month: v.nullable(v.number()),
  binding: v.nullable(v.string()),
  price: v.nullable(v.string()),
  pages: v.nullable(v.union([v.string(), v.number()])),
  series: v.nullable(v.string()),
  imprint: v.nullable(v.string()),
  isbn: v.nullable(v.string()),
});

const tvShowSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('TVShow'),
  season_count: v.nullable(v.number()),
  orig_title: v.nullable(v.string()),
  director: v.array(v.string()),
  playwright: v.array(v.string()),
  actor: v.array(v.string()),
  genre: v.array(v.string()),
  language: v.array(v.string()),
  area: v.array(v.string()),
  year: v.nullable(v.number()),
  site: v.nullable(v.string()),
  episode_count: v.nullable(v.number()),
  season_uuids: v.array(v.string()),
  imdb: v.nullable(v.string()),
});

const tvSeasonSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('TVSeason'),
  season_number: v.nullable(v.number()),
  orig_title: v.nullable(v.string()),
  director: v.array(v.string()),
  playwright: v.array(v.string()),
  actor: v.array(v.string()),
  genre: v.array(v.string()),
  language: v.array(v.string()),
  area: v.array(v.string()),
  year: v.nullable(v.number()),
  site: v.nullable(v.string()),
  episode_count: v.nullable(v.number()),
  episode_uuids: v.array(v.string()),
  imdb: v.nullable(v.string()),
});

const movieSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('Movie'),
  orig_title: v.nullable(v.string()),
  director: v.array(v.string()),
  playwright: v.array(v.string()),
  actor: v.array(v.string()),
  genre: v.array(v.string()),
  language: v.array(v.string()),
  area: v.array(v.string()),
  year: v.nullable(v.number()),
  site: v.nullable(v.string()),
  duration: v.nullable(v.string()),
  imdb: v.nullable(v.string()),
});

const albumSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('MusicAlbum'),
  genre: v.array(v.string()),
  artist: v.array(v.string()),
  company: v.array(v.string()),
  duration: v.nullable(v.number()),
  release_date: v.nullable(v.string()),
  track_list: v.nullable(v.string()),
  barcode: v.nullable(v.string()),
});

const podcastSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('Podcast'),
  genre: v.array(v.string()),
  host: v.array(v.string()),
  language: v.array(v.string()),
  official_site: v.nullable(v.string()),
});

const gameSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('Game'),
  genre: v.array(v.string()),
  developer: v.array(v.string()),
  publisher: v.array(v.string()),
  platform: v.array(v.string()),
  release_type: v.nullable(v.string()),
  release_date: v.nullable(v.string()),
  official_site: v.nullable(v.string()),
});

const performanceSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('Performance'),
  orig_title: v.nullable(v.string()),
  genre: v.array(v.string()),
  language: v.array(v.string()),
  opening_date: v.nullable(v.string()),
  closing_date: v.nullable(v.string()),
  director: v.array(v.string()),
  playwright: v.array(v.string()),
  orig_creator: v.array(v.string()),
  composer: v.array(v.string()),
  choreographer: v.array(v.string()),
  performer: v.array(v.string()),
  actor: v.array(v.string()),
  crew: v.array(v.string()),
  official_site: v.nullable(v.string()),
});

const podcastEpisodeSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('PodcastEpisode'),
  guid: v.nullable(v.string()),
  pub_date: v.nullable(v.string()),
  media_url: v.nullable(v.string()),
  link: v.nullable(v.string()),
  duration: v.nullable(v.number()),
});

const performanceProductionSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('PerformanceProduction'),
  orig_title: v.nullable(v.string()),
  language: v.array(v.string()),
  opening_date: v.nullable(v.string()),
  closing_date: v.nullable(v.string()),
  director: v.array(v.string()),
  playwright: v.array(v.string()),
  orig_creator: v.array(v.string()),
  composer: v.array(v.string()),
  choreographer: v.array(v.string()),
  performer: v.array(v.string()),
  actor: v.array(v.string()),
  crew: v.array(v.string()),
  official_site: v.nullable(v.string()),
});

const tvEpisodeSchema = v.object({
  ...baseItemSchema.entries,
  type: v.literal('PerformanceProduction'),
  episode_number: v.nullable(v.number()),
});

/**
 * @category Schemas
 * @see {@link https://neodb.social/developer}
 */
const itemSchema: v.BaseSchema<any, Item, v.BaseIssue<unknown>> = v.pipe(
  v.any(),
  v.variant('type', [
    editionSchema,
    tvShowSchema,
    tvSeasonSchema,
    movieSchema,
    albumSchema,
    podcastSchema,
    gameSchema,
    performanceSchema,
    podcastEpisodeSchema,
    performanceProductionSchema,
    tvEpisodeSchema,
  ]),
);

/**
 * @category Entity types
 */
type Item = v.InferOutput<
| typeof editionSchema
| typeof tvShowSchema
| typeof tvSeasonSchema
| typeof movieSchema
| typeof albumSchema
| typeof podcastSchema
| typeof gameSchema
| typeof performanceSchema
| typeof podcastEpisodeSchema
| typeof performanceProductionSchema
| typeof tvEpisodeSchema
>;

export {
  editionSchema,
  tvShowSchema,
  tvSeasonSchema,
  movieSchema,
  albumSchema,
  podcastSchema,
  gameSchema,
  performanceSchema,
  podcastEpisodeSchema,
  itemSchema,
  type Item,
};
