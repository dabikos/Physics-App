// Render the logo glyph to Expo's 96px source and the checked-in native densities.
// Usage: node scripts/prepare-notification-icon.mjs [path-to-sharp-module]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'assets/images/notification-icon.svg');
const outputs = [
  ['assets/images/notification-icon.png', 96],
  ...Object.entries({ mdpi: 24, hdpi: 36, xhdpi: 48, xxhdpi: 72, xxxhdpi: 96 })
    .map(([density, size]) => [`android/app/src/main/res/drawable-${density}/notification_icon.png`, size]),
];

for (const [relativePath, size] of outputs) {
  const destination = path.join(root, relativePath);
  await sharp(source, { density: 384 }).resize(size, size).png().toFile(destination);
  const { data, info } = await sharp(destination).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  let transparent = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const alpha = data[i + 3];
    if (!alpha) transparent++;
    else {
      opaque++;
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        throw new Error(`${relativePath}: non-white icon pixel`);
      }
    }
  }
  if (!opaque || !transparent) throw new Error(`${relativePath}: missing icon or transparency`);
  console.log(`${relativePath}: ${size}x${size}, white glyph with transparent background`);
}

// Native expanded notifications can also show the actual full-color app logo.
const brand = path.join(root, 'assets/images/notification-brand.png');
await sharp(path.join(root, 'assets/images/icon.png')).resize(128, 128).png().toFile(brand);
const { mkdir, copyFile } = await import('node:fs/promises');
const nativeBrandDirectory = path.join(root, 'android/app/src/main/res/drawable-nodpi');
await mkdir(nativeBrandDirectory, { recursive: true });
await copyFile(brand, path.join(nativeBrandDirectory, 'notification_brand.png'));
console.log('notification_brand.png: full-color application logo, 128x128');
