import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {MarinerieTirreno, MarinerieAdriatico, ConsegnaDiagram} from '../../lib/wide/Shared';
import {C, FONT, MONO, rand, clamp, SP, useScene, useIn, ez, Title, Card, Icon, Fish, SPECIES, Emblem, Truck, Boat, W, H} from '../../lib/wide/ui';
import {MapView, Port, pt, Route, Fleet, Storm, SeaLabel} from '../../lib/wide/MapView';

export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{children}</svg>
);
export const Pill: React.FC<{at: number; x: number; y: number; text: string; color?: string; icon?: string; size?: number; dark?: boolean}> = ({at, x, y, text, color = C.aqua, icon, size = 40, dark}) => {
  const p = useIn(at, {damping: 10, stiffness: 160});
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, opacity: Math.min(1, p * 1.5),
      display: 'flex', alignItems: 'center', gap: 14, padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999,
      background: dark ? 'rgba(2,11,26,0.85)' : color, border: dark ? `3px solid ${color}` : 'none', boxShadow: `0 12px 40px ${color}44`, whiteSpace: 'nowrap'}}>
      {icon && <Icon name={icon} size={size * 1.15} color={dark ? color : C.abyss} sw={6} />}
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: dark ? C.foam : C.abyss}}>{text}</span>
    </div>
  );
};
export const Big: React.FC<{at: number; x: number; y: number; text: string; size?: number; color?: string; sub?: string}> = ({at, x, y, text, size = 120, color = C.gold, sub}) => {
  const p = useIn(at, {damping: 9, stiffness: 140});
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.6 + p * 0.4}) rotate(${(1 - p) * -6}deg)`, opacity: Math.min(1, p * 1.4), textAlign: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color, letterSpacing: -2, lineHeight: 1, whiteSpace: 'nowrap', textShadow: `0 10px 50px ${color}55`}}>{text}</div>
      {sub && <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size * 0.28, color: C.foam, marginTop: 10, letterSpacing: 2}}>{sub}</div>}
    </div>
  );
};

/* 1 ─ HOOK */
export const Hook: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const a = useIn(B(0) - 4, {damping: 12});
  const b = useIn(B(1) - 2, {damping: 12});
  return (
    <AbsoluteFill>
      <Svg>
        <g transform={`translate(960 520)`} opacity={0.22}>
          <circle r={380} fill="none" stroke={C.ocean} strokeWidth={4} />
          {Array.from({length: 60}).map((_, i) => (
            <line key={i} x1={0} y1={-380} x2={0} y2={i % 5 ? -362 : -340} stroke={C.aqua} strokeWidth={i % 5 ? 2 : 5} transform={`rotate(${i * 6})`} opacity={0.6} />
          ))}
          <line x1={0} y1={30} x2={0} y2={-340} stroke={C.coral} strokeWidth={6} strokeLinecap="round" transform={`rotate(${Math.floor(f / 6) * 6})`} />
          <circle r={14} fill={C.coral} />
        </g>
        {[0, 1, 2].map((k) => {
          let d = `M 0 ${H}`;
          const base = 880 - k * 40 - ez(f, 0, 60) * 60;
          for (let x = 0; x <= W; x += 24) d += ` L ${x} ${base + Math.sin(x / (160 + k * 30) + f * 0.07 * (k + 1)) * (18 + k * 6)}`;
          return <path key={k} d={d + ` L ${W} ${H} Z`} fill={[C.ocean, C.sea, C.aqua][k]} opacity={[0.9, 0.6, 0.25][k]} />;
        })}
      </Svg>
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 132, color: C.foam, letterSpacing: -3, opacity: a, transform: `translateY(${(1 - a) * 60}px)`, filter: `blur(${(1 - a) * 10}px)`}}>
          Il <span style={{color: C.aqua}}>mare</span> non aspetta.
        </div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 64, color: C.gold, marginTop: 24, opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>E nemmeno i vostri clienti.</div>
      </div>
    </AbsoluteFill>
  );
};

/* 2 ─ INTRO (HyperFrames: logo Argo Maris + insegna Unicoop Etruria) */
export const Intro: React.FC<SP> = () => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile('coop-etruria/hf_intro.mp4')} muted />
  </AbsoluteFill>
);

/* 3 ─ ROTTA COMUNE (con i loghi) */
export const Rotta: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const line = ez(f, B(0) + 10, B(0) + 50);
  const ship = ez(f, B(0) + 20, B(0) + 120);
  const hub = useIn(B(2), {damping: 12});
  const spokes = ['boat', 'gavel', 'warehouse', 'truck', 'doc', 'snow'];
  const l1 = useIn(B(0) + 4, {damping: 11}), l2 = useIn(B(0) + 14, {damping: 11});
  return (
    <AbsoluteFill>
      <Title kicker="Argo Maris × Unicoop Etruria" title="Una rotta comune" at={B(0) - 6} />
      <Svg>
        <path d="M 420 450 C 760 330, 1160 570, 1480 450" stroke={C.aqua} strokeWidth={5} fill="none" strokeDasharray="16 14" opacity={line} strokeDashoffset={-f} />
        <g transform={`translate(${420 + 1060 * ship} ${450 + Math.sin(ship * Math.PI * 2) * -40})`} opacity={line}><Boat x={0} y={0} s={2.2} color={C.gold} /></g>
      </Svg>
      <div style={{position: 'absolute', left: 300, top: 330, transform: `scale(${l1})`}}><Emblem size={240} /></div>
      <div style={{position: 'absolute', left: 1460, top: 340, transform: `scale(${l2})`, opacity: l2}}>
        <Img src={staticFile('brand/unicoop-etruria-insegna.jpg')} style={{height: 220, borderRadius: 26, border: `5px solid ${C.foam}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}} />
      </div>
      <Pill at={Wd('fresco')} x={450} y={680} text="FRESCO" color={C.aqua} icon="snow" size={42} />
      <Pill at={Wd('buono')} x={850} y={680} text="BUONO" color={C.gold} icon="star" size={42} />
      <Pill at={Wd('prezzo')} x={1390} y={680} text="AL PREZZO GIUSTO" color={C.coral} icon="euro" size={42} />
      <div style={{position: 'absolute', left: 510, top: 760, width: 900, transform: `scale(${hub})`, opacity: hub}}>
        <svg width={900} height={170} viewBox="-450 -85 900 170" style={{overflow: 'visible'}}>
          {spokes.map((sp, i) => {
            const x = [-430, -290, -150, 150, 290, 430][i];
            const pp = ez(f, B(2) + 6 + i * 4, B(2) + 26 + i * 4);
            return (
              <g key={i}>
                <line x1={0} y1={0} x2={x * pp} y2={0} stroke={C.gold} strokeWidth={3} opacity={0.6} />
                <g transform={`translate(${x} 0) scale(${pp})`}><circle r={40} fill={C.abyss} stroke={C.gold} strokeWidth={3} /><g transform="translate(-27 -27)"><Icon name={sp} size={54} color={C.gold} sw={5} /></g></g>
              </g>
            );
          })}
          <circle r={58} fill={C.gold} />
          <g transform="translate(-38 -38)"><Icon name="user" size={76} color={C.abyss} sw={7} /></g>
        </svg>
        <div style={{textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.gold, marginTop: -4}}>UN SOLO REFERENTE</div>
      </div>
    </AbsoluteFill>
  );
};

/* 4 ─ CHI È: radar */
export const Chi: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const cx = 1240, cy = 560, R = 360;
  const sweep = (f * 3) % 360;
  const opp = useIn(B(4) + 10, {damping: 8});
  const fiuto = useIn(B(5) + 8, {damping: 9});
  const places = [{a: -150, r: 0.5, l: 'Mercati', i: 'warehouse', k: 'mercati'}, {a: -40, r: 0.6, l: 'Porti', i: 'boat', k: 'porti'}, {a: 40, r: 0.55, l: 'Aste', i: 'gavel', k: 'aste'}];
  const people = [{a: 120, l: 'Grossisti', i: 'warehouse', k: 'grossisti'}, {a: 165, l: 'Armatori', i: 'boat', k: 'armatori'}, {a: 210, l: 'Pescatori', i: 'fish', k: 'pescatori'}, {a: 255, l: 'Astatori', i: 'gavel', k: 'astatori'}];
  return (
    <AbsoluteFill>
      <Title kicker="Il vostro buyer" title="Chi è Argo Maris?" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 360, width: 600}}>
        {[['Conosce il mare', 1], ['Esplora ogni giorno', 2], ['Conosce le persone giuste', 3]].map(([t, b], i) => {
          const q = useIn(B(b as number), {damping: 14});
          return <div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.foam, opacity: q, transform: `translateX(${(1 - q) * -40}px)`, marginBottom: 26, display: 'flex', gap: 18, alignItems: 'center'}}>
            <span style={{width: 16, height: 16, borderRadius: 8, background: C.aqua}} />{t}</div>;
        })}
      </div>
      <Svg>
        <defs>
          <radialGradient id="rad"><stop offset="0" stopColor={C.aqua} stopOpacity={0.18} /><stop offset="1" stopColor={C.aqua} stopOpacity={0} /></radialGradient>
          <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.aqua} stopOpacity={0} /><stop offset="1" stopColor={C.aqua} stopOpacity={0.45} /></linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="url(#rad)" stroke={C.aqua} strokeWidth={3} opacity={0.8} />
        {[0.33, 0.66].map((k) => <circle key={k} cx={cx} cy={cy} r={R * k} fill="none" stroke={C.aqua} strokeWidth={1.5} opacity={0.3} />)}
        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={C.aqua} opacity={0.2} />
        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={C.aqua} opacity={0.2} />
        <path d={`M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx + R * Math.cos(-0.7)} ${cy + R * Math.sin(-0.7)} Z`} fill="url(#sw)" transform={`rotate(${sweep} ${cx} ${cy})`} />
        {[...places, ...people.map((q) => ({...q, r: 0.86}))].map((q, i) => {
          const at = Wd(q.k);
          const s = useIn(at, {damping: 9});
          const x = cx + Math.cos((q.a * Math.PI) / 180) * R * q.r, y = cy + Math.sin((q.a * Math.PI) / 180) * R * q.r;
          const col = i < 3 ? C.aqua : C.foam;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, s * 2)}>
              <circle r={46} fill={C.abyss} stroke={col} strokeWidth={4} />
              <g transform="translate(-30 -30)"><Icon name={q.i} size={60} color={col} sw={5} /></g>
              <text y={78} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={col}>{q.l}</text>
            </g>
          );
        })}
        <g transform={`translate(${cx + 250} ${cy - 10}) scale(${opp})`} opacity={opp}>
          <circle r={30 + ((f % 30) / 30) * 40} fill="none" stroke={C.gold} strokeWidth={4} opacity={1 - (f % 30) / 30} />
          <circle r={22} fill={C.gold} />
          <text x={36} y={10} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.gold}>OCCASIONE!</text>
        </g>
      </Svg>
      <Big at={B(5) + 8} x={480} y={800} text="FIUTO DI MARE" size={84} color={C.gold} />
      <div style={{opacity: fiuto * 0}} />
    </AbsoluteFill>
  );
};

/* 5 ─ ORDINI */
const ORDER = [
  {sp: 'orata', name: 'Orate', kg: '40 kg', sup: 'Mercato di Roma · grossista', c: C.aqua},
  {sp: 'calamaro', name: 'Calamari', kg: '25 kg', sup: 'Asta di Anzio', c: C.gold},
  {sp: 'triglia', name: 'Triglie', kg: '15 kg', sup: 'Barca · Civitavecchia', c: C.coral},
  {sp: 'alice', name: 'Alici', kg: '30 kg', sup: 'Asta · Adriatico', c: C.violet},
];
export const Ordini: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const card = useIn(B(1), {damping: 13});
  const steps = [{k: 'cercata', l: 'Cercata', i: 'search'}, {k: 'confrontata', l: 'Confrontata', i: 'scale'}, {k: 'assegnata', l: 'Assegnata', i: 'check'}];
  return (
    <AbsoluteFill>
      <Title kicker="Gestione ordini" title="Voi ordinate. Noi esploriamo." at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 330, width: 820, borderRadius: 28, background: 'rgba(6,36,74,0.85)', border: `2px solid ${C.aqua}`, padding: 34,
        transform: `translateX(${(1 - card) * -200}px) rotate(${(1 - card) * -4}deg)`, opacity: card, boxShadow: '0 30px 80px rgba(0,0,0,0.4)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.foam}}>Ordine Coop · mattina</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.abyss, background: C.gold, padding: '6px 16px', borderRadius: 20}}>ESEMPIO</div>
        </div>
        <svg width={760} height={420} style={{overflow: 'visible'}}>
          {ORDER.map((o, i) => {
            const assigned = ez(f, Wd('assegnata') + i * 8, Wd('assegnata') + i * 8 + 14);
            return (
              <g key={i} transform={`translate(0 ${i * 100})`} opacity={ez(f, B(1) + 8 + i * 5, B(1) + 18 + i * 5)}>
                <rect width={760} height={84} rx={18} fill="rgba(2,11,26,0.6)" stroke={assigned > 0.5 ? o.c : 'rgba(232,251,255,0.1)'} strokeWidth={2} />
                <Fish sp={o.sp} x={70} y={42} s={0.42} />
                <text x={150} y={52} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.foam}>{o.name}</text>
                <text x={330} y={52} fontFamily={MONO} fontWeight={700} fontSize={26} fill="rgba(232,251,255,0.6)">{o.kg}</text>
                <g opacity={assigned} transform={`translate(${440 + (1 - assigned) * 40} 0)`}>
                  <rect y={20} width={300} height={44} rx={22} fill={o.c} />
                  <text x={150} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.abyss}>{o.sup}</text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{position: 'absolute', left: 1100, top: 400}}>
        {steps.map((s, i) => {
          const q = useIn(Wd(s.k), {damping: 11});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 46, opacity: q, transform: `translateX(${(1 - q) * 60}px)`}}>
              <div style={{width: 110, height: 110, borderRadius: 55, background: C.abyss, border: `4px solid ${C.aqua}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={s.i} size={64} /></div>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.foam}}>{s.l}</div>
            </div>
          );
        })}
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 32, color: C.gold, opacity: ez(f, Wd('migliore'), Wd('migliore') + 12)}}>→ al fornitore migliore di quel giorno</div>
      </div>
      <div style={{position: 'absolute', left: 1100, top: 300, display: 'flex', alignItems: 'center', gap: 16, opacity: ez(f, B(2), B(2) + 12)}}>
        <Emblem size={64} /><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.aqua}}>Ci pensiamo noi</span>
      </div>
    </AbsoluteFill>
  );
};

/* 6 ─ ESEMPIO: confronto offerte */
const OFFERS = [
  {n: 'Fornitore A', price: 6.4, size: '300–400 g', fresh: 0.7},
  {n: 'Fornitore B', price: 6.0, size: '400–600 g', fresh: 0.95},
  {n: 'Fornitore C', price: 5.8, size: '200–300 g', fresh: 0.6},
];
export const Esempio: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const win = useIn(B(3), {damping: 9});
  const tomorrow = ez(f, B(4), B(4) + 24);
  const winner = tomorrow > 0.5 ? 2 : 1;
  return (
    <AbsoluteFill>
      <Title kicker="Facciamo un esempio" title="Nell'ordine ci sono le orate" at={B(0) - 6} />
      <svg width={W} height={H} style={{position: 'absolute'}}><Fish sp="orata" x={1620} y={210} s={1.1} /></svg>
      {OFFERS.map((o, i) => {
        const at = B(2) + i * 6;
        const isW = i === winner && f > B(3);
        const bars = [
          {l: 'Prezzo', v: (7 - o.price) / 1.4, t: `${o.price.toFixed(2).replace('.', ',')} €/kg`, k: 'prezzo'},
          {l: 'Pezzatura', v: i === 1 ? 0.9 : i === 0 ? 0.7 : 0.5, t: o.size, k: 'pezzatura'},
          {l: 'Freschezza', v: o.fresh, t: o.fresh > 0.9 ? 'ottima' : o.fresh > 0.65 ? 'buona' : 'discreta', k: 'freschezza'},
        ];
        return (
          <Card key={i} at={at} x={120 + i * 570} y={360} w={530} h={420} title={o.n} icon="warehouse" color={isW ? C.gold : C.aqua} active={isW || f < B(3)}>
            <div style={{marginTop: 26}}>
              {bars.map((b, j) => {
                const fill = ez(f, Wd(b.k) + i * 3, Wd(b.k) + i * 3 + 20) * b.v;
                return (
                  <div key={j} style={{marginBottom: 22}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: 'rgba(232,251,255,0.75)'}}><span>{b.l}</span><span style={{color: C.foam, fontFamily: MONO}}>{b.t}</span></div>
                    <div style={{height: 16, borderRadius: 8, background: 'rgba(232,251,255,0.12)', marginTop: 8}}>
                      <div style={{height: 16, borderRadius: 8, width: `${fill * 100}%`, background: isW ? C.gold : C.aqua}} />
                    </div>
                  </div>
                );
              })}
            </div>
            {isW && <div style={{position: 'absolute', right: 20, bottom: 18, fontFamily: FONT, fontWeight: 900, fontSize: 22, color: C.abyss, background: C.gold, padding: '8px 16px', borderRadius: 16, transform: `scale(${win})`}}>{winner === 1 ? 'MIGLIORE DI OGGI' : 'MIGLIORE DI DOMANI'}</div>}
          </Card>
        );
      })}
      {[{l: 'Conferma chiara', i: 'check', k: 'conferma'}, {l: 'Documenti in ordine', i: 'doc', k: 'documenti'}, {l: 'Lotto tracciato', i: 'search', k: 'tracciabilit'}].map((s, i) => (
        <Pill key={i} at={Wd(s.k)} x={420 + i * 540} y={870} text={s.l} color={C.aqua} icon={s.i} size={34} dark />
      ))}
    </AbsoluteFill>
  );
};

/* 7 ─ CAR: 400 aziende */
export const Car: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const cols = 20, rows = 20, sz = 26, gap = 6, x0 = 1120, y0 = 290;
  const build = ez(f, B(1) - 10, B(1) + 50);
  const rot = f > B(2) ? Math.floor((f - B(2)) / 18) : -1;
  const best = f > B(3) ? 189 : -1;
  const down = f > B(4) ? 189 : -1;
  const backup = f > B(4) + 20 ? 190 : -1;
  const crown = useIn(B(3), {damping: 8});
  return (
    <AbsoluteFill>
      <Title kicker="Il primo alleato" title="Centro Agroalimentare di Roma" at={B(0) - 6} size={66} />
      <Big at={Wd('quattrocento')} x={470} y={470} text="+400" size={190} color={C.aqua} sub="AZIENDE" />
      <div style={{position: 'absolute', left: 120, top: 640, width: 680}}>
        {[['Nessun fornitore fisso', 2, C.foam], ['Ogni mattina vince il migliore', 3, C.gold], ['Se uno si ferma, un altro è pronto', 4, C.aqua]].map(([t, b, c], i) => {
          const q = useIn(B(b as number), {damping: 13});
          return <div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: c as string, opacity: q, transform: `translateX(${(1 - q) * -40}px)`, marginBottom: 20}}>• {t}</div>;
        })}
      </div>
      <Svg>
        {Array.from({length: cols * rows}).map((_, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const appear = build * (cols + rows) - (r + c);
          const o = Math.max(0, Math.min(1, appear));
          let col = 'rgba(28,143,214,0.55)';
          const lit = rot >= 0 && [(rot * 37) % 400, (rot * 53 + 91) % 400, (rot * 71 + 203) % 400].includes(i);
          if (lit) col = C.aqua;
          if (i === best && down < 0) col = C.gold;
          if (i === down) col = C.coral;
          if (i === backup) col = '#7CF29A';
          return <rect key={i} x={x0 + c * (sz + gap)} y={y0 + r * (sz + gap)} width={sz} height={sz} rx={7} fill={col} opacity={o} transform={`translate(0 ${(1 - o) * 20})`} />;
        })}
        {best >= 0 && (() => { const r = Math.floor(best / cols), c = best % cols; const x = x0 + c * (sz + gap) + sz / 2, y = y0 + r * (sz + gap); return (
          <g transform={`translate(${x} ${y - 20})`}><path d="M -26 0 L -20 -30 L -8 -14 L 0 -36 L 8 -14 L 20 -30 L 26 0 Z" fill={C.gold} transform={`scale(${crown})`} /></g>); })()}
        {down >= 0 && (() => { const r = Math.floor(down / cols), c = down % cols; const x = x0 + c * (sz + gap) + sz / 2, y = y0 + r * (sz + gap) + sz / 2; return (
          <g transform={`translate(${x} ${y})`}><path d="M -12 -12 L 12 12 M 12 -12 L -12 12" stroke={C.abyss} strokeWidth={5} /></g>); })()}
      </Svg>
    </AbsoluteFill>
  );
};

/* 8 ─ LOCALE: le 11 marinerie del Tirreno */
export const Locale: React.FC<SP> = (p) => {
  const {B, Wd} = useScene(p);
  return (
    <MarinerieTirreno {...p} kicker="Il cuore di tutto" title="Il pesce locale: il Tirreno" routesAt={Wd('sbarcato')}>
      <Pill at={Wd('poche')} x={360} y={640} text="Sbarcato poche ore prima" color={C.gold} icon="clock" size={28} dark />
      <Pill at={Wd('piattaforma')} x={230} y={720} text="Piattaforma" color={C.aqua} icon="box" size={26} />
      <Pill at={Wd('punto')} x={520} y={720} text="Punto vendita" color={C.gold} icon="store" size={26} />
      <div style={{opacity: B(0) * 0}} />
    </MarinerieTirreno>
  );
};

/* 9 ─ SPECIE */
export const Specie: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const list = [['triglia', 'triglie'], ['alice', 'alici'], ['calamaro', 'calamari'], ['gambero', 'gamberi'], ['spada', 'spada'], ['ricciola', 'ricciole']];
  const ring = useIn(B(1), {damping: 13});
  const km = ez(f, B(2) + 10, B(2) + 40);
  return (
    <AbsoluteFill>
      <Title kicker="Pescato locale" title="Quello che il mare offre" at={B(0) - 8} />
      <Svg>
        {list.map(([sp, k], i) => {
          const at = Wd(k);
          const pp = ez(f, at - 4, at + 22);
          const x = 250 + (i % 3) * 470, y = 420 + Math.floor(i / 3) * 210;
          return (
            <g key={sp} opacity={Math.min(1, pp * 2)}>
              <Fish sp={sp} x={x + (1 - pp) * 500} y={y} s={1.15} />
              <text x={x} y={y + 92} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.foam} opacity={pp}>{SPECIES[sp].name}</text>
            </g>
          );
        })}
        <g transform={`translate(1620 520) scale(${ring})`} opacity={ring}>
          {['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'].map((m, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const on = Math.floor(((f - B(1)) / 6) % 12) === i;
            return (
              <g key={i}>
                <path d={`M ${Math.cos(a) * 120} ${Math.sin(a) * 120} A 120 120 0 0 1 ${Math.cos(a + 0.48) * 120} ${Math.sin(a + 0.48) * 120}`} stroke={on ? C.gold : C.ocean} strokeWidth={34} fill="none" />
                <text x={Math.cos(a + 0.26) * 180} y={Math.sin(a + 0.26) * 180 + 10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={on ? C.gold : 'rgba(232,251,255,0.5)'}>{m}</text>
              </g>
            );
          })}
          <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.foam}>STAGIONE</text>
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 120, top: 870, display: 'flex', gap: 60, opacity: ez(f, B(2), B(2) + 10)}}>
        {[['Chilometri', 0.12, C.aqua, 'pochi'], ['Freschezza', 1, C.gold, 'tanta']].map(([l, v, c, t], i) => (
          <div key={i} style={{width: 600}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 900, fontSize: 30, color: c as string}}><span>{l as string}</span><span>{t as string}</span></div>
            <div style={{height: 22, borderRadius: 11, background: 'rgba(232,251,255,0.12)', marginTop: 8}}><div style={{height: 22, borderRadius: 11, width: `${km * (v as number) * 100}%`, background: c as string}} /></div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 10 ─ ADRIATICO: le 13 marinerie, due mari una regia */
export const Adriatico: React.FC<SP> = (p) => <MarinerieAdriatico {...p} />;

/* 11 ─ ROTAZIONE */
export const Rotazione: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const seg = [{l: 'TIRRENO', c: C.aqua}, {l: 'ADRIATICO', c: C.gold}, {l: 'MERCATO DI ROMA', c: C.coral}];
  const spin = f * 0.8;
  const wheel = useIn(B(0), {damping: 13});
  const story = [
    {at: B(3), icon: 'storm', t: 'Mare grosso sul Tirreno', s: 'le barche restano in porto', c: C.coral},
    {at: B(4), icon: 'boat', t: 'Lavoriamo Adriatico e mercato', s: 'stessa qualità, altra costa', c: C.gold},
    {at: B(5), icon: 'store', t: 'Banco Coop pieno', s: 'nessun buco per i clienti', c: '#7CF29A'},
  ];
  return (
    <AbsoluteFill>
      <Title kicker="Il nostro segreto" title="Rotazione" at={B(0) - 6} size={96} />
      <Svg>
        <g transform={`translate(520 590) scale(${wheel}) rotate(${spin})`}>
          {seg.map((s, i) => {
            const a0 = (i / 3) * Math.PI * 2, a1 = ((i + 1) / 3) * Math.PI * 2 - 0.04;
            const R = 260, r = 120;
            const d = `M ${Math.cos(a0) * R} ${Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R} L ${Math.cos(a1) * r} ${Math.sin(a1) * r} A ${r} ${r} 0 0 0 ${Math.cos(a0) * r} ${Math.sin(a0) * r} Z`;
            const am = (a0 + a1) / 2;
            return (
              <g key={i}>
                <path d={d} fill={s.c} opacity={0.92} />
                <text x={Math.cos(am) * 190} y={Math.sin(am) * 190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={i === 2 ? 22 : 28} fill={C.abyss}
                  transform={`rotate(${(am * 180) / Math.PI + 90} ${Math.cos(am) * 190} ${Math.sin(am) * 190})`}>{s.l}</text>
              </g>
            );
          })}
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 520, top: 590, transform: 'translate(-50%,-50%)'}}><Emblem size={200} /></div>
      {[['Stagione', 'stagione', 'calendar'], ['Meteo', 'meteo', 'storm'], ['Qualità', 'qualit', 'star']].map(([l, k, i], j) => (
        <Pill key={j} at={Wd(k)} x={290 + j * 230} y={890} text={l} color={C.aqua} icon={i} size={28} dark />
      ))}
      <div style={{position: 'absolute', left: 1000, top: 300, width: 800}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.gold, letterSpacing: 4, opacity: ez(f, B(2), B(2) + 10), marginBottom: 20}}>UN ESEMPIO</div>
        {story.map((s, i) => {
          const q = useIn(s.at, {damping: 12});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, padding: '20px 26px', borderRadius: 24,
              background: 'rgba(6,36,74,0.8)', border: `3px solid ${s.c}`, opacity: q, transform: `translateY(${(1 - q) * 40}px)`}}>
              <Icon name={s.icon} size={70} color={s.c} />
              <div><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.foam}}>{s.t}</div><div style={{fontFamily: FONT, fontWeight: 600, fontSize: 24, color: 'rgba(232,251,255,0.7)'}}>{s.s}</div></div>
            </div>
          );
        })}
      </div>
      <Big at={B(6)} x={1400} y={860} text="Continuità, sempre." size={64} color={C.aqua} />
    </AbsoluteFill>
  );
};

/* 11b ─ COME COMPRIAMO */
export const Acquisti: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const ch = [
    {b: 1, t: 'Grossisti del mercato di Roma', s: 'listini confrontati ogni mattina · contratto scritto · 30 giorni', i: 'warehouse', c: C.aqua},
    {b: 2, t: 'Aste', s: 'acquirenti registrati presso ogni mercato · offerta · pesce battuto', i: 'gavel', c: C.gold},
    {b: 3, t: 'Barche', s: 'prima vendita · nota di vendita entro 24 ore · codice lotto', i: 'boat', c: C.coral},
  ];
  const hit = f - Wd('battuto');
  return (
    <AbsoluteFill>
      <Title kicker="In pratica" title="Come compriamo: tre canali" at={B(0) - 6} />
      {ch.map((c, k) => (
        <Card key={k} at={B(c.b)} x={120 + k * 570} y={300} w={540} h={470} num={String(k + 1)} title={c.t} sub={c.s} icon={c.i} color={c.c}>
          <svg width={480} height={170} style={{position: 'absolute', left: 30, bottom: 20}}>
            {k === 0 && [0.75, 0.9, 0.6, 0.82].map((v, i) => { const h = ez(f, B(1) + 20 + i * 5, B(1) + 40 + i * 5) * v * 140; const best = i === 2 && f > B(1) + 70; return <rect key={i} x={30 + i * 110} y={160 - h} width={80} height={h} rx={10} fill={best ? C.gold : C.aqua} opacity={best || f < B(1) + 70 ? 1 : 0.35} />; })}
            {k === 1 && <g>
              <g transform={`translate(160 110) rotate(${hit > 0 && hit < 12 ? -40 + hit * 3.5 : -40})`}><rect x={-14} y={-90} width={28} height={110} rx={8} fill="#B07A3B" /><rect x={-60} y={-120} width={120} height={50} rx={12} fill="#8A5A26" /></g>
              <rect x={80} y={140} width={180} height={22} rx={6} fill="#5E3E1C" />
              <text x={340} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.gold} opacity={ez(f, Wd('battuto'), Wd('battuto') + 6)} transform={`rotate(-8 340 110)`}>BATTUTO!</text>
            </g>}
            {k === 2 && <g opacity={ez(f, B(3) + 20, B(3) + 30)}>
              <g transform="translate(70 100)"><Icon name="boat" size={90} color={C.coral} /></g>
              <path d="M 170 100 L 240 100" stroke={C.foam} strokeWidth={4} />
              <g transform="translate(250 50)"><Icon name="doc" size={90} color={C.foam} /></g>
              <text x={300} y={165} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={C.gold}>24 h</text>
              <g transform="translate(370 60)">{Array.from({length: 18}).map((_, i) => <rect key={i} x={i * 5} y={0} width={rand(i) > 0.5 ? 3.5 : 1.8} height={70} fill={C.foam} />)}</g>
            </g>}
          </svg>
        </Card>
      ))}
      <Pill at={B(4)} x={960} y={850} text="Solo quello che ordinate → niente invenduto → prezzi bassi" color={C.gold} icon="check" size={30} />
    </AbsoluteFill>
  );
};

/* 12 ─ LOGISTICA/* 12 ─ LOGISTICA: 24 ore */
export const Logistica: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const x0 = 160, x1 = 1760, y = 580;
  const tl = [{h: 9, l: 'Ordini', s: 'mattina', i: 'order', at: B(1)}, {h: 15, l: 'Aste', s: 'pomeriggio', i: 'gavel', at: B(2)}, {h: 23, l: 'Viaggio', s: 'notte · freddo', i: 'truck', at: B(3)}, {h: 30, l: 'A destinazione', s: 'mattina dopo', i: 'check', at: B(4)}];
  const hx = (h: number) => x0 + ((h - 6) / 26) * (x1 - x0);
  const now = interpolate(f, [B(1), B(2), B(3), B(4), B(4) + 40], [9, 15, 22, 29, 30], clamp);
  const truckX = interpolate(f, [B(3), B(4) + 10], [hx(21), hx(30)], clamp);
  const dest = [{l: 'Hub logistico', i: 'warehouse'}, {l: 'Piattaforma', i: 'box'}, {l: 'Punto vendita', i: 'store'}];
  return (
    <AbsoluteFill>
      <Title kicker="Logistica" title="Il viaggio del fresco" at={B(0) - 6} />
      <Svg>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFB86B" /><stop offset="0.3" stopColor="#5EC8F2" /><stop offset="0.55" stopColor="#F7A35C" />
            <stop offset="0.7" stopColor="#1B2B5A" /><stop offset="0.9" stopColor="#0B1433" /><stop offset="1" stopColor="#FFB86B" />
          </linearGradient>
        </defs>
        <rect x={x0} y={y - 16} width={x1 - x0} height={32} rx={16} fill="url(#sky)" opacity={0.9} />
        {Array.from({length: 27}).map((_, i) => (
          <g key={i}>
            <line x1={hx(6 + i)} y1={y + 24} x2={hx(6 + i)} y2={y + (i % 3 ? 34 : 46)} stroke="rgba(232,251,255,0.4)" strokeWidth={2} />
            {i % 3 === 0 && <text x={hx(6 + i)} y={y + 76} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill="rgba(232,251,255,0.6)">{String((6 + i) % 24).padStart(2, '0')}:00</text>}
          </g>
        ))}
        <g transform={`translate(${hx(now)} ${y})`} opacity={ez(f, B(1) - 10, B(1))}>
          <circle r={26} fill={now > 19 && now < 29 ? '#DDE6F5' : C.gold} />
          {now > 19 && now < 29 && <circle cx={10} cy={-8} r={22} fill="#1B2B5A" />}
        </g>
        {tl.map((t, i) => {
          const q = useIn(t.at, {damping: 11});
          return (
            <g key={i} transform={`translate(${hx(t.h)} ${y - 60}) scale(${q})`} opacity={q}>
              <line x1={0} y1={0} x2={0} y2={40} stroke={C.aqua} strokeWidth={3} />
              <circle cy={-70} r={62} fill={C.abyss} stroke={C.aqua} strokeWidth={4} />
              <g transform="translate(-40 -110)"><Icon name={t.i} size={80} color={C.aqua} /></g>
              <text y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.foam}>{t.l}</text>
              <text y={-185} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.gold}>{t.s.toUpperCase()}</text>
            </g>
          );
        })}
        <g opacity={ez(f, B(3), B(3) + 10)}><Truck x={truckX} y={y + 165} s={0.6} /></g>
      </Svg>
      <div style={{position: 'absolute', left: 700, top: 880, display: 'flex', gap: 22}}>
        {dest.map((d, i) => (
          <Pill key={i} at={B(4) + 30 + i * 14} x={i * 280} y={0} text={d.l} color={C.gold} icon={d.i} size={26} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 12b ─ CONSEGNA DIRETTA */
export const Consegna: React.FC<SP> = (p) => {
  const {B, Wd} = useScene(p);
  return <ConsegnaDiagram {...p} kicker="Logistica" title="La consegna diretta" platAt={Wd('piattaforma')} hubAt={B(4)} directAt={Wd('direttamente')} prosAt={B(2)}
    chips={[{at: B(3), t: 'Vostri orari di scarico'}, {at: B(3) + 25, t: 'Ordini per singolo negozio'}]} tipAt={B(4) + 10} tip="Scegliete voi, anche negozio per negozio." />;
};

/* 13 ─ FREDDO/* 13 ─ FREDDO */
export const Freddo: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const temp = interpolate(f, [B(1), B(1) + 60], [12, 0], clamp);
  const chain = ['boat', 'truck', 'warehouse', 'store'];
  return (
    <AbsoluteFill>
      <Title kicker="Catena del freddo" title="Non si spezza mai" at={B(0) - 6} />
      <Svg>
        <g transform="translate(380 640)">
          <rect x={-40} y={-300} width={80} height={380} rx={40} fill="rgba(232,251,255,0.08)" stroke={C.foam} strokeWidth={5} />
          <circle cy={120} r={70} fill={C.sea} stroke={C.foam} strokeWidth={5} />
          <rect x={-22} y={100 - (temp / 12) * 300 - 40} width={44} height={(temp / 12) * 300 + 60} rx={22} fill={C.sea} />
          {Array.from({length: 7}).map((_, i) => <line key={i} x1={50} x2={80} y1={-260 + i * 50} y2={-260 + i * 50} stroke="rgba(232,251,255,0.5)" strokeWidth={3} />)}
          <text x={110} y={-80} fontFamily={MONO} fontWeight={700} fontSize={120} fill={C.aqua}>{temp.toFixed(0)} °C</text>
          <text x={110} y={-10} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.foam} opacity={ez(f, Wd('ghiaccio'), Wd('ghiaccio') + 10)}>ghiaccio fondente</text>
        </g>
        {Array.from({length: 9}).map((_, i) => {
          const q = ez(f, Wd('ghiaccio') + i * 3, Wd('ghiaccio') + i * 3 + 15);
          return <rect key={i} x={240 + (i % 3) * 90} y={900 - Math.floor(i / 3) * 70 - (1 - q) * 200} width={70} height={58} rx={12} fill="#D8F4FF" opacity={q * 0.85} transform={`rotate(${(i * 17) % 20 - 10} ${275 + (i % 3) * 90} ${930})`} />;
        })}
        {chain.map((c, i) => {
          const q = useIn(B(0) + 10 + i * 10, {damping: 11});
          const x = 1000 + i * 230;
          return (
            <g key={i} transform={`translate(${x} 600) scale(${q})`}>
              {i < 3 && <line x1={60} x2={170} y1={0} y2={0} stroke={C.aqua} strokeWidth={8} strokeDasharray="16 10" strokeDashoffset={-f * 2} />}
              <circle r={74} fill={C.abyss} stroke={C.aqua} strokeWidth={5} />
              <g transform="translate(-44 -44)"><Icon name={c} size={88} /></g>
              <g transform="translate(40 -70)"><circle r={26} fill={C.aqua} /><g transform="translate(-20 -20)"><Icon name="snow" size={40} color={C.abyss} sw={8} /></g></g>
            </g>
          );
        })}
      </Svg>
      <Big at={B(2)} x={1340} y={850} text="Dal ghiaccio, al banco." size={64} color={C.aqua} />
    </AbsoluteFill>
  );
};

/* 14 ─ QUALITÀ: etichetta */
export const Qualita: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const label = useIn(B(2), {damping: 13});
  const rows = [
    ['Specie', 'Triglia di fango', 'specie'], ['Nome scientifico', 'Mullus barbatus', 'nome'], ['Metodo di produzione', 'Pescato in mare', 'metodo'],
    ['Zona di cattura', 'FAO 37.1.3 · Mar Tirreno', 'zona'], ['Attrezzo', 'Reti da traino', 'attrezzo'], ['Lotto', 'AM-2611-TRG-014', 'attrezzo'],
  ];
  const stamp = useIn(B(3), {damping: 8});
  return (
    <AbsoluteFill>
      <Title kicker="Qualità" title="Prima di tutto" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 360}}>
        {[['Controllo del prodotto', 'controllo'], ['Etichettatura chiara', 'etichettatura'], ['Tracciabilità di ogni lotto', 'tracciabilit'], ['Fornitori in regola', 'tracciabilit']].map(([t, k], i) => {
          const q = useIn(Wd(k) + (i === 3 ? 20 : 0), {damping: 12});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30, opacity: q, transform: `translateX(${(1 - q) * -50}px)`}}>
              <Icon name="check" size={58} color="#7CF29A" sw={6} />
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.foam}}>{t}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 980, top: 290, width: 800, borderRadius: 20, background: '#F4F7FA', padding: '30px 36px', boxShadow: '0 30px 90px rgba(0,0,0,0.5)',
        transform: `rotate(${(1 - label) * 8 - 1.5}deg) scale(${0.85 + label * 0.15})`, opacity: label}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `4px solid ${C.abyss}`, paddingBottom: 14, marginBottom: 14}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.abyss}}>ETICHETTA · ESEMPIO</div>
          <svg width={110} height={60}>{Array.from({length: 30}).map((_, i) => <rect key={i} x={i * 3.6} y={0} width={rand(i) > 0.5 ? 2.4 : 1.2} height={60} fill={C.abyss} />)}</svg>
        </div>
        {rows.map(([k, v, w], i) => {
          const q = ez(f, Wd(w) + (i === 5 ? 14 : 0), Wd(w) + (i === 5 ? 14 : 0) + 10);
          return (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #C9D6E3', opacity: 0.25 + q * 0.75}}>
              <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: '#4A6075'}}>{k}</span>
              <span style={{fontFamily: i === 1 ? 'Georgia, serif' : FONT, fontStyle: i === 1 ? 'italic' : 'normal', fontWeight: 800, fontSize: 28, color: C.abyss, background: q > 0.5 && q < 1 ? '#FFE9A8' : 'transparent'}}>{v}</span>
            </div>
          );
        })}
        <div style={{position: 'absolute', right: 30, bottom: -40, transform: `rotate(-12deg) scale(${2 - stamp})`, opacity: stamp, border: `6px solid #1E9E55`, borderRadius: 16, padding: '8px 20px',
          fontFamily: FONT, fontWeight: 900, fontSize: 38, color: '#1E9E55', background: 'rgba(244,247,250,0.9)'}}>VERIFICABILE ✓</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 860, display: 'flex', gap: 10, alignItems: 'flex-end', opacity: ez(f, B(4), B(4) + 10)}}>
        {Array.from({length: 14}).map((_, i) => {
          const q = ez(f, B(4) + i * 4, B(4) + i * 4 + 10);
          return <div key={i} style={{transform: `scale(${q})`, opacity: q}}><Icon name="user" size={50} color={i % 4 === 0 ? C.gold : C.aqua} sw={6} /></div>;
        })}
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.gold, marginLeft: 20}}>un banco alla volta</span>
      </div>
    </AbsoluteFill>
  );
};

/* 14b ─ GARANZIE: assicurazioni e certificazioni */
export const Garanzie: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const cards = [
    {b: 1, t: 'RC prodotti', s: 'danni da prodotto difettoso, compreso il ritiro dal mercato', i: 'shield', c: C.aqua},
    {b: 2, t: 'Merci trasportate', s: 'copre anche il mancato freddo durante il viaggio', i: 'thermo', c: C.coral},
    {b: 3, t: 'HACCP · IFS Broker', s: 'autocontrollo attivo e percorso verso lo standard internazionale per gli intermediari', i: 'star', c: C.gold},
  ];
  return (
    <AbsoluteFill>
      <Title kicker="Per la vostra tranquillità" title="Assicurati e in regola" at={B(0) - 6} />
      {cards.map((c, k) => (
        <Card key={k} at={B(c.b)} x={120 + k * 570} y={300} w={540} h={400} num={String(k + 1)} title={c.t} sub={c.s} icon={c.i} color={c.c}>
          <div style={{position: 'absolute', right: 26, bottom: 22, transform: `scale(${ez(f, B(c.b) + 20, B(c.b) + 30)})`}}><Icon name="check" size={70} color="#7CF29A" sw={7} /></div>
        </Card>
      ))}
      {['Contratto scritto', 'Pagamenti chiari', 'Tracciabilità di ogni lotto'].map((t, i) => <Pill key={i} at={B(4) + i * 14} x={420 + i * 540} y={800} text={t} color="#7CF29A" icon="doc" size={30} dark />)}
    </AbsoluteFill>
  );
};

/* 15 ─ ESTERO/* 15 ─ ESTERO: il plus */
export const Estero: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const P = (k: string) => pt('europa', k);
  const roma = P('roma');
  const items = [
    {k: 'scozia', l: 'Scozia', sp: 'salmone', t: 'Salmone', w: 'scozia'},
    {k: 'olanda', l: 'Olanda', sp: 'merluzzo', t: 'Mare del Nord', w: 'olanda'},
    {k: 'grecia', l: 'Grecia', sp: 'orata', t: 'Orate', w: 'grecia'},
    {k: 'croazia', l: 'Croazia', sp: 'spigola', t: 'Spigole', w: 'croazia'},
    {k: 'turchia', l: 'Turchia', sp: 'orata', t: 'Orate e spigole', w: 'turchia'},
  ];
  return (
    <AbsoluteFill>
      <MapView view="europa" cam={[{s: 2.4, x: -60, y: -330}, {s: 2.4, x: -60, y: -330}, {s: 1.0, x: 80, y: -70}]} camAt={[0, B(1) - 30, B(1) + 20]} italy="#2A6FA8">
        <Port x={roma[0]} y={roma[1]} at={0} label="Roma" side="r" color={C.aqua} s={1.2} />
        {items.map((it, i) => (
          <g key={i}>
            <Port x={P(it.k)[0]} y={P(it.k)[1]} at={Wd(it.w)} label={it.l} side={it.k === 'scozia' || it.k === 'olanda' ? 'l' : 'r'} />
            <Route a={P(it.k)} b={roma} at={Wd(it.w) + 4} dur={36} color={C.gold} bend={it.k === 'turchia' ? 0.2 : -0.2} />
          </g>
        ))}
      </MapView>
      <Title kicker="Il plus" title="Quando serve, andiamo lontano" at={B(0) - 6} size={66} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {items.slice(0, 4).map((it, i) => {
          const q = useIn(Wd(it.w) + 10, {damping: 11});
          return (
            <g key={i} transform={`translate(${1560} ${330 + i * 150}) scale(${q})`} opacity={q}>
              <rect x={-180} y={-60} width={360} height={120} rx={24} fill="rgba(2,11,26,0.85)" stroke={C.gold} strokeWidth={3} />
              <Fish sp={it.sp} x={-90} y={0} s={0.55} />
              <text x={20} y={-6} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.foam}>{it.t}</text>
              <text x={20} y={30} fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.gold}>{it.l}{i === 2 ? ' · Croazia · Turchia' : ''}</text>
            </g>
          );
        })}
      </svg>
      <Pill at={Wd('documenti')} x={520} y={860} text="Documenti e tracciabilità in regola" color="#7CF29A" icon="doc" size={30} dark />
      {p.sc.beats.length > 4
        ? <Big at={B(5)} x={960} y={720} text="Il mondo nel banco" size={72} color={C.foam} sub="CON LA STESSA CURA DEL PESCE DI CASA" />
        : <Big at={B(3)} x={500} y={360} text="Non sostituisce: completa" size={48} color={C.foam} sub="IL NOSTRO MARE RESTA AL CENTRO" />}
    </AbsoluteFill>
  );
};

/* 16 ─ PERCHÉ */
export const Perche: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const cards = [
    {i: 'search', t: 'Buyer esploratore', s: 'tutto il mercato di Roma a disposizione'},
    {i: 'boat', t: 'Tirreno e Adriatico', s: '24 marinerie, a rotazione'},
    {i: 'storm', t: 'Continuità', s: 'anche quando il mare è grosso'},
    {i: 'truck', t: 'Logistica flessibile', s: 'fino alla consegna diretta in negozio'},
    {i: 'shield', t: 'Assicurati e tracciati', s: 'un solo referente, sempre raggiungibile'},
  ];
  return (
    <AbsoluteFill>
      <Title kicker="In sintesi" title="Perché scegliere Argo Maris?" at={B(0) - 6} />
      {cards.map((c, i) => (
        <Card key={i} at={B(i + 1)} x={120 + (i % 3) * 570} y={300 + Math.floor(i / 3) * 290} w={540} h={250} icon={c.i} title={c.t} sub={c.s} num={String(i + 1)} color={i === 1 ? C.gold : C.aqua} />
      ))}
      <div style={{position: 'absolute', left: 1290, top: 600, transform: `scale(${useIn(B(5) + 20, {damping: 10})})`}}><Emblem size={240} /></div>
    </AbsoluteFill>
  );
};

/* 17 ─ FINE (HyperFrames) */
export const Fine: React.FC<SP> = () => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile('coop-etruria/hf_end.mp4')} muted />
  </AbsoluteFill>
);

export const SCENES: Record<string, React.FC<SP>> = {
  hook: Hook, intro: Intro, rotta: Rotta, chi: Chi, ordini: Ordini, esempio: Esempio, car: Car, locale: Locale, specie: Specie,
  adriatico: Adriatico, rotazione: Rotazione, acquisti: Acquisti, logistica: Logistica, consegna: Consegna, freddo: Freddo, qualita: Qualita, garanzie: Garanzie, estero: Estero, perche: Perche, fine: Fine,
};
export const CHAPTERS: Record<string, string> = {
  hook: 'Argo Maris', intro: 'Argo Maris', rotta: 'La rotta comune', chi: 'Chi siamo', ordini: 'Ordini', esempio: 'Ordini', car: 'Mercato di Roma',
  locale: 'Il Tirreno', specie: 'Il Tirreno', adriatico: "L'Adriatico", rotazione: 'Rotazione', logistica: 'Logistica', freddo: 'Logistica',
  qualita: 'Qualità', garanzie: 'Garanzie', acquisti: 'Come compriamo', consegna: 'Logistica', estero: 'Il plus: estero', perche: 'Perché noi', fine: 'Argo Maris',
};
