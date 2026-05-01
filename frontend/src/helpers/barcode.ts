// Encodeur Code 39 → SVG. Utilisé pour le code-barres de la carte de membre.
// Code 39 est le standard utilisé par les médiathèques (notamment MicroBib) :
// auto-checking, plus tolérant aux scanners bas de gamme que Code 128.
//
// Chaque caractère = 9 éléments alternés (5 barres + 4 espaces) dont 3 sont
// larges. Ratio largeur/étroit = 3:1. Gap inter-caractère = 1 espace étroit.
// '1' dans le pattern = élément large, '0' = étroit.
// Position dans la chaîne : 0,2,4,6,8 = barres ; 1,3,5,7 = espaces.

const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  A: '100001001',
  B: '001001001',
  C: '101001000',
  D: '000011001',
  E: '100011000',
  F: '001011000',
  G: '000001101',
  H: '100001100',
  I: '001001100',
  J: '000011100',
  K: '100000011',
  L: '001000011',
  M: '101000010',
  N: '000010011',
  O: '100010010',
  P: '001010010',
  Q: '000000111',
  R: '100000110',
  S: '001000110',
  T: '000010110',
  U: '110000001',
  V: '011000001',
  W: '111000000',
  X: '010010001',
  Y: '110010000',
  Z: '011010000',
  '-': '010000101',
  '.': '110000100',
  ' ': '011000100',
  $: '010101000',
  '/': '010100010',
  '+': '010001010',
  '%': '000101010',
  '*': '010010100',
};

const NARROW = 2;
const WIDE = NARROW * 3;
const QUIET_ZONE = NARROW * 10;

export function generateCode39Svg(text: string, height = 80): string {
  if (!text) return '';
  const upper = text.toUpperCase();

  // Filtre les caractères supportés (le * est réservé au start/stop).
  const chars = ['*'];
  for (const c of upper) {
    if (c !== '*' && CODE39_PATTERNS[c]) chars.push(c);
  }
  chars.push('*');

  if (chars.length <= 2) return '';

  type Element = { width: number; isBar: boolean };
  const elements: Element[] = [];

  for (let i = 0; i < chars.length; i++) {
    const pattern = CODE39_PATTERNS[chars[i]];
    if (!pattern) continue;
    for (let j = 0; j < 9; j++) {
      elements.push({
        width: pattern[j] === '1' ? WIDE : NARROW,
        isBar: j % 2 === 0,
      });
    }
    // Gap inter-caractère (espace étroit) sauf après le dernier.
    if (i < chars.length - 1) {
      elements.push({ width: NARROW, isBar: false });
    }
  }

  const barsWidth = elements.reduce((sum, e) => sum + e.width, 0);
  const totalWidth = barsWidth + QUIET_ZONE * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" width="${totalWidth}" height="${height}"><rect x="0" y="0" width="${totalWidth}" height="${height}" fill="#fff"/>`;
  let x = QUIET_ZONE;
  for (const e of elements) {
    if (e.isBar) {
      svg += `<rect x="${x}" y="0" width="${e.width}" height="${height}" fill="#000"/>`;
    }
    x += e.width;
  }
  svg += '</svg>';
  return svg;
}
