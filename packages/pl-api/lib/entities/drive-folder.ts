import * as v from 'valibot';

import { bookmarkFolderSchema } from './bookmark-folder';
import { driveFileSchema } from './drive-file';
import { filteredArray } from './utils';

/**
 * @category Schemas
*/
const driveFolderSchema = v.pipe(v.any(), v.transform((folder) => ({
  ...folder,
  parent_id: folder.parentId,
})), v.object({
  id: v.fallback(v.nullable(v.string()), null),
  name: v.fallback(v.nullable(v.string()), null),
  parent_id: v.fallback(v.nullable(v.string()), null),
  files: filteredArray(driveFileSchema),
  folders: filteredArray(bookmarkFolderSchema),
}));

/**
 * @category Entity types
 */
type DriveFolder = v.InferOutput<typeof driveFolderSchema>;

export { driveFolderSchema, type DriveFolder };
