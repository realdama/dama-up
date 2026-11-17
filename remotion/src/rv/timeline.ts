// "Rosso o viola?" — secondi sulla voce montata (79,5 s, 1,04x)
import type {Shot} from '../timeline';

export const RV_LOGO_AT = 78.84; // "Dama Reservèe"
export const RV_TOTAL = 82.7;

export const RV_COL = {rosso: '#e2452f', viola: '#b46cd8', violaSoft: '#e7c6f5'};

export const RV_SCENES = {
  hook: [0, 3.58],
  med: [3.58, 8.84],
  idRosso: [8.84, 13.04],
  sicilia: [13.04, 17.92],
  idViola: [17.92, 24.24],
  italia: [24.24, 29.36],
  calibro: [29.36, 39.52],
  ue: [41.62, 51.84],
  meno6: [51.84, 59.36],
  chain: [59.36, 62.78],
  lazio: [62.78, 68.74],
  stamps: [71.02, 75.5],
  poll: [75.5, RV_LOGO_AT],
} as const;

export const RV_SHOTS: Shot[] = [
  {src: 'viola3', start: 39.22, end: 41.92, fx: 50, fy: 50, trans: 'none', label: 'CRESCONO LENTAMENTE', labelAt: 39.6},
  {src: 'crudo2', start: 68.44, end: 71.32, fx: 52, fy: 50, zoom: 1.15, trans: 'none', label: 'PER CHI AMA IL CRUDO', labelAt: 68.8},
];

export const RV_HIDE_SUBS: [number, number][] = [
  [0, 3.5],
  [73.6, 75.45],
  [75.45, 99],
];
