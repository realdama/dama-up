import {staticFile, continueRender, delayRender} from 'remotion';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  navy: '#0b1a33',
  navyDeep: '#060f20',
  land: '#2b3a5e',
  italy: '#3a5799',
  orange: '#FFB447',
  red: '#e2452f',
  green: '#2fbf71',
  silver: '#d9dee6',
  cream: '#f4f1ea',
};

const fonts: [string, string, number][] = [
  ['Inter', 'inter-latin-800-normal.woff2', 800],
  ['Inter', 'inter-latin-900-normal.woff2', 900],
  ['Cinzel', 'cinzel-latin-600-normal.woff2', 600],
  ['Cinzel', 'cinzel-latin-700-normal.woff2', 700],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  Promise.all(
    fonts.map(([fam, file, weight]) => {
      const f = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: String(weight)});
      return f.load().then((ff) => document.fonts.add(ff));
    }),
  ).then(() => continueRender(h));
};

export const sec = (s: number) => Math.round(s * FPS);
