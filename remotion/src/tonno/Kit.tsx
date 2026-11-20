import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, spring, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, H, W} from '../theme';
import {Bubbles, Rays} from '../rv/Fx';
import {TC} from './Tuna';
import wide from './wide.json';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const useAt = (t0: number) => {
  const f = useCurrentFrame();
  return {f, at: (s: number) => Math.round((s - t0) * FPS)};
};
export const sp = (f: number, d = 12, s = 190) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});
export const GRAD = `linear-gradient(90deg, ${TC.rosso}, ${TC.gialla}, ${TC.obeso})`;

export const Pill: React.FC<{txt: React.ReactNode; bg: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({txt, bg, fg = C.navy, size = 50, style}) => (
  <span style={{display: 'inline-block', background: bg, color: fg, fontFamily: 'Inter', fontWeight: 900, fontSize: size, padding: `${size * 0.22}px ${size * 0.6}px`, borderRadius: size, letterSpacing: 1, boxShadow: '0 14px 40px rgba(0,0,0,.45)', whiteSpace: 'nowrap', ...style}}>{txt}</span>
);

export const TopCard: React.FC<{txt: string; f: number}> = ({txt, f}) => {
  if (f < 0) return null;
  const x = interpolate(f, [0, 9], [-900, 0], {...clamp, easing: Easing.out(Easing.back(1.1))});
  return (
    <div style={{position: 'absolute', top: 318, left: 70, transform: `translateX(${x}px)`, zIndex: 5}}>
      <div style={{display: 'flex', alignItems: 'stretch', borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 44px rgba(0,0,0,.45), 0 0 0 2px rgba(255,255,255,.35)'}}>
        <div style={{width: 14, background: `linear-gradient(180deg, ${TC.rosso}, ${TC.gialla}, ${TC.obeso})`}} />
        <div style={{background: 'linear-gradient(180deg, #fbf8f1, #ece6da)', color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 46, padding: '14px 28px 12px', letterSpacing: 0.5}}>{txt}</div>
      </div>
    </div>
  );
};

export const NavyBg: React.FC<{tint?: string}> = ({tint}) => (
  <>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, ${tint ?? '#18305c'} 0%, #0b1a33 55%, #040b18 100%)`}} />
    <Rays opacity={0.5} />
    <Bubbles n={16} />
  </>
);

export const BlurPhoto: React.FC<{src: string; dark?: number}> = ({src, dark = 0.5}) => (
  <AbsoluteFill>
    <Img src={staticFile(`img/${src}.jpg`)} style={{width: W, height: H, objectFit: 'cover', transform: 'scale(1.3)', filter: `blur(22px) brightness(${dark}) saturate(1.2)`}} />
  </AbsoluteFill>
);

export const Chip: React.FC<{f: number; txt: React.ReactNode; y: number; bg: string; fg?: string; size?: number}> = ({f, txt, y, bg, fg, size = 52}) => {
  if (f < 0) return null;
  const p = sp(f);
  return (
    <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', transform: `translateY(${(1 - p) * 60}px)`, opacity: p}}>
      <Pill txt={txt} bg={bg} fg={fg} size={size} />
    </div>
  );
};

export const Check: React.FC<{lf: number; color: string; size?: number}> = ({lf, color, size = 56}) => (
  <svg width={size} height={size} viewBox="0 0 56 56" style={{flex: 'none'}}>
    <circle cx="28" cy="28" r="26" fill={color} />
    <path d="M16 29 L25 38 L41 19" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44" strokeDashoffset={44 * (1 - interpolate(lf, [3, 10], [0, 1], clamp))} />
  </svg>
);

// Contatore numerico con separatore delle migliaia
export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------- Mappa larga (Atlantico + Mediterraneo + tropici) ----------
export type P = [number, number];
export type Cam = {cx: number; cy: number; w: number};
export const WP = wide.points as unknown as Record<string, P>;
export const toS = (p: P, cam: Cam): P => {
  const k = W / cam.w;
  return [W / 2 + (p[0] - cam.cx) * k, H / 2 + (p[1] - cam.cy) * k];
};
export const lerpCam = (a: Cam, b: Cam, z: number): Cam => ({cx: a.cx + (b.cx - a.cx) * z, cy: a.cy + (b.cy - a.cy) * z, w: a.w * Math.pow(b.w / a.w, z)});

// Mappa pre-renderizzata in PNG (il tracciato vettoriale costa troppo a ogni fotogramma)
export const MAPS = {
  world: {x0: -11119.5, y0: -8849.2, w: 17791.2, h: 13423.5, k: 0.33, src: 'tn_map_world.png'},
  med: {x0: -1600, y0: -6600, w: 4800, h: 3200, k: 1.0, src: 'tn_map_med.png'},
};
export const MapSvg: React.FC<{x0: number; y0: number; w: number; h: number; k: number}> = ({x0, y0, w, h, k}) => (
  <svg width={w * k} height={h * k} viewBox={`${x0} ${y0} ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={wide.land} fill={C.land} stroke="rgba(160,180,220,.45)" strokeWidth={1.2 / k} />
    <path d={wide.spain} fill="#3a5799" stroke="#cfd9ef" strokeWidth={2 / k} />
    <path d={wide.croatia} fill="#3a5799" stroke="#cfd9ef" strokeWidth={2 / k} />
    <path d={wide.italy} fill="#3a5799" stroke="#cfd9ef" strokeWidth={2.4 / k} />
  </svg>
);
export const MapStill: React.FC<{m: 'world' | 'med'}> = ({m}) => <MapSvg {...MAPS[m]} />;

export const WideBase: React.FC<{cam: Cam; tropics?: number; hi?: string[]}> = ({cam, tropics = 0}) => {
  const k = W / cam.w;
  const m = cam.w < 2600 && cam.cx > -1000 ? MAPS.med : MAPS.world;
  const [tN, tS] = wide.tropics;
  const s0 = toS([m.x0, m.y0], cam);
  const tN_ = toS([0, tN], cam)[1];
  const tS_ = toS([0, tS], cam)[1];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #10284d, #040b18 80%)', overflow: 'hidden'}}>
      <Img src={staticFile('img/' + m.src)} style={{position: 'absolute', left: s0[0], top: s0[1], width: m.w * k, height: m.h * k, maxWidth: 'none', mixBlendMode: 'normal'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(16,40,77,0) 40%, rgba(4,11,24,.75) 100%)'}} />
      {tropics > 0 && <div style={{position: 'absolute', left: 0, width: W, top: tN_, height: (tS_ - tN_) * tropics, background: 'linear-gradient(180deg, rgba(255,140,40,0), rgba(255,150,40,.35) 30%, rgba(255,190,60,.45) 50%, rgba(255,150,40,.35) 70%, rgba(255,140,40,0))', mixBlendMode: 'screen'}} />}
    </AbsoluteFill>
  );
};

// Sagoma di persona (per i confronti)
export const Person: React.FC<{h: number; color?: string}> = ({h, color = '#dfe6f3'}) => (
  <svg width={h * 0.36} height={h} viewBox="0 0 36 100">
    <circle cx="18" cy="9" r="8" fill={color} />
    <path d="M6 22 Q18 17 30 22 L32 56 L26 56 L25 98 L19 98 L18 62 L17 98 L11 98 L10 56 L4 56 Z" fill={color} />
  </svg>
);
