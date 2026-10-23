// Scopre i formati in formats/*.js (ogni file esporta di default un oggetto formato).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FORMATS_DIR } from './paths.js';

const REQUIRED = ['id', 'collection', 'width', 'height', 'safeArea', 'output', 'render'];

export async function loadFormats(dir = FORMATS_DIR) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
  const formats = [];
  for (const file of files) {
    const { default: format } = await import(pathToFileURL(path.join(dir, file)).href);
    const missing = REQUIRED.filter((k) => format?.[k] === undefined);
    if (missing.length) throw new Error(`formats/${file}: mancano ${missing.join(', ')}`);
    formats.push(format);
  }
  return formats;
}
