import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, staticFile, random} from 'remotion';
import {C, FPS, H, W} from '../theme';
import {Tuna, TC, TNAME, Species} from './Tuna';
import {BlurPhoto, Chip, GRAD, NavyBg, Pill, TopCard, clamp, fmt, sp, useAt, SceneWrap} from './Kit';

const SPECIES: Species[] = ['rosso', 'gialla', 'obeso'];

// Trancio di tonno (SVG) con venature di grasso e righe della piastra
const Steak: React.FC<{w: number; base: string; fat: number; grill?: number; seed: string}> = ({w, base, fat, grill = 0, seed}) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 200 144">
    <defs>
      <clipPath id={'cl' + seed}><path d="M14 30 C40 6 150 2 182 26 C200 48 196 112 170 128 C130 146 50 142 22 122 C2 104 0 48 14 30 Z" /></clipPath>
    </defs>
    <path d="M14 30 C40 6 150 2 182 26 C200 48 196 112 170 128 C130 146 50 142 22 122 C2 104 0 48 14 30 Z" fill={base} stroke="rgba(255,255,255,.7)" strokeWidth="4" />
    <g clipPath={`url(#cl${seed})`}>
      {new Array(Math.round(fat * 14)).fill(0).map((_, i) => {
        const y = 14 + random(seed + i) * 120;
        return <path key={i} d={`M-10 ${y} C50 ${y - 18} 120 ${y + 18} 210 ${y - 6}`} stroke="rgba(255,240,235,.55)" strokeWidth={1.5 + random(seed + 'w' + i) * 3} fill="none" />;
      })}
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={20 + i * 38} y={-20} width={10} height={200} transform="rotate(28 100 72)" fill="#2a1408" opacity={0.75 * grill} />)}
      <path d="M100 10 C80 50 120 90 100 140" stroke="rgba(0,0,0,.12)" strokeWidth="3" fill="none" />
    </g>
  </svg>
);

// ---------- 10. La carne: rosa chiaro e magra, trancio da piastra ----------
export const Carne: React.FC<{dur: number; t0: number; bg: string}> = ({dur, t0, bg}) => {
  const {f, at} = useAt(t0);
  const meats: [Species, string, number][] = [['rosso', '#9b1c26', 0.45], ['gialla', '#ef9a9a', 0.12], ['obeso', '#c23a45', 0.9]];
  const focus = f >= at(55.47);
  const grill = interpolate(f, [at(57.54), at(58.2)], [0, 1], clamp);
  const fatP = interpolate(f, [at(56.69), at(57.2)], [0, 0.18], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <SceneWrap dur={dur}>
      <BlurPhoto src={bg} dark={0.32} />
      <AbsoluteFill style={{background: 'rgba(6,15,32,.45)'}} />
      <TopCard txt="IL COLORE DELLA CARNE" f={f - 2} />
      {meats.map(([s, c, fat], i) => {
        const p = sp(f - 6 - i * 4, 12, 190);
        const isG = s === 'gialla';
        const big = focus && isG ? 1 : 0;
        const dim = focus && !isG ? interpolate(f - at(55.47), [0, 8], [1, 0], clamp) : 1;
        const x = focus ? (isG ? 190 : i === 0 ? 40 : 760) : 40 + i * 340;
        const y = focus ? (isG ? 520 : 1020) : 560;
        const w = focus ? (isG ? 700 : 280) : 300;
        return (
          <div key={s} style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y + (1 - p) * 120}px)`, opacity: p * dim, textAlign: 'center', width: w, transition: 'none'}}>
            <Steak w={w} base={c} fat={fat} grill={isG ? grill : 0} seed={s} />
            <div style={{marginTop: big ? -10 : 6}}><Pill txt={TNAME[s]} bg={TC[s]} fg={s === 'gialla' ? C.navy : '#fff'} size={big ? 44 : 30} /></div>
          </div>
        );
      })}
      {focus && (
        <div style={{position: 'absolute', left: 120, top: 1080, width: 840, opacity: sp(f - at(56.69))}}>
          <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 34, color: '#dfe6f3', marginBottom: 10}}>GRASSO</div>
          <div style={{height: 34, borderRadius: 20, background: 'rgba(255,255,255,.15)', overflow: 'hidden', border: '3px solid rgba(255,255,255,.35)'}}>
            <div style={{width: `${fatP * 100}%`, height: '100%', background: TC.gialla, borderRadius: 20}} />
          </div>
        </div>
      )}
      <Chip f={f - at(55.47)} txt="ROSA CHIARO" y={450} bg="#ffc9c9" size={46} />
      {f < at(57.54) && <Chip f={f - at(56.69)} txt="MAGRA" y={1180} bg={C.cream} size={46} />}
      {f >= at(57.54) && (
        <div style={{position: 'absolute', top: 1180, width: '100%', textAlign: 'center', transform: `scale(${sp(f - at(57.54), 9, 220)})`}}>
          <Pill txt={f >= at(59.48) ? 'IL TRANCIO DEL PESCIVENDOLO' : 'TRANCIO DA PIASTRA'} bg={C.orange} size={46} />
        </div>
      )}
    </SceneWrap>
  );
};

// ---------- 11. Vive in profondità: buio, freddo → più grasso ----------
export const Profondo: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const d = interpolate(f, [4, at(67.6)], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const temp = interpolate(f, [at(67.47), at(68.2)], [26, 12], clamp);
  const fat = f - at(68.29);
  const light = 1 - d;
  return (
    <SceneWrap dur={dur}>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgb(${20 + 30 * light},${70 + 80 * light},${130 + 70 * light}) 0%, rgb(${4 + 10 * light},${12 + 30 * light},${30 + 50 * light}) 100%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 0%, rgba(200,235,255,${0.35 * light}), rgba(0,0,0,0) 60%)`}} />
      {/* scala profondità */}
      <div style={{position: 'absolute', left: 70, top: 470, width: 16, height: 760, borderRadius: 8, background: 'linear-gradient(180deg, #7fd0ff, #0b1a33)'}} />
      <div style={{position: 'absolute', left: 52, top: 470 + d * 740, width: 52, height: 52, borderRadius: '50%', background: C.orange, border: '6px solid #fff'}} />
      <div style={{position: 'absolute', left: 120, top: 460, fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: '#fff'}}>SUPERFICIE</div>
      <div style={{position: 'absolute', left: 120, top: 1200, fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: '#9fb2cf'}}>CENTINAIA DI METRI</div>
      <div style={{position: 'absolute', left: 300, top: 560 + d * 380, transform: `rotate(${12 * (1 - d)}deg)`}}><Tuna sp="obeso" w={560} f={f} glow={d > 0.6 ? 'rgba(110,160,255,.5)' : undefined} /></div>
      {/* termometro */}
      {f >= at(67.31) && (
        <div style={{position: 'absolute', right: 80, top: 520, textAlign: 'center', opacity: sp(f - at(67.31))}}>
          <div style={{width: 40, height: 300, margin: '0 auto', borderRadius: 20, background: 'rgba(255,255,255,.2)', border: '4px solid #fff', position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', bottom: 0, width: '100%', height: `${(temp / 30) * 100}%`, background: temp > 18 ? '#ff7a50' : '#5ab4ff'}} />
          </div>
          <div style={{width: 76, height: 76, borderRadius: '50%', margin: '-14px auto 0', background: temp > 18 ? '#ff7a50' : '#5ab4ff', border: '4px solid #fff'}} />
          <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 34, color: '#fff', marginTop: 8}}>PIÙ FREDDA</div>
        </div>
      )}
      <Chip f={f - at(65.63)} txt="IN PROFONDITÀ" y={420} bg={C.cream} size={46} />
      <Chip f={f - at(66.77)} txt="BUIO" y={520} bg="#1b2a44" fg="#fff" size={46} />
      {fat >= 0 && (
        <div style={{position: 'absolute', left: 130, top: 960, width: 820, padding: '26px 30px', borderRadius: 26, background: 'rgba(244,241,234,.96)', boxShadow: '0 20px 60px rgba(0,0,0,.5)', transform: `scale(${sp(fat, 12, 190)})`}}>
          <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 38, color: C.navy, marginBottom: 14}}>PIÙ GRASSO</div>
          {([['gialla', 0.25], ['obeso', 0.72]] as [Species, number][]).map(([s, v], i) => (
            <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: i ? 12 : 0}}>
              <div style={{width: 250, fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: C.navy}}>{TNAME[s]}</div>
              <div style={{flex: 1, height: 34, borderRadius: 18, background: '#d9dde4', overflow: 'hidden'}}>
                <div style={{width: `${interpolate(fat - i * 6, [0, 14], [0, v * 100], clamp)}%`, height: '100%', background: TC[s], borderRadius: 18}} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SceneWrap>
  );
};

// ---------- 12. Curiosità: asta di Tokyo ----------
export const Asta: React.FC<{dur: number; t0: number; bg: string}> = ({dur, t0, bg}) => {
  const {f, at} = useAt(t0);
  const money = interpolate(f, [at(77.29), at(78.6)], [0, 3200000], {...clamp, easing: Easing.out(Easing.cubic)});
  const slam = f - at(78.35);
  const hammer = f - at(76.07);
  const hr = hammer >= 0 ? interpolate(hammer % 14, [0, 4, 7, 14], [0, -40, 8, 0], clamp) : 0;
  return (
    <SceneWrap dur={dur}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={staticFile(`img/${bg}.jpg`)} style={{width: W, height: H, objectFit: 'cover', objectPosition: '40% 50%', transform: `scale(${1.15 + f * 0.0012})`, filter: 'contrast(1.06) saturate(1.1) brightness(.62)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,15,32,.85), rgba(6,15,32,.3) 30%, rgba(6,15,32,.45) 65%, rgba(6,15,32,.92))'}} />
      <TopCard txt="UNA CURIOSITÀ" f={f - 2} />
      {f >= at(73.79) && (
        <div style={{position: 'absolute', top: 460, width: '100%', textAlign: 'center', transform: `scale(${sp(f - at(73.79))})`}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 18}}>
            <svg width={84} height={56} viewBox="0 0 84 56" style={{borderRadius: 6, boxShadow: '0 0 0 3px rgba(255,255,255,.7)'}}><rect width="84" height="56" fill="#fff" /><circle cx="42" cy="28" r="16" fill="#bc002d" /></svg>
            <Pill txt="TOKYO" bg={C.cream} size={56} />
          </span>
        </div>
      )}
      <Chip f={f - at(74.37)} txt="ASTA DI INIZIO ANNO" y={580} bg="#bfe3ff" size={44} />
      {hammer >= 0 && (
        <svg width={170} height={170} viewBox="0 0 100 100" style={{position: 'absolute', right: 40, top: 590, transform: `rotate(${hr}deg)`, transformOrigin: '80% 80%'}}>
          <rect x="10" y="20" width="46" height="22" rx="5" fill="#c98a4a" stroke="#fff" strokeWidth="3" transform="rotate(-35 33 31)" />
          <rect x="34" y="34" width="10" height="56" rx="4" fill="#a86a32" stroke="#fff" strokeWidth="3" transform="rotate(-35 39 62)" />
        </svg>
      )}
      {f >= at(77.29) && (
        <div style={{position: 'absolute', top: 780, width: '100%', textAlign: 'center'}}>
          <div style={{display: 'inline-block', background: 'rgba(6,15,32,.85)', border: `4px solid ${C.orange}`, borderRadius: 24, padding: '14px 34px', fontFamily: 'Inter', fontWeight: 900, fontSize: 110, color: '#fff', fontVariantNumeric: 'tabular-nums', boxShadow: '0 20px 60px rgba(0,0,0,.6)'}}>$ {fmt(money)}</div>
        </div>
      )}
      {slam >= 0 && (
        <>
          <div style={{position: 'absolute', top: 990, width: '100%', textAlign: 'center', transform: `scale(${2.2 - 1.2 * Math.min(1, sp(slam, 7, 260))}) rotate(-5deg)`, opacity: Math.min(1, slam / 4)}}>
            <Pill txt="UN SOLO TONNO ROSSO" bg={C.orange} size={52} />
          </div>
          <div style={{position: 'absolute', top: 1110, width: '100%', textAlign: 'center', opacity: sp(slam - 10), fontFamily: 'Inter', fontWeight: 900, fontSize: 34, color: '#dfe6f3', letterSpacing: 1}}>243 KG · GENNAIO 2026 · ≈ 13.000 $ AL KG</div>
        </>
      )}
    </SceneWrap>
  );
};

// ---------- 13. In cucina: come si mangia ----------
export const Cucina: React.FC<{dur: number; t0: number; photos: Record<Species, string | null>}> = ({dur, t0, photos}) => {
  const {f, at} = useAt(t0);
  const rows: [Species, string, string, number][] = [
    ['rosso', 'CRUDO', 'LA VENTRESCA SI SCIOGLIE IN BOCCA', 80.71],
    ['gialla', 'SCOTTATO', 'O ALLA PIASTRA', 84.01],
    ['obeso', 'SUSHI', 'E TARTARE', 86.65],
  ];
  return (
    <SceneWrap dur={dur}>
      <NavyBg tint="#2a2140" />
      <TopCard txt="IN CUCINA" f={f - 2} />
      {rows.map(([s, t, sub, tt], i) => {
        const lf = f - at(tt);
        if (lf < 0) return null;
        const p = sp(lf, 13, 190);
        const ph = photos[s];
        return (
          <div key={s} style={{position: 'absolute', left: 60, top: 470 + i * 300, width: 960, height: 270, display: 'flex', alignItems: 'center', gap: 30, padding: '0 30px 0 0', borderRadius: 30, background: 'rgba(244,241,234,.97)', boxShadow: '0 20px 60px rgba(0,0,0,.5)', overflow: 'hidden', transform: `translateX(${(1 - p) * (i % 2 ? 1100 : -1100)}px)`, borderLeft: `18px solid ${TC[s]}`}}>
            <div style={{width: 300, height: 270, flex: 'none', overflow: 'hidden', background: '#1b2a44', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {ph ? <Img src={staticFile(`img/${ph}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 + lf * 0.002})`}} /> : <Steak w={250} base="#ef9a9a" fat={0.12} grill={interpolate(lf, [6, 18], [0, 1], clamp)} seed="ck" />}
            </div>
            <div>
              <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: TC[s] === TC.gialla ? '#b88700' : TC[s], letterSpacing: 2}}>{TNAME[s]}</div>
              <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 76, color: C.navy, lineHeight: 1.05}}>{t}</div>
              <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 30, color: '#4b5d7a', marginTop: 6}}>{sub}</div>
            </div>
          </div>
        );
      })}
    </SceneWrap>
  );
};

// ---------- 14. Sondaggio: quale hai assaggiato? ----------
export const Poll: React.FC<{dur: number; t0: number; photos: Record<Species, [string, string]>}> = ({dur, t0, photos}) => {
  const {f, at} = useAt(t0);
  const q = sp(f - 4, 9, 200);
  const bub = sp(f - at(90.25), 9, 190);
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], clamp)}}>
      <AbsoluteFill style={{background: C.navyDeep}} />
      {SPECIES.map((s, i) => {
        const p = sp(f - i * 3, 14, 160);
        return (
          <div key={s} style={{position: 'absolute', left: 0, top: (H / 3) * i, width: W, height: H / 3, overflow: 'hidden', transform: `translateX(${(1 - p) * (i % 2 ? W : -W)}px)`, borderBottom: i < 2 ? '6px solid #fff' : undefined}}>
            <Img src={staticFile(`img/${photos[s][0]}.jpg`)} style={{width: W, height: H / 3, objectFit: 'cover', objectPosition: photos[s][1], transform: `scale(${1.1 + f * 0.001})`, filter: 'contrast(1.06) saturate(1.12) brightness(.9)'}} />
            <div style={{position: 'absolute', right: 50, ...(i === 0 ? {top: 230} : i === 1 ? {bottom: 40} : {top: 30})}}><Pill txt={`${['A', 'B', 'C'][i]} · ${TNAME[s]}`} bg={TC[s]} fg={s === 'gialla' ? C.navy : '#fff'} size={54} /></div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 395, width: '100%', textAlign: 'center', transform: `scale(${q}) rotate(-2deg)`}}>
        <div style={{display: 'inline-block', background: C.cream, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 84, lineHeight: 1.05, padding: '16px 34px', borderRadius: 18, boxShadow: '0 24px 70px rgba(0,0,0,.55)', borderBottom: `14px solid ${C.orange}`}}>E TU, QUALE<br />HAI ASSAGGIATO?</div>
      </div>
      {f >= at(90.25) && (
        <div style={{position: 'absolute', top: 1020, width: '100%', textAlign: 'center', transform: `scale(${bub})`}}>
          <div style={{display: 'inline-block', position: 'relative', background: '#fff', color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 54, padding: '22px 40px', borderRadius: 40, boxShadow: '0 18px 50px rgba(0,0,0,.55)'}}>
            SCRIVILO NEI COMMENTI
            <div style={{position: 'absolute', left: 120, bottom: -30, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '34px solid #fff'}} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Transizione a scia rosso→giallo→blu
export const Swooshes: React.FC<{times: number[]}> = ({times}) => {
  const {f} = useAt(0);
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
              <div key={k} style={{position: 'absolute', left: -900 + p * (W + 1800) - k * 160, top: -300, width: 260 - k * 70, height: H + 600, transform: 'rotate(18deg)', background: k === 1 ? 'rgba(255,255,255,.85)' : `linear-gradient(180deg, ${TC.rosso}, ${TC.gialla}, ${TC.obeso})`, opacity: 0.9 - k * 0.25, filter: k === 1 ? 'blur(6px)' : undefined}} />
            ))}
          </AbsoluteFill>
        );
      })}
    </>
  );
};
export {GRAD};
