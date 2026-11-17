import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, W} from './theme';
import {SHOTS, Shot} from './timeline';

const TR = 9; // 0,3 s

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const transStyle = (s: Shot, f: number): React.CSSProperties => {
  const p = interpolate(f, [0, TR], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  switch (s.trans) {
    case 'smoothleft':
      return {transform: `translateX(${(1 - p) * 100}%)`};
    case 'slideleft':
      return {transform: `translateX(${(1 - p) * 100}%)`, boxShadow: '-30px 0 60px rgba(0,0,0,.5)'};
    case 'smoothup':
      return {transform: `translateY(${(1 - p) * 100}%)`};
    case 'zoomin':
      return {opacity: p, transform: `scale(${1.35 - 0.35 * p})`};
    case 'hblur':
      return {opacity: p, filter: `blur(${(1 - p) * 40}px)`};
    case 'wipeup':
      return {clipPath: `inset(${(1 - p) * 100}% 0 0 0)`};
    case 'circleopen':
      return {clipPath: `circle(${p * 120}% at 50% 50%)`};
    default:
      return {};
  }
};

const ShotView: React.FC<{s: Shot; idx: number}> = ({s, idx}) => {
  const frame = useCurrentFrame();
  const start = Math.round(s.start * FPS) - (s.trans === 'none' ? 0 : TR);
  const end = Math.round(s.end * FPS);
  if (frame < start || frame >= end) return null;
  const f = frame - start;
  const dur = end - start;
  // punch-in sui primi 6 frame + push/pull lento alternato
  const punch = interpolate(f, [0, 6], [0, 0.05], {...clamp, easing: Easing.out(Easing.quad)});
  const drift = idx % 2 === 0 ? interpolate(f, [0, dur], [0, 0.07]) : interpolate(f, [0, dur], [0.07, 0]);
  const scale = (s.zoom ?? 1) * (1.0 + punch + drift);
  return (
    <AbsoluteFill style={{...transStyle(s, f), overflow: 'hidden'}}>
      <Img
        src={staticFile(`img/${s.src}.jpg`)}
        style={{
          width: W,
          height: H,
          objectFit: 'cover',
          objectPosition: `${s.fx ?? 50}% ${s.fy ?? 50}%`,
          transform: `scale(${scale})`,
          transformOrigin: `${s.fx ?? 50}% ${s.fy ?? 50}%`,
          filter: 'contrast(1.06) saturate(1.1) brightness(0.98)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Photos: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {SHOTS.map((s, i) => (
      <ShotView key={i} s={s} idx={i} />
    ))}
  </AbsoluteFill>
);

// Grading caldo/teal, sfumature blu notte, vignetta
export const Grade: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,170,90,.10), rgba(0,90,110,.12))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, rgba(6,15,32,.88) 0%, rgba(6,15,32,.45) 14%, rgba(6,15,32,0) 26%, rgba(6,15,32,0) 58%, rgba(6,15,32,.55) 76%, rgba(6,15,32,.9) 100%)',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)'}} />
  </AbsoluteFill>
);
