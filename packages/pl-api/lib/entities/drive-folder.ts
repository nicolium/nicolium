import * as v from 'valibot';

import { type DriveFile, driveFileSchema } from './drive-file';
import { filteredArray } from './utils';

const baseDriveFolderSchema = v.object({
  id: v.fallback(v.nullable(v.string()), null),
  name: v.fallback(v.nullable(v.string()), null),
  parent_id: v.fallback(v.nullable(v.string()), null),
  files: filteredArray(driveFileSchema),
});

/**
 * @category Schemas
*/
const driveFolderSchema: v.BaseSchema<any, DriveFolder, v.BaseIssue<unknown>> = v.pipe(v.any(), v.transform((folder) => ({
  ...folder,
  parent_id: folder.parentId,
})), v.object({
  ...baseDriveFolderSchema.entries,
  folders: filteredArray(v.lazy(() => driveFolderSchema)),
})) as any;

/**
 * @category Entity types
 */
type DriveFolder = {
  id: string | null;
  name: string | null;
  parent_id: string | null;
  files: Array<DriveFile>;
  folders: Array<DriveFolder>;
}

export { driveFolderSchema, type DriveFolder };
