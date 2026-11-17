// Timeline (secondi sull'audio voce montato, 1,04x). Ogni foto cambia ogni 2–3 s.
export type Trans = 'none' | 'smoothleft' | 'zoomin' | 'hblur' | 'smoothup' | 'slideleft' | 'wipeup' | 'circleopen';

export type Shot = {
  src: string;
  start: number;
  end: number;
  fx?: number; // focus x 0..100
  fy?: number;
  zoom?: number; // scala base extra
  trans: Trans;
  label?: string;
  labelAt?: number;
};

export const VOICE_END = 56.65;
export const LOGO_AT = 55.72; // si sente "Dama Reservèe"
export const TOTAL = 59.6;

export const SCENES = {
  travel: [3.3, 6.46],
  depth: [8.88, 14.84],
  distance: [17.74, 22.56],
  checklist: [35.52, 41.28],
  poll: [52.46, LOGO_AT],
} as const;

export const SHOTS: Shot[] = [
  {src: 'hook', start: 0, end: 2.06, fx: 50, fy: 50, zoom: 1.05, trans: 'none'},
  {src: 'gambero_v', start: 2.06, end: 3.6, fx: 50, fy: 40, zoom: 1.12, trans: 'zoomin', label: 'GAMBERO ROSSO DI MAZARA', labelAt: 2.4},
  {src: 'selvaggio', start: 6.16, end: 9.2, fx: 52, fy: 55, trans: 'none', label: 'SELVAGGIO, NON ALLEVATO', labelAt: 6.5},
  {src: 'carne', start: 14.54, end: 18.0, fx: 50, fy: 40, trans: 'none', label: 'CARNE COMPATTA E DOLCE', labelAt: 14.9},
  {src: 'pescherecci', start: 22.26, end: 25.28, fx: 58, fy: 50, trans: 'none', label: 'IN MARE PER SETTIMANE', labelAt: 22.6},
  {src: 'peschereccio2', start: 25.28, end: 27.24, fx: 30, fy: 45, trans: 'smoothleft', label: 'APPENA PESCATO…', labelAt: 25.4},
  {src: 'congelato', start: 27.24, end: 29.36, fx: 50, fy: 50, trans: 'hblur', label: 'CONGELATO A BORDO', labelAt: 27.3},
  {src: 'colore', start: 29.36, end: 32.42, fx: 45, fy: 50, trans: 'smoothup', label: 'COLORE · PROFUMO · FRESCHEZZA', labelAt: 29.5},
  {src: 'crudo1', start: 32.42, end: 35.8, fx: 50, fy: 50, zoom: 1.9, trans: 'circleopen', label: 'CRUDO IN TOTALE SICUREZZA', labelAt: 32.6},
  {src: 'crudo2', start: 40.98, end: 44.82, fx: 52, fy: 50, zoom: 1.15, trans: 'none', label: 'CRUDO: OLIO E LIMONE', labelAt: 41.3},
  {src: 'pasta1', start: 44.82, end: 46.9, fx: 45, fy: 55, trans: 'slideleft', label: 'OPPURE UN PRIMO', labelAt: 44.9},
  {src: 'pasta2', start: 46.9, end: 48.68, fx: 50, fy: 50, trans: 'wipeup', label: 'LE TESTE FANNO IL SUGO', labelAt: 47.0},
  {src: 'teste', start: 48.68, end: 50.36, fx: 50, fy: 50, trans: 'zoomin', label: 'CONSIGLIO DA INTENDITORE', labelAt: 48.75},
  {src: 'gambero_testa', start: 50.36, end: 52.8, fx: 50, fy: 40, zoom: 1.1, trans: 'smoothleft', label: 'LA TESTA? SI SUCCHIA!', labelAt: 50.45},
];

// Sottotitoli nascosti durante checklist, sondaggio e logo
export const HIDE_SUBS: [number, number][] = [
  [35.45, 41.3],
  [52.4, 99],
];
