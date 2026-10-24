// Identità e regole del brand (content/brand/brand.yaml): caricamento e validazione.
// I colori, la tipografia, i raggi e le spaziature stanno nei token; qui solo testi e regole (ADR-0011).
import fs from 'node:fs';
import { load as loadYaml } from 'js-yaml';
import { z } from 'zod';
import { BRAND_FILE } from './paths.js';
import { FAMILIES, VARIANTS, PADDINGS, FORMATS } from './logo.js';

export const SCOPES = ['interfaccia', 'community', 'tutti'];
export const RULE_SECTIONS = ['colori', 'tipografia', 'forme'];

const text = z.string().trim().min(1);
const list = z.array(text).min(1);
const url = z.url({ protocol: /^https$/ });
const doDont = z.strictObject({ do: list, dont: list });
const colorToken = z.string().regex(/^brand\.color\.[a-z-]+$/);
/** Elenco con un elemento per ogni id atteso, nello stesso ordine (famiglie, varianti… del logo pack). */
const exactly = (ids, shape) =>
  z.array(z.strictObject({ id: z.enum(ids), ...shape })).refine((a) => a.map((x) => x.id).join() === ids.join(), `servono esattamente: ${ids.join(', ')}`);

export const BrandSchema = z.strictObject({
  provenance: z.strictObject({ source: text, ref: text, imported: z.iso.date(), note: text }),
  identity: z.strictObject({
    name: z.literal('Salento.dev'),
    domain: text,
    site: url,
    email: z.email(),
    language: text,
    tagline: text,
    channels: z.array(z.strictObject({ label: text, url, note: text })).min(1)
      .refine((c) => c.every((ch) => !/chat\.whatsapp\.com/.test(ch.url)), 'niente link di invito WhatsApp: usa il sito'),
    naming: doDont,
  }),
  descriptions: z.strictObject({
    source: url,
    items: z.array(z.strictObject({ id: z.string().regex(/^[a-z-]+$/), label: text, use: text, text }))
      .min(1)
      .refine((items) => items.every((d) => !/Salento\.Dev|Salento Dev/.test(d.text)), 'nel testo il nome si scrive Salento.dev'),
  }),
  northStar: z.strictObject({ name: text, text: list, traits: list }),
  scopes: z.strictObject(Object.fromEntries(SCOPES.map((s) => [s, z.strictObject({ label: text, text })]))),
  rules: z.array(z.strictObject({
    id: z.string().regex(/^[a-z0-9-]+$/),
    section: z.enum(RULE_SECTIONS),
    name: text,
    scope: z.enum(SCOPES),
    text,
  })).min(1),
  logo: z.strictObject({
    provenance: z.strictObject({ source: text, url, pack: text, sha256: z.string().regex(/^[0-9a-f]{64}$/), imported: z.iso.date(), note: text }),
    description: text,
    families: exactly(FAMILIES, { name: text, description: text, use: text }),
    variants: exactly(VARIANTS, { name: text, ink: colorToken, background: colorToken, on: text, description: text }),
    paddings: exactly(PADDINGS, { name: text, description: text }),
    formats: exactly(FORMATS, { name: text, description: text }),
    whereToUse: z.array(z.strictObject({ where: text, family: z.enum(FAMILIES), variant: z.enum(VARIANTS).optional() })).min(1),
    guidelines: z.array(z.strictObject({ title: text, items: list })).min(1),
    lightRule: text,
    do: list,
    dont: list,
    rights: list,
  }),
  dosAndDonts: z.array(z.strictObject({ scope: z.enum(SCOPES), do: list, dont: list })).min(1),
  partners: z.strictObject({ status: z.enum(['proposta', 'accettata']), intro: text, naming: list, cobranding: list, licence: list }),
});

/** Carica e valida content/brand/brand.yaml. Lancia un errore leggibile se non è valido. */
export function loadBrand(file = BRAND_FILE) {
  const result = BrandSchema.safeParse(loadYaml(fs.readFileSync(file, 'utf8')));
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.') || '(radice)'}: ${i.message}`);
    throw new Error(`content/brand/brand.yaml non valido:\n  ${issues.join('\n  ')}`);
  }
  const brand = result.data;
  const ids = brand.rules.map((r) => r.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`content/brand/brand.yaml: regola duplicata "${dup}"`);
  return brand;
}
