import React from 'react';
import {AbsoluteFill, interpolate, Easing, spring, useCurrentFrame} from 'remotion';
import {C, FPS, H, W} from './theme';
import map from './mapdata.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type P = [number, number];
const pts = map.points as unknown as Record<string, P>;

type Cam = {cx: number; cy: number; w: number};
const toScreen = (p: P, cam: Cam): P => {
  const k = W / cam.w;
  return [W / 2 + (p[0] - cam.cx) * k, H / 2 + (p[1] - cam.cy) * k];
};

const Base: React.FC<{cam: Cam; children?: React.ReactNode}> = ({cam, children}) => {
  const h = (cam.w * H) / W;
  return (
    <svg width={W} height={H} viewBox={`${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="sea" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#0f2547" />
          <stop offset="100%" stopColor="#040b18" />
        </radialGradient>
      </defs>
      <rect x={map.bounds[0] - 5000} y={map.bounds[1] - 5000} width={20000} height={20000} fill="url(#sea)" />
      <path d={map.land} fill={C.land} />
      <path d={map.borders} fill="none" stroke="rgba(160,180,220,.35)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      <path d={map.italy} fill="#3a5799" stroke="#cfd9ef" strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
      {children}
    </svg>
  );
};

const Grid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
      backgroundSize: '90px 90px',
    }}
  />
);

const Pin: React.FC<{x: number; y: number; f: number; color?: string}> = ({x, y, f, color = C.orange}) => {
  const s = spring({frame: f, fps: FPS, config: {damping: 9, stiffness: 200}});
  if (f < 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      {[0, 20, 40].map((d) => {
        const r = ((f + d) % 60) / 60;
        return (
          <div
            key={d}
            style={{position: 'absolute', left: -60 * r * 1.6, top: -60 * r * 1.6, width: 120 * r * 1.6, height: 120 * r * 1.6, borderRadius: '50%', border: `4px solid ${color}`, opacity: 1 - r}}
          />
        );
      })}
      <div style={{position: 'absolute', left: -16, top: -16, width: 32, height: 32, borderRadius: '50%', background: color, border: '5px solid #fff', transform: `scale(${s})`, boxShadow: `0 0 30px ${color}`}} />
    </div>
  );
};

const Tag: React.FC<{x: number; y: number; f: number; title: string; sub?: string}> = ({x, y, f, title, sub}) => {
  const s = spring({frame: f, fps: FPS, config: {damping: 12, stiffness: 170}});
  if (f < 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: '50% 100%'}}>
      <div style={{background: 'rgba(244,241,234,.97)', color: C.navy, padding: '16px 30px 14px', borderRadius: 14, textAlign: 'center', boxShadow: '0 16px 50px rgba(0,0,0,.5)', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: 'Cinzel', fontWeight: 700, fontSize: 46, letterSpacing: 3}}>{title}</div>
        {sub && <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 22, letterSpacing: 6, color: '#a0371f', marginTop: 2}}>{sub}</div>}
      </div>
      <div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '18px solid rgba(244,241,234,.97)'}} />
    </div>
  );
};

const Plane: React.FC<{x: number; y: number; angle: number}> = ({x, y, angle}) => (
  <svg width={90} height={90} viewBox="-12 -12 24 24" style={{position: 'absolute', left: x - 45, top: y - 45, transform: `rotate(${angle}deg)`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.6))'}}>
    <path d="M10 0 L3 -1.5 L-2 -9 L-4 -9 L-1 -1.5 L-7 -1.2 L-9 -4 L-10.5 -4 L-9.5 0 L-10.5 4 L-9 4 L-7 1.2 L-1 1.5 L-4 9 L-2 9 L3 1.5 Z" fill="#fff" />
  </svg>
);

const SceneWrap: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 9, dur - 9, dur], [0, 1, 1, 0], clamp);
  const b = interpolate(f, [0, 9, dur - 9, dur], [24, 0, 0, 18], clamp);
  return <AbsoluteFill style={{opacity: o, filter: b > 0.1 ? `blur(${b}px)` : undefined}}>{children}</AbsoluteFill>;
};

const bez = (a: P, c: P, b: P, t: number): P => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

// Mappa viaggio Roma → Mazara del Vallo
export const TravelMap: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 70], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cam: Cam = {cx: interpolate(z, [0, 1], [1420, 1405]), cy: interpolate(z, [0, 1], [-4870, -4640]), w: interpolate(z, [0, 1], [1500, 640])};
  const a = pts.roma;
  const b = pts.mazara;
  const c: P = [a[0] - 260, (a[1] + b[1]) / 2];
  const t = interpolate(f, [6, 62], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const N = 60;
  const trail: P[] = [];
  for (let i = 0; i <= N * t; i++) trail.push(toScreen(bez(a, c, b, i / N), cam));
  const pl = toScreen(bez(a, c, b, t), cam);
  const pl2 = toScreen(bez(a, c, b, Math.min(1, t + 0.01)), cam);
  const ang = (Math.atan2(pl2[1] - pl[1], pl2[0] - pl[0]) * 180) / Math.PI;
  const ra = toScreen(a, cam);
  const mz = toScreen(b, cam);
  return (
    <SceneWrap dur={dur}>
      <Base cam={cam} />
      <Grid />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <polyline points={trail.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.orange} strokeWidth={7} strokeDasharray="20 16" strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: ra[0], top: ra[1], opacity: interpolate(ra[1], [260, 420], [0, 1], clamp)}}>
        <div style={{position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#fff'}} />
        <div style={{position: 'absolute', left: 24, top: -26, fontFamily: 'Inter', fontWeight: 900, fontSize: 38, color: '#fff', letterSpacing: 3, textShadow: '0 3px 10px #000'}}>ROMA</div>
      </div>
      {t < 1 && <Plane x={pl[0]} y={pl[1]} angle={ang} />}
      <Pin x={mz[0]} y={mz[1]} f={f - 60} />
      <Tag x={mz[0]} y={mz[1] - 60} f={f - 64} title="MAZARA DEL VALLO" sub="SICILIA" />
    </SceneWrap>
  );
};

const Boat: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => {
  const bob = Math.sin(f / 7) * 4;
  return (
    <div style={{position: 'absolute', left: x - 50 * s, top: y - 40 * s + bob}}>
      <div style={{position: 'absolute', left: -110 * s, top: 46 * s, width: 120 * s, height: 6 * s, borderRadius: 3, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.6))'}} />
      <svg width={100 * s} height={70 * s} viewBox="0 0 100 70">
        <path d="M2 40 L98 40 L86 62 L12 62 Z" fill="#f4f1ea" />
        <path d="M2 40 L98 40 L95 46 L5 46 Z" fill={C.red} />
        <rect x="34" y="20" width="34" height="20" fill="#f4f1ea" />
        <rect x="40" y="25" width="8" height="7" fill={C.navy} />
        <rect x="53" y="25" width="8" height="7" fill={C.navy} />
        <path d="M76 40 L76 4 M76 8 L92 30" stroke="#f4f1ea" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
};

// Mappa distanze Mazara ↔ Africa + pescherecci nel Canale di Sicilia
export const DistanceMap: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [0, 1]);
  const cam: Cam = {cx: 1330, cy: -4440, w: interpolate(z, [0, 1], [560, 500])};
  const mz = toScreen(pts.mazara, cam);
  const cb = toScreen(pts.capobon, cam);
  const t = interpolate(f, [14, 44], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ex = mz[0] + (cb[0] - mz[0]) * t;
  const ey = mz[1] + (cb[1] - mz[1]) * t;
  const mid: P = [(mz[0] + cb[0]) / 2, (mz[1] + cb[1]) / 2];
  const kmPop = spring({frame: f - 40, fps: FPS, config: {damping: 9, stiffness: 190}});
  const boatsF = f - 66; // "i pescherecci"
  const sic = toScreen([1480, -4600], cam);
  const afr = toScreen([1150, -4330], cam);
  const canaleIn = interpolate(f, [62, 72], [-900, 0], {...clamp, easing: Easing.out(Easing.back(1.1))});
  return (
    <SceneWrap dur={dur}>
      <Base cam={cam} />
      <Grid />
      <div style={{position: 'absolute', left: sic[0], top: sic[1], transform: 'translate(-50%,-50%)', fontFamily: 'Cinzel', fontWeight: 700, fontSize: 52, letterSpacing: 10, color: 'rgba(230,236,248,.9)'}}>SICILIA</div>
      <div style={{position: 'absolute', left: Math.max(150, afr[0]), top: afr[1], transform: 'translate(-50%,-50%)', textAlign: 'center', fontFamily: 'Cinzel', fontWeight: 700, fontSize: 52, letterSpacing: 10, color: 'rgba(230,236,248,.9)'}}>
        AFRICA
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 22, letterSpacing: 6, opacity: 0.75}}>TUNISIA</div>
      </div>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <line x1={mz[0]} y1={mz[1]} x2={ex} y2={ey} stroke={C.orange} strokeWidth={7} strokeDasharray="18 14" strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: cb[0] - 12, top: cb[1] - 12, width: 24, height: 24, borderRadius: '50%', background: '#fff', opacity: t >= 1 ? 1 : 0}} />
      {f >= 40 && (
        <div style={{position: 'absolute', left: mid[0] - 20, top: mid[1] - 120, transform: `translate(-50%,0) scale(${kmPop})`, background: C.orange, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 64, padding: '6px 24px', borderRadius: 12, whiteSpace: 'nowrap', boxShadow: '0 14px 40px rgba(0,0,0,.5)'}}>
          ≈ 150 KM
        </div>
      )}
      <Pin x={mz[0]} y={mz[1]} f={f} />
      <div style={{position: 'absolute', left: mz[0] + 34, top: mz[1] - 30, fontFamily: 'Inter', fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: 2, textShadow: '0 3px 10px #000'}}>MAZARA</div>
      {boatsF >= 0 && (
        <>
          <Boat x={toScreen([1290 + boatsF * 0.35, -4385], cam)[0]} y={toScreen([0, -4385], cam)[1]} f={boatsF} s={interpolate(boatsF, [0, 8], [0, 1], clamp)} />
          <Boat x={toScreen([1345 + boatsF * 0.3, -4460], cam)[0]} y={toScreen([0, -4460], cam)[1]} f={boatsF + 9} s={interpolate(boatsF, [4, 12], [0, 0.85], clamp)} />
          <Boat x={toScreen([1405 + boatsF * 0.25, -4360], cam)[0]} y={toScreen([0, -4360], cam)[1]} f={boatsF + 17} s={interpolate(boatsF, [8, 16], [0, 0.75], clamp)} />
        </>
      )}
      {f >= 62 && (
        <div style={{position: 'absolute', top: 318, left: 70, transform: `translateX(${canaleIn}px)`}}>
          <div style={{background: C.cream, color: C.navy, fontFamily: 'Inter', fontWeight: 800, fontSize: 48, padding: '14px 26px 12px', borderRadius: 10, borderLeft: `10px solid ${C.orange}`}}>CANALE DI SICILIA</div>
        </div>
      )}
    </SceneWrap>
  );
};

export {SceneWrap, Base, Grid, Pin, Tag, Boat, toScreen, pts};
export type {Cam, P};
