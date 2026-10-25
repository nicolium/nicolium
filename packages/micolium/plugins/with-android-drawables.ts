// Adapted from https://github.com/react-native-menu/menu/blob/master/plugin/withAndroidDrawables.js
import fs from 'fs';
import path from 'path';

import { type ConfigPlugin, withDangerousMod } from 'expo/config-plugins';
import svg2vectordrawable from 'svg2vectordrawable';

type ConfigProps = {
  drawableFiles: Array<string>;
  prefix?: string;
};

/**
 * This config plugin copies files from the specified paths, like the assets
 * directory, to the Android drawable directory.
 */
const withAndroidDrawables: ConfigPlugin<ConfigProps> = (
  config,
  { drawableFiles, prefix = '' },
) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      // Validate drawableFiles
      if (!Array.isArray(drawableFiles)) {
        throw new Error('drawableFiles must be an array of file paths');
      }

      // Define the target drawable directory
      const drawableDir = path.join(
        config.modRequest.projectRoot,
        'android/app/src/main/res/drawable',
      );

      // Create the drawable directory if it doesn't exist
      if (!fs.existsSync(drawableDir)) {
        fs.mkdirSync(drawableDir, { recursive: true });
      }

      const keptDrawables: Array<string> = [];

      // Copy each drawable file to the drawable directory
      for (const filePath of drawableFiles) {
        const sourcePath = path.resolve(config.modRequest.projectRoot, filePath);
        if (filePath.endsWith('.svg')) {
          // Convert to Android-compatible xml and copy to destination path
          if (!fs.existsSync(sourcePath)) {
            console.warn(`Warning: Drawable file not found: ${sourcePath}`);
            continue;
          }

          const icon = fs.readFileSync(sourcePath, 'utf-8');
          const replacedFileName =
            path.basename(filePath).slice(0, -4).replaceAll('-', '_') + '.xml';
          const destPath = path.join(drawableDir, prefix + replacedFileName);
          const convertedIcon = (await svg2vectordrawable(icon))
            .replaceAll('="256dp"', '="24dp"')
            .replaceAll(
              'android:viewportHeight="256"',
              'android:viewportHeight="256"\n    android:tint="?android:attr/textColorPrimary"',
            )
            .replaceAll(
              'android:pathData',
              'android:fillColor="@android:color/white" android:pathData',
            );

          fs.writeFileSync(destPath, convertedIcon);
          keptDrawables.push(path.basename(destPath, '.xml'));
        } else {
          const fileName = path.basename(filePath);
          const destPath = path.join(drawableDir, prefix + fileName);

          if (!fs.existsSync(sourcePath)) {
            console.warn(`Warning: Drawable file not found: ${sourcePath}`);
            continue;
          }

          // Copy the file
          fs.copyFileSync(sourcePath, destPath);
          keptDrawables.push((prefix + fileName).split('.')[0]);
        }
      }

      const rawDir = path.join(config.modRequest.projectRoot, 'android/app/src/main/res/raw');
      if (!fs.existsSync(rawDir)) {
        fs.mkdirSync(rawDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(rawDir, 'keep_drawables.xml'),
        `<?xml version="1.0" encoding="utf-8"?>\n<resources xmlns:tools="http://schemas.android.com/tools"\n    tools:keep="${keptDrawables.map((name) => `@drawable/${name}`).join(',')}" />\n`,
      );

      return config;
    },
  ]);
};

module.exports = withAndroidDrawables;
