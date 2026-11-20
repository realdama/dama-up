import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import {Subs} from '../Overlay';
import {TnMain} from './TnMain';
import warp from './warp5.json';
import words5 from './words5.json';

// Riallinea le scene (fatte sui tempi della voce vecchia) alla voce nuova: ogni fotogramma nuovo
// mostra il fotogramma "vecchio" corrispondente, interpolato tra le ancore sulle parole.
const O = warp.old as number[];
const N = warp.new as number[];
export const TN5_TOTAL = N[N.length - 1] + (95.6 - O[O.length - 1]);
export const TN5_LOGO = N[N.length - 1];
const toOld = (t: number) => {
  if (t >= N[N.length - 1]) return O[O.length - 1] + (t - N[N.length - 1]);
  let i = 0;
  while (i < N.length - 2 && N[i + 1] < t) i++;
  const k = (t - N[i]) / (N[i + 1] - N[i]);
  return O[i] + k * (O[i + 1] - O[i]);
};
const mapNew = (o: number) => {
  if (o >= O[O.length - 1]) return N[N.length - 1] + (o - O[O.length - 1]);
  let i = 0;
  while (i < O.length - 2 && O[i + 1] < o) i++;
  return N[i] + ((o - O[i]) / (O[i + 1] - O[i])) * (N[i + 1] - N[i]);
};
const HIDE: [number, number][] = [[0, mapNew(3.4)], [mapNew(29.75), mapNew(34.12)], [mapNew(79.45), 999]];

export const TnFinal: React.FC = () => {
  const f = useCurrentFrame();
  const of = Math.round(toOld(f / FPS) * FPS);
  return (
    <AbsoluteFill>
      <Freeze frame={of}>
        <TnMain subs={false} />
      </Freeze>
      <Subs groups={words5 as never} hide={HIDE} />
    </AbsoluteFill>
  );
};
