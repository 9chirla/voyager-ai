#!/usr/bin/env node
/** Download UK hero images into public/destinations/uk/ */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { UK_DESTINATIONS_SEED } from './uk_destinations_seed.mjs';
import { UK_IMAGE_OVERRIDES } from './uk_image_overrides.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(ROOT, 'public/destinations/uk');
const UA = 'VoyagerAI/1.0 (uk-destination-image-sync)';
const WIKI_DELAY_MS = 2500;

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * @param {string} searchTerm
 * @returns {Promise<string|null>}
 */
async function wikimediaImageUrl(searchTerm) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: searchTerm,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '560',
    format: 'json',
  });

  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) return null;

  const text = await res.text();
  if (text.startsWith('You are making too many requests')) return null;

  const data = JSON.parse(text);
  const pages = data?.query?.pages;
  if (!pages) return null;

  const sorted = Object.values(pages).sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  for (const page of sorted) {
    const info = page.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (!url) continue;
    if (/\.(svg|webm|ogv|gif)$/i.test(url)) continue;
    return url;
  }
  return null;
}

await mkdir(dir, { recursive: true });

let ok = 0;
const failed = [];

for (const dest of UK_DESTINATIONS_SEED) {
  const outPath = join(dir, `${dest.id}.jpg`);
  let url = UK_IMAGE_OVERRIDES[dest.id];

  if (!url) {
    await sleep(WIKI_DELAY_MS);
    url = await wikimediaImageUrl(dest.imageQuery);
  }

  if (!url) {
    failed.push(dest.id);
    console.log(`${dest.id} ✗ no image found`);
    continue;
  }

  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    failed.push(dest.id);
    console.log(`${dest.id} ✗ HTTP ${res.status}`);
    continue;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  ok += 1;
  console.log(`${dest.id} ✓`);
}

console.log(`Saved ${ok}/${UK_DESTINATIONS_SEED.length} images to public/destinations/uk/`);
if (failed.length) {
  console.log(`Missing (${failed.length}): ${failed.join(', ')}`);
}
