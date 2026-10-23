// SVG -> PNG con resvg. Nessun font: le icone non contengono testo (rendering più veloce e riproducibile).
import { Resvg } from '@resvg/resvg-js';

export const svgToPng = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } }).render().asPng();

/** PNG a dimensione piena + anteprime richieste (es. [96]): { png, previews: { 96: Buffer } }. */
export function renderPng(svg, { width, previews = [] }) {
  return { png: svgToPng(svg, width), previews: Object.fromEntries(previews.map((w) => [w, svgToPng(svg, w)])) };
}
