// Wallpaper di doodle a schizzo: sparsi a caso (seed = slug) su tutta l'icona, anche dietro al soggetto,
// senza sovrapposizioni. Misure in px dell'icona 640.
import { SIZE, hash, mulberry32, shuffle, renderSketch, maskFor, Packer } from './doodles.js';

export const WALLPAPER = {
  sizeMin: 64, // lato dei doodle (px)
  sizeMax: 100,
  stroke: 4.5, // spessore del tratto (px)
  fillerStroke: 3.5,
  fillerSizeMin: 30,
  fillerSizeMax: 42,
  fillers: 10, // quanti riempitivi (stelline, puntini…) negli spazi rimasti
  opacity: 0.5,
  gap: 26, // distanza minima tra doodle (px)
  maxRotation: 20, // gradi
  sameNameDistance: 220, // due copie dello stesso doodle non stanno più vicine di così
  minBag: 21, // doodle "da provare" (poi si smette dopo 12 fallimenti di fila)
};

/** Raggio entro cui un doodle conta come visibile nel ritaglio circolare di WhatsApp. */
const visibleFrom = (x, y, s) => Math.hypot(x - SIZE / 2, y - SIZE / 2) + s * 0.15 < 316;

/**
 * Posiziona i doodle. `extras` = doodle del gruppo (pesati ×3), `base` = set comune (×1),
 * `fillers` = riempitivi. Restituisce [{ name, x, y, s, rot, filler }].
 */
export function composeWallpaper({ seed, lib, extras = [], base = [], fillers = [], p = WALLPAPER }) {
  const rand = mulberry32(hash(`icon:${seed}`));
  const pk = new Packer();
  const placed = [];
  const rot = (max) => (rand() * 2 - 1) * max;

  const pool = [...extras, ...extras, ...extras, ...base.filter((n) => !extras.includes(n))];
  const bag = [];
  while (pool.length && bag.length < p.minBag) bag.push(...shuffle(rand, [...pool]));

  let fails = 0;
  while (fails < 12 && bag.length) {
    const s = p.sizeMin + rand() * (p.sizeMax - p.sizeMin);
    const r = rot(p.maxRotation);
    let ok = false;
    for (let b = 0; b < Math.min(3, bag.length) && !ok; b++) {
      const name = bag[b];
      const m = maskFor(lib, name, s, r, p.gap + p.stroke);
      for (let j = 0; j < 600; j++) {
        const x = rand() * SIZE, y = rand() * SIZE;
        if (placed.some((q) => q.name === name && Math.hypot(q.x - x, q.y - y) < p.sameNameDistance)) continue;
        if (!pk.fits(m, x, y)) continue;
        if (pk.visible(m, x, y) < 0.5) continue;
        pk.add(m, x, y);
        placed.push({ name, x, y, s, rot: r, filler: false });
        bag.splice(b, 1);
        ok = true;
        break;
      }
    }
    fails = ok ? 0 : fails + 1;
  }

  let nf = 0;
  for (let k = 0; k < 400 && nf < p.fillers && fillers.length; k++) {
    const name = fillers[Math.floor(rand() * fillers.length)];
    const s = p.fillerSizeMin + rand() * (p.fillerSizeMax - p.fillerSizeMin);
    const r = rot(30);
    const m = maskFor(lib, name, s, r, 18);
    const x = rand() * SIZE, y = rand() * SIZE;
    if (!visibleFrom(x, y, s) || !pk.fits(m, x, y)) continue;
    pk.add(m, x, y);
    placed.push({ name, x, y, s, rot: r, filler: true });
    nf++;
  }
  return placed;
}

/** Markup SVG del wallpaper già colorato. */
export function wallpaperSvg({ seed, lib, layout, color, p = WALLPAPER }) {
  const doodles = layout
    .map((it, i) => renderSketch(lib, it, `${seed}:bg:${i}`, { w: it.filler ? p.fillerStroke : p.stroke }))
    .join('');
  return `<g stroke-linecap="round" stroke-linejoin="round" opacity="${p.opacity}">${doodles.replace(/currentColor/g, color)}</g>`;
}
