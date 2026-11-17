// Argo Maris — kit grafico condiviso (solo vettori, niente immagini)
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/space-grotesk/700.css';

export const C = {
  abyss: '#020B1A',
  deep: '#06244A',
  ocean: '#0A4C8C',
  sea: '#1C8FD6',
  aqua: '#3FE0D0',
  foam: '#E8FBFF',
  gold: '#FFC94A',
  coral: '#FF6B6B',
  salt: '#F4F7FA',
  violet: '#9B8CFF',
};
export const FONT = 'Montserrat, sans-serif';
export const MONO = '"Space Grotesk", sans-serif';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** spring 0→1 che parte a `delay` frame */
export const useSpring = (delay = 0, cfg: {damping?: number; mass?: number; stiffness?: number} = {}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14, mass: 0.8, stiffness: 120, ...cfg}});
};

export const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});

/** generatore pseudo-casuale deterministico */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** onda SVG animata */
export const wavePath = (w: number, y: number, amp: number, len: number, phase: number, h = 2400) => {
  let d = `M 0 ${y}`;
  for (let x = 0; x <= w; x += 20) {
    const yy = y + Math.sin(x / len + phase) * amp + Math.sin(x / (len * 0.47) + phase * 1.7) * amp * 0.35;
    d += ` L ${x} ${yy.toFixed(1)}`;
  }
  return d + ` L ${w} ${h} L 0 ${h} Z`;
};

export const Sea: React.FC<{y: number; w?: number; opacity?: number; speed?: number; colors?: [string, string]}> = ({
  y, w = 1080, opacity = 1, speed = 1, colors = [C.sea, C.deep],
}) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`sea${y}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <path d={wavePath(w, y - 14, 16, 120, f * 0.06 * speed + 1)} fill={C.aqua} opacity={0.25} />
      <path d={wavePath(w, y, 18, 150, f * 0.08 * speed)} fill={`url(#sea${y})`} />
      <path d={wavePath(w, y + 22, 10, 90, -f * 0.05 * speed)} fill={C.foam} opacity={0.08} />
    </g>
  );
};

/** cristallo di sale (cubetto isometrico) */
export const Crystal: React.FC<{x: number; y: number; s?: number; rot?: number; o?: number}> = ({x, y, s = 1, rot = 0, o = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <polygon points="0,-14 13,-7 0,0 -13,-7" fill="#FFFFFF" />
    <polygon points="-13,-7 0,0 0,15 -13,8" fill="#CFE6F2" />
    <polygon points="13,-7 0,0 0,15 13,8" fill="#A9CDE3" />
  </g>
);

/** ione: cerchio con etichetta */
export const Ion: React.FC<{x: number; y: number; label: string; color: string; s?: number; o?: number}> = ({x, y, label, color, s = 1, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={40} fill={color} opacity={0.22} />
    <circle r={30} fill={color} />
    <text y={10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={label.length > 3 ? 20 : 26} fill={C.abyss}>
      {label}
    </text>
  </g>
);

/** goccia */
export const Drop: React.FC<{x: number; y: number; s?: number; color?: string; o?: number}> = ({x, y, s = 1, color = C.aqua, o = 1}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={o}
    d="M0,-30 C10,-14 22,0 22,14 C22,28 12,36 0,36 C-12,36 -22,28 -22,14 C-22,0 -10,-14 0,-30 Z" fill={color} />
);

/** nuvola morbida */
export const Cloud: React.FC<{x: number; y: number; s?: number; color?: string; o?: number}> = ({x, y, s = 1, color = '#DDEBF7', o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill={color}>
    <ellipse cx={0} cy={20} rx={170} ry={55} />
    <circle cx={-70} cy={0} r={65} />
    <circle cx={10} cy={-30} r={85} />
    <circle cx={95} cy={5} r={60} />
  </g>
);

/** sole con raggi rotanti */
export const Sun: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={210} fill={C.gold} opacity={0.08} />
      <circle r={150} fill={C.gold} opacity={0.15} />
      <g transform={`rotate(${f * 0.6})`}>
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={-7} y={-175} width={14} height={45} rx={7} fill={C.gold} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r={100} fill={C.gold} />
      <circle r={100} fill="url(#sunShine)" />
      <defs>
        <radialGradient id="sunShine" cx="0.35" cy="0.35">
          <stop offset="0" stopColor="#FFF6C9" />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
    </g>
  );
};

/** etichetta "pillola" in SVG */
export const Pill: React.FC<{x: number; y: number; text: string; color?: string; s?: number; o?: number; size?: number}> = ({
  x, y, text, color = C.aqua, s = 1, o = 1, size = 38,
}) => {
  const w = text.length * size * 0.62 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={size * 0.95} fill={color} />
      <text y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.abyss}>
        {text}
      </text>
    </g>
  );
};

/** numero che scorre */
export const Counter: React.FC<{from?: number; to: number; start: number; dur: number; fmt?: (n: number) => string}> = ({
  from = 0, to, start, dur, fmt = (n) => Math.round(n).toLocaleString('it-IT'),
}) => {
  const f = useCurrentFrame();
  return <>{fmt(ease(f, start, start + dur, from, to))}</>;
};
