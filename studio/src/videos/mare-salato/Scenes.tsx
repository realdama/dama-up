import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {C, FONT, MONO, Sea, Crystal, Ion, Drop, Cloud, Sun, Pill, Counter, ease, rand, useSpring, clamp} from '../../lib/kit';

export type SceneData = {id: string; start: number; dur: number; words: {w: string; start: number; end: number}[]};
export type SceneProps = {sc: SceneData; offset: number};

/** frame locale in cui viene pronunciata una parola (prima occorrenza dopo `after`) */
export const useCue = ({sc, offset}: SceneProps) => {
  const {fps} = useVideoConfig();
  return (word: string, nth = 0) => {
    const hits = sc.words.filter((w) => w.w.toLowerCase().startsWith(word.toLowerCase()));
    const w = hits[Math.min(nth, hits.length - 1)];
    return w ? Math.round((w.start - sc.start) * fps) + offset : 0;
  };
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {children}
  </svg>
);

/* ───────────── 1. HOOK ───────────── */
export const Hook: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const rise = useSpring(4, {damping: 11});
  const burst = f - cue('Salatissimo');
  const q = useSpring(cue('sale', 1), {damping: 8, stiffness: 160});
  const sal = useSpring(cue('Salatissimo'), {damping: 9});
  const shake = burst > 0 && burst < 18 ? Math.sin(burst * 2.2) * (18 - burst) * 0.8 : 0;
  return (
    <Stage>
      <Sea y={1180} />
      <g transform={`translate(${540 + shake} ${1150 - rise * 420}) scale(${rise * 4.2})`}>
        <Drop x={0} y={0} color={C.aqua} />
        <circle cx={-8} cy={6} r={4} fill={C.abyss} />
        <circle cx={8} cy={6} r={4} fill={C.abyss} />
        <path d={burst > 0 ? 'M -9 20 Q 0 13 9 20' : 'M -8 17 Q 0 23 8 17'} stroke={C.abyss} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <ellipse cx={-10} cy={-6} rx={4} ry={7} fill="#fff" opacity={0.6} />
      </g>
      {burst > 0 &&
        Array.from({length: 26}).map((_, i) => {
          const a = rand(i) * Math.PI * 2;
          const sp = 6 + rand(i + 9) * 14;
          const d = Math.min(burst, 40) * sp * (1 - Math.min(burst, 40) / 90);
          return <Crystal key={i} x={540 + Math.cos(a) * d} y={740 + Math.sin(a) * d + burst * burst * 0.06} s={1 + rand(i + 3) * 1.4} rot={burst * 6 + i * 20} o={interpolate(burst, [0, 50, 75], [1, 1, 0], clamp)} />;
        })}
      {burst > 0 && <Pill x={540} y={400} text="SALATISSIMO!" color={C.coral} s={sal} size={56} />}
      <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={420} fill={C.gold}
        opacity={q} transform={`translate(540 420) scale(${q}) rotate(${(1 - q) * -25}) translate(-540 -420)`}
        style={{filter: 'drop-shadow(0 20px 40px rgba(255,201,74,0.45))'}}>?</text>
    </Stage>
  );
};

/* ───────────── 2. PIOGGIA ───────────── */
export const Pioggia: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const cl = useSpring(0, {damping: 16});
  const absorb = ease(f, cue('anidride'), cue('anidride') + 40);
  const acid = useSpring(cue('acida'), {damping: 10});
  const focus = useSpring(cue('goccia'), {damping: 12});
  const mols = Array.from({length: 7}).map((_, i) => ({x: 120 + rand(i) * 840, y: 620 + rand(i + 20) * 480}));
  return (
    <Stage>
      {/* pioggia */}
      {Array.from({length: 46}).map((_, i) => {
        const x = 90 + rand(i) * 900;
        const y = 480 + (((f * (18 + rand(i + 1) * 10) + rand(i + 2) * 900) % 900));
        return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 46} stroke={C.aqua} strokeWidth={5} strokeLinecap="round" opacity={0.45 * cl * (1 - focus * 0.5)} />;
      })}
      <Cloud x={540} y={400 - (1 - cl) * 300} s={2.1} color="#9FB4C9" />
      <Cloud x={300} y={360 - (1 - cl) * 300} s={1.1} color="#B9CCDD" o={0.9} />
      {/* molecole CO2 */}
      {mols.map((m, i) => {
        const tx = interpolate(absorb, [0, 1], [m.x + Math.sin(f / 15 + i) * 20, 540]);
        const ty = interpolate(absorb, [0, 1], [m.y + Math.cos(f / 18 + i) * 16, 900]);
        return (
          <g key={i} transform={`translate(${tx} ${ty}) rotate(${f * 2 + i * 40}) scale(${1.7 * (1 - absorb * 0.8)})`} opacity={(1 - absorb) * focus + 0.0001}>
            <circle cx={-34} r={18} fill={C.coral} />
            <circle r={22} fill="#2B3A55" stroke={C.foam} strokeWidth={3} />
            <circle cx={34} r={18} fill={C.coral} />
          </g>
        );
      })}
      {focus > 0.01 && mols[0] && (
        <>
          <text x={mols[1].x} y={mols[1].y - 50} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={C.coral} opacity={focus * (1 - absorb)}>CO₂</text>
          <g transform={`translate(540 900) scale(${focus * (3.4 + absorb * 0.4)})`}>
            <Drop x={0} y={0} color={absorb > 0.5 ? '#A7F070' : C.aqua} />
          </g>
        </>
      )}
      <Pill x={540} y={1260} text="pH ≈ 5,6 · LEGGERMENTE ACIDA" color="#A7F070" s={acid} size={40} o={acid} />
    </Stage>
  );
};

/* ───────────── 3. ROCCE ───────────── */
export const Rocce: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const rock = useSpring(0, {damping: 14});
  const erode = ease(f, cue('scioglie'), cue('scioglie') + 90);
  const ions = [
    {l: 'Na⁺', c: C.gold, k: 'sodio', x: 260},
    {l: 'Cl⁻', c: C.aqua, k: 'cloro', x: 540},
    {l: 'Mg²⁺', c: C.violet, k: 'magnesio', x: 820},
  ];
  const flow = `M -40 640 C 200 640, 300 860, 540 830 S 900 900, 1120 1000`;
  return (
    <Stage>
      <g transform={`translate(540 ${1180 + (1 - rock) * 500}) scale(${1 - erode * 0.12})`}>
        <polygon points="-380,120 -320,-160 -120,-260 140,-230 330,-120 400,120" fill="#5B6B7D" />
        <polygon points="-320,-160 -120,-260 140,-230 60,-110 -180,-90" fill="#7D8EA1" />
        <polygon points="140,-230 330,-120 400,120 210,60 60,-110" fill="#465565" />
        {Array.from({length: 9}).map((_, i) => (
          <circle key={i} cx={-300 + i * 75} cy={-150 + rand(i) * 230} r={6 + rand(i + 5) * 7} fill="#9AA9BA" opacity={1 - erode * rand(i + 7)} />
        ))}
      </g>
      <path d={flow} stroke={C.aqua} strokeWidth={46} fill="none" strokeLinecap="round" opacity={0.75}
        strokeDasharray="70 40" strokeDashoffset={-f * 9} />
      <path d={flow} stroke={C.foam} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5} strokeDasharray="20 90" strokeDashoffset={-f * 14} />
      {/* frammenti che si staccano */}
      {erode > 0 && Array.from({length: 14}).map((_, i) => {
        const t = ((f - cue('scioglie') + i * 9) % 80) / 80;
        return <circle key={i} cx={300 + rand(i) * 450 + t * 260} cy={920 - t * 120 + Math.sin(t * 9 + i) * 20} r={5 + rand(i) * 6} fill="#B7C6D6" opacity={(1 - t) * 0.8} />;
      })}
      {ions.map((io, i) => {
        const s = useSpring(cue(io.k), {damping: 8, stiffness: 150});
        const fl = Math.sin(f / 12 + i) * 14;
        return <Ion key={io.l} x={io.x} y={430 + fl - s * 40} label={io.l} color={io.c} s={s * 2.1} o={Math.min(1, s * 2)} />;
      })}
      {ions.map((io, i) => {
        const s = useSpring(cue(io.k) + 6);
        return <text key={i} x={io.x} y={600} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={io.c} opacity={s}>{io.k.toUpperCase()}</text>;
      })}
    </Stage>
  );
};

/* ───────────── 4. FIUMI ───────────── */
const RIVER = 'M 210 640 C 300 760, 160 860, 330 950 S 640 980, 560 1100 S 700 1230, 820 1260';
export const Fiumi: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const len = getLength(RIVER);
  const draw = ease(f, 4, 60);
  const big = useSpring(cue('miliardi'), {damping: 12});
  return (
    <Stage>
      <Sea y={1250} />
      {/* montagne */}
      <g transform={`translate(0 ${(1 - useSpring(0)) * 400})`}>
        <polygon points="20,720 230,420 440,720" fill="#3C5674" />
        <polygon points="230,420 290,505 255,495 230,530 200,495 175,505" fill={C.salt} />
        <polygon points="250,720 420,500 600,720" fill="#2D4560" />
        <polygon points="420,500 465,560 440,555 420,580 395,555 375,560" fill={C.salt} />
      </g>
      <path d={RIVER} stroke={C.sea} strokeWidth={44} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <path d={RIVER} stroke={C.aqua} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={`18 60`} strokeDashoffset={-f * 6} opacity={draw} />
      {draw > 0.95 && Array.from({length: 16}).map((_, i) => {
        const t = ((f * 3.2 + i * (len / 16)) % len);
        const pt = getPointAtLength(RIVER, t);
        const col = [C.gold, C.aqua, C.violet][i % 3];
        return <circle key={i} cx={pt.x} cy={pt.y} r={11} fill={col} stroke={C.abyss} strokeWidth={3} />;
      })}
      {/* accumulo in mare */}
      {Array.from({length: Math.floor(ease(f, 60, 220) * 30)}).map((_, i) => (
        <Crystal key={i} x={680 + rand(i) * 360} y={1330 + rand(i + 4) * 160 + Math.sin(f / 14 + i) * 6} s={0.9} rot={f + i * 30} />
      ))}
      <g transform={`translate(760 520) scale(${big})`} opacity={big}>
        <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128} fill={C.gold}>
          <Counter to={4} start={cue('miliardi')} dur={30} fmt={(n) => `${n.toFixed(0)} MLD`} />
        </text>
        <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.foam}>di tonnellate</text>
        <text y={128} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.aqua}>OGNI ANNO</text>
      </g>
    </Stage>
  );
};

/* ───────────── 5. SOLE ───────────── */
export const Sole: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const sun = useSpring(cue('sole'), {damping: 12});
  const evap = f > cue('evaporare') ? f - cue('evaporare') : -1;
  const cloud = ease(f, cue('nuvole'), cue('nuvole') + 50);
  const stay = useSpring(cue('no'), {damping: 9});
  const bounce = stay > 0.1 ? Math.abs(Math.sin((f - cue('no')) / 5)) * 18 * Math.max(0, 1 - (f - cue('no')) / 60) : 0;
  return (
    <Stage>
      <Sun x={820} y={460 - (1 - sun) * 500} s={0.9 + sun * 0.2} />
      <Cloud x={280} y={420} s={0.3 + cloud * 1.3} o={cloud} color="#E3EEF8" />
      {evap >= 0 && Array.from({length: 22}).map((_, i) => {
        const t = ((evap * 1.3 + i * 13) % 120) / 120;
        const x = 120 + rand(i) * 840;
        const tx = interpolate(t, [0, 1], [x, 280 + (rand(i + 3) - 0.5) * 220]);
        const ty = interpolate(t, [0, 1], [1160, 460]);
        return <Drop key={i} x={tx + Math.sin(t * 12 + i) * 18} y={ty} s={0.55 * (1 - t * 0.5)} color={C.aqua} o={Math.sin(t * Math.PI) * 0.9} />;
      })}
      <Sea y={1150} />
      {Array.from({length: 26}).map((_, i) => (
        <Crystal key={i} x={80 + rand(i) * 920} y={1230 + rand(i + 2) * 190 - bounce * rand(i + 5)} s={1.1 + stay * 0.5} rot={f * 0.8 + i * 25} />
      ))}
      <Pill x={540} y={1030} text="IL SALE RESTA QUI ↓" color={C.gold} s={stay} o={stay} size={46} />
      <g opacity={ease(f, cue('evaporare') + 10, cue('evaporare') + 30)}>
        <Pill x={540} y={760} text="H₂O ↑" color={C.aqua} size={40} />
      </g>
    </Stage>
  );
};

/* ───────────── 6. CICLO ───────────── */
export const Ciclo: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const R = 310;
  const cx = 540, cy = 830;
  const nodes = [
    {a: -90, label: 'PIOGGIA', c: C.aqua},
    {a: 0, label: 'ROCCE', c: '#9AA9BA'},
    {a: 90, label: 'MARE', c: C.sea},
    {a: 180, label: 'NUVOLE', c: C.foam},
  ];
  const appear = useSpring(0, {damping: 14});
  const spin = f * 3.2;
  const level = ease(f, 10, 230, 0.15, 0.9);
  const years = useSpring(cue('milioni'), {damping: 10});
  return (
    <Stage>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.ocean} strokeWidth={22} opacity={appear} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.aqua} strokeWidth={22} strokeLinecap="round"
        strokeDasharray={`${R * 1.1} ${R * 5.2}`} transform={`rotate(${spin} ${cx} ${cy})`} opacity={appear} />
      {/* freccia che gira */}
      <g transform={`rotate(${spin + 63} ${cx} ${cy})`} opacity={appear}>
        <polygon points={`${cx + R},${cy - 30} ${cx + R + 34},${cy + 10} ${cx + R - 34},${cy + 10}`} fill={C.aqua} transform={`rotate(90 ${cx + R} ${cy})`} />
      </g>
      {nodes.map((n, i) => {
        const s = useSpring(i * 8, {damping: 10});
        const x = cx + Math.cos((n.a * Math.PI) / 180) * R;
        const y = cy + Math.sin((n.a * Math.PI) / 180) * R;
        const lit = (((spin + 63 - n.a) % 360) + 360) % 360 < 40;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s * (lit ? 1.15 : 1)})`}>
            <circle r={78} fill={C.abyss} stroke={n.c} strokeWidth={lit ? 10 : 6} />
            <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={i === 3 ? 26 : 28} fill={n.c}>{n.label}</text>
          </g>
        );
      })}
      {/* indicatore di salinità al centro */}
      <g transform={`translate(${cx} ${cy})`} opacity={appear}>
        <rect x={-70} y={-150} width={140} height={300} rx={34} fill={C.abyss} stroke={C.foam} strokeWidth={6} />
        <rect x={-58} y={138 - 276 * level} width={116} height={276 * level} rx={26} fill={C.sea} />
        {Array.from({length: Math.floor(level * 14)}).map((_, i) => (
          <Crystal key={i} x={-34 + (i % 3) * 34} y={120 - Math.floor(i / 3) * 40} s={0.9} rot={i * 20} />
        ))}
        <text y={-180} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.foam}>SALE</text>
      </g>
      <Pill x={540} y={1280} text="× MILIONI DI ANNI" color={C.gold} s={years} o={years} size={52} />
    </Stage>
  );
};

/* ───────────── 7. NUMERI ───────────── */
export const Numeri: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const bottle = useSpring(0, {damping: 13});
  const fill = ease(f, cue('litro'), cue('litro') + 30);
  const g35 = useSpring(cue('trentacinque'), {damping: 10});
  return (
    <Stage>
      <g transform={`translate(300 ${860 + (1 - bottle) * 700})`}>
        <rect x={-50} y={-330} width={100} height={70} rx={14} fill={C.coral} />
        <path d="M -60 -260 L 60 -260 L 60 -220 Q 150 -170 150 -90 L 150 300 Q 150 340 110 340 L -110 340 Q -150 340 -150 300 L -150 -90 Q -150 -170 -60 -220 Z"
          fill="rgba(232,251,255,0.08)" stroke={C.foam} strokeWidth={8} />
        <clipPath id="btl"><path d="M -142 -90 Q -142 -160 -60 -210 L 60 -210 Q 142 -160 142 -90 L 142 300 Q 142 332 110 332 L -110 332 Q -142 332 -142 300 Z" /></clipPath>
        <g clipPath="url(#btl)">
          <path d={`M -160 ${330 - fill * 500} ${Array.from({length: 17}).map((_, i) => `L ${-160 + i * 20} ${330 - fill * 500 + Math.sin(i / 2 + f / 5) * 8}`).join(' ')} L 160 400 L -160 400 Z`} fill={C.sea} />
          {Array.from({length: Math.floor(g35 * 18)}).map((_, i) => (
            <Crystal key={i} x={-110 + (i % 6) * 44} y={300 - Math.floor(i / 6) * 34} s={0.8} rot={i * 33 + f} />
          ))}
        </g>
        <text y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={C.foam} opacity={fill}>1 L</text>
      </g>
      <g transform={`translate(780 700) scale(${g35})`} opacity={g35}>
        <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={210} fill={C.gold}>
          <Counter to={35} start={cue('trentacinque')} dur={26} />
        </text>
        <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={C.foam}>GRAMMI</text>
      </g>
      {/* 6 cucchiaini */}
      {Array.from({length: 6}).map((_, i) => {
        const s = useSpring(cue('cucchiaini') - 14 + i * 4, {damping: 9});
        const x = 640 + (i % 3) * 150;
        const y = 1010 + Math.floor(i / 3) * 170;
        return (
          <g key={i} transform={`translate(${x} ${y - (1 - s) * 80}) scale(${s}) rotate(-20)`} opacity={Math.min(1, s * 1.5)}>
            <ellipse cx={0} cy={0} rx={52} ry={34} fill="#C9D6E3" />
            <rect x={44} y={-9} width={90} height={18} rx={9} fill="#C9D6E3" />
            <ellipse cx={0} cy={-8} rx={42} ry={22} fill={C.salt} />
            <Crystal x={-12} y={-18} s={0.6} />
            <Crystal x={14} y={-14} s={0.5} />
          </g>
        );
      })}
    </Stage>
  );
};

/* ───────────── 8. WOW ───────────── */
export const Wow: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const land = useSpring(0, {damping: 14});
  const layer = ease(f, cue('stendessimo'), cue('stendessimo') + 70);
  const tower = ease(f, cue('grattacielo') - 10, cue('grattacielo') + 45);
  const H = 760; // altezza in px per ~166 m
  const ground = 1290;
  const floors = Math.round(tower * 50);
  return (
    <Stage>
      {/* terraferma */}
      <rect x={0} y={ground} width={1080} height={200} fill="#2A4B3A" transform={`translate(0 ${(1 - land) * 300})`} />
      <rect x={0} y={ground} width={1080} height={14} fill="#4F8A5F" transform={`translate(0 ${(1 - land) * 300})`} />
      {/* strato di sale */}
      <rect x={0} y={ground - H * layer} width={620} height={H * layer} fill={C.salt} />
      {Array.from({length: Math.floor(layer * 60)}).map((_, i) => (
        <Crystal key={i} x={30 + rand(i) * 560} y={ground - rand(i + 1) * H * layer} s={0.9} rot={i * 17} o={0.7} />
      ))}
      <path d={`M 0 ${ground - H * layer} ${Array.from({length: 32}).map((_, i) => `L ${i * 20} ${ground - H * layer + Math.sin(i + f / 8) * 6}`).join(' ')} L 620 ${ground - H * layer}`} stroke="#CFE6F2" strokeWidth={8} fill="none" />
      {/* grattacielo */}
      <g>
        <rect x={720} y={ground - H * tower} width={240} height={H * tower} fill="#1B3A5E" stroke={C.aqua} strokeWidth={4} />
        {Array.from({length: floors}).map((_, i) => (
          <g key={i}>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={738 + k * 56} y={ground - (i + 1) * (H / 50) + 3} width={38} height={H / 50 - 6} fill={rand(i * 4 + k) > 0.35 ? C.gold : '#2B5078'} opacity={0.85} />
            ))}
          </g>
        ))}
      </g>
      {/* righello */}
      <g opacity={layer}>
        <line x1={660} y1={ground} x2={660} y2={ground - H * layer} stroke={C.gold} strokeWidth={6} />
        <line x1={640} y1={ground - H * layer} x2={680} y2={ground - H * layer} stroke={C.gold} strokeWidth={6} />
      </g>
      <text x={840} y={ground - H * tower - 40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.gold} opacity={tower}>
        {floors} PIANI
      </text>
      <g opacity={layer} transform={`translate(310 ${ground - H * layer + 120})`}>
        <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={C.abyss}>≈ 166 m</text>
        <text y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.ocean}>DI SALE</text>
      </g>
    </Stage>
  );
};

/* ───────────── 9. CTA ───────────── */
export const Cta: React.FC<SceneProps> = (p) => {
  const f = useCurrentFrame();
  const cue = useCue(p);
  const em = useSpring(0, {damping: 11});
  const name = 'ARGO MARIS';
  const btn = useSpring(cue('Seguici'), {damping: 9});
  const pulse = 1 + Math.max(0, Math.sin((f - cue('Seguici')) / 6)) * 0.06 * btn;
  return (
    <Stage>
      <Sea y={1500} speed={0.7} />
      <g transform={`translate(540 640) scale(${em}) rotate(${(1 - em) * -90})`}>
        <circle r={190} fill="none" stroke={C.aqua} strokeWidth={10} />
        <circle r={160} fill={C.deep} />
        <clipPath id="emb"><circle r={160} /></clipPath>
        <g clipPath="url(#emb)">
          <path d={`M -200 30 ${Array.from({length: 21}).map((_, i) => `L ${-200 + i * 20} ${30 + Math.sin(i / 1.6 + f / 6) * 18}`).join(' ')} L 200 200 L -200 200 Z`} fill={C.sea} />
          <path d={`M -200 70 ${Array.from({length: 21}).map((_, i) => `L ${-200 + i * 20} ${70 + Math.sin(i / 1.3 - f / 5) * 12}`).join(' ')} L 200 200 L -200 200 Z`} fill={C.ocean} />
          {/* vela stilizzata */}
          <path d={`M -20 ${10 + Math.sin(f / 6) * 6} L -20 -110 L 70 ${0 + Math.sin(f / 6) * 6} Z`} fill={C.foam} />
          <path d={`M -90 ${20 + Math.sin(f / 6) * 6} L 90 ${20 + Math.sin(f / 6) * 6} L 60 ${50 + Math.sin(f / 6) * 6} L -60 ${50 + Math.sin(f / 6) * 6} Z`} fill={C.gold} />
        </g>
      </g>
      <text x={540} y={1000} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} letterSpacing={14} fill={C.foam}>
        {name.split('').map((ch, i) => {
          const s = ease(f, 10 + i * 3, 30 + i * 3);
          return <tspan key={i} opacity={s} dy={i === 0 ? 0 : 0}>{ch}</tspan>;
        })}
      </text>
      <text x={540} y={1070} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={40} letterSpacing={8} fill={C.aqua} opacity={ease(f, 40, 60)}>I SEGRETI DEL MARE</text>
      <g transform={`translate(540 1250) scale(${btn * pulse})`} opacity={btn}>
        <rect x={-230} y={-62} width={460} height={124} rx={62} fill={C.coral} />
        <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={C.foam}>+ SEGUICI</text>
      </g>
    </Stage>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook, pioggia: Pioggia, rocce: Rocce, fiumi: Fiumi, sole: Sole, ciclo: Ciclo, numeri: Numeri, wow: Wow, cta: Cta,
};
