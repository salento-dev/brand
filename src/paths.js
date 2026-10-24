import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const at = (...parts) => path.join(ROOT, ...parts);

export const TOKENS_FILE = at('tokens', 'tokens.json');
export const GROUPS_DIR = at('content', 'groups');
export const SUBJECTS_DIR = at('assets', 'subjects');
export const DOODLES_DIR = at('assets', 'doodles');
export const DOODLE_SETS_FILE = at('assets', 'doodles', 'sets.yaml');
export const LOGO_FILE = at('assets', 'logo.svg');
export const FORMATS_DIR = at('formats');
export const OUT_DIR = at('out');
export const BRAND_FILE = at('content', 'brand', 'brand.yaml');
export const SITE_DIR = at('src', 'site');
