// Saves photo crop changes by editing the Markdown file in the GitHub repository (one commit per file).
// Cloudflare then rebuilds the site as for any other change, so the crop goes live in about 2 minutes.
// Needs a GitHub key (Cloudflare secret GITHUB_TOKEN) that can edit this repository's contents.

import { applyCropEdits } from './frontmatter';
import { slotFor, PERCENT_FOCUS, ZOOM_MAX, ZOOM_MIN } from './photo-slots';

export type CropChange = { id: string; focus: string; zoom: number };
export class SaveError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const enc = new TextEncoder();
const dec = new TextDecoder();
const toBase64 = (text: string) => {
  const bytes = enc.encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const fromBase64 = (b64: string) => dec.decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

/** Check one change and turn it into an exact edit; throws a plain-English error if anything's off. */
export function checkChange(file: string, c: CropChange) {
  const slot = typeof c?.id === 'string' ? slotFor(file, c.id) : null;
  if (!slot) throw new SaveError('That photo can’t be edited here.');
  const m = typeof c.focus === 'string' ? c.focus.match(PERCENT_FOCUS) : null;
  if (!m || Number(m[1]) > 100 || Number(m[2]) > 100) throw new SaveError('The focus point must be two percentages, like "50% 30%".');
  if (typeof c.zoom !== 'number' || !(c.zoom >= ZOOM_MIN && c.zoom <= ZOOM_MAX)) throw new SaveError(`Zoom must be between ${ZOOM_MIN} and ${ZOOM_MAX}.`);
  return { ...slot, focus: c.focus, zoom: Math.round(c.zoom * 100) / 100 };
}

export async function saveCrops(env: Partial<Env>, file: string, changes: CropChange[], fetcher: typeof fetch = fetch) {
  if (!env.GITHUB_TOKEN) throw new SaveError('Saving isn’t set up yet: add the GITHUB_TOKEN secret in Cloudflare (see the README).', 503);
  if (!Array.isArray(changes) || !changes.length || changes.length > 50) throw new SaveError('Nothing to save.');
  const edits = changes.map((c) => checkChange(file, c));

  const api = (env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
  const repo = env.GITHUB_REPO || 'claude4ben/loving-life-longer-blog';
  const branch = env.GITHUB_BRANCH || 'main';
  const url = `${api}/repos/${repo}/contents/${file}`;
  const headers = {
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'loving-life-longer-admin',
    'x-github-api-version': '2022-11-28',
  };
  const explain = (status: number) =>
    status === 401 || status === 403
      ? new SaveError('GitHub refused the key. It may have expired or lack permission (see the README).', 502)
      : status === 404
        ? new SaveError('GitHub couldn’t find that file. Has it been renamed?', 502)
        : status === 409 || status === 422
          ? new SaveError('That file was changed at the same moment. Please press Save again.', 409)
          : new SaveError(`GitHub didn’t accept the change (error ${status}). Please try again.`, 502);

  const got = await fetcher(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
  if (!got.ok) throw explain(got.status);
  const current = (await got.json()) as { content: string; sha: string };
  const before = fromBase64(current.content);
  let after: string;
  try {
    after = applyCropEdits(before, edits);
  } catch (e) {
    throw new SaveError((e as Error).message);
  }
  if (after === before) return { changed: false };

  const name = file.split('/').pop();
  const summary = changes.map((c) => `${c.id} (focus ${c.focus}, zoom ${Math.round(c.zoom * 100) / 100})`).join(', ');
  const put = await fetcher(url, {
    method: 'PUT',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ message: `Photo crop: ${summary} in ${name}\n\nSaved from the admin crop editor.`, content: toBase64(after), sha: current.sha, branch }),
  });
  if (!put.ok) throw explain(put.status);
  return { changed: true };
}
