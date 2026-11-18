import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {FPS} from '../theme';
import {RvMain} from './RvMain';
import {RV_TOTAL} from './timeline';
import cuts from './tight_cuts.json';

// Pause accorciate nell'audio: il video salta gli stessi istanti (tempo "vecchio" → "nuovo")
const segs: {a: number; b: number; n: number}[] = [];
{
  let cur = 0;
  let removed = 0;
  for (const [a, b] of cuts as number[][]) {
    segs.push({a: cur, b: a, n: cur - removed});
    removed += b - a;
    cur = b;
  }
  segs.push({a: cur, b: RV_TOTAL, n: cur - removed});
}
export const WARP_TOTAL = RV_TOTAL - (cuts as number[][]).reduce((s, [a, b]) => s + (b - a), 0);

export const RvWarp: React.FC = () => (
  <AbsoluteFill>
    {segs.map((s, i) => {
      const from = Math.round(s.n * FPS);
      const end = Math.round((s.n + (s.b - s.a)) * FPS);
      return (
        <Sequence key={i} from={from} durationInFrames={Math.max(1, end - from)}>
          <Sequence from={-Math.round(s.a * FPS)}>
            <RvMain />
          </Sequence>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
