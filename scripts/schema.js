// Esporta lo JSON Schema dei gruppi (da src/schema.js) in schema/group.schema.json.
import fs from 'node:fs';
import { at } from '../src/paths.js';
import { groupJsonSchema } from '../src/schema.js';

export const SCHEMA_FILE = at('schema', 'group.schema.json');
export const schemaText = () => JSON.stringify(groupJsonSchema(), null, 2) + '\n';

if (import.meta.url === `file://${process.argv[1]}`) {
  fs.mkdirSync(at('schema'), { recursive: true });
  fs.writeFileSync(SCHEMA_FILE, schemaText());
  console.log('Scritto schema/group.schema.json');
}
