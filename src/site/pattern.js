// Pattern a puntini del telaio, ricostruito da resources/images/dots-pattern-15.png del sito (tile 800px mostrata a 9rem):
// griglia 12×12 con passo 12px (tile 144px), puntini tenui e alcuni "accesi" sempre nelle stesse posizioni.
export const DOT_PITCH = 12;
export const DOT_COUNT = 12;
export const DOT_TILE = DOT_PITCH * DOT_COUNT;
const RADIUS = 1.35;
const OPACITY = { dim: 0.05, lit: 0.15 };

/** Puntini accesi della tile del sito, come [colonna, riga]. */
export const LIT_DOTS = [
  [1, 2], [1, 5], [1, 7], [1, 10], [2, 9], [2, 11], [3, 3], [3, 5], [3, 6], [4, 6], [4, 8], [5, 5], [5, 8], [5, 9],
  [6, 4], [6, 5], [6, 8], [7, 1], [7, 4], [7, 7], [8, 5], [8, 7], [8, 8], [8, 11], [9, 1], [9, 3], [9, 4], [9, 10],
  [10, 1], [10, 9], [11, 1], [11, 2], [11, 3], [11, 4], [11, 9],
];

/** Tile SVG del pattern nel colore dato (brand.color.pattern-sand). */
export function dotsSvg(color) {
  const lit = new Set(LIT_DOTS.map(([c, r]) => `${c},${r}`));
  const dots = { dim: [], lit: [] };
  for (let r = 0; r < DOT_COUNT; r++) {
    for (let c = 0; c < DOT_COUNT; c++) {
      dots[lit.has(`${c},${r}`) ? 'lit' : 'dim'].push(`<circle cx="${c * DOT_PITCH + DOT_PITCH / 2}" cy="${r * DOT_PITCH + DOT_PITCH / 2}" r="${RADIUS}"/>`);
    }
  }
  const group = (kind) => `<g fill-opacity="${OPACITY[kind]}">${dots[kind].join('')}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${DOT_TILE}" height="${DOT_TILE}" viewBox="0 0 ${DOT_TILE} ${DOT_TILE}" fill="${color}">${group('dim')}${group('lit')}</svg>\n`;
}
