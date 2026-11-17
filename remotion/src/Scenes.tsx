import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, spring, staticFile, useCurrentFrame, random} from 'remotion';
import {C, FPS, H, W} from './theme';
import {SceneWrap} from './Maps';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Contatore profondità 0 → 500+ M ----------
export const Depth: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const f = useCurrentFrame();
  const at = (s: number) => Math.round((s - t0) * FPS);
  // "profonde" 9.60 → "500" 11.60-11.96
  const depth = interpolate(f, [at(9.6), at(11.95)], [0, 500], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const plus = f >= at(11.95);
  const dark = depth / 500;
  const plusPop = spring({frame: f - at(11.95), fps: FPS, config: {damping: 8, stiffness: 220}});
  const pxPerM = 3.2;
  const parts = new Array(46).fill(0).map((_, i) => {
    const x = random('x' + i) * W;
    const sp = 1 + random('s' + i) * 3;
    const y = (((random('y' + i) * H - f * sp) % H) + H) % H;
    const r = 2 + random('r' + i) * 5;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', background: 'rgba(200,230,255,.5)', filter: 'blur(1px)'}} />;
  });
  const chip = (txt: string, s: number, y: number, col: string) => {
    const p = spring({frame: f - at(s), fps: FPS, config: {damping: 12, stiffness: 200}});
    if (f < at(s)) return null;
    return (
      <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', transform: `translateY(${(1 - p) * 60}px)`, opacity: p}}>
        <span style={{background: col, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 50, padding: '12px 30px', borderRadius: 50, letterSpacing: 2}}>{txt}</span>
      </div>
    );
  };
  return (
    <SceneWrap dur={dur}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgb(${Math.round(30 - 24 * dark)},${Math.round(110 - 90 * dark)},${Math.round(160 - 120 * dark)}) 0%, rgb(${Math.round(8 - 5 * dark)},${Math.round(40 - 32 * dark)},${Math.round(80 - 62 * dark)}) 100%)`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% -10%, rgba(255,255,255,.25), rgba(255,255,255,0) 55%)', opacity: 1 - dark * 0.8}} />
      {parts}
      {/* righello */}
      <div style={{position: 'absolute', left: 70, top: 0, height: H, width: 160, overflow: 'hidden'}}>
        {new Array(70).fill(0).map((_, i) => {
          const m = i * 10;
          const y = 960 + (m - depth) * pxPerM;
          if (y < 250 || y > 1650) return null;
          const big = m % 50 === 0;
          return (
            <div key={i} style={{position: 'absolute', top: y, left: 0, display: 'flex', alignItems: 'center'}}>
              <div style={{width: big ? 50 : 26, height: big ? 5 : 3, background: 'rgba(230,240,255,.85)'}} />
              {big && <div style={{marginLeft: 10, fontFamily: 'Inter', fontWeight: 800, fontSize: 26, color: 'rgba(230,240,255,.85)'}}>{m}</div>}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 957, width: 250, height: 6, background: C.orange, boxShadow: `0 0 20px ${C.orange}`}} />
      <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 40, letterSpacing: 10, color: 'rgba(230,240,255,.85)'}}>PROFONDITÀ</div>
        <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 230, lineHeight: 1.05, color: '#fff', textShadow: '0 20px 60px rgba(0,0,0,.5)', fontVariantNumeric: 'tabular-nums'}}>
          {Math.round(depth)}
          <span style={{color: C.orange, display: 'inline-block', transform: `scale(${plus ? plusPop : 0})`}}>+</span>
          <span style={{fontSize: 110}}> M</span>
        </div>
      </div>
      {chip('ACQUA FREDDA', 13.46, 1060, '#bfe3ff')}
      {chip('E PULITA', 14.2, 1180, C.cream)}
    </SceneWrap>
  );
};

// ---------- Checklist "COME RICONOSCERLO" ----------
const Check: React.FC<{ok: boolean; p: number}> = ({ok, p}) => (
  <svg width={92} height={92} viewBox="0 0 92 92">
    <circle cx="46" cy="46" r="42" fill={ok ? C.green : C.red} />
    {ok ? (
      <path d="M26 47 L40 61 L67 32" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - p)} />
    ) : (
      <path d="M30 30 L62 62 M62 30 L30 62" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 * (1 - p)} />
    )}
  </svg>
);

export const Checklist: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const f = useCurrentFrame();
  const at = (s: number) => Math.round((s - t0) * FPS);
  const items: [string, boolean, number][] = [
    ['ROSSO VIVO', true, 36.58],
    ['COLORE UNIFORME', true, 37.4],
    ['TESTA BEN ATTACCATA', true, 38.58],
    ['MACCHIE NERE', false, 40.06],
  ];
  const tp = spring({frame: f - 2, fps: FPS, config: {damping: 12, stiffness: 180}});
  return (
    <SceneWrap dur={dur}>
      <AbsoluteFill>
        <Img src={staticFile('img/gambero.jpg')} style={{width: W, height: H, objectFit: 'cover', objectPosition: '55% 50%', transform: 'scale(1.6)', filter: 'blur(26px) brightness(.55) saturate(1.2)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,15,32,.75), rgba(6,15,32,.35) 40%, rgba(6,15,32,.8))'}} />
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', transform: `scale(${tp})`}}>
        <span style={{background: C.orange, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 64, padding: '14px 34px', borderRadius: 14, letterSpacing: 1}}>COME RICONOSCERLO</span>
      </div>
      {items.map(([txt, ok, s], i) => {
        const lf = f - at(s);
        if (lf < 0) return null;
        const p = spring({frame: lf, fps: FPS, config: {damping: 13, stiffness: 190}});
        const ck = interpolate(lf, [4, 12], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 90,
              top: 560 + i * 190,
              width: 900,
              height: 160,
              transform: `translateX(${(1 - p) * -1000}px)`,
              background: ok ? 'rgba(244,241,234,.97)' : 'rgba(255,232,228,.97)',
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              padding: '0 34px',
              boxShadow: '0 18px 50px rgba(0,0,0,.45)',
              gap: 30,
            }}
          >
            <Check ok={ok} p={ck} />
            <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: txt.length > 16 ? 52 : 60, color: ok ? C.navy : '#8e1c0e', textDecoration: ok ? 'none' : 'line-through', textDecorationThickness: 6}}>{txt}</div>
          </div>
        );
      })}
    </SceneWrap>
  );
};

// ---------- Sondaggio "CRUDO o COTTO" ----------
export const Poll: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const f = useCurrentFrame();
  const at = (s: number) => Math.round((s - t0) * FPS);
  const top = spring({frame: f, fps: FPS, config: {damping: 14, stiffness: 160}});
  const bot = spring({frame: f - at(53.06), fps: FPS, config: {damping: 14, stiffness: 160}});
  const ring = spring({frame: f - 6, fps: FPS, config: {damping: 8, stiffness: 200}});
  const bub = spring({frame: f - at(53.6), fps: FPS, config: {damping: 9, stiffness: 190}});
  const half = (src: string, y: number, label: string, p: number, fromTop: boolean, pos: string, sc: number) => (
    <div style={{position: 'absolute', left: 0, top: y, width: W, height: H / 2, overflow: 'hidden', transform: `translateY(${(1 - p) * (fromTop ? -H / 2 : H / 2)}px)`}}>
      <Img src={staticFile(`img/${src}.jpg`)} style={{width: W, height: H / 2, objectFit: 'cover', objectPosition: pos, transform: `scale(${sc + f * 0.0012})`, filter: 'contrast(1.06) saturate(1.12)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,15,32,.35), rgba(6,15,32,0) 40%, rgba(6,15,32,.45))'}} />
      <div style={{position: 'absolute', width: '100%', textAlign: 'center', top: fromTop ? 270 : 590}}>
        <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 120, color: '#fff', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', letterSpacing: 4}}>{label}</span>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], clamp)}}>
      <AbsoluteFill style={{background: C.navyDeep}} />
      {half('crudo2', 0, 'CRUDO', top, true, '50% 45%', 1.25)}
      {f >= at(53.06) - 1 && half('pasta1', H / 2, 'COTTO', bot, false, '45% 50%', 1.1)}
      <div style={{position: 'absolute', left: 0, top: H / 2 - 4, width: W, height: 8, background: C.silver, transform: `scaleX(${ring})`}} />
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 95,
          top: H / 2 - 95,
          width: 190,
          height: 190,
          borderRadius: '50%',
          background: C.orange,
          border: '10px solid #fff',
          transform: `scale(${ring})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter',
          fontWeight: 900,
          fontSize: 110,
          color: C.navy,
          boxShadow: '0 20px 60px rgba(0,0,0,.6)',
        }}
      >
        O
      </div>
      {f >= at(53.6) && (
        <div style={{position: 'absolute', top: 1300, width: '100%', textAlign: 'center', transform: `scale(${bub})`, transformOrigin: '50% 100%'}}>
          <div style={{display: 'inline-block', position: 'relative', background: '#fff', color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 54, padding: '22px 40px', borderRadius: 40, boxShadow: '0 18px 50px rgba(0,0,0,.55)'}}>
            SCRIVILO NEI COMMENTI
            <div style={{position: 'absolute', left: 120, bottom: -30, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '34px solid #fff'}} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- Chiusura logo ----------
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = interpolate(f, [0, 5], [0, 1], clamp);
  const fadeBlack = interpolate(f, [5, 13], [1, 0], clamp);
  const s = interpolate(f, [4, 25], [0.4, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const o = interpolate(f, [4, 12], [0, 1], clamp);
  const sheen = interpolate(f, [24, 50], [-120, 220], clamp);
  const txt = spring({frame: f - 28, fps: FPS, config: {damping: 14, stiffness: 160}});
  const glow = 0.5 + 0.25 * Math.sin(f / 9);
  const R = 300;
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1a3566 0%, #0b1a33 45%, #040b18 100%)'}} />
      <div style={{position: 'absolute', left: W / 2 - 420, top: 860 - 420, width: 840, height: 840, borderRadius: '50%', background: `radial-gradient(circle, rgba(200,215,240,${0.28 * glow}) 0%, rgba(200,215,240,0) 65%)`, opacity: o}} />
      <div style={{position: 'absolute', left: W / 2 - R, top: 860 - R, width: 2 * R, height: 2 * R, transform: `scale(${s})`, opacity: o}}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            background: 'radial-gradient(circle at 40% 30%, #1f3f78, #0b1a33 70%)',
            border: '10px solid #cfd5de',
            boxShadow: '0 0 0 4px #0b1a33, 0 0 0 10px rgba(207,213,222,.6), 0 30px 80px rgba(0,0,0,.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 20, letterSpacing: 8, color: '#b9c2d0'}}>EXCLUSIVE SEAFOOD</div>
          <div style={{fontFamily: 'Cinzel', fontWeight: 700, fontSize: 112, color: '#eef1f6', lineHeight: 1.05, marginTop: 10, letterSpacing: 6}}>DAMA</div>
          <div style={{width: 300, height: 3, background: 'linear-gradient(90deg, transparent, #cfd5de, transparent)', margin: '8px 0 12px'}} />
          <div style={{fontFamily: 'Cinzel', fontWeight: 600, fontSize: 64, color: '#dfe4ec', letterSpacing: 8}}>RESERVÈE</div>
          <svg width="160" height="40" viewBox="0 0 160 40" style={{marginTop: 16}}>
            <path d="M5 22 Q25 6 45 22 T85 22 T125 22 T155 22" stroke={C.orange} strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
          <div style={{position: 'absolute', top: 0, left: `${sheen}%`, width: '45%', height: '100%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.38), rgba(255,255,255,0))', transform: 'skewX(-18deg)'}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 1250, width: '100%', textAlign: 'center', opacity: txt, transform: `translateY(${(1 - txt) * 40}px)`}}>
        <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 50, letterSpacing: 5, color: '#fff'}}>SEGUI PER ALTRE</div>
        <div style={{fontFamily: 'Cinzel', fontWeight: 700, fontSize: 70, letterSpacing: 8, color: C.orange, marginTop: 6}}>ECCELLENZE</div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fadeBlack}} />
    </AbsoluteFill>
  );
};
