// Sottotitoli "social": 2-4 parole alla volta, pop sulla parola parlata, parole chiave colorate
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from './kit';

export type Word = {w: string; t?: string; start: number; end: number};

const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let chars = 0;
  for (const w of words) {
    const txt = w.t ?? w.w;
    cur.push(w);
    chars += txt.length + 1;
    const punct = /[.,!?:;]$/.test(txt);
    if (cur.length >= 4 || chars > 17 || punct) {
      out.push(cur);
      cur = [];
      chars = 0;
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC<{
  words: Word[];
  y?: number;
  highlight?: Record<string, string>;
  replace?: Record<string, string>;
}> = ({words, y = 1430, highlight = {}, replace = {}}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const groups = chunk(words);
  const gi = groups.findIndex((g, i) => {
    const next = groups[i + 1];
    return t >= g[0].start - 0.08 && (!next || t < next[0].start - 0.08);
  });
  if (gi < 0) return null;
  const g = groups[gi];
  const gStart = Math.round((g[0].start - 0.08) * fps);
  const enter = spring({frame: frame - gStart, fps, config: {damping: 13, stiffness: 180, mass: 0.6}});

  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center'}}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 28px',
        transform: `translateY(${(1 - enter) * 40}px) scale(${0.85 + enter * 0.15})`, opacity: enter,
      }}>
        {g.map((w, i) => {
          const raw = w.t ?? w.w;
          const key = w.w.toLowerCase().replace(/[^a-zàèéìòù0-9]/g, '');
          const txt = replace[key] ? raw.replace(new RegExp(w.w, 'i'), replace[key]) : raw;
          const active = t >= w.start - 0.03;
          const pop = spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10, stiffness: 260, mass: 0.5}});
          const col = highlight[key] ?? (active ? C.foam : 'rgba(232,251,255,0.38)');
          return (
            <span key={i} style={{
              fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1.08, letterSpacing: -1.5,
              color: col, textTransform: 'uppercase',
              transform: `scale(${active ? 1 + (1 - pop) * 0.12 : 1})`, display: 'inline-block',
              textShadow: '0 6px 0 rgba(2,11,26,0.55), 0 0 40px rgba(2,11,26,0.9)',
              WebkitTextStroke: '2px rgba(2,11,26,0.35)',
            }}>
              {txt}
            </span>
          );
        })}
      </div>
    </div>
  );
};
