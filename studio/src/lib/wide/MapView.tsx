// Mappe vettoriali (Natural Earth) per scene geografiche: porti, rotte, barche, meteo
import React from 'react';
import {useCurrentFrame} from 'remotion';
import maps from '../maps.json';
import {C, FONT, MONO, ez, useIn, W, H, Boat} from './ui';

type View = 'lazio' | 'centro' | 'italia' | 'europa' | 'tirrenoV' | 'adriaticoV';
export const pt = (view: View, k: string): [number, number] => (maps as any).views[view].pts[k] ?? [0, 0];

export const MapView: React.FC<{
  view: View; at?: number; land?: string; italy?: string; cam?: {s: number; x: number; y: number}[]; camAt?: number[];
  children?: React.ReactNode; dim?: number; top?: boolean;
}> = ({view, at = 0, land = '#163556', italy = '#24578A', cam, camAt, children, dim = 1}) => {
  const f = useCurrentFrame();
  const v = (maps as any).views[view];
  const p = ez(f, at, at + 25);
  // camera: interpola tra i keyframe cam[i] ai frame camAt[i]
  let s = 1, x = 0, y = 0;
  if (cam && camAt) {
    let i = 0;
    while (i < camAt.length - 1 && f >= camAt[i + 1]) i++;
    const a = cam[i], b = cam[Math.min(i + 1, cam.length - 1)];
    const t = i + 1 < camAt.length ? ez(f, camAt[i], camAt[i + 1] - 0) : 1;
    const tt = f < camAt[0] ? 0 : t;
    s = a.s + (b.s - a.s) * tt; x = a.x + (b.x - a.x) * tt; y = a.y + (b.y - a.y) * tt;
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, opacity: p * dim}}>
      <defs>
        <radialGradient id={`seaG${view}`} cx="0.5" cy="0.5" r="0.8">
          <stop offset="0" stopColor="#0A3360" />
          <stop offset="1" stopColor={C.abyss} />
        </radialGradient>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(63,224,208,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#seaG${view})`} />
      <rect width={W} height={H} fill="url(#grid)" />
      <g transform={`translate(${W / 2} ${H / 2}) scale(${s}) translate(${-W / 2 + x} ${-H / 2 + y})`}>
        {v.shapes.map((sh: any) => (
          <path key={sh.name} d={sh.d} fill={sh.name === 'Italy' ? italy : land}
            stroke={sh.name === 'Italy' ? C.aqua : 'rgba(232,251,255,0.18)'} strokeWidth={(sh.name === 'Italy' ? 2.2 : 1.2) / s} />
        ))}
        {children}
      </g>
      <defs><linearGradient id="veil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020B1A" stopOpacity={0.92} /><stop offset="1" stopColor="#020B1A" stopOpacity={0} /></linearGradient>
      <linearGradient id="veilB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#020B1A" stopOpacity={0.75} /><stop offset="1" stopColor="#020B1A" stopOpacity={0} /></linearGradient></defs>
      <rect width={W} height={330} fill="url(#veil)" />
      <rect y={H - 200} width={W} height={200} fill="url(#veilB)" />
    </svg>
  );
};

export const Port: React.FC<{x: number; y: number; at: number; label: string; side?: 'l' | 'r'; color?: string; s?: number; big?: boolean}> = ({x, y, at, label, side = 'l', color = C.gold, s = 1, big}) => {
  const f = useCurrentFrame();
  const p = useIn(at, {damping: 10});
  const pulse = ((f - at) % 45) / 45;
  const fs = (big ? 30 : 24) / s;
  const w = label.length * fs * 0.62 + 30 / s;
  const lx = side === 'l' ? -w - 26 / s : 26 / s;
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 1.4)}>
      {f > at && <circle r={(12 + pulse * 34) / s} fill="none" stroke={color} strokeWidth={3 / s} opacity={1 - pulse} />}
      <circle r={(11 / s) * p} fill={color} stroke={C.abyss} strokeWidth={3 / s} />
      <g transform={`translate(${lx} 0) scale(${p})`}>
        <rect x={0} y={-fs * 0.95} width={w} height={fs * 1.9} rx={fs * 0.5} fill="rgba(2,11,26,0.85)" stroke={color} strokeWidth={2 / s} />
        <text x={w / 2} y={fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={C.foam}>{label}</text>
      </g>
    </g>
  );
};

/** rotta curva animata con punto viaggiante */
export const Route: React.FC<{a: [number, number]; b: [number, number]; at: number; dur?: number; color?: string; bend?: number; s?: number; dot?: boolean; width?: number}> = ({
  a, b, at, dur = 40, color = C.aqua, bend = 0.25, s = 1, dot = true, width = 4,
}) => {
  const f = useCurrentFrame();
  const p = ez(f, at, at + dur);
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.25;
  const q = ((f - at - dur) % 60) / 60;
  const t = f > at + dur ? q : p;
  const bx = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mx + t * t * b[0];
  const by = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * my + t * t * b[1];
  return (
    <g opacity={f >= at ? 1 : 0}>
      <path d={d} stroke={color} strokeWidth={width / s} fill="none" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - p)} strokeLinecap="round" opacity={0.9} />
      <path d={d} stroke={color} strokeWidth={(width + 10) / s} fill="none" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - p)} opacity={0.15} />
      {dot && <circle cx={bx} cy={by} r={8 / s} fill={C.foam} stroke={color} strokeWidth={3 / s} />}
    </g>
  );
};

/** flottiglia: barche che rientrano verso un porto */
export const Fleet: React.FC<{to: [number, number]; at: number; n?: number; spread?: number; s?: number; from?: [number, number]; color?: string; hold?: boolean}> = ({
  to, at, n = 4, spread = 120, s = 1, from, color = C.foam, hold = false,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const st = from ?? [to[0] - 160 - i * 30, to[1] + 60 + i * 20];
        const sx = st[0] + Math.cos(i * 2.1) * spread * 0.5, sy = st[1] + Math.sin(i * 1.7) * spread * 0.4;
        const p = hold ? 0 : ez(f, at + i * 8, at + i * 8 + 90);
        const x = sx + (to[0] - sx) * p * 0.92, y = sy + (to[1] - sy) * p * 0.92;
        const rot = (Math.atan2(to[1] - sy, to[0] - sx) * 180) / Math.PI;
        return <Boat key={i} x={x} y={y} s={(0.9 / s) * Math.min(1, ez(f, at + i * 6, at + i * 6 + 10))} rot={hold ? 0 : rot > 90 || rot < -90 ? 0 : 0} color={color} />;
      })}
    </g>
  );
};

/** zona di mare in tempesta */
export const Storm: React.FC<{x: number; y: number; at: number; s?: number; r?: number}> = ({x, y, at, s = 1, r = 160}) => {
  const f = useCurrentFrame();
  const p = useIn(at, {damping: 12});
  return (
    <g transform={`translate(${x} ${y})`} opacity={p}>
      <circle r={(r * p) / s} fill="rgba(255,107,107,0.12)" stroke={C.coral} strokeWidth={3 / s} strokeDasharray={`${12 / s} ${10 / s}`} transform={`rotate(${f * 2})`} />
      {Array.from({length: 5}).map((_, i) => {
        const yy = ((f * 3 + i * 30) % 120) - 60;
        return <path key={i} transform={`scale(${1 / s})`} d={`M ${-r * 0.6 + i * r * 0.3} ${yy} q 10 -14 20 0 t 20 0`} stroke={C.coral} strokeWidth={4} fill="none" opacity={0.6} />;
      })}
      <g transform={`scale(${1 / s})`}>
        <path d="M -40 -10 C -58 -10 -58 -40 -34 -40 C -28 -64 14 -64 20 -40 C 46 -44 50 -10 26 -10 Z" fill="#CBD7E3" />
        <path d="M -6 -6 L -18 18 H 0 L -12 42" stroke={C.gold} strokeWidth={6} fill="none" strokeLinejoin="round" />
      </g>
    </g>
  );
};

export const SeaLabel: React.FC<{x: number; y: number; at: number; text: string; s?: number; size?: number; color?: string; rot?: number}> = ({x, y, at, text, s = 1, size = 56, color = C.aqua, rot = 0}) => {
  const f = useCurrentFrame();
  const p = ez(f, at, at + 30);
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size / s} letterSpacing={(size * 0.4) / s}
      fill={color} opacity={p * 0.9} transform={`rotate(${rot} ${x} ${y})`} style={{filter: `blur(${(1 - p) * 6}px)`}}>{text}</text>
  );
};

export const MONO_ = MONO;
