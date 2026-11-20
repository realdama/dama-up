import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, staticFile, random} from 'remotion';
import {C, H, W} from '../theme';
import {Sparkles} from '../rv/Fx';
import {Tuna, TC, TNAME, Species} from './Tuna';
import {BlurPhoto, Cam, Check, Chip, GRAD, NavyBg, P, Person, Pill, TopCard, WP, WideBase, clamp, fmt, lerpCam, sp, toS, useAt, SceneWrap} from './Kit';

const SPECIES: Species[] = ['rosso', 'gialla', 'obeso'];

// ---------- 1. HOOK: tre bande foto + domanda ----------
export const Hook: React.FC<{dur: number; photos: Record<Species, [string, string]>}> = ({dur, photos}) => {
  const {f, at} = useAt(0);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const q = sp(f - 2, 10, 170);
  const no = sp(f - at(1.52), 7, 240);
  const fam = f - at(2.3);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: C.navyDeep}} />
      {SPECIES.map((s, i) => {
        const p = sp(f - i * 3, 14, 160);
        const y = (H / 3) * i;
        return (
          <div key={s} style={{position: 'absolute', left: 0, top: y, width: W, height: H / 3, overflow: 'hidden', transform: `translateX(${(1 - p) * (i % 2 ? W : -W)}px)`, borderBottom: i < 2 ? '6px solid #fff' : undefined}}>
            <Img src={staticFile(`img/${photos[s][0]}.jpg`)} style={{width: W, height: H / 3, objectFit: 'cover', objectPosition: photos[s][1], transform: `scale(${1.08 + f * 0.0015})`, filter: 'contrast(1.08) saturate(1.15)'}} />
            <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,15,32,.55), rgba(6,15,32,0) 60%)'}} />
            {fam >= i * 4 && (
              <div style={{position: 'absolute', left: 50, ...(i === 2 ? {top: 30} : {bottom: 40}), transform: `scale(${sp(fam - i * 4, 10, 220)})`, transformOrigin: '0% 100%'}}>
                <Pill txt={TNAME[s]} bg={TC[s]} fg={s === 'gialla' ? C.navy : '#fff'} size={56} />
              </div>
            )}
          </div>
        );
      })}
      {f < at(2.3) && (
        <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', transform: `scale(${0.6 + 0.4 * q}) rotate(-2deg)`, opacity: interpolate(f, [at(2.1), at(2.3)], [1, 0], clamp)}}>
          <div style={{display: 'inline-block', background: C.cream, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 92, lineHeight: 1.05, padding: '18px 36px', borderRadius: 18, boxShadow: '0 24px 70px rgba(0,0,0,.55)', borderBottom: `14px solid ${C.orange}`}}>
            IL TONNO È<br />TUTTO UGUALE?
          </div>
          {f >= at(1.52) && (
            <div style={{marginTop: 40, transform: `scale(${2 - no}) rotate(-6deg)`, opacity: Math.min(1, no * 2)}}>
              <Pill txt="ASSOLUTAMENTE NO!" bg={C.orange} size={74} />
            </div>
          )}
        </div>
      )}
      {fam >= 0 && (
        <div style={{position: 'absolute', top: 236, width: '100%', textAlign: 'center', opacity: sp(fam)}}>
          <span style={{display: 'inline-block', fontFamily: 'Inter', fontWeight: 900, fontSize: 40, letterSpacing: 6, color: '#fff', padding: '10px 30px', borderRadius: 40, background: GRAD, boxShadow: '0 12px 40px rgba(0,0,0,.5)', textShadow: '0 2px 8px rgba(0,0,0,.4)'}}>LA FAMIGLIA DEL TONNO</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 2. Il re: gigante con esempi (3 m, 600 kg, 60 km/h) ----------
const Gauge: React.FC<{v: number}> = ({v}) => {
  const a = -120 + (v / 80) * 240;
  return (
    <svg width={330} height={260} viewBox="-165 -165 330 260">
      <path d="M-139 80 A150 150 0 1 1 139 80" stroke="rgba(255,255,255,.18)" strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M-139 80 A150 150 0 1 1 139 80" stroke={C.orange} strokeWidth="26" fill="none" strokeLinecap="round" pathLength={100} strokeDasharray={`${(v / 80) * 100} 100`} />
      {[0, 20, 40, 60, 80].map((t) => {
        const r = ((-120 + (t / 80) * 240 - 90) * Math.PI) / 180;
        return <text key={t} x={Math.cos(r) * 108} y={Math.sin(r) * 108 + 10} fill="#dfe6f3" fontFamily="Inter" fontWeight={900} fontSize={26} textAnchor="middle">{t}</text>;
      })}
      <g transform={`rotate(${a})`}>
        <path d="M-7 0 L0 -128 L7 0 Z" fill="#fff" />
      </g>
      <circle r="16" fill="#fff" />
    </svg>
  );
};

export const Re: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const crown = sp(f - 4, 9, 200);
  // fasi: 0 lunghezza, 1 peso, 2 velocità
  const L = at(5.86), P = at(7.3), V = at(8.78);
  const ph = f >= V ? 2 : f >= P ? 1 : f >= L ? 0 : -1;
  const tunaX = interpolate(f, [0, 20], [-700, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const done = (i: number, txt: string) => {
    const lf = f - [P, V, 9999][i];
    if (lf < 0) return null;
    return (
      <div key={i} style={{display: 'inline-flex', alignItems: 'center', gap: 10, margin: '0 10px', transform: `scale(${sp(lf)})`}}>
        <Check lf={lf} color={TC.rosso} size={42} />
        <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 40, color: '#fff'}}>{txt}</span>
      </div>
    );
  };
  const panel = (i: number, node: React.ReactNode) => {
    const st = [L, P, V][i];
    if (ph !== i) return null;
    const p = sp(f - st, 13, 180);
    return <div style={{position: 'absolute', left: 70, top: 840, width: 940, height: 440, borderRadius: 30, background: 'rgba(8,20,42,.78)', border: '3px solid rgba(255,255,255,.18)', boxShadow: '0 30px 80px rgba(0,0,0,.5)', transform: `translateY(${(1 - p) * 80}px)`, opacity: p, overflow: 'hidden'}}>{node}</div>;
  };
  const len = interpolate(f - L, [4, 26], [0, 3], {...clamp, easing: Easing.out(Easing.cubic)});
  const kg = interpolate(f - P, [2, 24], [0, 600], {...clamp, easing: Easing.out(Easing.cubic)});
  const kmh = interpolate(f - V, [2, 22], [0, 60], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <SceneWrap dur={dur}>
      <NavyBg tint="#4a1a22" />
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${crown})`}}>
        <svg width={120} height={84} viewBox="0 0 120 84" style={{display: 'block', margin: '0 auto', filter: 'drop-shadow(0 0 18px rgba(255,200,60,.8))'}}>
          <path d="M8 76 L4 18 L34 44 L60 6 L86 44 L116 18 L112 76 Z" fill="#ffcc33" stroke="#fff3c4" strokeWidth="4" />
          <circle cx="60" cy="52" r="8" fill={TC.rosso} />
        </svg>
        <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 84, color: '#fff', lineHeight: 1, textShadow: `0 0 40px ${TC.rosso}`}}>IL RE: <span style={{color: '#ff7a6a'}}>TONNO ROSSO</span></div>
      </div>
      <div style={{position: 'absolute', left: 230, top: 470, transform: `translateX(${tunaX}px)`}}>
        <Tuna sp="rosso" w={620} f={f} glow="rgba(255,90,70,.45)" />
      </div>
      <div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center'}}>{done(0, '3 M')}{done(1, '600 KG')}</div>
      {panel(0, (
        <>
          <div style={{position: 'absolute', left: 50, top: 34, fontFamily: 'Inter', fontWeight: 900, fontSize: 38, color: '#dfe6f3'}}>PIÙ LUNGO DI UN UOMO</div>
          <div style={{position: 'absolute', left: 60, bottom: 70}}><Person h={230} /></div>
          <div style={{position: 'absolute', left: 60, bottom: 30, fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: '#9fb2cf'}}>1,8 M</div>
          <div style={{position: 'absolute', left: 170, bottom: 90, transform: `scale(${sp(f - L - 2)})`, transformOrigin: '0% 50%'}}><Tuna sp="rosso" w={560} f={f} /></div>
          <div style={{position: 'absolute', left: 175, bottom: 60, width: 690 * (len / 3), height: 12, background: C.orange, borderRadius: 6}} />
          <div style={{position: 'absolute', left: 175 + 690 * (len / 3) - 8, bottom: 48, width: 8, height: 36, background: C.orange}} />
          <div style={{position: 'absolute', right: 50, top: 24, fontFamily: 'Inter', fontWeight: 900, fontSize: 90, color: C.orange}}>{len.toFixed(1).replace('.', ',')} M</div>
        </>
      ))}
      {panel(1, (
        <>
          <div style={{position: 'absolute', left: 50, top: 34, fontFamily: 'Inter', fontWeight: 900, fontSize: 38, color: '#dfe6f3'}}>PESA COME 8 PERSONE</div>
          <div style={{position: 'absolute', right: 50, top: 20, fontFamily: 'Inter', fontWeight: 900, fontSize: 90, color: C.orange}}>{fmt(kg)} KG</div>
          <div style={{position: 'absolute', left: 60, bottom: 50, display: 'flex', gap: 18, alignItems: 'flex-end'}}>
            {new Array(8).fill(0).map((_, i) => (
              <div key={i} style={{transform: `scale(${sp(f - P - 6 - i * 2, 9, 230)})`, transformOrigin: '50% 100%'}}><Person h={170} color={i % 2 ? '#dfe6f3' : '#ffd8a0'} /></div>
            ))}
          </div>
          <div style={{position: 'absolute', right: 60, bottom: 60, fontFamily: 'Inter', fontWeight: 900, fontSize: 34, color: '#9fb2cf', textAlign: 'right'}}>8 × 75 KG<br />= 600 KG</div>
        </>
      ))}
      {panel(2, (
        <>
          <div style={{position: 'absolute', left: 50, top: 34, fontFamily: 'Inter', fontWeight: 900, fontSize: 44, color: '#dfe6f3'}}>VELOCE COME UN'AUTO IN CITTÀ</div>
          <div style={{position: 'absolute', left: 60, top: 140}}><Gauge v={kmh} /></div>
          <div style={{position: 'absolute', right: 60, top: 170, textAlign: 'right'}}>
            <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 150, color: C.orange, lineHeight: 1}}>{Math.round(kmh)}</div>
            <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 50, color: '#fff'}}>KM/H</div>
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{position: 'absolute', left: ((f * 38 + i * 260) % 1300) - 200, top: 400 + (i % 3) * 18, width: 160, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.35)'}} />
          ))}
        </>
      ))}
    </SceneWrap>
  );
};

// ---------- 3. Mappa: attraversa l'oceano, entra nel Mediterraneo per le uova ----------
const bez = (a: P, c: P, b: P, t: number): P => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
export const Oceano: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const z = interpolate(f, [at(12.2), at(13.6)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cam = lerpCam({cx: -3300, cy: -4650, w: 13500}, {cx: 650, cy: -4620, w: 4400}, z);
  const a = WP.usa, g = WP.gibilterra, m: P = [WP.sicilia[0] - 250, WP.sicilia[1] + 120];
  const t1 = interpolate(f, [4, at(12.1)], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const t2 = interpolate(f, [at(13.1), at(14.9)], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const c1: P = [(a[0] + g[0]) / 2, a[1] - 2400];
  const c2: P = [(g[0] + m[0]) / 2, g[1] - 200];
  const N = 50;
  const trail: P[] = [];
  for (let i = 0; i <= N * t1; i++) trail.push(toS(bez(a, c1, g, i / N), cam));
  const trail2: P[] = [];
  for (let i = 0; i <= N * t2; i++) trail2.push(toS(bez(g, c2, m, i / N), cam));
  const cur = t2 > 0 ? bez(g, c2, m, t2) : bez(a, c1, g, t1);
  const nx = t2 > 0 ? bez(g, c2, m, Math.min(1, t2 + 0.02)) : bez(a, c1, g, Math.min(1, t1 + 0.02));
  const cs = toS(cur, cam), ns = toS(nx, cam);
  const ang = (Math.atan2(ns[1] - cs[1], ns[0] - cs[0]) * 180) / Math.PI;
  const lab = (p: P, txt: string, o: number, size = 46) => {
    const s = toS(p, cam);
    return <div style={{position: 'absolute', left: s[0], top: s[1], transform: 'translate(-50%,-50%)', fontFamily: 'Cinzel', fontWeight: 700, fontSize: size, letterSpacing: 8, color: 'rgba(230,236,248,.85)', opacity: o, whiteSpace: 'nowrap'}}>{txt}</div>;
  };
  const eggs = f - at(14.9);
  return (
    <SceneWrap dur={dur}>
      <WideBase cam={cam} hi={['spain', 'croatia']} />
      {lab([-4300, -3500], 'OCEANO ATLANTICO', 1 - z, 50)}
      {lab([-8300, -6400], 'AMERICA', 1 - z, 42)}
      {lab([1100, -6500], 'EUROPA', 1 - z, 42)}
      {lab([1200, -4150], 'MEDITERRANEO', z, 40)}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <polyline points={trail.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.orange} strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" />
        <polyline points={trail2.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.orange} strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: cs[0] - 130, top: cs[1] - 58, transform: `rotate(${ang}deg)`, transformOrigin: '130px 58px'}}>
        <div style={{transform: 'scaleX(-1)'}}><Tuna sp="rosso" w={260} f={f} glow="rgba(255,120,80,.7)" /></div>
      </div>
      {eggs >= 0 &&
        new Array(26).fill(0).map((_, i) => {
          const base = i % 2 ? WP.sicilia : ([WP.sardegna[0] + 300, WP.sardegna[1] + 250] as P);
          const s = toS([base[0] + (random('ex' + i) - 0.5) * 520, base[1] + (random('ey' + i) - 0.5) * 300] as P, cam);
          const p = sp(eggs - i * 0.6, 8, 220);
          return <div key={i} style={{position: 'absolute', left: s[0] - 9, top: s[1] - 9, width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff 0 25%, #ffd27a 45%, #ff9a3a 100%)', boxShadow: '0 0 16px #ffb447', transform: `scale(${p * (0.8 + 0.3 * Math.sin((f + i * 7) / 6))})`}} />;
        })}
      <TopCard txt="ATTRAVERSA L'OCEANO" f={f - 2} />
      {f >= at(12.34) && (
        <div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', justifyContent: 'center', gap: 14}}>
          {['MAR', 'APR', 'MAG', 'GIU'].map((mth, i) => (
            <div key={mth} style={{transform: `scale(${sp(f - at(12.34) - i * 3)})`, background: i ? '#7fdc8f' : 'rgba(255,255,255,.25)', color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 38, padding: '10px 20px', borderRadius: 14}}>{mth}</div>
          ))}
        </div>
      )}
      <Chip f={f - at(12.74)} txt="OGNI PRIMAVERA" y={570} bg="#7fdc8f" size={46} />
      <Chip f={eggs} txt="QUI FA LE UOVA" y={1130} bg={C.cream} size={52} />
      <Chip f={f - at(16.02)} txt="ED È QUI CHE SI PESCA" y={1230} bg={C.orange} size={52} />
    </SceneWrap>
  );
};

// ---------- 4. Mappa: dove si pesca ----------
type MP = {p: P; t: number; label: string; side?: 'l' | 'r'};
export const Med: React.FC<{dur: number; t0: number; tonnara?: string}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const z = interpolate(f, [0, dur], [0, 1], {easing: Easing.inOut(Easing.quad)});
  const cam = lerpCam({cx: 640, cy: -4700, w: 3700}, {cx: 640, cy: -4720, w: 3400}, z);
  const pins: MP[] = [
    {p: WP.sicilia, t: 17.73, label: 'SICILIA', side: 'r'},
    {p: [WP.sardegna[0] + 60, WP.sardegna[1]], t: 18.29, label: 'SARDEGNA', side: 'r'},
    {p: WP.carloforte, t: 19.11, label: 'CARLOFORTE', side: 'l'},
    {p: WP.spagna, t: 20.89, label: 'SPAGNA', side: 'r'},
    {p: WP.croazia, t: 21.39, label: 'CROAZIA', side: 'l'},
  ];
  const ph = f - at(19.93);
  return (
    <SceneWrap dur={dur}>
      <WideBase cam={cam} hi={['spain', 'croatia']} />
      {pins.map((pn, i) => {
        const s = toS(pn.p, cam);
        const lf = f - at(pn.t);
        if (lf < 0) return null;
        const p = sp(lf, 10, 220);
        return (
          <React.Fragment key={i}>
            {[0, 20, 40].map((d) => {
              const r = ((lf + d) % 60) / 60;
              return <div key={d} style={{position: 'absolute', left: s[0] - 90 * r, top: s[1] - 90 * r, width: 180 * r, height: 180 * r, borderRadius: '50%', border: `4px solid ${C.orange}`, opacity: 1 - r}} />;
            })}
            <div style={{position: 'absolute', left: s[0] - 16, top: s[1] - 16, width: 32, height: 32, borderRadius: '50%', background: C.orange, border: '5px solid #fff', transform: `scale(${p})`}} />
            <div style={{position: 'absolute', top: s[1] - 30, ...(pn.side === 'l' ? {right: W - s[0] + 36} : {left: s[0] + 36}), transform: `scale(${p})`, transformOrigin: pn.side === 'l' ? '100% 50%' : '0% 50%'}}>
              <Pill txt={pn.label} bg="rgba(244,241,234,.96)" size={36} />
            </div>
          </React.Fragment>
        );
      })}
      {ph >= 0 && (
        <div style={{position: 'absolute', left: 70, top: 450, width: 420, transform: `scale(${sp(ph, 11, 180)})`, transformOrigin: '100% 100%'}}>
          <div style={{width: 420, height: 300, borderRadius: 22, overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 20px 60px rgba(0,0,0,.6)', background: 'linear-gradient(180deg, #1d4f86, #0b2547)'}}>
            <svg width={420} height={300} viewBox="0 0 420 300">
              <rect x="0" y="0" width="420" height="40" fill="#c9b48a" />
              <text x="16" y="28" fontFamily="Inter" fontWeight={900} fontSize="20" fill={C.navy}>COSTA</text>
              <path d="M210 40 L210 120" stroke="#e8eef6" strokeWidth="5" strokeDasharray="10 7" />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={60 + i * 80} y={120} width={74} height={110} rx={6} fill={i === 3 ? 'rgba(255,90,70,.25)' : 'rgba(255,255,255,.08)'} stroke="#e8eef6" strokeWidth="4" strokeDasharray="9 6" />)}
              <text x="327" y="258" fontFamily="Inter" fontWeight={900} fontSize="15" fill="#ffd0c8" textAnchor="middle">ULTIMA CAMERA</text>
              {[0, 1, 2].map((i) => {
                const x = 40 + ((ph * 2.2 + i * 60) % 300);
                return <g key={i} transform={`translate(${x} ${150 + i * 26}) scale(0.16)`}><Tuna sp="rosso" w={300} f={ph + i * 4} /></g>;
              })}
              <text x="210" y="290" fontFamily="Inter" fontWeight={900} fontSize="18" fill="#9fc4ff" textAnchor="middle">RETI FISSE A CAMERE</text>
            </svg>
          </div>
          <div style={{marginTop: -30, textAlign: 'center'}}><Pill txt="ANTICHE TONNARE" bg={C.orange} size={36} /></div>
        </div>
      )}
      <TopCard txt="DOVE SI PESCA" f={f - at(17.4)} />
    </SceneWrap>
  );
};

// ---------- 5. Storia: grafico (giù fino al 2006, poi risale) ----------
const YRS = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025];
const stock = (y: number) => {
  // andamento qualitativo: calo fino a metà anni 2000, poi recupero
  if (y <= 2007) return 0.78 - ((y - 1990) / 17) * 0.58;
  return 0.2 + Math.pow((y - 2007) / 18, 1.3) * 0.72;
};
export const Storia: React.FC<{dur: number; t0: number; phase: 'giu' | 'su'}> = ({dur, t0, phase}) => {
  const {f, at} = useAt(t0);
  const x0 = 130, x1 = 960, y0 = 1160, y1 = 640;
  const X = (y: number) => x0 + ((y - 1990) / 35) * (x1 - x0);
  const Y = (v: number) => y0 - v * (y0 - y1);
  const upTo = phase === 'giu' ? interpolate(f, [at(23.2), at(26.6)], [1990, 2006.5], clamp) : interpolate(f, [at(35.57), at(37.6)], [2006.5, 2025], {...clamp, easing: Easing.out(Easing.quad)});
  const pts: string[] = [];
  for (let y = 1990; y <= upTo; y += 0.25) pts.push(`${X(y)},${Y(stock(y))}`);
  const endY = Math.min(upTo, 2025);
  const red = phase === 'giu' && f >= at(24.8);
  const m06 = phase === 'su' || f >= at(27.39);
  const ok = f - at(37.51);
  const alarm = phase === 'giu' && f >= at(25.7) ? 0.5 + 0.5 * Math.sin(f / 2.5) : 0;
  return (
    <SceneWrap dur={dur}>
      <NavyBg tint={phase === 'giu' ? '#3a1a22' : '#123a2c'} />
      <AbsoluteFill style={{background: `rgba(255,40,40,${alarm * 0.12})`}} />
      <TopCard txt={phase === 'giu' ? "UN PO' DI STORIA" : 'HA FUNZIONATO'} f={f - (phase === 'giu' ? at(22.1) : at(34.2))} />
      <div style={{position: 'absolute', left: x0, top: 520, fontFamily: 'Inter', fontWeight: 900, fontSize: 32, color: '#9fb2cf', letterSpacing: 2}}>TONNI ROSSI IN MARE (ANDAMENTO)</div>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[0.25, 0.5, 0.75, 1].map((v) => <line key={v} x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,.08)" strokeWidth={2} />)}
        <line x1={x0} x2={x1} y1={y0} y2={y0} stroke="rgba(255,255,255,.5)" strokeWidth={3} />
        {YRS.map((y) => <text key={y} x={X(y)} y={y0 + 46} fill="#c9d4e6" fontFamily="Inter" fontWeight={900} fontSize={28} textAnchor="middle">{`'${String(y).slice(2)}`}</text>)}
        <polyline points={pts.join(' ')} fill="none" stroke={phase === 'su' ? '#3fd68a' : red ? '#ff5a4a' : '#ffffff'} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 12px rgba(255,255,255,.35))'}} />
        {phase === 'su' && (() => {
          const p2: string[] = [];
          for (let y = 1990; y <= 2006.5; y += 0.25) p2.push(`${X(y)},${Y(stock(y))}`);
          return <polyline points={p2.join(' ')} fill="none" stroke="#ff5a4a" strokeWidth={12} strokeLinecap="round" opacity={0.7} />;
        })()}
        {m06 && (
          <>
            <line x1={X(2006)} x2={X(2006)} y1={y1 - 20} y2={y0} stroke={C.orange} strokeWidth={5} strokeDasharray="14 10" />
            <circle cx={X(2006)} cy={Y(stock(2006))} r={16} fill={C.orange} stroke="#fff" strokeWidth={5} />
          </>
        )}
        <circle cx={X(endY)} cy={Y(stock(endY))} r={14} fill="#fff" />
      </svg>
      {phase === 'giu' && f >= at(23.24) && (
        <div style={{position: 'absolute', left: X(2005) - 230, top: 600, transform: `scale(${sp(f - at(23.24))})`}}><Pill txt="20 ANNI FA" bg={C.cream} size={42} /></div>
      )}
      {red && <div style={{position: 'absolute', left: 140, top: 680, transform: `scale(${sp(f - at(24.8), 9, 220)}) rotate(-4deg)`}}><Pill txt="TROPPA PESCA" bg="#ff5a4a" fg="#fff" size={48} /></div>}
      {phase === 'giu' && f >= at(25.7) && <div style={{position: 'absolute', left: 140, top: 790, transform: `scale(${sp(f - at(25.7), 9, 220)}) rotate(3deg)`}}><Pill txt="RISCHIAVA DI SPARIRE" bg="#fff" fg="#c4291b" size={44} /></div>}
      {m06 && (
        <div style={{position: 'absolute', left: X(2006) - 20, top: 1230, transform: `translateX(-50%) scale(${phase === 'su' ? 1 : sp(f - at(27.39), 9, 220)})`}}>
          <Pill txt={phase === 'su' ? '2006' : '2006 · PIANO PER SALVARLO'} bg={C.orange} size={40} />
        </div>
      )}
      {phase === 'su' && ok >= 0 && (
        <div style={{position: 'absolute', right: 70, top: 560, transform: `scale(${2.2 - 1.2 * Math.min(1, sp(ok, 7, 260))}) rotate(-8deg)`, opacity: Math.min(1, ok / 4)}}>
          <div style={{border: '9px solid #3fd68a', borderRadius: 24, padding: '10px 26px', color: '#1d8f55', fontFamily: 'Inter', fontWeight: 900, fontSize: 64, background: 'rgba(255,255,255,.94)', boxShadow: '0 20px 60px rgba(0,0,0,.5)'}}>È TORNATO ✓</div>
        </div>
      )}
    </SceneWrap>
  );
};

// ---------- 6. Regole severe (checklist) ----------
export const Regole: React.FC<{dur: number; t0: number; bg: string}> = ({dur, t0, bg}) => {
  const {f, at} = useAt(t0);
  const rows: [string, string, number][] = [
    ['QUOTE', 'QUANTO SE NE PUÒ PESCARE', 30.75],
    ['TAGLIA MINIMA', 'QUANTO DEVE ESSERE GRANDE', 31.77],
    ['CONTROLLI', 'SU OGNI SINGOLO PESCE', 33.03],
  ];
  return (
    <SceneWrap dur={dur}>
      <BlurPhoto src={bg} dark={0.4} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,15,32,.75), rgba(6,15,32,.4) 50%, rgba(6,15,32,.85))'}} />
      <TopCard txt="REGOLE SEVERE" f={f - 2} />
      {rows.map(([t, s, tt], i) => {
        const lf = f - at(tt);
        if (lf < 0) return null;
        const p = sp(lf, 13, 200);
        return (
          <div key={i} style={{position: 'absolute', left: 70, top: 560 + i * 250, width: 940, display: 'flex', alignItems: 'center', gap: 30, padding: '30px 36px', borderRadius: 28, background: 'rgba(244,241,234,.96)', boxShadow: '0 20px 60px rgba(0,0,0,.5)', transform: `translateX(${(1 - p) * -1100}px)`}}>
            <Check lf={lf} color={[TC.rosso, '#e09a00', TC.obeso][i]} size={96} />
            <div>
              <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 64, color: C.navy, lineHeight: 1}}>{t}</div>
              <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: '#4b5d7a', marginTop: 8}}>{s}</div>
            </div>
          </div>
        );
      })}
    </SceneWrap>
  );
};

// ---------- 7. Quota Italia 2026-2028 ----------
const FlagIT: React.FC<{h?: number}> = ({h = 60}) => (
  <span style={{display: 'inline-flex', width: h * 1.5, height: h, borderRadius: 6, overflow: 'hidden', boxShadow: '0 0 0 3px rgba(255,255,255,.7)', verticalAlign: 'middle'}}>
    {['#009246', '#fff', '#ce2b37'].map((c) => <span key={c} style={{flex: 1, background: c}} />)}
  </span>
);
export const Quota: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const n = interpolate(f, [at(41.74), at(42.9)], [0, 6000], {...clamp, easing: Easing.out(Easing.cubic)});
  const bars = f - at(43.5);
  const b1 = interpolate(bars, [0, 14], [0, 5283], {...clamp, easing: Easing.out(Easing.cubic)});
  const b2 = interpolate(bars, [6, 22], [0, 6183], {...clamp, easing: Easing.out(Easing.cubic)});
  const pct = f - at(44.21);
  const sc = 0.062;
  return (
    <SceneWrap dur={dur}>
      <NavyBg tint="#14402e" />
      <TopCard txt="QUOTA DELL'ITALIA" f={f - 3} />
      <div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center'}}>
        <span style={{transform: `scale(${sp(f - 4)})`}}><FlagIT h={56} /></span>
        {[['2026', 38.68], ['2027', 39.36], ['2028', 39.66]].map(([y, t]) => (
          <span key={y as string} style={{transform: `scale(${sp(f - at(t as number))})`}}><Pill txt={y as string} bg={C.cream} size={44} /></span>
        ))}
      </div>
      {f >= at(41.74) && (
        <div style={{position: 'absolute', top: 590, width: '100%', textAlign: 'center', transform: `scale(${0.7 + 0.3 * sp(f - at(41.74))})`, opacity: interpolate(pct, [0, 5], [1, 0], clamp)}}>
          <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 150, color: '#fff', lineHeight: 1, textShadow: '0 0 50px rgba(63,214,138,.6)'}}>≈ {fmt(n)} T</div>
          <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 40, color: '#9fe3bd', letterSpacing: 2, marginTop: 6}}>ALL'ANNO = 6 MILIONI DI KG</div>
        </div>
      )}
      {bars >= 0 && (
        <div style={{position: 'absolute', left: 170, top: 860, width: 740, height: 420}}>
          {[['2025', b1, 'rgba(255,255,255,.55)', '5.283 T'], ['2026', b2, '#3fd68a', '6.183 T']].map(([y, v, c, l], i) => (
            <div key={i} style={{position: 'absolute', left: i * 380, bottom: 0, width: 300}}>
              <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 36, color: '#fff', textAlign: 'center', marginBottom: 8, opacity: (v as number) > 100 ? 1 : 0}}>{l as string}</div>
              <div style={{height: (v as number) * sc, background: c as string, borderRadius: '18px 18px 0 0'}} />
              <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 40, color: '#c9d4e6', textAlign: 'center', marginTop: 10}}>{y as string}</div>
            </div>
          ))}
        </div>
      )}
      {pct >= 0 && (
        <div style={{position: 'absolute', left: 0, width: '100%', textAlign: 'center', top: 560, transform: `scale(${2.2 - 1.2 * Math.min(1, sp(pct, 7, 260))}) rotate(-4deg)`, opacity: Math.min(1, pct / 4)}}>
          <span style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 170, color: C.orange, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>+17%</span>
        </div>
      )}
    </SceneWrap>
  );
};

// ---------- 8. Metà alla Sicilia ----------
export const Sicilia: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const cam = lerpCam({cx: 1450, cy: -4900, w: 1900}, {cx: 1530, cy: -4640, w: 1250}, interpolate(f, [0, dur], [0, 1], {easing: Easing.inOut(Easing.quad)}));
  const s = toS([WP.sicilia[0] - 60, WP.sicilia[1] - 20] as P, cam);
  const p = interpolate(f, [at(46.8), at(47.6)], [0, 0.5], {...clamp, easing: Easing.out(Easing.cubic)});
  const glow = sp(f - at(47.39), 10, 200);
  return (
    <SceneWrap dur={dur}>
      <WideBase cam={cam} />
      <div style={{position: 'absolute', left: s[0] - 230, top: s[1] - 160, width: 460, height: 320, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,180,71,.65), rgba(255,180,71,0) 70%)', transform: `scale(${glow})`}} />
      <div style={{position: 'absolute', left: 60, top: 470}}>
        <svg width={320} height={320} viewBox="-50 -50 100 100">
          <circle r="40" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="18" />
          <circle r="40" fill="none" stroke={C.orange} strokeWidth="18" pathLength={1} strokeDasharray={`${p} 1`} transform="rotate(-90)" />
          <text y="9" fill="#fff" fontFamily="Inter" fontWeight={900} fontSize="24" textAnchor="middle">{Math.round(p * 100)}%</text>
        </svg>
      </div>
      <TopCard txt="METÀ VA ALLA SICILIA" f={f - at(46.6)} />
    </SceneWrap>
  );
};

// ---------- 9. Tonni dei mari caldi (tropici) ----------
export const Caldi: React.FC<{dur: number; t0: number}> = ({dur, t0}) => {
  const {f, at} = useAt(t0);
  const tr = interpolate(f, [4, 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const cam: Cam = {cx: -1800, cy: 0, w: interpolate(f, [0, dur], [17500, 16000])};
  const eq = toS([0, 0] as P, cam);
  return (
    <SceneWrap dur={dur}>
      <WideBase cam={cam} tropics={tr} />
      <div style={{position: 'absolute', left: 60, top: eq[1] - 330 * tr, fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: '#ffd28a', letterSpacing: 3, opacity: tr}}>TROPICO DEL CANCRO</div>
      <div style={{position: 'absolute', left: 60, top: eq[1] + 300 * tr, fontFamily: 'Inter', fontWeight: 900, fontSize: 30, color: '#ffd28a', letterSpacing: 3, opacity: tr}}>TROPICO DEL CAPRICORNO</div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: ((f * (5 + i) + i * 380) % 1400) - 250, top: eq[1] - 120 + i * 100, opacity: tr}}>
          <div style={{transform: 'scaleX(-1)'}}><Tuna sp="gialla" w={210 - i * 30} f={f + i * 5} glow="rgba(255,200,60,.6)" /></div>
        </div>
      ))}
      <svg width={180} height={180} viewBox="-50 -50 100 100" style={{position: 'absolute', right: 70, top: 470, transform: `rotate(${f}deg) scale(${sp(f - 3)})`}}>
        {new Array(12).fill(0).map((_, i) => <path key={i} d="M0 -46 L5 -30 L-5 -30 Z" fill="#ffcc33" transform={`rotate(${i * 30})`} />)}
        <circle r="24" fill="#ffcc33" />
      </svg>
      <TopCard txt="TONNI DEI MARI CALDI" f={f - at(48.4)} />
      <Sparkles cx={W / 2} cy={eq[1]} r={420} n={8} />
    </SceneWrap>
  );
};
