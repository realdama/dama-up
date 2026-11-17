import React from 'react';
import {AbsoluteFill, interpolate, Easing, spring, useCurrentFrame} from 'remotion';
import {C, FPS} from './theme';
import {HIDE_SUBS, LOGO_AT, SHOTS, TOTAL, Shot} from './timeline';
import words from './words.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Header: React.FC<{logoAt?: number}> = ({logoAt = LOGO_AT}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [Math.round((logoAt - 0.3) * FPS), Math.round(logoAt * FPS)], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 92, width: '100%', textAlign: 'center', opacity: o}}>
      <div
        style={{
          fontFamily: 'Cinzel',
          fontWeight: 700,
          fontSize: 50,
          letterSpacing: 10,
          color: C.silver,
          textShadow: '0 2px 12px rgba(0,0,0,.6)',
        }}
      >
        DAMA RESERVÈE
      </div>
      <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 19, letterSpacing: 7, color: 'rgba(217,222,230,.85)', marginTop: 4}}>
        — EXCLUSIVE SEAFOOD —
      </div>
    </div>
  );
};

export const Progress: React.FC<{total?: number}> = ({total = TOTAL}) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / (total * FPS));
  return (
    <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${p * 100}%`, background: 'linear-gradient(90deg,#9aa3b1,#f3f5f8,#c4cad3)', boxShadow: '0 0 12px rgba(255,255,255,.5)'}} />
  );
};

export const Labels: React.FC<{shots?: Shot[]}> = ({shots = SHOTS}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {shots.filter((s) => s.label).map((s, i) => {
        const a = Math.round((s.labelAt ?? s.start) * FPS);
        const b = Math.round(s.end * FPS);
        if (frame < a || frame >= b) return null;
        const f = frame - a;
        const x = interpolate(f, [0, 9], [-900, 0], {...clamp, easing: Easing.out(Easing.back(1.1))});
        const out = interpolate(frame, [b - 6, b], [1, 0], clamp);
        return (
          <div key={i} style={{position: 'absolute', top: 318, left: 70, transform: `translateX(${x}px)`, opacity: out}}>
            <div
              style={{
                display: 'inline-block',
                background: C.cream,
                color: C.navy,
                fontFamily: 'Inter',
                fontWeight: 800,
                fontSize: s.label!.length > 24 ? 40 : 48,
                letterSpacing: 1,
                padding: '14px 26px 12px',
                borderRadius: 10,
                borderLeft: `10px solid ${C.orange}`,
                boxShadow: '0 12px 40px rgba(0,0,0,.35)',
                maxWidth: 900,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </>
  );
};

type Wd = {t: string; s: number; e: number};
const defaultGroups = words as Wd[][];

export const Subs: React.FC<{groups?: Wd[][]; hide?: [number, number][]}> = ({groups = defaultGroups, hide = HIDE_SUBS}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  let gi = -1;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const next = groups[i + 1];
    const endT = next ? Math.min(next[0].s, g[g.length - 1].e + 0.5) : g[g.length - 1].e + 0.5;
    if (t >= g[0].s - 0.03 && t < endT) gi = i;
  }
  if (gi < 0) return null;
  const g = groups[gi];
  const text = g.map((w) => w.t).join(' ');
  const fs = Math.min(112, 800 / (text.length * 0.8 + (g.length - 1) * 0.6));
  const f = frame - Math.round((g[0].s - 0.03) * FPS);
  const pop = spring({frame: f, fps: FPS, config: {damping: 11, stiffness: 220, mass: 0.6}});
  const sc = 0.65 + 0.35 * pop;
  return (
    <div style={{position: 'absolute', top: 1400 - fs / 2, width: '100%', textAlign: 'center', transform: `scale(${sc})`, transformOrigin: '50% 50%'}}>
      {g.map((w, i) => {
        const active = t >= w.s - 0.03 && (t < w.e + 0.1 || i === g.length - 1);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              margin: '0 0.3em',
              fontFamily: 'Inter',
              fontWeight: 900,
              fontSize: fs,
              lineHeight: 1,
              color: active ? C.orange : '#ffffff',
              transform: `scale(${active ? 1.15 : 1})`,
              transformOrigin: g.length === 1 ? '50% 60%' : i === 0 ? '100% 60%' : '0% 60%',
              WebkitTextStroke: `${Math.round(fs * 0.1)}px #000`,
              paintOrder: 'stroke fill',
              textShadow: '0 8px 24px rgba(0,0,0,.55)',
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

// Hook: titolo forte nei primi 2 s
export const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 62) return null;
  const pop = spring({frame: frame - 2, fps: FPS, config: {damping: 10, stiffness: 180}});
  const o = interpolate(frame, [54, 62], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 520, width: '100%', textAlign: 'center', opacity: o, transform: `scale(${0.6 + 0.4 * pop}) rotate(-2deg)`}}>
      <div style={{display: 'inline-block', background: C.orange, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 66, padding: '10px 26px', borderRadius: 12, marginBottom: 16}}>
        PERCHÉ COSTA
      </div>
      <br />
      <div style={{display: 'inline-block', background: C.cream, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 96, padding: '8px 30px', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,.45)'}}>
        COSÌ TANTO?
      </div>
    </div>
  );
};
