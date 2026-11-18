import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, spring, staticFile, useCurrentFrame, random} from 'remotion';
import {C, FPS, H, W} from '../theme';
import {Base, Boat, Cam, Grid, P, Pin, SceneWrap, Tag, pts, toScreen} from '../Maps';
import {RV_COL} from './timeline';
import {Bubbles, Illus, Rays, Sparkles} from './Fx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useAt = (t0: number) => {
  const f = useCurrentFrame();
  return {f, at: (s: number) => Math.round((s - t0) * FPS)};
};
const sp = (f: number, d = 12, s = 190) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});

const Pill: React.FC<{txt: string; bg: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({txt, bg, fg = C.navy, size = 50, style}) => (
  <span style={{display: 'inline-block', background: bg, color: fg, fontFamily: 'Inter', fontWeight: 900, fontSize: size, padding: `${size * 0.22}px ${size * 0.6}px`, borderRadius: size, letterSpacing: 1, boxShadow: '0 14px 40px rgba(0,0,0,.45)', whiteSpace: 'nowrap', ...style}}>{txt}</span>
);

const TopCard: React.FC<{txt: string; f: number}> = ({txt, f}) => {
  if (f < 0) return null;
  const x = interpolate(f, [0, 9], [-900, 0], {...clamp, easing: Easing.out(Easing.back(1.1))});
  return (
    <div style={{position: 'absolute', top: 318, left: 70, transform: `translateX(${x}px)`}}>
      <div style={{display: 'flex', alignItems: 'stretch', borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 44px rgba(0,0,0,.45), 0 0 0 2px rgba(255,255,255,.35)'}}>
        <div style={{width: 14, background: `linear-gradient(180deg, ${RV_COL.rosso}, ${C.orange}, ${RV_COL.viola})`}} />
        <div style={{background: 'linear-gradient(180deg, #fbf8f1, #ece6da)', color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 46, padding: '14px 28px 12px', letterSpacing: 0.5}}>{txt}</div>
      </div>
    </div>
  );
};

const NavyBg: React.FC<{tint?: string}> = ({tint}) => (
  <>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, ${tint ?? '#18305c'} 0%, #0b1a33 55%, #040b18 100%)`}} />
    <Rays opacity={0.55} />
    <Bubbles n={18} />
  </>
);

const BlurPhoto: React.FC<{src: string; dark?: number}> = ({src, dark = 0.5}) => (
  <AbsoluteFill>
    <Img src={staticFile(`img/${src}.jpg`)} style={{width: W, height: H, objectFit: 'cover', transform: 'scale(1.3)', filter: `blur(24px) brightness(${dark}) saturate(1.2)`}} />
  </AbsoluteFill>
);

// Sagoma di gambero (SVG)
export const Shrimp: React.FC<{size: number; color: string; flip?: boolean}> = ({size, color, flip}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80" style={{transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible'}}>
    <path d="M14 22 C30 8 62 8 76 24 C88 38 84 58 70 66 C62 70 54 68 50 62" fill="none" stroke={color} strokeWidth="15" strokeLinecap="round" />
    <path d="M30 14 L33 29 M44 11 L45 27 M58 13 L56 28 M70 20 L66 33 M78 33 L71 41 M78 48 L70 50" stroke="rgba(255,255,255,.35)" strokeWidth="2.5" />
    <path d="M50 62 L38 70 L46 58 L36 58 Z" fill={color} />
    <circle cx="20" cy="20" r="3" fill="#111" />
    <path d="M12 22 C-10 14 -20 30 -34 26 M12 24 C-6 30 -16 44 -30 46" stroke={color} strokeWidth="1.6" fill="none" />
    <path d="M26 30 L22 44 M34 31 L31 46 M42 31 L40 47" stroke={color} strokeWidth="2" />
  </svg>
);

// ---------- 1. HOOK: rosso VS viola ----------
export const Hook: React.FC<{dur: number}> = ({dur}) => {
  const {f, at} = useAt(0);
  const top = sp(f, 14, 170);
  const bot = sp(f - 3, 14, 170);
  const vs = sp(f - 8, 8, 220);
  const t1 = sp(f - at(0.92), 11, 200);
  const t2 = sp(f - at(2.28), 9, 230);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const half = (src: string, y: number, p: number, fromTop: boolean, pos: string, sc: number, label: string, col: string) => (
    <div style={{position: 'absolute', left: 0, top: y, width: W, height: H / 2, overflow: 'hidden', transform: `translateY(${(1 - p) * (fromTop ? -H / 2 : H / 2)}px)`}}>
      <Img src={staticFile(`img/${src}.jpg`)} style={{width: W, height: H / 2, objectFit: 'cover', objectPosition: pos, transform: `scale(${sc + f * 0.002})`, filter: 'contrast(1.08) saturate(1.15)'}} />
      <AbsoluteFill style={{background: `linear-gradient(${fromTop ? 180 : 0}deg, rgba(6,15,32,.75), rgba(6,15,32,0) 45%)`}} />
      <div style={{position: 'absolute', left: 70, [fromTop ? 'bottom' : 'top']: 70} as React.CSSProperties}>
        <Pill txt={label} bg={col} fg="#fff" size={64} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: C.navyDeep}} />
      {half('gambero', 0, top, true, '42% 42%', 1.05, 'ROSSO', RV_COL.rosso)}
      {half('viola1', H / 2, bot, false, '55% 50%', 1.2, 'VIOLA', RV_COL.viola)}
      <div style={{position: 'absolute', left: 0, top: H / 2 - 5, width: W, height: 10, background: `linear-gradient(90deg, ${RV_COL.rosso}, #fff, ${RV_COL.viola})`, transform: `scaleX(${vs})`}} />
      <div style={{position: 'absolute', left: W / 2 - 100, top: H / 2 - 100, width: 200, height: 200, borderRadius: '50%', background: C.navy, border: '10px solid #fff', transform: `scale(${vs}) rotate(${(1 - vs) * -90}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 900, fontSize: 92, color: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,.6)'}}>VS</div>
      <Sparkles cx={W / 2} cy={H / 2} r={150} n={10} />
      <div style={{position: 'absolute', top: 222, width: '100%', textAlign: 'center', opacity: sp(f - 4), transform: `translateY(${(1 - sp(f - 4)) * -30}px)`}}>
        <span style={{display: 'inline-block', fontFamily: 'Inter', fontWeight: 900, fontSize: 40, letterSpacing: 6, color: '#fff', padding: '10px 28px', borderRadius: 40, background: `linear-gradient(90deg, ${RV_COL.rosso}, ${RV_COL.viola})`, boxShadow: '0 12px 40px rgba(0,0,0,.5)'}}>QUALE SCEGLI?</span>
      </div>
      {f >= at(0.92) && f < at(2.28) && (
        <div style={{position: 'absolute', top: 1330, width: '100%', textAlign: 'center', transform: `scale(${0.6 + 0.4 * t1})`}}>
          <Pill txt="SEMBRANO CUGINI…" bg={C.cream} size={76} />
        </div>
      )}
      {f >= at(2.28) && (
        <div style={{position: 'absolute', top: 1310, width: '100%', textAlign: 'center', transform: `scale(${1.6 - 0.6 * t2}) rotate(-3deg)`, opacity: Math.min(1, t2 * 2)}}>
          <Pill txt="MA NON SONO UGUALI!" bg={C.orange} size={78} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 2. Mappa Mediterraneo ----------
export const MedMap: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const z = interpolate(f, [0, dur], [0, 1], {easing: Easing.inOut(Easing.quad)});
  const cam: Cam = {cx: 1180, cy: -4720, w: interpolate(z, [0, 1], [1700, 1450])};
  const sea = toScreen([1130, -4400] as P, cam);
  const r = toScreen(pts.pantelleria, cam);
  const v = toScreen([880, -4700] as P, cam);
  const chip = (txt: string, s: number, y: number, bg: string, fg = C.navy) => {
    const p = sp(f - at(s));
    if (f < at(s)) return null;
    return (
      <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', transform: `translateY(${(1 - p) * 60}px)`, opacity: p}}>
        <Pill txt={txt} bg={bg} fg={fg} size={52} />
      </div>
    );
  };
  return (
    <SceneWrap dur={dur}>
      <Base cam={cam} />
      <Grid />
      <div style={{position: 'absolute', left: sea[0], top: sea[1], transform: 'translate(-50%,-50%)', fontFamily: 'Cinzel', fontWeight: 700, fontSize: 50, letterSpacing: 12, color: 'rgba(230,236,248,.85)', textAlign: 'center', opacity: interpolate(f, [at(5.6), at(6.0)], [0, 1], clamp)}}>
        MAR<br />MEDITERRANEO
      </div>
      <Illus src="ill_rosso" x={560} y={470} w={460} rot={-6} delay={at(4.6)} glow="rgba(255,120,90,.45)" />
      <Illus src="ill_viola" x={30} y={560} w={500} rot={4} delay={at(5.0)} glow="rgba(200,140,255,.45)" />
      <Pin x={r[0]} y={r[1]} f={f - at(4.3)} color={RV_COL.rosso} />
      <Pin x={v[0]} y={v[1]} f={f - at(4.5)} color={RV_COL.viola} />
      <TopCard txt="GAMBERI DI PROFONDITÀ" f={f - at(4.3)} />
      {chip('SELVAGGI', 7.26, 1060, '#bfe3ff')}
      {chip('PREGIATI', 8.0, 1180, C.cream)}
    </SceneWrap>
  );
};

// ---------- 3. Carta identikit ----------
type Row = [string, number];
export const IdCard: React.FC<{dur: number; t0: number; color: string; photo: string; pos: string; num: string; name: string; latin: string; rows: Row[]; tint: string; ill?: string}> = ({dur, t0, color, photo, pos, num, name, latin, rows, tint, ill}) => {
  const {f, at} = useAt(t0);
  const flip = interpolate(f, [0, 14], [90, 0], {...clamp, easing: Easing.out(Easing.back(1.2))});
  const nm = sp(f - 8, 12, 180);
  return (
    <SceneWrap dur={dur}>
      <NavyBg tint={tint} />
      <AbsoluteFill style={{background: `repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 2px, transparent 2px 28px)`}} />
      <div style={{position: 'absolute', left: 80, top: 285, width: 920, height: 470, borderRadius: 26, overflow: 'hidden', border: `6px solid ${color}`, boxShadow: `0 0 60px ${color}55, 0 30px 80px rgba(0,0,0,.6)`, transform: `perspective(1400px) rotateY(${flip}deg)`}}>
        <Img src={staticFile(`img/${photo}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.08 + f * 0.0008})`}} />
        <div style={{position: 'absolute', right: 18, top: 16, fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: '#fff', background: color, padding: '6px 16px', borderRadius: 10, letterSpacing: 3}}>IDENTIKIT {num}</div>
      </div>
      <div style={{position: 'absolute', left: 80, top: 772, opacity: nm, transform: `translateY(${(1 - nm) * 30}px)`}}>
        <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 86, color, lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,.6)'}}>{name}</div>
        <div style={{fontFamily: 'Cinzel', fontWeight: 600, fontSize: 30, color: 'rgba(230,236,248,.8)', letterSpacing: 4, marginTop: 8}}>{latin}</div>
      </div>
      {ill && <Illus src={ill} x={600} y={1000} w={440} rot={-8} opacity={0.55} delay={10} glow={color + '66'} />}
      {rows.map(([txt, s], i) => {
        const lf = f - at(s);
        if (lf < 0) return null;
        const p = sp(lf, 13, 200);
        return (
          <div key={i} style={{position: 'absolute', left: 80, top: 935 + i * 82, display: 'flex', alignItems: 'center', gap: 22, transform: `translateX(${(1 - p) * -700}px)`, opacity: p}}>
            <svg width={56} height={56} viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="26" fill={color} />
              <path d="M16 29 L25 38 L41 19" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44" strokeDashoffset={44 * (1 - interpolate(lf, [3, 10], [0, 1], clamp))} />
            </svg>
            <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 50, color: '#fff', letterSpacing: 1}}>{txt}</span>
          </div>
        );
      })}
    </SceneWrap>
  );
};

// ---------- Mappa generica con segnaposto ----------
type MPin = {p: P; t: number; label?: string; side?: 'l' | 'r'; color: string; tag?: string; tagSub?: string};
export const ZoneMap: React.FC<{dur: number; t0: number; cam0: Cam; cam1: Cam; pins: MPin[]; card?: [string, number]; boatsAt?: number; extra?: (f: number, at: (s: number) => number) => React.ReactNode}> = ({dur, t0, cam0, cam1, pins, card, boatsAt, extra}) => {
  const {f, at} = useAt(t0);
  const z = interpolate(f, [0, Math.min(dur, 60)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cam: Cam = {cx: cam0.cx + (cam1.cx - cam0.cx) * z, cy: cam0.cy + (cam1.cy - cam0.cy) * z, w: cam0.w + (cam1.w - cam0.w) * z};
  const bf = boatsAt !== undefined ? f - at(boatsAt) : -1;
  return (
    <SceneWrap dur={dur}>
      <Base cam={cam} />
      <Grid />
      {bf >= 0 &&
        [[-60, 70, 0], [10, 20, 9], [60, 110, 17]].map(([dx, dy, o], i) => {
          const m = pts.mazara;
          const s = toScreen([m[0] + dx - 60 + bf * 0.3, m[1] + dy] as P, cam);
          return <Boat key={i} x={s[0]} y={s[1]} f={bf + o} s={interpolate(bf, [o * 0.5, o * 0.5 + 8], [0, 1 - i * 0.12], clamp)} />;
        })}
      {pins.map((pn, i) => {
        const s = toScreen(pn.p, cam);
        const lf = f - at(pn.t);
        const p = sp(lf, 12, 200);
        return (
          <React.Fragment key={i}>
            <Pin x={s[0]} y={s[1]} f={lf} color={pn.color} />
            {pn.label && lf >= 0 && (
              <div style={{position: 'absolute', top: s[1] - 30, ...(pn.side === 'l' ? {right: W - s[0] + 40} : {left: s[0] + 40}), opacity: p, transform: `scale(${0.5 + 0.5 * p})`, transformOrigin: pn.side === 'l' ? '100% 50%' : '0% 50%'}}>
                <Pill txt={pn.label} bg="rgba(244,241,234,.96)" size={38} />
              </div>
            )}
            {pn.tag && <Tag x={s[0]} y={s[1] - 60} f={lf} title={pn.tag} sub={pn.tagSub} />}
          </React.Fragment>
        );
      })}
      {card && <TopCard txt={card[0]} f={f - at(card[1])} />}
      {extra?.(f, at)}
    </SceneWrap>
  );
};

// ---------- 4. Calibro = pezzi al chilo ----------
export const Calibro: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const big = f >= at(35.9);
  const smallIn = at(31.3);
  const title = sp(f - at(32.92), 9, 220);
  const tray = sp(f - at(30.7), 14, 170);
  const chip = (txt: string, s: number, y: number, bg: string) => {
    const p = sp(f - at(s));
    if (f < at(s)) return null;
    return (
      <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', transform: `translateY(${(1 - p) * 60}px)`, opacity: p}}>
        <Pill txt={txt} bg={bg} size={50} />
      </div>
    );
  };
  const out = (n: number, cols: number, size: number, start: number, gone: number | null) =>
    new Array(n).fill(0).map((_, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const lf = f - start - i * 1.2;
      const p = sp(lf, 11, 230);
      const g = gone !== null ? interpolate(f, [gone, gone + 8], [1, 0], clamp) : 1;
      if (lf < 0 || g <= 0) return null;
      const cw = 820 / cols;
      const col = i % 2 ? RV_COL.viola : RV_COL.rosso;
      return (
        <div key={i} style={{position: 'absolute', left: 130 + c * cw + (cw - size) / 2, top: 650 + r * (size * 0.95) + (big ? 10 : 0), transform: `scale(${p * g}) rotate(${(random('r' + i) - 0.5) * 30}deg)`}}>
          <Shrimp size={size} color={col} flip={r % 2 === 1} />
        </div>
      );
    });
  return (
    <SceneWrap dur={dur}>
      <BlurPhoto src="viola_griglia" dark={0.35} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,15,32,.6), rgba(6,15,32,.25) 45%, rgba(6,15,32,.75))'}} />
      <TopCard txt="ALL'ASTA E AL BANCO" f={f - at(30.5)} />
      {f >= at(32.92) && (
        <div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', transform: `scale(${1.5 - 0.5 * title})`, opacity: Math.min(1, title * 2)}}>
          <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 104, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', letterSpacing: 4}}>CALIBRO</span>
          <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 56, color: C.orange, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', marginLeft: 18}}>= PEZZI/KG</span>
        </div>
      )}
      {f >= at(30.7) && (
        <div style={{position: 'absolute', left: 100, top: 600, width: 880, height: 470, borderRadius: 30, background: 'linear-gradient(180deg, #cfd5de, #8f98a6)', boxShadow: 'inset 0 0 0 10px #e9edf2, 0 30px 80px rgba(0,0,0,.55)', transform: `scale(${tray})`}}>
          <div style={{position: 'absolute', right: -20, top: -34, background: C.navy, color: '#fff', fontFamily: 'Inter', fontWeight: 900, fontSize: 46, padding: '8px 24px', borderRadius: 14, border: '4px solid #fff'}}>1 KG</div>
        </div>
      )}
      {out(24, 6, 112, smallIn, at(35.9))}
      {big && out(6, 3, 230, at(36.1), null)}
      {f >= at(34.82) && !big && chip('TANTI PEZZI = PICCOLI', 34.82, 1120, '#bfe3ff')}
      {chip('MENO PEZZI = PIÙ GRANDI', 37.12, 1120, C.cream)}
      {f >= at(38.46) && (
        <div style={{position: 'absolute', top: 1215, width: '100%', textAlign: 'center', transform: `scale(${sp(f - at(38.46), 8, 230)})`}}>
          <Pill txt="PREZZO PIÙ ALTO €€€" bg={C.orange} size={54} />
        </div>
      )}
    </SceneWrap>
  );
};

// ---------- 5. Unione Europea: limite di cattura + giorni di pesca ----------
export const UE: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const ring = sp(f - at(42.2), 12, 160);
  const fill = interpolate(f, [at(44.32), at(45.4)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const hit = f >= at(45.4);
  const shake = hit ? Math.sin((f - at(45.4)) * 2.2) * Math.max(0, 8 - (f - at(45.4))) : 0;
  return (
    <SceneWrap dur={dur}>
      <NavyBg tint="#16306a" />
      <div style={{position: 'absolute', left: W / 2 - 150, top: 290, width: 300, height: 300, transform: `scale(${ring}) rotate(${(1 - ring) * 120}deg)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#123a8c', boxShadow: '0 0 60px rgba(60,110,220,.5)'}} />
        {new Array(12).fill(0).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return (
            <svg key={i} width={40} height={40} viewBox="-10 -10 20 20" style={{position: 'absolute', left: 150 + Math.cos(a) * 105 - 20, top: 150 + Math.sin(a) * 105 - 20, opacity: interpolate(f - at(42.2) - i, [0, 4], [0, 1], clamp)}}>
              <path d="M0 -9 L2.6 -3 L9 -2.8 L4 1.4 L5.6 8 L0 4.4 L-5.6 8 L-4 1.4 L-9 -2.8 L-2.6 -3 Z" fill="#ffcc00" />
            </svg>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 610, width: '100%', textAlign: 'center', fontFamily: 'Cinzel', fontWeight: 700, fontSize: 52, letterSpacing: 8, color: '#fff', opacity: ring}}>UNIONE EUROPEA</div>
      {f >= at(44.1) && (
        <div style={{position: 'absolute', left: 90, top: 720, width: 900, transform: `translateX(${shake}px)`, opacity: sp(f - at(44.1))}}>
          <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 38, color: '#dfe6f3', letterSpacing: 2, marginBottom: 14}}>LIMITE MASSIMO DI CATTURA</div>
          <div style={{position: 'relative', height: 74, borderRadius: 40, background: 'rgba(255,255,255,.12)', border: '4px solid rgba(255,255,255,.35)', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 82}%`, background: hit ? `linear-gradient(90deg, ${C.orange}, ${RV_COL.rosso})` : `linear-gradient(90deg, #6fb6ff, ${C.orange})`, borderRadius: 40}} />
          </div>
          <div style={{position: 'absolute', left: '82%', top: 40, width: 8, height: 110, background: '#fff', boxShadow: '0 0 20px #fff'}} />
          <div style={{position: 'absolute', left: 'calc(82% - 60px)', top: 158, fontFamily: 'Inter', fontWeight: 900, fontSize: 34, color: hit ? C.orange : '#fff'}}>STOP</div>
        </div>
      )}
      {f >= at(45.96) && (
        <div style={{position: 'absolute', top: 960, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 20}}>
          <span style={{transform: `scale(${sp(f - at(45.96))})`}}><Pill txt="ROSSO" bg={RV_COL.rosso} fg="#fff" size={44} /></span>
          <span style={{transform: `scale(${sp(f - at(46.36))})`}}><Pill txt="VIOLA" bg={RV_COL.viola} fg="#fff" size={44} /></span>
        </div>
      )}
      {f >= at(49.14) && (
        <div style={{position: 'absolute', left: 140, top: 1070, width: 800}}>
          <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 36, color: '#dfe6f3', letterSpacing: 2, marginBottom: 12, textAlign: 'center'}}>GIORNI DI PESCA LIMITATI</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10}}>
            {new Array(14).fill(0).map((_, i) => {
              const ap = sp(f - at(49.14) - i * 0.8, 12, 220);
              const crossed = [1, 3, 5, 6, 8, 10, 12, 13].includes(i);
              const cx = interpolate(f - at(49.9) - i * 1.1, [0, 5], [0, 1], clamp);
              return (
                <div key={i} style={{position: 'relative', height: 70, borderRadius: 10, background: C.cream, transform: `scale(${ap})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: C.navy}}>
                  {i + 1}
                  {crossed && (
                    <svg width={60} height={60} viewBox="0 0 60 60" style={{position: 'absolute'}}>
                      <path d="M12 12 L48 48 M48 12 L12 48" stroke={RV_COL.rosso} strokeWidth="8" strokeLinecap="round" strokeDasharray="52" strokeDashoffset={52 * (1 - cx)} />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SceneWrap>
  );
};

// ---------- 6. 2025: -6% ----------
const Flag: React.FC<{c: [string, string, string]}> = ({c}) => (
  <span style={{display: 'inline-flex', width: 54, height: 36, borderRadius: 4, overflow: 'hidden', marginRight: 14, verticalAlign: 'middle', boxShadow: '0 0 0 2px rgba(255,255,255,.6)'}}>
    {c.map((x, i) => <span key={i} style={{flex: 1, background: x}} />)}
  </span>
);
export const Meno6: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const y = sp(f - at(52.1), 9, 200);
  const pct = interpolate(f, [at(58.0), at(58.6)], [0, 6], clamp);
  const slam = sp(f - at(58.0), 7, 260);
  const barH = interpolate(f, [at(58.0), at(58.8)], [100, 94], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <SceneWrap dur={dur}>
      <NavyBg tint="#3a1a2a" />
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${y})`}}>
        <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 150, color: '#fff', letterSpacing: 6, textShadow: `0 0 60px ${RV_COL.rosso}`}}>2025</span>
      </div>
      {f >= at(54.0) && (
        <div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', opacity: sp(f - at(54.0))}}>
          <Pill txt="LIMITE GAMBERO ROSSO" bg={RV_COL.rosso} fg="#fff" size={46} />
        </div>
      )}
      {f >= at(55.6) && (
        <div style={{position: 'absolute', top: 610, width: '100%', textAlign: 'center', fontFamily: 'Inter', fontWeight: 900, fontSize: 38, color: '#fff', letterSpacing: 2}}>
          <span style={{opacity: sp(f - at(55.7)), marginRight: 34}}><Flag c={['#009246', '#fff', '#ce2b37']} />ACQUE ITALIANE</span>
          <span style={{opacity: sp(f - at(56.7))}}><Flag c={['#0055a4', '#fff', '#ef4135']} />FRANCESI</span>
        </div>
      )}
      <div style={{position: 'absolute', left: 300, bottom: 1920 - 1290, width: 220, height: 5.2 * barH, background: `linear-gradient(180deg, ${RV_COL.rosso}, #7a1c10)`, borderRadius: '16px 16px 0 0', opacity: interpolate(f, [at(54.0), at(54.4)], [0, 1], clamp)}}>
        <div style={{position: 'absolute', top: -60, width: '100%', textAlign: 'center', fontFamily: 'Inter', fontWeight: 900, fontSize: 40, color: '#fff'}}>{f >= at(58.0) ? '2025' : 'PRIMA'}</div>
        {f >= at(58.0) && <div style={{position: 'absolute', top: 5.2 * (barH - 100) , left: 0, right: 0, height: 5.2 * (100 - barH), background: 'rgba(255,255,255,.2)', borderTop: '4px dashed #fff'}} />}
      </div>
      {f >= at(58.0) && (
        <div style={{position: 'absolute', left: 560, top: 860, transform: `scale(${2.2 - 1.2 * slam}) rotate(-6deg)`, opacity: Math.min(1, slam * 2)}}>
          <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 190, color: C.orange, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>-{Math.round(pct)}%</span>
        </div>
      )}
    </SceneWrap>
  );
};

// ---------- 7. Catena: meno pesca → meno prodotto → prezzi più alti ----------
export const Chain: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const items: [string, number, string][] = [
    ['MENO PESCA', 59.5, '#bfe3ff'],
    ['MENO PRODOTTO', 60.85, C.cream],
    ['PREZZI PIÙ ALTI €', 61.75, C.orange],
  ];
  return (
    <SceneWrap dur={dur}>
      <BlurPhoto src="viola2" dark={0.4} />
      <AbsoluteFill style={{background: 'rgba(6,15,32,.45)'}} />
      {items.map(([t, s, bg], i) => {
        const p = sp(f - at(s), 10, 220);
        if (f < at(s)) return null;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg width={80} height={90} viewBox="0 0 80 90" style={{position: 'absolute', left: W / 2 - 40, top: 470 + i * 270 - 120, opacity: p}}>
                <path d="M40 0 L40 60 M14 40 L40 70 L66 40" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div style={{position: 'absolute', top: 470 + i * 270, width: '100%', textAlign: 'center', transform: `scale(${p})`}}>
              <Pill txt={t} bg={bg} size={72} />
            </div>
          </React.Fragment>
        );
      })}
    </SceneWrap>
  );
};

// ---------- 8. Timbri: raro · selvaggio · protetto ----------
export const Stamps: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const items: [string, number, number, number, string][] = [
    ['RARO', 73.74, 400, 600, RV_COL.rosso],
    ['SELVAGGIO', 74.1, 640, 850, C.orange],
    ['PROTETTO', 74.82, 450, 1100, '#3fbf7f'],
  ];
  return (
    <SceneWrap dur={dur}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={staticFile('img/viola3.jpg')} style={{width: W, height: H, objectFit: 'cover', transform: `scale(${1.1 + f * 0.0015})`, filter: 'contrast(1.06) saturate(1.1) brightness(.75)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,15,32,.85), rgba(6,15,32,.25) 30%, rgba(6,15,32,.35) 70%, rgba(6,15,32,.9))'}} />
      <TopCard txt="QUANDO PAGHI CARO…" f={f - at(71.1)} />
      {items.map(([t, s, x, y, col], i) => {
        const lf = f - at(s);
        if (lf < 0) return null;
        const p = interpolate(lf, [0, 5], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
        const sc = 2.4 - 1.4 * p;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, 0) scale(${sc}) rotate(${-12 + i * 9}deg)`, opacity: Math.min(1, p * 1.5)}}>
            <div style={{border: `9px solid ${col}`, borderRadius: 26, padding: '14px 34px', color: col, fontFamily: 'Inter', fontWeight: 900, fontSize: 84, letterSpacing: 6, background: 'rgba(255,255,255,.92)', boxShadow: `0 0 0 5px rgba(255,255,255,.92), 0 0 0 9px ${col}, 0 20px 60px rgba(0,0,0,.5)`}}>{t}</div>
          </div>
        );
      })}
    </SceneWrap>
  );
};

// ---------- 9. Sondaggio Team rosso / Team viola ----------
export const TeamPoll: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const top = sp(f, 14, 160);
  const bot = sp(f - at(76.4), 14, 160);
  const ring = sp(f - at(76.2), 8, 200);
  const bub = sp(f - at(77.14), 9, 190);
  const half = (src: string, y: number, label: string, col: string, p: number, fromTop: boolean, pos: string, sc: number) => (
    <div style={{position: 'absolute', left: 0, top: y, width: W, height: H / 2, overflow: 'hidden', transform: `translateY(${(1 - p) * (fromTop ? -H / 2 : H / 2)}px)`}}>
      <Img src={staticFile(`img/${src}.jpg`)} style={{width: W, height: H / 2, objectFit: 'cover', objectPosition: pos, transform: `scale(${sc + f * 0.0012})`, filter: 'contrast(1.06) saturate(1.12)'}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(6,15,32,.35), rgba(6,15,32,0) 40%, rgba(6,15,32,.45))`}} />
      <div style={{position: 'absolute', width: '100%', textAlign: 'center', top: fromTop ? 290 : 560}}>
        <Pill txt={label} bg={col} fg="#fff" size={88} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], clamp)}}>
      <AbsoluteFill style={{background: C.navyDeep}} />
      {half('gambero', 0, 'TEAM ROSSO', RV_COL.rosso, top, true, '42% 42%', 1.05)}
      {f >= at(76.4) - 1 && half('viola3', H / 2, 'TEAM VIOLA', RV_COL.viola, bot, false, '50% 50%', 1.1)}
      <div style={{position: 'absolute', left: 0, top: H / 2 - 5, width: W, height: 10, background: `linear-gradient(90deg, ${RV_COL.rosso}, #fff, ${RV_COL.viola})`, transform: `scaleX(${ring})`}} />
      <div style={{position: 'absolute', left: W / 2 - 95, top: H / 2 - 95, width: 190, height: 190, borderRadius: '50%', background: C.orange, border: '10px solid #fff', transform: `scale(${ring})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 900, fontSize: 110, color: C.navy, boxShadow: '0 20px 60px rgba(0,0,0,.6)'}}>?</div>
      {f >= at(77.14) && (
        <div style={{position: 'absolute', top: 1290, width: '100%', textAlign: 'center', transform: `scale(${bub})`, transformOrigin: '50% 100%'}}>
          <div style={{display: 'inline-block', position: 'relative', background: '#fff', color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 54, padding: '22px 40px', borderRadius: 40, boxShadow: '0 18px 50px rgba(0,0,0,.55)'}}>
            SCRIVILO NEI COMMENTI
            <div style={{position: 'absolute', left: 120, bottom: -30, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '34px solid #fff'}} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
