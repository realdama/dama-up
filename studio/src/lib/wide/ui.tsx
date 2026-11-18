// Argo Maris — libreria 16:9 (1920×1080): sfondo, header, sottotitoli, icone, card, pesci
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, FONT, MONO, rand, clamp} from '../kit';

export const W = 1920, H = 1080;
export {C, FONT, MONO, rand, clamp};

export type Word = {w: string; t?: string; start: number; end: number; beat?: number};
export type Beat = {i: number; start: number; end: number; text: string};
export type SceneData = {id: string; start: number; dur: number; beats: Beat[]; words: Word[]; text: string};
export type SP = {sc: SceneData; offset: number; dur: number};

/** frame locali di beat e parole */
export const useScene = ({sc, offset}: SP) => {
  const {fps} = useVideoConfig();
  const f = useCurrentFrame();
  const B = (i: number, d = 0) => (sc.beats[i] ? Math.round((sc.beats[i].start - sc.start) * fps) + offset + d : 1e6);
  const Bend = (i: number) => (sc.beats[i] ? Math.round((sc.beats[i].end - sc.start) * fps) + offset : 1e6);
  const Wd = (word: string, nth = 0, d = 0) => {
    const k = word.toLowerCase();
    const norm = (w: Word) => w.w.toLowerCase().replace(/[^a-zà-ù0-9]/g, '');
    let hits = sc.words.filter((w) => norm(w).startsWith(k));
    if (!hits.length && k.length > 3) hits = sc.words.filter((w) => norm(w).includes(k));
    const w = hits[Math.min(nth, hits.length - 1)];
    return w ? Math.round((w.start - sc.start) * fps) + offset + d : 1e6;
  };
  return {f, fps, B, Bend, Wd};
};

/** 0→1 con molla, parte al frame `at` */
export const useIn = (at: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: {damping: 15, stiffness: 140, mass: 0.7, ...cfg}});
};
export const ez = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});

/* ───────── sfondo oceano ───────── */
export const Backdrop: React.FC<{tint?: string}> = ({tint = C.deep}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 120% at 30% 0%, ${tint} 0%, ${C.abyss} 75%)`}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.aqua} stopOpacity={0.07} />
            <stop offset="1" stopColor={C.aqua} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 200 + i * 380 + Math.sin(f / 90 + i * 1.7) * 60;
          return <polygon key={i} points={`${x},0 ${x + 120},0 ${x - 60 + i * 30},${H} ${x - 260 + i * 30},${H}`} fill="url(#ray)" />;
        })}
        {Array.from({length: 40}).map((_, i) => {
          const sp = 0.4 + rand(i) * 1.2;
          const y = H + 40 - ((f * sp + rand(i + 1) * 1300) % (H + 120));
          return <circle key={i} cx={rand(i + 2) * W + Math.sin(f / 40 + i) * 12} cy={y} r={2 + rand(i + 3) * 5}
            fill="none" stroke={C.foam} strokeWidth={1.5} opacity={0.08 + rand(i + 4) * 0.12} />;
        })}
        {[0, 1, 2].map((k) => {
          let d = `M 0 ${H}`;
          for (let x = 0; x <= W; x += 30) d += ` L ${x} ${H - 40 - k * 18 + Math.sin(x / (180 + k * 40) + f * 0.03 * (k + 1)) * 10}`;
          d += ` L ${W} ${H} Z`;
          return <path key={k} d={d} fill={C.sea} opacity={0.05 + k * 0.03} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ───────── logo Argo Maris (file del cliente, ritagliato in tondo) ───────── */
export const Emblem: React.FC<{size?: number; ring?: string}> = ({size = 60, ring}) => {
  const f = useCurrentFrame();
  return (
    <div style={{width: size, height: size, borderRadius: size / 2, boxShadow: `0 0 ${size * 0.25}px ${ring ?? C.aqua}55`, transform: `rotate(${Math.sin(f / 40) * 1.5}deg)`}}>
      <Img src={staticFile('brand/argo-maris-logo.png')} style={{width: size, height: size}} />
    </div>
  );
};

/* ───────── header ───────── */
export const Header: React.FC<{subtitle: string; chapter?: string; idx?: number; total?: number; progress?: number}> = ({subtitle, chapter, idx, total, progress = 0}) => (
  <>
    <div style={{position: 'absolute', top: 40, left: 64, display: 'flex', alignItems: 'center', gap: 18}}>
      <Emblem size={58} />
      <div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 26, letterSpacing: 5, color: C.foam}}>ARGO MARIS</div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 17, letterSpacing: 2, color: 'rgba(232,251,255,0.6)'}}>{subtitle}</div>
      </div>
    </div>
    {chapter && (
      <div style={{position: 'absolute', top: 52, right: 64, display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT}}>
        <span style={{fontWeight: 700, fontSize: 20, letterSpacing: 3, color: C.aqua}}>{chapter.toUpperCase()}</span>
        {idx !== undefined && <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, color: 'rgba(232,251,255,0.55)'}}>{String(idx).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>}
      </div>
    )}
    <div style={{position: 'absolute', left: 0, bottom: 0, height: 6, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${C.aqua}, ${C.gold})`}} />
  </>
);

/* ───────── sottotitoli 16:9 ───────── */
const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [], chars = 0;
  for (const w of words) {
    const txt = w.t ?? w.w;
    cur.push(w); chars += txt.length + 1;
    if (cur.length >= 7 || chars > 40 || /[.,!?:;]$/.test(txt)) {
      if (chars > 12 || /[.!?]$/.test(txt)) { out.push(cur); cur = []; chars = 0; }
    }
  }
  if (cur.length) out.push(cur);
  return out;
};
export const Captions16: React.FC<{words: Word[]; highlight?: Record<string, string>}> = ({words, highlight = {}}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const groups = React.useMemo(() => chunk(words), [words]);
  let gi = -1;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (t >= g[0].start - 0.06 && t <= g[g.length - 1].end + 0.5) gi = i;
  }
  if (gi < 0) return null;
  const g = groups[gi];
  const enter = spring({frame: frame - Math.round((g[0].start - 0.06) * fps), fps, config: {damping: 16, stiffness: 200, mass: 0.5}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center'}}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 14px', maxWidth: 1500,
        padding: '14px 34px', borderRadius: 22, background: 'rgba(2,11,26,0.62)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(232,251,255,0.08)',
        transform: `translateY(${(1 - enter) * 24}px)`, opacity: enter,
      }}>
        {g.map((w, i) => {
          const txt = w.t ?? w.w;
          const key = w.w.toLowerCase().replace(/[^a-zà-ù0-9]/g, '');
          const active = t >= w.start - 0.02;
          const col = active ? highlight[key] ?? C.foam : 'rgba(232,251,255,0.42)';
          return <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, lineHeight: 1.25, color: col}}>{txt}</span>;
        })}
      </div>
    </div>
  );
};

/* ───────── titoli di scena ───────── */
export const Title: React.FC<{kicker?: string; title: string; at?: number; x?: number; y?: number; size?: number; color?: string; align?: 'left' | 'center'}> = ({
  kicker, title, at = 0, x = 120, y = 150, size = 76, color = C.foam, align = 'left',
}) => {
  const f = useCurrentFrame();
  const words = title.split(' ');
  return (
    <div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align}}>
      {kicker && (
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: C.aqua, marginBottom: 10,
          opacity: ez(f, at, at + 12), transform: `translateX(${(1 - ez(f, at, at + 14)) * -30}px)`}}>{kicker.toUpperCase()}</div>
      )}
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: -1.5, color}}>
        {words.map((w, i) => {
          const p = ez(f, at + 4 + i * 2.5, at + 18 + i * 2.5);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: size * 0.24, opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 8}px)`}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ───────── icone vettoriali ───────── */
const ICONS: Record<string, React.ReactNode> = {
  order: <><rect x={-26} y={-34} width={52} height={68} rx={8} /><path d="M -14 -14 H 14 M -14 0 H 14 M -14 14 H 4" /></>,
  truck: <><rect x={-36} y={-20} width={44} height={34} rx={4} /><path d="M 8 -8 H 26 L 38 6 V 14 H 8 Z" /><circle cx={-20} cy={18} r={7} /><circle cx={24} cy={18} r={7} /></>,
  boat: <><path d="M -38 6 H 38 L 26 24 H -26 Z" /><path d="M -4 2 V -36 L 24 2" /><path d="M -10 2 L -10 -24 L -30 2" /></>,
  fish: <><path d="M -30 0 C -14 -20 16 -20 28 0 C 16 20 -14 20 -30 0 Z" /><path d="M 28 0 L 40 -12 L 40 12 Z" /><circle cx={-16} cy={-4} r={2.5} /></>,
  check: <><circle r={32} /><path d="M -14 0 L -4 11 L 16 -11" /></>,
  clock: <><circle r={32} /><path d="M 0 -18 V 0 L 13 9" /></>,
  euro: <><circle r={32} /><path d="M 13 -12 C 4 -22 -16 -16 -16 0 C -16 16 4 22 13 12 M -24 -5 H 6 M -24 5 H 6" /></>,
  shield: <><path d="M 0 -34 L 28 -22 V 2 C 28 20 14 30 0 36 C -14 30 -28 20 -28 2 V -22 Z" /><path d="M -11 2 L -2 11 L 13 -7" /></>,
  people: <><circle cx={-13} cy={-12} r={10} /><circle cx={15} cy={-12} r={10} /><path d="M -32 26 C -30 6 4 6 6 26 M 0 26 C 2 6 34 6 34 26" /></>,
  user: <><circle cy={-12} r={13} /><path d="M -26 30 C -24 4 24 4 26 30" /></>,
  store: <><path d="M -34 -8 L -28 -30 H 28 L 34 -8 Z" /><path d="M -30 -8 V 30 H 30 V -8" /><rect x={-10} y={8} width={20} height={22} /></>,
  warehouse: <><path d="M -36 -6 L 0 -30 L 36 -6 V 30 H -36 Z" /><path d="M -20 30 V 6 H 20 V 30 M -20 16 H 20" /></>,
  gavel: <><rect x={-24} y={-30} width={30} height={16} rx={3} transform="rotate(-40)" /><path d="M -2 -6 L 26 22" /><path d="M -32 32 H 6" /></>,
  doc: <><path d="M -24 -34 H 10 L 26 -18 V 34 H -24 Z" /><path d="M 10 -34 V -18 H 26 M -12 -2 H 14 M -12 12 H 14" /></>,
  bank: <><path d="M -36 -12 L 0 -32 L 36 -12 Z" /><path d="M -26 -6 V 20 M -9 -6 V 20 M 9 -6 V 20 M 26 -6 V 20 M -36 28 H 36" /></>,
  snow: <><path d="M 0 -32 V 32 M -28 -16 L 28 16 M -28 16 L 28 -16" /><path d="M -8 -26 L 0 -18 L 8 -26 M -8 26 L 0 18 L 8 26" /></>,
  globe: <><circle r={32} /><path d="M -32 0 H 32 M 0 -32 C -16 -14 -16 14 0 32 C 16 14 16 -14 0 -32" /></>,
  phone: <><rect x={-18} y={-32} width={36} height={64} rx={8} /><path d="M -6 22 H 6" /></>,
  chart: <><path d="M -32 30 H 32" /><rect x={-26} y={4} width={12} height={22} /><rect x={-6} y={-12} width={12} height={38} /><rect x={14} y={-26} width={12} height={52} /></>,
  calendar: <><rect x={-30} y={-24} width={60} height={54} rx={6} /><path d="M -30 -8 H 30 M -16 -34 V -18 M 16 -34 V -18" /></>,
  search: <><circle cx={-6} cy={-6} r={20} /><path d="M 9 9 L 28 28" /></>,
  thermo: <><path d="M -8 14 V -26 C -8 -36 8 -36 8 -26 V 14" /><circle cy={22} r={13} /></>,
  storm: <><path d="M -26 4 C -38 4 -38 -18 -22 -18 C -18 -34 10 -34 14 -18 C 32 -20 34 4 18 4 Z" /><path d="M -4 10 L -12 26 H 0 L -8 40" /></>,
  handshake: <><path d="M -36 -6 L -18 -18 L 0 -10 L 18 -18 L 36 -6 M -18 -18 L -26 14 L 0 28 L 26 14 L 18 -18 M -8 6 L 6 16" /></>,
  scale: <><path d="M 0 -30 V 30 M -26 -18 H 26 M -26 -18 L -36 8 H -16 Z M 26 -18 L 16 8 H 36 Z M -16 30 H 16" /></>,
  pin: <><path d="M 0 34 C -20 6 -24 -4 -24 -10 C -24 -24 -12 -34 0 -34 C 12 -34 24 -24 24 -10 C 24 -4 20 6 0 34 Z" /><circle cy={-10} r={8} /></>,
  factory: <><path d="M -34 30 V -4 L -14 -16 V -4 L 6 -16 V -4 L 26 -16 V -30 H 34 V 30 Z" /></>,
  wave: <><path d="M -34 -6 C -24 -16 -14 -16 -4 -6 C 6 4 16 4 26 -6 M -34 12 C -24 2 -14 2 -4 12 C 6 22 16 22 26 12" /></>,
  star: <><path d="M 0 -32 L 9 -10 L 32 -10 L 14 4 L 20 28 L 0 14 L -20 28 L -14 4 L -32 -10 L -9 -10 Z" /></>,
  box: <><path d="M -30 -14 L 0 -30 L 30 -14 V 18 L 0 34 L -30 18 Z M -30 -14 L 0 2 L 30 -14 M 0 2 V 34" /></>,
  money: <><rect x={-36} y={-20} width={72} height={40} rx={6} /><circle r={11} /></>,
};
export const Icon: React.FC<{name: string; size?: number; color?: string; sw?: number; fill?: string}> = ({name, size = 64, color = C.aqua, sw = 5, fill = 'none'}) => (
  <svg width={size} height={size} viewBox="-44 -44 88 88" style={{overflow: 'visible'}}>
    <g fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{ICONS[name] ?? ICONS.fish}</g>
  </svg>
);

/* ───────── card ───────── */
export const Card: React.FC<{at: number; x: number; y: number; w: number; h: number; icon?: string; title: string; sub?: string; num?: string; color?: string; active?: boolean; children?: React.ReactNode; dir?: 'up' | 'left' | 'right'}> = ({
  at, x, y, w, h, icon, title, sub, num, color = C.aqua, active = true, children, dir = 'up',
}) => {
  const p = useIn(at, {damping: 14});
  const dx = dir === 'left' ? -60 : dir === 'right' ? 60 : 0;
  const dy = dir === 'up' ? 60 : 0;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, padding: '26px 28px',
      background: active ? 'linear-gradient(160deg, rgba(28,143,214,0.22), rgba(6,36,74,0.7))' : 'rgba(6,36,74,0.45)',
      border: `2px solid ${active ? color : 'rgba(232,251,255,0.12)'}`, boxShadow: active ? `0 18px 60px rgba(0,0,0,0.35), 0 0 40px ${color}22` : 'none',
      opacity: p, transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px) scale(${0.92 + p * 0.08})`, overflow: 'hidden',
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        {num && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.abyss, background: color, borderRadius: 14, minWidth: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px'}}>{num}</div>}
        {icon && <Icon name={icon} size={56} color={color} />}
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, lineHeight: 1.1, color: C.foam}}>{title}</div>
      </div>
      {sub && <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 25, lineHeight: 1.35, color: 'rgba(232,251,255,0.78)', marginTop: 14}}>{sub}</div>}
      {children}
    </div>
  );
};

/* ───────── pesci e specie (vettoriali) ───────── */
type Kind = 'fish' | 'squid' | 'shrimp' | 'flat' | 'octopus' | 'cuttle' | 'mussel' | 'clam' | 'oyster' | 'lobster' | 'razor';
type FishSpec = {body: string; belly: string; len: number; h: number; fin?: string; stripe?: string; sword?: boolean; kind?: Kind; brow?: string; spot?: string; bands?: string; spiky?: boolean; tail?: 'fork' | 'round'};
export const SPECIES: Record<string, FishSpec & {name: string}> = {
  // pesce locale
  triglia: {name: 'Triglie', body: '#F0605A', belly: '#FFD3C2', len: 150, h: 54, fin: '#E04848', stripe: '#FFB347'},
  alice: {name: 'Alici', body: '#5C8FB8', belly: '#E3EEF6', len: 160, h: 34, fin: '#3E6F99', stripe: '#9CC5E3', tail: 'fork'},
  sardina: {name: 'Sardine', body: '#4F7FA8', belly: '#EEF4F8', len: 150, h: 38, fin: '#3B6488', stripe: '#A9C9E2', tail: 'fork'},
  sgombro: {name: 'Sgombri', body: '#2F6C7E', belly: '#EAF2F2', len: 170, h: 44, fin: '#245564', bands: '#123A44', tail: 'fork'},
  cefalo: {name: 'Cefali', body: '#7E8C98', belly: '#E8ECEF', len: 180, h: 46, fin: '#5E6C78', stripe: '#A6B2BC', tail: 'fork'},
  ricciola: {name: 'Ricciole', body: '#7FA4C0', belly: '#EAF2F8', len: 190, h: 58, fin: '#5E8099', stripe: '#FFC94A', tail: 'fork'},
  spada: {name: 'Pesce spada', body: '#56708C', belly: '#D8E3EE', len: 210, h: 52, fin: '#3E5670', sword: true, tail: 'fork'},
  tonno: {name: 'Tonno', body: '#22365A', belly: '#D6DEE8', len: 210, h: 70, fin: '#FFC94A', tail: 'fork'},
  palamita: {name: 'Palamite', body: '#2E4E78', belly: '#E6ECF2', len: 180, h: 50, fin: '#22406A', bands: '#152A4A', tail: 'fork'},
  leccia: {name: 'Lecce stella', body: '#9AA86A', belly: '#EEF0DE', len: 175, h: 62, fin: '#7E8C50', stripe: '#C9D486', tail: 'fork'},
  scorfano: {name: 'Scorfani', body: '#D9483B', belly: '#F7B49A', len: 145, h: 64, fin: '#B8322A', spiky: true, spot: '#8E2018', tail: 'round'},
  sanpietro: {name: 'Pesce San Pietro', body: '#8E9478', belly: '#C8CCB4', len: 160, h: 96, fin: '#6E7458', spot: '#2A2A22', spiky: true, tail: 'round'},
  gallinella: {name: 'Gallinelle', body: '#E0654A', belly: '#FBD0BC', len: 160, h: 50, fin: '#3E78C8', tail: 'round'},
  pagello: {name: 'Pagelli', body: '#D8A29A', belly: '#F6E4DE', len: 150, h: 62, fin: '#C98476', spot: '#6A2E28'},
  dentice: {name: 'Dentici', body: '#C98EA0', belly: '#F2E0E6', len: 180, h: 70, fin: '#9E6A82', stripe: '#7FA7D8'},
  sarago: {name: 'Saraghi', body: '#B9C2C8', belly: '#EEF2F4', len: 150, h: 66, fin: '#8E989E', bands: '#3A4248'},
  nasello: {name: 'Naselli', body: '#9AA2AE', belly: '#EEF0F2', len: 190, h: 44, fin: '#7C8490'},
  orata: {name: 'Orate', body: '#A9B8C6', belly: '#EEF3F7', len: 160, h: 72, fin: '#8496A8', brow: '#FFC94A'},
  spigola: {name: 'Spigole', body: '#94A6B6', belly: '#EEF2F6', len: 175, h: 58, fin: '#72869A'},
  ombrina: {name: 'Ombrine', body: '#A8946A', belly: '#EEE6D4', len: 180, h: 60, fin: '#866F48'},
  sogliola: {name: 'Sogliole', body: '#8A7458', belly: '#E8DCC8', len: 160, h: 70, kind: 'flat'},
  rombo: {name: 'Rombi', body: '#7C735C', belly: '#E4DCC8', len: 150, h: 120, kind: 'flat'},
  // molluschi e crostacei
  calamaro: {name: 'Calamari', body: '#F2C6D2', belly: '#FFF0F4', len: 170, h: 46, kind: 'squid'},
  seppia: {name: 'Seppie', body: '#B99A78', belly: '#EBDCC6', len: 150, h: 78, kind: 'cuttle'},
  polpo: {name: 'Polpi', body: '#C8706A', belly: '#F2C4B8', len: 150, h: 90, kind: 'octopus'},
  moscardino: {name: 'Moscardini', body: '#B8866E', belly: '#EBCDB8', len: 110, h: 66, kind: 'octopus'},
  gambero: {name: 'Gamberi rosa', body: '#FF8A6A', belly: '#FFC2A8', len: 150, h: 50, kind: 'shrimp'},
  gamberorosso: {name: 'Gamberi rossi', body: '#E23B3B', belly: '#FF9A8A', len: 160, h: 52, kind: 'shrimp'},
  mazzancolla: {name: 'Mazzancolle', body: '#C9A57A', belly: '#F0DCC0', len: 165, h: 54, kind: 'shrimp'},
  scampo: {name: 'Scampi', body: '#F2A08A', belly: '#FFD9CC', len: 160, h: 50, kind: 'lobster'},
  aragosta: {name: 'Aragoste', body: '#8E3A28', belly: '#E0A070', len: 190, h: 66, kind: 'lobster'},
  // frutti di mare
  cozza: {name: 'Cozze', body: '#1E2638', belly: '#3A4A6E', len: 110, h: 54, kind: 'mussel'},
  vongola: {name: 'Vongole veraci', body: '#B8A48A', belly: '#E8DCC8', len: 90, h: 70, kind: 'clam'},
  tellina: {name: 'Telline', body: '#E4C8B0', belly: '#F6E8DA', len: 80, h: 50, kind: 'clam'},
  fasolaro: {name: 'Fasolari', body: '#C46A4A', belly: '#F0C8A8', len: 100, h: 82, kind: 'clam'},
  ostrica: {name: 'Ostriche', body: '#9C978C', belly: '#E6E2DA', len: 110, h: 80, kind: 'oyster'},
  cannolicchio: {name: 'Cannolicchi', body: '#D8C8A8', belly: '#F2EADA', len: 170, h: 26, kind: 'razor'},
  // importazione
  salmone: {name: 'Salmone', body: '#7D93A8', belly: '#F6C1AE', len: 200, h: 60, fin: '#62788D', stripe: '#F49B7C', tail: 'fork'},
  merluzzo: {name: 'Merluzzo', body: '#9C9A78', belly: '#EDEBD8', len: 190, h: 56, fin: '#7F7D5C'},
};
export const Fish: React.FC<{sp: string; x: number; y: number; s?: number; flip?: boolean; o?: number}> = ({sp, x, y, s = 1, flip, o = 1}) => {
  const f = useCurrentFrame();
  const q = SPECIES[sp] ?? SPECIES.orata;
  const L = q.len, h = q.h, wig = Math.sin(f / 5 + x) * 6;
  const tr = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;
  const ink = 'rgba(2,11,26,0.35)';
  if (q.kind === 'squid') return (
    <g transform={tr} opacity={o}>
      <path d={`M ${L / 2} 0 C ${L / 4} ${-h} ${-L / 4} ${-h / 1.4} ${-L / 6} 0 C ${-L / 4} ${h / 1.4} ${L / 4} ${h} ${L / 2} 0 Z`} fill={q.body} />
      <path d={`M ${L / 2} 0 L ${L / 2 + 26} ${-h / 1.2} L ${L / 2 + 6} 0 L ${L / 2 + 26} ${h / 1.2} Z`} fill={q.body} />
      {Array.from({length: 6}).map((_, i) => <path key={i} d={`M ${-L / 6} ${-12 + i * 5} Q ${-L / 2} ${-20 + i * 8 + wig} ${-L / 1.4} ${-24 + i * 10 + wig * 1.4}`} stroke={q.body} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <circle cx={-L / 12} cy={-6} r={6} fill={C.abyss} />
    </g>);
  if (q.kind === 'cuttle') return (
    <g transform={tr} opacity={o}>
      <ellipse cx={10} cy={0} rx={L / 2 + 6} ry={h / 2 + 6} fill={q.belly} opacity={0.85} />
      <ellipse cx={10} cy={0} rx={L / 2} ry={h / 2} fill={q.body} />
      {Array.from({length: 7}).map((_, i) => <path key={i} d={`M ${-L / 2 + 30 + i * 18} ${-h / 3} q 6 ${h / 3} 0 ${h / 1.5}`} stroke="rgba(255,255,255,0.35)" strokeWidth={4} fill="none" />)}
      {Array.from({length: 8}).map((_, i) => <path key={i} d={`M ${-L / 2 + 6} ${-14 + i * 4} q ${-30} ${wig + (i - 4) * 3} ${-48} ${(i - 4) * 6}`} stroke={q.body} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <circle cx={-L / 2 + 22} cy={-12} r={7} fill="#F6E7C8" /><circle cx={-L / 2 + 22} cy={-12} r={3.5} fill={C.abyss} />
    </g>);
  if (q.kind === 'octopus') return (
    <g transform={tr} opacity={o}>
      {Array.from({length: 8}).map((_, i) => { const a = -Math.PI * 0.95 + (i / 7) * Math.PI * 0.9; const L2 = L * 0.7;
        return <path key={i} d={`M ${Math.cos(a) * 20} ${12} C ${Math.cos(a) * L2 * 0.5} ${h * 0.4 + wig} ${Math.cos(a) * L2 * 0.9} ${h * 0.7 - wig} ${Math.cos(a) * L2} ${h * 0.5 + Math.sin(f / 9 + i) * 8}`} stroke={q.body} strokeWidth={13 - i % 2 * 2} fill="none" strokeLinecap="round" />; })}
      <ellipse cx={0} cy={-h * 0.25} rx={L * 0.28} ry={h * 0.42} fill={q.body} />
      <ellipse cx={-L * 0.08} cy={-h * 0.35} rx={L * 0.1} ry={h * 0.16} fill={q.belly} opacity={0.4} />
      {[-1, 1].map((d) => <g key={d}><circle cx={d * L * 0.11} cy={-h * 0.02} r={8} fill="#FBE9C6" /><rect x={d * L * 0.11 - 5} y={-h * 0.02 - 1.5} width={10} height={3} fill={C.abyss} /></g>)}
    </g>);
  if (q.kind === 'shrimp') return (
    <g transform={tr} opacity={o}>
      {Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={-L / 2.6 + i * (L / 7)} cy={Math.sin(i / 1.6) * 10 - 6} rx={L / 9} ry={h / 2.2 - i * 2} fill={i % 2 ? q.body : q.belly} stroke={ink} strokeWidth={1.5} />)}
      <path d={`M ${L / 2.2} 0 L ${L / 2 + 28} ${-22} L ${L / 2 + 28} ${18} Z`} fill={q.body} />
      <path d={`M ${-L / 2.2} -10 Q ${-L} ${-60 + wig} ${-L * 1.1} ${-20}`} stroke={q.body} strokeWidth={3} fill="none" />
      <path d={`M ${-L / 2.2} -4 Q ${-L * 0.9} ${-20 + wig} ${-L} ${10}`} stroke={q.body} strokeWidth={3} fill="none" />
      <circle cx={-L / 2.4} cy={-14} r={5} fill={C.abyss} />
    </g>);
  if (q.kind === 'lobster') return (
    <g transform={tr} opacity={o}>
      {Array.from({length: 6}).map((_, i) => <rect key={i} x={-L / 8 + i * (L / 9)} y={-h / 2.6 + i} width={L / 9 + 2} height={h / 1.3 - i * 2} rx={8} fill={i % 2 ? q.body : q.belly} stroke={ink} strokeWidth={1.5} />)}
      <path d={`M ${L / 2 - 8} 0 L ${L / 2 + 30} ${-26} L ${L / 2 + 22} 0 L ${L / 2 + 30} ${26} Z`} fill={q.body} />
      <ellipse cx={-L / 3.4} cy={0} rx={L / 5} ry={h / 2.2} fill={q.body} stroke={ink} strokeWidth={2} />
      {[-1, 1].map((d) => <path key={d} d={`M ${-L / 2.6} ${d * 8} Q ${-L * 0.9} ${d * (40 + wig)} ${-L * 1.25} ${d * 20}`} stroke={q.body} strokeWidth={5} fill="none" strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={d} d={`M ${-L / 4} ${d * h / 2.4} l -30 ${d * 22} l -26 ${d * -4}`} stroke={q.body} strokeWidth={7} fill="none" strokeLinecap="round" />)}
      <circle cx={-L / 2.4} cy={-10} r={4.5} fill={C.abyss} />
    </g>);
  if (q.kind === 'flat') return (
    <g transform={tr} opacity={o}>
      <ellipse rx={L / 2} ry={h / 2} fill={q.belly} />
      <ellipse rx={L / 2 - 8} ry={h / 2 - 8} fill={q.body} />
      {Array.from({length: 14}).map((_, i) => <circle key={i} cx={-L / 3 + (i % 5) * (L / 7)} cy={-h / 4 + Math.floor(i / 5) * (h / 5)} r={3 + (i % 3)} fill="rgba(2,11,26,0.18)" />)}
      <path d={`M ${L / 2 - 4} 0 L ${L / 2 + 24} -16 L ${L / 2 + 24} 16 Z`} fill={q.body} />
      <circle cx={-L / 3} cy={-h / 8} r={4.5} fill={C.abyss} /><circle cx={-L / 3.6} cy={h / 12} r={4.5} fill={C.abyss} />
    </g>);
  if (q.kind === 'mussel') return (
    <g transform={tr} opacity={o}>
      <path d={`M ${-L / 2} 0 C ${-L / 3} ${-h / 1.6} ${L / 3} ${-h / 1.8} ${L / 2} ${-4} C ${L / 3} ${h / 2.2} ${-L / 4} ${h / 2} ${-L / 2} 0 Z`} fill={q.body} stroke="#7F95C8" strokeWidth={2.5} />
      <path d={`M ${-L / 2 + 10} -2 C ${-L / 4} ${-h / 2.4} ${L / 4} ${-h / 2.4} ${L / 2 - 10} -4`} stroke={q.belly} strokeWidth={4} fill="none" opacity={0.6} />
      <path d={`M ${-L / 3} 4 C 0 ${h / 4} ${L / 4} ${h / 5} ${L / 2 - 6} 2`} stroke="#4E6A9E" strokeWidth={3} fill="none" opacity={0.6} />
    </g>);
  if (q.kind === 'clam' || q.kind === 'oyster') return (
    <g transform={tr} opacity={o}>
      <path d={q.kind === 'oyster' ? `M ${-L / 2} ${h / 6} C ${-L / 2.4} ${-h / 1.6} ${L / 3} ${-h / 1.4} ${L / 2} ${-h / 6} C ${L / 2.2} ${h / 2} ${-L / 3} ${h / 1.8} ${-L / 2} ${h / 6} Z` : `M ${-L / 2} ${h / 6} C ${-L / 2} ${-h / 1.5} ${L / 2} ${-h / 1.5} ${L / 2} ${h / 6} C ${L / 3} ${h / 2} ${-L / 3} ${h / 2} ${-L / 2} ${h / 6} Z`} fill={q.body} stroke={ink} strokeWidth={2} />
      {Array.from({length: q.kind === 'oyster' ? 5 : 7}).map((_, i) => <path key={i} d={`M 0 ${h / 3} L ${(-0.45 + i * (0.9 / (q.kind === 'oyster' ? 4 : 6))) * L} ${-h / 2.6}`} stroke={q.belly} strokeWidth={3} opacity={0.55} />)}
      {Array.from({length: 3}).map((_, i) => <path key={i} d={`M ${-L / 2.4 + i * 6} ${h / 8 - i * 10} Q 0 ${-h / 2.2 + i * 12} ${L / 2.4 - i * 6} ${h / 8 - i * 10}`} stroke={q.belly} strokeWidth={2} fill="none" opacity={0.5} />)}
    </g>);
  if (q.kind === 'razor') return (
    <g transform={tr} opacity={o}>
      <rect x={-L / 2} y={-h / 2} width={L} height={h} rx={h / 2} fill={q.body} stroke={ink} strokeWidth={2} />
      {Array.from({length: 9}).map((_, i) => <line key={i} x1={-L / 2 + 14 + i * (L / 10)} x2={-L / 2 + 14 + i * (L / 10)} y1={-h / 2 + 4} y2={h / 2 - 4} stroke={q.belly} strokeWidth={2} opacity={0.6} />)}
    </g>);
  const tailD = q.tail === 'fork' ? `M ${L / 2 - 6} 0 L ${L / 2 + 38} ${-h / 1.3 + wig} L ${L / 2 + 18} 0 L ${L / 2 + 38} ${h / 1.3 + wig} Z` : q.tail === 'round' ? `M ${L / 2 - 8} 0 C ${L / 2 + 24} ${-h / 1.6 + wig} ${L / 2 + 40} ${-h / 3} ${L / 2 + 40} 0 C ${L / 2 + 40} ${h / 3} ${L / 2 + 24} ${h / 1.6 + wig} ${L / 2 - 8} 0 Z` : `M ${L / 2 - 6} 0 L ${L / 2 + 34} ${-h / 1.5 + wig} L ${L / 2 + 22} 0 L ${L / 2 + 34} ${h / 1.5 + wig} Z`;
  return (
    <g transform={tr} opacity={o}>
      <path d={tailD} fill={q.fin ?? q.body} />
      {q.spiky ? <path d={`M ${-L / 4} ${-h / 2 + 6} ${Array.from({length: 9}).map((_, i) => `L ${-L / 4 + i * (L / 13)} ${-h / 2 - 14 - (i % 2) * 10} L ${-L / 4 + i * (L / 13) + L / 26} ${-h / 2 + 4}`).join(' ')} L ${L / 3} ${-h / 2 + 8} Z`} fill={q.fin ?? q.body} />
        : <path d={`M ${-L / 6} ${-h / 2 + 4} Q ${L / 8} ${-h - 10} ${L / 3} ${-h / 2 + 8} Z`} fill={q.fin ?? q.body} />}
      <path d={`M ${-L / 2} 0 C ${-L / 3} ${-h} ${L / 3} ${-h} ${L / 2} 0 C ${L / 3} ${h} ${-L / 3} ${h} ${-L / 2} 0 Z`} fill={q.body} />
      <path d={`M ${-L / 2 + 8} 4 C ${-L / 3} ${h * 0.75} ${L / 3} ${h * 0.75} ${L / 2 - 4} 4 Z`} fill={q.belly} />
      {q.bands && Array.from({length: 5}).map((_, i) => <path key={i} d={`M ${-L / 5 + i * (L / 9)} ${-h / 2 + 6} q 8 ${h / 3} 0 ${h / 1.8}`} stroke={q.bands} strokeWidth={6} fill="none" opacity={0.75} />)}
      {q.stripe && <path d={`M ${-L / 2.6} -2 Q 0 ${-8} ${L / 2.4} -2`} stroke={q.stripe} strokeWidth={6} fill="none" strokeLinecap="round" />}
      {q.spot && <circle cx={q.kind === undefined && sp === 'sanpietro' ? 0 : -L / 6} cy={sp === 'sanpietro' ? 0 : -h / 4} r={sp === 'sanpietro' ? h / 7 : h / 10} fill={q.spot} opacity={0.85} />}
      {q.brow && <path d={`M ${-L / 2.9} ${-h / 3} Q ${-L / 3.6} ${-h / 2.2} ${-L / 4.6} ${-h / 3}`} stroke={q.brow} strokeWidth={7} fill="none" strokeLinecap="round" />}
      {sp === 'gallinella' && <path d={`M ${-L / 5} ${h / 6} q 40 ${30 + wig} 70 ${10}`} stroke={q.fin} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.9} />}
      {q.sword && <path d={`M ${-L / 2 + 4} -3 L ${-L / 2 - 90} -1 L ${-L / 2 + 4} 4 Z`} fill={q.fin} />}
      <circle cx={-L / 2.9} cy={-h / 7} r={Math.max(5, h / 9)} fill="#fff" />
      <circle cx={-L / 2.9} cy={-h / 7} r={Math.max(3, h / 15)} fill={C.abyss} />
      <path d={`M ${-L / 4.2} ${-h / 2.6} Q ${-L / 5.4} 0 ${-L / 4.2} ${h / 2.6}`} stroke={ink} strokeWidth={3} fill="none" />
    </g>
  );
};

/* ───────── barca vettoriale ───────── */
export const Boat: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string; o?: number}> = ({x, y, s = 1, rot = 0, color = C.foam, o = 1}) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 8 + x / 50) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot + Math.sin(f / 11 + y) * 3}) scale(${s})`} opacity={o}>
      <path d="M -26 0 H 26 L 18 12 H -18 Z" fill={color} />
      <rect x={-6} y={-16} width={16} height={16} rx={2} fill={color} opacity={0.85} />
      <path d="M -2 -16 V -30 M -2 -30 L 18 -2" stroke={color} strokeWidth={2.5} />
    </g>
  );
};

/* ───────── camion vettoriale ───────── */
export const Truck: React.FC<{x: number; y: number; s?: number; cold?: boolean}> = ({x, y, s = 1, cold = true}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-170} y={-110} width={230} height={120} rx={10} fill="#E8F3FA" />
      <rect x={-170} y={-110} width={230} height={14} rx={6} fill={C.sea} />
      {cold && <g transform="translate(-55 -50)"><Icon name="snow" size={70} color={C.sea} sw={6} /></g>}
      <path d="M 66 -80 H 130 L 168 -36 V 10 H 66 Z" fill={C.coral} />
      <path d="M 82 -70 H 126 L 154 -38 H 82 Z" fill="#BFE3F5" />
      {[-120, 10, 120].map((cx, i) => (
        <g key={i} transform={`translate(${cx} 14) rotate(${f * 12})`}>
          <circle r={24} fill="#1A2533" />
          <circle r={10} fill="#8DA2B5" />
          <rect x={-2} y={-22} width={4} height={14} fill="#8DA2B5" />
        </g>
      ))}
    </g>
  );
};
