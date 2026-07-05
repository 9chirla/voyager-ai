#!/usr/bin/env node
/** Download verified hero images into public/destinations/ */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const URLS = {
  FR: 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-tower-161853.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  ES: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=560&h=750&q=80',
  IT: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  PT: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  GR: 'https://images.pexels.com/photos/1011776/pexels-photo-1011776.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  HR: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  PL: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  TH: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=560&h=750&q=80',
  VN: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=560&h=750&q=80',
  ID: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  PH: 'https://images.pexels.com/photos/2260790/pexels-photo-2260790.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  SG: 'https://images.pexels.com/photos/325600/pexels-photo-325600.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  JP: 'https://images.pexels.com/photos/250692/pexels-photo-250692.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  KR: 'https://images.pexels.com/photos/358441/pexels-photo-358441.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  LK: 'https://images.pexels.com/photos/2387866/pexels-photo-2387866.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  JO: 'https://images.pexels.com/photos/3870037/pexels-photo-3870037.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  AE: 'https://images.pexels.com/photos/325193/pexels-photo-325193.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  MA: 'https://images.pexels.com/photos/450038/pexels-photo-450038.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  KE: 'https://images.pexels.com/photos/33045/lion-wild-africa-african.jpg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  ZA: 'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  MX: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  CR: 'https://images.pexels.com/photos/1632362/pexels-photo-1632362.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  CO: 'https://images.pexels.com/photos/2082148/pexels-photo-2082148.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  AU: 'https://images.pexels.com/photos/1872053/pexels-photo-1872053.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
  NZ: 'https://images.pexels.com/photos/1955134/pexels-photo-1955134.jpeg?auto=compress&cs=tinysrgb&w=560&h=750&fit=crop',
};

const dir = join(ROOT, 'public/destinations');
await mkdir(dir, { recursive: true });

for (const [iso, url] of Object.entries(URLS)) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${iso}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(dir, `${iso}.jpg`), buf);
  console.log(`${iso} ✓`);
}

console.log(`Saved ${Object.keys(URLS).length} images to public/destinations/`);
