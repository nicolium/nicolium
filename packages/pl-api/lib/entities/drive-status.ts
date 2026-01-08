import * as v from 'valibot';

/**
 * @category Schemas
*/
const driveStatusSchema = v.pipe(v.any(), v.transform((status) => ({
  file_count: status.fileCount,
  used_size: status.usedSize,
  ...status,
})), v.object({
  file_count: v.fallback(v.number(), 0),
  used_size: v.fallback(v.number(), 0),
}));

/**
 * @category Entity types
 */
type DriveStatus = v.InferOutput<typeof driveStatusSchema>;

export { driveStatusSchema, type DriveStatus };