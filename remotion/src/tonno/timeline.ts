// "Il tonno è tutto uguale?" — secondi sulla voce montata (92,9 s, DeepFilterNet3 + pause accorciate)
import type {Shot} from '../timeline';

export const TN_LOGO_AT = 91.95; // "Dama Reservèe"
export const TN_TOTAL = 95.6;

export const TN_SCENES = {
  hook: [0, 3.4],
  re: [3.4, 10.5],
  oceano: [10.5, 17.2],
  med: [17.2, 21.95],
  storia: [21.95, 29.75],
  regole: [29.75, 34.12],
  tornato: [34.12, 38.45],
  quota: [38.45, 46.45],
  sicilia: [46.45, 47.98],
  caldi: [47.98, 49.95],
  gialla: [49.95, 54.33],
  carne: [54.33, 60.25],
  obeso: [60.25, 65.15],
  profondo: [65.15, 69.95],
  asta: [72.25, 79.45],
  cucina: [79.45, 88.65],
  poll: [88.65, 91.95],
} as const;

export const TN_SHOTS: Shot[] = [
  {src: 'tn_sashimi', start: 69.95, end: 72.25, fx: 50, fy: 50, zoom: 1.08, trans: 'none', label: 'GIAPPONE · SASHIMI', labelAt: 70.19},
];

export const TN_HIDE_SUBS: [number, number][] = [
  [0, 3.4],
  [29.75, 34.12],
  [79.45, 99],
];
