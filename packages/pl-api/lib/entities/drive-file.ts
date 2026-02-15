import * as v from 'valibot';

/**
 * @category Schemas
 */
const driveFileSchema = v.pipe(
  v.any(),
  v.transform((file) => ({
    ...file,
    thumbnail_url: file.thumbnailUrl,
    content_type: file.contentType,
    is_avatar: file.isAvatar,
    is_banner: file.isBanner,
  })),
  v.object({
    id: v.string(),
    url: v.string(),
    thumbnail_url: v.string(),
    filename: v.string(),
    content_type: v.string(),
    sensitive: v.boolean(),
    description: v.fallback(v.nullable(v.string()), null),
    is_avatar: v.boolean(),
    is_banner: v.boolean(),
  }),
);

/**
 * @category Entity types
 */
type DriveFile = v.InferOutput<typeof driveFileSchema>;

export { driveFileSchema, type DriveFile };
