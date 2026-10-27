import type { ImageMetadata } from 'astro';
import { CONTENT_ROOT, IS_TEST_CONTENT } from './content-root';

// Photos placed inside article text ({% photo src="./my-article/x.jpg" /%}) are found here, so they get
// the same automatic resizing as photos in the settings. A missing file stops the build.
type Loader = () => Promise<ImageMetadata>;
const files: Record<string, Loader> = IS_TEST_CONTENT
  ? import.meta.glob<ImageMetadata>('/tests/fixtures/content/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG}', { import: 'default' })
  : import.meta.glob<ImageMetadata>('/src/content/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG}', { import: 'default' });

/** The photo at `src`, relative to `folder` inside the content (e.g. 'blog'). Web links are used as they are. */
export async function photoFor(src: string, folder: string): Promise<ImageMetadata | string> {
  if (/^https?:\/\//.test(src)) return src;
  const path = new URL(src, `file:///${CONTENT_ROOT}/${folder}/`).pathname;
  const load = files[path];
  if (!load) throw new Error(`Photo not found: ${src} (looked for ${path}). Check the file name and folder.`);
  return load();
}
