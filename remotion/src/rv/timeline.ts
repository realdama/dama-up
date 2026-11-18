// "Rosso o viola?" — secondi sulla voce montata (79,5 s, 1,04x)
import type {Shot} from '../timeline';

// Tolta "questi gamberi crescono lentamente, così" (non verificabile): tutto dopo 39,3 s anticipa di 2,47 s
export const RV_SHIFT = -2.47;
export const RV_CUT_AT = 39.55;
export const rvSh = (t: number) => (t >= RV_CUT_AT ? t + RV_SHIFT : t);
export const RV_LOGO_AT = 76.37; // "Dama Reservèe"
export const RV_TOTAL = 80.25;

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
  poll: [75.5, 78.84], // tempi originali (prima dello spostamento)
} as const;

export const RV_SHOTS: Shot[] = [
  {src: 'viola2', start: 65.97, end: 68.85, fx: 40, fy: 45, zoom: 1.1, trans: 'none', label: 'PER CHI AMA IL CRUDO', labelAt: 66.33},
];

export const RV_HIDE_SUBS: [number, number][] = [
  [0, 3.5],
  [71.13, 72.98],
  [72.98, 99],
];
