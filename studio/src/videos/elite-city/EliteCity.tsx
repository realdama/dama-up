// ELITE CITY — video originale in stile "Miami anni '80" (omaggio di genere, nessun elemento del gioco)
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/monoton/400.css';
import '@fontsource/kaushan-script/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';

const W = 1080, H = 1920, FPS = 30;
export const BAR = (60 / 110) * 4 * FPS; // 65.45 frame per battuta
export const ELITE_FRAMES = Math.round(26 * BAR + 3 * FPS);
const P = {night: '#12022B', purple: '#2A0A55', violet: '#5B1A9E', magenta: '#FF2E97', pink: '#FF77D9', cyan: '#2DE2E6', orange: '#FF9A3C', yellow: '#FFE45E', red: '#E8132B'};
const NEON = 'Monoton, sans-serif', SCRIPT = '"Kaushan Script", cursive', HUD = 'Orbitron, sans-serif', SANS = 'Montserrat, sans-serif';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ez = (f: number, a: number, b: number, x = 0, y = 1) => interpolate(f, [a, b], [x, y], {...cl, easing: Easing.bezier(0.22, 1, 0.36, 1)});
const rnd = (s: number) => { const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const useSpr = (at: number, d = 12) => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return spring({frame: f - at, fps, config: {damping: d, stiffness: 140, mass: 0.7}}); };
const img = (n: string) => staticFile(`elite/${n}.png`);

/* ───── elementi di scena ───── */
const Sky: React.FC<{night?: number}> = ({night = 0}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${P.night} 0%, ${P.purple} 28%, ${P.violet} 46%, ${night > 0.5 ? '#7A1F8F' : P.magenta} 62%, ${night > 0.5 ? '#B8306E' : P.orange} 78%, ${P.yellow} 100%)`}} />
);
const Stars: React.FC = () => {
  const f = useCurrentFrame();
  return <svg width={W} height={H} style={{position: 'absolute'}}>{Array.from({length: 70}).map((_, i) => (
    <circle key={i} cx={rnd(i) * W} cy={rnd(i + 7) * 700} r={1 + rnd(i + 3) * 2.4} fill="#fff" opacity={0.3 + 0.7 * Math.abs(Math.sin(f / 18 + i))} />
  ))}</svg>;
};
const RetroSun: React.FC<{y: number; r?: number}> = ({y, r = 300}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.yellow} /><stop offset="0.55" stopColor={P.orange} /><stop offset="1" stopColor={P.magenta} /></linearGradient>
        <clipPath id="sunc"><circle cx={W / 2} cy={y} r={r} /></clipPath>
      </defs>
      <circle cx={W / 2} cy={y} r={r * 1.35} fill={P.magenta} opacity={0.18} />
      <g clipPath="url(#sunc)">
        <rect x={0} y={y - r} width={W} height={r * 2} fill="url(#sun)" />
        {Array.from({length: 8}).map((_, i) => {
          const yy = y + r * 0.05 + i * r * 0.13 + ((f * 0.6) % (r * 0.13));
          return <rect key={i} x={0} y={yy} width={W} height={4 + i * 3.2} fill={P.purple} />;
        })}
      </g>
    </svg>
  );
};
const Ocean: React.FC<{y: number}> = ({y}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs><linearGradient id="oc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B0F70" /><stop offset="1" stopColor={P.night} /></linearGradient></defs>
      <rect x={0} y={y} width={W} height={H - y} fill="url(#oc)" />
      {Array.from({length: 26}).map((_, i) => {
        const yy = y + 8 + i * i * 2.2;
        const w = 120 + i * 30;
        return <rect key={i} x={W / 2 - w / 2 + Math.sin(f / 14 + i) * 30} y={yy} width={w} height={3 + i * 0.5} rx={2} fill={i % 3 ? P.orange : P.pink} opacity={0.75 - i * 0.025} />;
      })}
    </svg>
  );
};
const Palm: React.FC<{x: number; y: number; s?: number; flip?: boolean; c?: string}> = ({x, y, s = 1, flip, c = '#0A0118'}) => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 22 + x) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M 0 0 C 10 -150, 30 -300, 60 -460" stroke={c} strokeWidth={26} fill="none" strokeLinecap="round" />
      <g transform={`translate(60 -460) rotate(${sway})`}>
        {[-160, -120, -75, -30, 15, 55, 100, 140].map((a, i) => (
          <path key={i} transform={`rotate(${a})`} d="M 0 0 C 60 -30, 140 -20, 210 40 C 150 0, 70 0, 0 12 Z" fill={c} />
        ))}
        <circle r={16} fill={c} />
      </g>
    </g>
  );
};
const Skyline: React.FC<{y: number; o?: number}> = ({y, o = 1}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
      {Array.from({length: 16}).map((_, i) => {
        const w = 60 + rnd(i) * 70, h = 160 + rnd(i + 2) * 420, x = i * 72 - 20;
        return (
          <g key={i}>
            <rect x={x} y={y - h} width={w} height={h} fill="#1C0640" stroke={i % 4 ? 'none' : P.cyan} strokeWidth={2} />
            {Array.from({length: Math.floor(h / 36)}).map((_, k) => Array.from({length: 3}).map((_, j) => (
              <rect key={`${k}-${j}`} x={x + 10 + j * (w - 20) / 3} y={y - h + 16 + k * 36} width={10} height={14}
                fill={rnd(i * 31 + k * 7 + j + Math.floor(f / 40)) > 0.55 ? (rnd(i + k) > 0.5 ? P.pink : P.yellow) : '#2A0A55'} />
            )))}
          </g>
        );
      })}
    </svg>
  );
};
/** scanline VHS + grana */
const VHS: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(10,0,25,0.75) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: (f * 9) % (H + 200) - 100, height: 70, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.05), transparent)'}} />
    </AbsoluteFill>
  );
};
const NeonText: React.FC<{text: string; font?: string; size: number; color: string; at?: number; flicker?: boolean; style?: React.CSSProperties}> = ({text, font = NEON, size, color, at = 0, flicker, style}) => {
  const f = useCurrentFrame();
  const on = ez(f, at, at + 14);
  const fl = flicker && f - at < 30 ? (rnd(Math.floor(f / 2)) > 0.35 ? 1 : 0.25) : 1;
  return (
    <div style={{fontFamily: font, fontSize: size, color: '#fff', lineHeight: 1, opacity: on * fl, whiteSpace: 'nowrap',
      textShadow: `0 0 6px ${color}, 0 0 18px ${color}, 0 0 42px ${color}, 0 0 80px ${color}, 0 6px 0 ${color}`, ...style}}>{text}</div>
  );
};

/* ───── 1. INTRO: titolo al tramonto ───── */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = useSpr(BAR * 1, 9), t2 = useSpr(BAR * 2, 10);
  return (
    <AbsoluteFill>
      <Sky /><Stars /><RetroSun y={1100} r={320} /><Ocean y={1180} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Palm x={-30} y={1500} s={1.5} /><Palm x={1120} y={1560} s={1.7} flip /><Palm x={180} y={1330} s={0.8} c="#1A0533" />
      </svg>
      <div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', transform: `scale(${0.6 + 0.4 * t1})`}}>
        <NeonText text="ELITE" size={210} color={P.magenta} at={BAR * 1} flicker />
      </div>
      <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', transform: `rotate(-7deg) translateX(${(1 - t2) * 600}px)`}}>
        <NeonText text="City" font={SCRIPT} size={190} color={P.cyan} at={BAR * 2} />
      </div>
      <div style={{position: 'absolute', top: 800, width: '100%', textAlign: 'center', fontFamily: HUD, fontWeight: 700, fontSize: 46, letterSpacing: 26, color: P.yellow, opacity: ez(f, BAR * 3, BAR * 3 + 15), textShadow: `0 0 20px ${P.orange}`}}>1 9 8 6</div>
    </AbsoluteFill>
  );
};

/* ───── 2. LOCANDINE ───── */
const Panel: React.FC<{src: string; at: number; x: number; y: number; w: number; h: number; rot: number; label: string; color: string; pos?: string; fit?: 'cover' | 'contain'; bg?: string}> = ({src, at, x, y, w, h, rot, label, color, pos = 'center', fit = 'cover', bg}) => {
  const s = useSpr(at, 11);
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) translateY(${(1 - s) * 1400}px)`, border: '10px solid #fff', boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 4px ${color}`,
      background: bg ?? `linear-gradient(160deg, ${color}, ${P.violet})`, overflow: 'hidden'}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: fit, objectPosition: pos, transform: `scale(${1.08 - 0.08 * ez(f, at, at + 120)})`}} />
      <div style={{position: 'absolute', left: 18, bottom: 14, fontFamily: SCRIPT, fontSize: 64, color: '#fff', textShadow: `0 0 14px ${color}, 0 4px 0 #000`}}>{label}</div>
    </div>
  );
};
const Posters: React.FC = () => {
  const b = BAR / 2;
  return (
    <AbsoluteFill style={{background: `linear-gradient(135deg, ${P.orange}, ${P.magenta} 45%, ${P.violet})`}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 3px, transparent 3.5px)', backgroundSize: '22px 22px'}} />
      <Panel src={img('ritratto')} at={4} x={60} y={120} w={960} h={860} rot={-3} label="Il boss" color={P.cyan} pos="center 20%" />
      <Panel src={img('poster_tu_cane')} at={4 + b * 2} x={40} y={1010} w={520} h={800} rot={4} label="La squadra" color={P.yellow} fit="contain" bg={`linear-gradient(170deg, #FFB86B, ${P.magenta})`} />
      <Panel src={img('cane_ritratto')} at={4 + b * 4} x={560} y={1060} w={480} h={720} rot={-5} label="Il socio" color={P.pink} pos="center 30%" />
    </AbsoluteFill>
  );
};

/* ───── personaggio: testa (foto) su corpo disegnato in camicia ───── */
const Hero: React.FC<{x: number; y: number; s?: number; baton?: boolean}> = ({x, y, s = 1, baton = true}) => {
  const f = useCurrentFrame();
  const sw = Math.sin(f / 10) * 3;
  return (
    <div style={{position: 'absolute', left: x - 50, top: y, width: 520, height: 1000, transform: `scale(${s})`, transformOrigin: 'top center'}}>
      <svg width={520} height={880} style={{position: 'absolute', top: 285}} viewBox="0 0 420 980" preserveAspectRatio="none">
        <defs>
          <pattern id="shirt" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill={P.pink} />
            <path d="M 10 60 C 25 30, 50 25, 70 10 C 55 35, 35 45, 10 60 Z" fill="#18A999" />
            <circle cx="62" cy="58" r="9" fill={P.yellow} />
            <path d="M 50 70 C 58 62, 70 64, 78 72" stroke="#18A999" strokeWidth="4" fill="none" />
          </pattern>
        </defs>
        {/* gambe */}
        <path d="M 120 430 L 100 900 L 175 900 L 205 520 L 235 900 L 310 900 L 290 430 Z" fill="#F4F1EA" stroke="#12022B" strokeWidth="6" />
        <path d="M 95 890 h 85 v 30 h -95 Z M 230 890 h 85 v 30 h -85 Z" fill="#12022B" />
        {/* busto in camicia aperta */}
        <path d="M 60 70 C 110 30, 300 30, 350 70 L 330 440 L 80 440 Z" fill="url(#shirt)" stroke="#12022B" strokeWidth="6" />
        <path d="M 170 40 L 210 170 L 250 40" fill="#C98A6B" stroke="#12022B" strokeWidth="5" />
        <path d="M 160 38 L 210 175 L 175 120 Z M 260 38 L 210 175 L 245 120 Z" fill="#fff" stroke="#12022B" strokeWidth="5" />
        <path d="M 196 160 C 200 210, 205 260, 208 300" stroke="#E8C547" strokeWidth="5" fill="none" />
        {/* braccia */}
        <path d="M 62 75 C 20 160, 25 300, 50 400" stroke="#12022B" strokeWidth="64" fill="none" strokeLinecap="round" />
        <path d="M 62 75 C 20 160, 25 300, 50 400" stroke="url(#shirt)" strokeWidth="52" fill="none" strokeLinecap="round" />
        <circle cx={50} cy={415} r={26} fill="#C98A6B" stroke="#12022B" strokeWidth="5" />
        <g transform={`rotate(${sw} 360 80)`}>
          <path d="M 348 75 C 395 160, 390 290, 370 390" stroke="#12022B" strokeWidth="64" fill="none" strokeLinecap="round" />
          <path d="M 348 75 C 395 160, 390 290, 370 390" stroke="url(#shirt)" strokeWidth="52" fill="none" strokeLinecap="round" />
          <circle cx={370} cy={405} r={26} fill="#C98A6B" stroke="#12022B" strokeWidth="5" />
          {baton && <g transform="translate(370 405) rotate(-28)">
            <rect x={-9} y={-20} width={18} height={250} rx={8} fill="#111" stroke={P.cyan} strokeWidth={3} />
            <rect x={-12} y={10} width={24} height={60} rx={6} fill="#2a2a2a" />
            <rect x={-20} y={60} width={40} height={10} rx={4} fill="#333" />
          </g>}
        </g>
      </svg>
      <Img src={img('testa')} style={{position: 'absolute', left: 95, top: 0, width: 330}} />
    </div>
  );
};

/* ───── 3. YACHT ───── */
const Yacht: React.FC = () => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 16) * 10, roll = Math.sin(f / 21) * 1.5;
  const sign = useSpr(BAR * 1, 10);
  return (
    <AbsoluteFill>
      <Sky /><Stars /><RetroSun y={760} r={260} /><Ocean y={880} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Palm x={980} y={900} s={0.7} flip c="#2A0A55" />
        {Array.from({length: 7}).map((_, i) => <path key={i} d={`M ${-200 + ((f * 6 + i * 180) % 1400)} ${1500 + i * 14} q 40 -16 80 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.35} />)}
      </svg>
      <div style={{position: 'absolute', left: -60, top: 1180 + bob, width: 1200, transform: `rotate(${roll}deg)`}}>
        <svg width={1200} height={560} viewBox="0 0 1200 560">
          <path d="M 40 220 L 1160 220 L 1040 420 L 150 420 Z" fill="#F7F4EE" stroke="#12022B" strokeWidth={8} />
          <path d="M 70 270 L 1120 270" stroke={P.magenta} strokeWidth={16} />
          <path d="M 90 300 L 1100 300" stroke={P.cyan} strokeWidth={10} />
          <path d="M 260 220 L 330 110 L 820 110 L 900 220 Z" fill="#EDE9F5" stroke="#12022B" strokeWidth={8} />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={360 + i * 75} y={135} width={58} height={50} rx={10} fill="#3B0F70" stroke="#12022B" strokeWidth={4} />)}
          <path d="M 420 110 L 470 40 L 700 40 L 740 110 Z" fill="#fff" stroke="#12022B" strokeWidth={7} />
          <line x1={590} y1={40} x2={590} y2={-60} stroke="#12022B" strokeWidth={6} />
          <path d="M 590 -60 L 650 -40 L 590 -20 Z" fill={P.magenta} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => <circle key={i} cx={130 + i * 85} cy={360} r={9} fill="#3B0F70" />)}
          <path d="M 950 220 L 1140 180" stroke="#12022B" strokeWidth={5} />
        </svg>
      </div>
      <Hero x={420} y={500 + bob} s={0.82} baton={false} />
      <Img src={img('cane_testa')} style={{position: 'absolute', left: 230, top: 1060 + bob, width: 230, transform: `rotate(${-4 + Math.sin(f / 9) * 3}deg)`}} />
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', transform: `scale(${sign})`}}>
        <NeonText text="YACHT" size={150} color={P.cyan} at={BAR * 1} flicker />
        <NeonText text="Club" font={SCRIPT} size={130} color={P.magenta} at={BAR * 1 + 10} style={{marginTop: 10, transform: 'rotate(-6deg)'}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───── 4. SUPERCAR SUL VIALE ───── */
const Car: React.FC = () => {
  const f = useCurrentFrame();
  const bounce = Math.abs(Math.sin(f / 4)) * 4;
  const enter = ez(f, 0, 40, -900, 0);
  return (
    <AbsoluteFill>
      <Sky night={1} /><Stars /><RetroSun y={760} r={220} /><Skyline y={980} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <rect x={0} y={980} width={W} height={940} fill="#160433" />
        {/* strada in prospettiva */}
        <path d={`M 470 980 L 610 980 L 1300 ${H} L -220 ${H} Z`} fill="#24074A" />
        {Array.from({length: 10}).map((_, i) => {
          const t = ((i / 10 + f / 40) % 1);
          const y = 980 + t * t * 940, w = 6 + t * 40, h = 10 + t * 120;
          return <rect key={i} x={540 - w / 2} y={y} width={w} height={h} fill={P.yellow} opacity={0.9} />;
        })}
        <path d={`M 470 980 L -220 ${H}`} stroke={P.magenta} strokeWidth={8} />
        <path d={`M 610 980 L 1300 ${H}`} stroke={P.cyan} strokeWidth={8} />
        {Array.from({length: 6}).map((_, i) => {
          const t = ((i / 6 + f / 55) % 1);
          const s = 0.15 + t * t * 1.6;
          return (
            <g key={i}>
              <Palm x={470 - t * t * 900} y={980 + t * t * 860} s={s} />
              <Palm x={610 + t * t * 900} y={980 + t * t * 860} s={s} flip />
            </g>
          );
        })}
      </svg>
      {/* auto (vista laterale) */}
      <div style={{position: 'absolute', left: 4 + enter, top: 1200 - bounce, width: 1020, transform: 'scale(1.05)', transformOrigin: 'left top'}}>
        <svg width={1020} height={420} viewBox="0 0 1020 420">
          {Array.from({length: 8}).map((_, i) => <line key={i} x1={-200 - i * 40} x2={-20} y1={170 + i * 22} y2={170 + i * 22} stroke="#fff" strokeWidth={4} opacity={0.4} transform={`translate(${-(f * 30 + i * 70) % 220} 0)`} />)}
          <path d="M 30 300 L 40 230 C 120 210, 220 200, 300 190 L 420 120 C 520 100, 640 100, 720 130 L 860 190 C 940 200, 990 220, 1000 250 L 995 300 Z" fill={P.red} stroke="#12022B" strokeWidth={8} />
          <path d="M 440 128 C 520 112, 620 112, 700 138 L 780 186 L 380 190 Z" fill="#1A0533" stroke="#12022B" strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={560 + i * 6} x2={880 + i * 2} y1={215 + i * 13} y2={215 + i * 13} stroke="#7A0A18" strokeWidth={6} />)}
          <path d="M 40 245 L 1000 245" stroke="#FF5A6E" strokeWidth={4} opacity={0.7} />
          <rect x={970} y={235} width={30} height={16} rx={4} fill={P.yellow} />
          <rect x={30} y={240} width={26} height={16} rx={4} fill="#FF3355" />
          {[220, 820].map((cx) => (
            <g key={cx} transform={`translate(${cx} 305)`}>
              <circle r={70} fill="#0A0118" stroke="#12022B" strokeWidth={6} />
              <g transform={`rotate(${f * 40})`}>{[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-6} y={-52} width={12} height={46} rx={4} fill="#C7C7D1" transform={`rotate(${a})`} />)}</g>
              <circle r={14} fill="#C7C7D1" />
            </g>
          ))}
        </svg>
        <Img src={img('testa')} style={{position: 'absolute', left: 500, top: -40, width: 190, transform: 'scaleX(-1)'}} />
        <Img src={img('cane_testa')} style={{position: 'absolute', left: 340, top: -10, width: 150, transform: `rotate(${Math.sin(f / 5) * 5}deg)`}} />
      </div>
      <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center'}}>
        <NeonText text="Ocean Drive" font={SCRIPT} size={140} color={P.magenta} at={BAR * 0.5} flicker style={{transform: 'rotate(-5deg)'}} />
        <NeonText text="ROSSO FUOCO · V12" font={HUD} size={46} color={P.cyan} at={BAR * 1.5} style={{marginTop: 36, letterSpacing: 8, fontWeight: 900}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───── 5. HUD: manganello e soldi ───── */
const Money: React.FC = () => {
  const f = useCurrentFrame();
  const steps = [0, 125000, 870000, 2500000, 4800000, 7300000, 9100000, 9999999];
  const idx = Math.min(steps.length - 1, Math.floor(f / (BAR / 2)));
  const prev = steps[Math.max(0, idx - 1)], cur = steps[idx];
  const v = Math.round(prev + (cur - prev) * ez(f % (BAR / 2), 0, 14));
  const money = '$' + String(Math.min(9999999, v));
  const bigToCorner = ez(f, BAR * 3.2, BAR * 3.8);
  const pop = 1 + 0.08 * Math.max(0, 1 - (f % (BAR / 2)) / 8);
  const baton = useSpr(10, 9);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${P.night}, #2A0A55 60%, #4B0F6B)`}} />
      <Stars /><Skyline y={1600} o={0.9} />
      {/* pioggia di banconote */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 26}).map((_, i) => {
          const y = ((f * (6 + rnd(i) * 6) + rnd(i + 1) * 2000) % 2200) - 200;
          const x = rnd(i + 2) * W + Math.sin(f / 15 + i) * 40;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${f * (2 + rnd(i) * 3) + i * 40})`} opacity={ez(f, 20, 40)}>
              <rect x={-55} y={-26} width={110} height={52} rx={6} fill="#5FD068" stroke="#1E6B2A" strokeWidth={4} />
              <circle r={15} fill="#9BE7A1" /><text y={8} textAnchor="middle" fontFamily={HUD} fontWeight={900} fontSize={22} fill="#1E6B2A">$</text>
            </g>
          );
        })}
      </svg>
      {/* slot arma + barre (stile HUD originale) */}
      <div style={{position: 'absolute', right: 40, top: 70, display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${baton})`, transformOrigin: 'top right'}}>
        <div style={{textAlign: 'right'}}>
          <div style={{fontFamily: HUD, fontWeight: 900, fontSize: 30, color: P.cyan, textShadow: `0 0 10px ${P.cyan}`}}>MANGANELLO</div>
          <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12}}>
            <div style={{width: 200, height: 18, border: `3px solid #fff`, background: P.magenta, boxShadow: `0 0 12px ${P.magenta}`}} />
          </div>
          <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8}}>
            <div style={{width: 200, height: 18, border: `3px solid #fff`, background: `linear-gradient(90deg, ${P.cyan} 75%, transparent 75%)`}} />
          </div>
        </div>
        <div style={{width: 170, height: 170, borderRadius: 85, border: `6px solid #fff`, background: `radial-gradient(${P.violet}, ${P.night})`, boxShadow: `0 0 30px ${P.pink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={120} height={120} viewBox="-60 -60 120 120"><g transform={`rotate(${-40 + Math.sin(f / 6) * 8})`}>
            <rect x={-8} y={-55} width={16} height={100} rx={7} fill="#111" stroke={P.cyan} strokeWidth={3} />
            <rect x={-11} y={10} width={22} height={34} rx={5} fill="#333" /><rect x={-18} y={5} width={36} height={8} rx={3} fill="#444" /></g></svg>
        </div>
      </div>
      {/* contatore soldi: prima al centro, poi nell'angolo */}
      <div style={{position: 'absolute', left: interpolate(bigToCorner, [0, 1], [W / 2, W - 50]), top: interpolate(bigToCorner, [0, 1], [880, 420]),
        transform: `translate(${interpolate(bigToCorner, [0, 1], [-50, -100])}%, -50%) scale(${interpolate(bigToCorner, [0, 1], [1, 0.55]) * pop})`, transformOrigin: 'right center'}}>
        <div style={{fontFamily: HUD, fontWeight: 900, fontSize: 150, color: '#7CFF8A', letterSpacing: 4, whiteSpace: 'nowrap',
          textShadow: '0 0 12px #2BFF5A, 0 0 40px #2BFF5A, 0 8px 0 #0B3D16, 4px 4px 0 #000'}}>{money}</div>
      </div>
      <div style={{position: 'absolute', top: 1060, width: '100%', textAlign: 'center', opacity: ez(f, BAR * 3.5, BAR * 3.9)}}>
        <NeonText text="Soldi a palate" font={SCRIPT} size={130} color={P.magenta} at={BAR * 3.5} style={{transform: 'rotate(-5deg)'}} />
      </div>
      <Hero x={330} y={1180 - ez(f, BAR * 3, BAR * 3.6) * 60} s={0.62} />
    </AbsoluteFill>
  );
};

/* ───── 6. IL SOCIO (cane) ───── */
const Socio: React.FC = () => {
  const f = useCurrentFrame();
  const s = useSpr(4, 10);
  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 50% at 50% 45%, ${P.magenta}, ${P.violet} 55%, ${P.night})`}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>{Array.from({length: 24}).map((_, i) => (
        <line key={i} x1={W / 2} y1={860} x2={W / 2 + Math.cos(i / 24 * Math.PI * 2 + f / 60) * 1600} y2={860 + Math.sin(i / 24 * Math.PI * 2 + f / 60) * 1600} stroke={i % 2 ? P.pink : P.cyan} strokeWidth={30} opacity={0.12} />
      ))}</svg>
      <div style={{position: 'absolute', left: 140, top: 420, width: 800, height: 900, borderRadius: 40, overflow: 'hidden', border: '12px solid #fff', boxShadow: `0 0 0 6px ${P.cyan}, 0 0 80px ${P.cyan}`, transform: `scale(${s}) rotate(${(1 - s) * 10}deg)`}}>
        <Img src={img('cane_ritratto')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%'}} />
      </div>
      <div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center'}}><NeonText text="IL SOCIO" size={130} color={P.cyan} at={6} flicker /></div>
      <div style={{position: 'absolute', top: 1400, width: '100%', textAlign: 'center'}}><NeonText text="fedele sempre" font={SCRIPT} size={110} color={P.pink} at={BAR * 0.8} style={{transform: 'rotate(-5deg)'}} /></div>
    </AbsoluteFill>
  );
};

/* ───── 7. FINALE ───── */
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const r = useSpr(6, 12);
  return (
    <AbsoluteFill>
      <Sky /><Stars /><RetroSun y={1150} r={360} /><Ocean y={1240} />
      <svg width={W} height={H} style={{position: 'absolute'}}><Palm x={-40} y={1600} s={1.6} /><Palm x={1130} y={1640} s={1.7} flip /></svg>
      <Img src={img('ritratto')} style={{position: 'absolute', left: 60, top: 620, width: 960, transform: `translateY(${(1 - r) * 500}px)`, filter: `drop-shadow(0 0 30px ${P.magenta})`}} />
      <div style={{position: 'absolute', top: 160, width: '100%', textAlign: 'center'}}>
        <NeonText text="MISSIONE" font={HUD} size={92} color={P.yellow} at={BAR * 1} style={{fontWeight: 900, letterSpacing: 10}} />
        <NeonText text="COMPIUTA" font={HUD} size={92} color={P.yellow} at={BAR * 1 + 6} style={{fontWeight: 900, letterSpacing: 10, marginTop: 12}} />
        <div style={{fontFamily: HUD, fontWeight: 900, fontSize: 64, color: '#7CFF8A', marginTop: 30, opacity: ez(f, BAR * 1.6, BAR * 1.9), textShadow: '0 0 20px #2BFF5A, 4px 4px 0 #000'}}>$9999999</div>
      </div>
      <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', opacity: ez(f, BAR * 2.2, BAR * 2.6)}}>
        <NeonText text="ELITE" size={120} color={P.magenta} at={BAR * 2.2} />
        <NeonText text="City" font={SCRIPT} size={110} color={P.cyan} at={BAR * 2.4} style={{transform: 'rotate(-7deg)', marginTop: -10}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───── montaggio ───── */
const Cut: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const flash = Math.max(0, 1 - f / 6);
  const glitch = f < 8 ? (rnd(f) - 0.5) * 40 : 0;
  const out = interpolate(f, [dur - 6, dur], [1, 0.4], cl);
  return (
    <AbsoluteFill style={{transform: `translateX(${glitch}px)`, opacity: out}}>
      {children}
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.7, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
export const EliteCity: React.FC = () => {
  const f = useCurrentFrame();
  const B = (n: number) => Math.round(n * BAR);
  const scenes: [number, number, React.FC][] = [[0, 4, Intro], [4, 8, Posters], [8, 12, Yacht], [12, 16, Car], [16, 20, Money], [20, 22, Socio], [22, 27, Outro]];
  const pulse = 1 + 0.012 * Math.max(0, 1 - (f % (BAR / 4)) / 6) * (f > B(4) ? 1 : 0);
  return (
    <AbsoluteFill style={{background: P.night}}>
      <AbsoluteFill style={{transform: `scale(${pulse})`}}>
        {scenes.map(([a, b, C], i) => (
          <Sequence key={i} from={B(a)} durationInFrames={Math.min(ELITE_FRAMES, B(b)) - B(a)}>
            <Cut dur={Math.min(ELITE_FRAMES, B(b)) - B(a)}><C /></Cut>
          </Sequence>
        ))}
      </AbsoluteFill>
      <VHS />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [ELITE_FRAMES - 40, ELITE_FRAMES], [0, 1], cl)}} />
      <Audio src={staticFile('elite/music.wav')} />
      <Sequence from={0} durationInFrames={B(4)}><Audio src={staticFile('elite/waves.wav')} volume={0.35} /></Sequence>
      <Sequence from={B(8)} durationInFrames={B(4)}><Audio src={staticFile('elite/waves.wav')} volume={0.3} /></Sequence>
      <Sequence from={B(12)}><Audio src={staticFile('elite/engine.wav')} volume={0.55} /></Sequence>
      {Array.from({length: 7}).map((_, i) => (
        <Sequence key={i} from={B(16) + Math.round((i + 1) * BAR / 2)} durationInFrames={30}><Audio src={staticFile('elite/cash.wav')} volume={0.4} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
