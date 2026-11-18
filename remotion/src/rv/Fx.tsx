import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';
import {FPS, H, W} from '../theme';
import {RV_COL} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Raggi di luce subacquei che ondeggiano piano
export const Rays: React.FC<{opacity?: number}> = ({opacity = 0.5}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'screen', overflow: 'hidden'}}>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 80 + i * 230 + Math.sin(f / 50 + i * 1.7) * 60;
        const w = 90 + random('rw' + i) * 120;
        const o = 0.10 + 0.08 * Math.sin(f / 35 + i * 2.1);
        return (
          <div
            key={i}
            style={{position: 'absolute', left: x, top: -200, width: w, height: H * 1.1, transform: `rotate(${14 + i * 3}deg)`, transformOrigin: '50% 0%', background: `linear-gradient(180deg, rgba(190,225,255,${o}) 0%, rgba(190,225,255,0) 85%)`, filter: 'blur(18px)'}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Bolle che salgono con riflesso
export const Bubbles: React.FC<{n?: number; seed?: string}> = ({n = 26, seed = 'b'}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {new Array(n).fill(0).map((_, i) => {
        const r = 5 + random(seed + 'r' + i) * 16;
        const sp = 1.2 + random(seed + 's' + i) * 2.4;
        const x0 = random(seed + 'x' + i) * W;
        const y = (((random(seed + 'y' + i) * (H + 200) - f * sp) % (H + 200)) + H + 200) % (H + 200) - 100;
        const x = x0 + Math.sin(f / 18 + i) * 10;
        return (
          <div
            key={i}
            style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', border: '1.5px solid rgba(220,240,255,.45)', background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,.55) 0 18%, rgba(255,255,255,.06) 30%, rgba(255,255,255,0) 70%)'}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Illustrazione incisa che fluttua (linee luminose su trasparente)
export const Illus: React.FC<{src: string; x: number; y: number; w: number; rot?: number; opacity?: number; delay?: number; glow?: string; flip?: boolean}> = ({src, x, y, w, rot = 0, opacity = 1, delay = 0, glow, flip}) => {
  const f = useCurrentFrame() - delay;
  if (f < 0) return null;
  const p = interpolate(f, [0, 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const fl = Math.sin(f / 22) * 10;
  return (
    <Img
      src={staticFile(`img/${src}.png`)}
      style={{position: 'absolute', left: x, top: y + fl + (1 - p) * 40, width: w, opacity: opacity * p, transform: `rotate(${rot + Math.sin(f / 30) * 2}deg) scaleX(${flip ? -1 : 1})`, filter: glow ? `drop-shadow(0 0 18px ${glow})` : undefined}}
    />
  );
};

// Transizione a scia rosso→viola sui cambi scena
export const Swooshes: React.FC<{times: number[]}> = ({times}) => {
  const f = useCurrentFrame();
  return (
    <>
      {times.map((t, i) => {
        const c = Math.round(t * FPS);
        const lf = f - (c - 7);
        if (lf < 0 || lf > 14) return null;
        const p = interpolate(lf, [0, 14], [0, 1], {easing: Easing.inOut(Easing.cubic)});
        return (
          <AbsoluteFill key={i} style={{pointerEvents: 'none', overflow: 'hidden'}}>
            {[0, 1, 2].map((k) => (
              <div
                key={k}
                style={{position: 'absolute', left: -900 + p * (W + 1800) - k * 160, top: -300, width: 260 - k * 70, height: H + 600, transform: 'rotate(18deg)', background: k === 1 ? 'rgba(255,255,255,.85)' : `linear-gradient(180deg, ${RV_COL.rosso}, ${RV_COL.viola})`, opacity: 0.9 - k * 0.25, filter: k === 1 ? 'blur(6px)' : undefined}}
              />
            ))}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// Scintille (per VS e copertina)
export const Sparkles: React.FC<{cx: number; cy: number; r: number; n?: number}> = ({cx, cy, r, n = 10}) => {
  const f = useCurrentFrame();
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + f / 40;
        const rr = r * (0.8 + 0.3 * random('sp' + i));
        const s = 0.5 + 0.5 * Math.sin(f / 6 + i * 1.3);
        return (
          <svg key={i} width={30} height={30} viewBox="-10 -10 20 20" style={{position: 'absolute', left: cx + Math.cos(a) * rr - 15, top: cy + Math.sin(a) * rr - 15, transform: `scale(${s})`, opacity: s}}>
            <path d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z" fill="#fff" />
          </svg>
        );
      })}
    </>
  );
};
