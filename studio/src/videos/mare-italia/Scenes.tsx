import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {C, FONT, MONO, clamp, SP, useScene, useIn, ez, Title, Card, Icon, Fish, Emblem, Truck, W, H} from '../../lib/wide/ui';
import {MapView, Port, pt} from '../../lib/wide/MapView';
import {TIRRENO, ADRIATICO} from '../../lib/wide/Shared';
import {Svg, Pill, Big} from '../coop-etruria/Scenes';

const eur = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** marchio testuale Mare Italia (nessun logo disponibile: solo il nome) */
export const MareItaliaMark: React.FC<{size?: number}> = ({size = 1}) => (
  <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: `${14 * size}px ${30 * size}px`, borderRadius: 20 * size,
    background: 'linear-gradient(160deg, #0B5FA5, #06244A)', border: `${4 * size}px solid ${C.foam}`, boxShadow: '0 20px 60px rgba(0,0,0,0.45)'}}>
    <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 52 * size, letterSpacing: 6 * size, color: C.foam, lineHeight: 1}}>MARE ITALIA</span>
    <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 18 * size, letterSpacing: 5 * size, color: C.aqua, marginTop: 6 * size}}>GROSSISTA · MERCATO ITTICO DI ROMA</span>
  </div>
);

/** i box del mercato ittico, con il 46 e il 47 evidenziati */
export const Box4647: React.FC<{at: number; y?: number}> = ({at, y = 420}) => {
  const f = useCurrentFrame();
  const hl = ez(f, at + 30, at + 50);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 12}).map((_, i) => {
        const n = 41 + i;
        const x = 150 + i * 135;
        const q = ez(f, at + i * 2, at + i * 2 + 14);
        const isMI = n === 46 || n === 47;
        return (
          <g key={i} opacity={q} transform={`translate(${x} ${y + (1 - q) * 40})`}>
            <rect width={118} height={150} rx={10} fill={isMI ? `rgba(63,224,208,${0.15 + hl * 0.35})` : 'rgba(28,143,214,0.25)'} stroke={isMI && hl > 0.5 ? C.gold : 'rgba(232,251,255,0.25)'} strokeWidth={isMI ? 5 : 2} />
            <rect y={-30} width={118} height={30} rx={6} fill={isMI && hl > 0.5 ? C.gold : 'rgba(232,251,255,0.15)'} />
            <text x={59} y={-8} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={isMI && hl > 0.5 ? C.abyss : C.foam}>BOX {n}</text>
            {[0, 1, 2].map((k) => <rect key={k} x={14} y={30 + k * 38} width={90} height={24} rx={5} fill="rgba(232,251,255,0.12)" />)}
          </g>
        );
      })}
      <text x={150 + 5.5 * 135 + 59} y={y + 200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.gold} opacity={hl}>MARE ITALIA · BOX 46–47</text>
    </svg>
  );
};

/* 1 ─ HOOK: notte → alba al mercato */
export const Hook: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const dawn = ez(f, B(1) - 10, B(1) + 50);
  const a = useIn(B(0) - 4, {damping: 12}), b = useIn(B(1) - 2, {damping: 12});
  const tx = interpolate(f, [0, B(1) + 20], [-300, 900], clamp);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${dawn > 0.5 ? '#F7A35C' : '#0B1433'} 0%, #06244A 60%, #020B1A 100%)`}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #0B1433 0%, #06244A 60%, #020B1A 100%)', opacity: 1 - dawn}} />
      <Svg>
        <circle cx={1650} cy={760 - dawn * 230} r={80} fill={C.gold} opacity={dawn} />
        <circle cx={1650} cy={520 + dawn * 200} r={55} fill="#DDE6F5" opacity={1 - dawn} />
        <rect x={0} y={760} width={W} height={320} fill="#0E2238" />
        {Array.from({length: 9}).map((_, i) => <rect key={i} x={120 + i * 200} y={640} width={160} height={120} rx={8} fill="#1B3A5E" stroke="rgba(232,251,255,0.15)" />)}
        <g transform={`translate(${tx} 860)`}><Truck x={0} y={0} s={0.8} /></g>
      </Svg>
      <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: C.foam, opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>Ogni notte arriva il pesce.</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.gold, marginTop: 20, opacity: b}}>All'alba è pronto per i banchi.</div>
      </div>
    </AbsoluteFill>
  );
};

/* 2 ─ INTRO (HyperFrames) */
export const Intro: React.FC<SP> = () => (
  <AbsoluteFill><OffthreadVideo src={staticFile('mare-italia/hf_intro.mp4')} muted /></AbsoluteFill>
);

/* 3 ─ CHI È MARE ITALIA */
export const Chi: React.FC<SP> = (p) => {
  const {B, Wd} = useScene(p);
  const m = useIn(B(0), {damping: 12});
  return (
    <AbsoluteFill>
      <Title kicker="Il partner" title="Chi è Mare Italia?" at={B(0) - 6} />
      <div style={{position: 'absolute', right: 120, top: 120, transform: `scale(${m})`}}><MareItaliaMark size={0.9} /></div>
      <Box4647 at={B(1)} y={360} />
      {[['Iscritta dal 2015', 'calendar', Wd('duemilaquindici')], ['Sede: Guidonia Montecelio', 'pin', Wd('guidonia')], ['Circa 16 persone', 'people', Wd('sedici')], ['A pochi metri da tutto il mercato', 'warehouse', B(3)]].map(([t, i, at], k) => (
        <Pill key={k} at={at as number} x={[300, 760, 1200, 1600][k]} y={[690, 690, 690, 690][k] + (k % 2) * 90} text={t as string} color={k === 3 ? C.gold : C.aqua} icon={i as string} size={26} dark={k !== 3} />
      ))}
    </AbsoluteFill>
  );
};

/* 4 ─ CHI È ARGO MARIS */
export const Argo: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const l = useIn(B(0), {damping: 11});
  return (
    <AbsoluteFill>
      <Title kicker="Il buyer" title="E chi è Argo Maris?" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 200, top: 320, transform: `scale(${l})`}}><Emblem size={360} /></div>
      <div style={{position: 'absolute', left: 700, top: 330, fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.foam, opacity: ez(useCurrentFrame(), B(1), B(1) + 12)}}>Il buyer del pesce<br /><span style={{color: C.aqua}}>per la grande distribuzione</span></div>
      {['Raccoglie gli ordini delle catene', 'Compra il pesce migliore al prezzo giusto', '1 fornitore · 1 referente · 1 fattura'].map((t, i) => <Pill key={i} at={B(2) + i * 25} x={1100} y={560 + i * 100} text={t} color={i === 2 ? C.gold : C.aqua} icon={['order', 'fish', 'check'][i]} size={30} dark={i !== 2} />)}
    </AbsoluteFill>
  );
};

/* 5 ─ L'IDEA: catene → Argo Maris → Mare Italia (+ aste e barche) */
export const Idea: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const line = (x1: number, y1: number, x2: number, y2: number, at: number, c: string, w: number) => {
    const q = ez(f, at, at + 24);
    return <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * q} y2={y1 + (y2 - y1) * q} stroke={c} strokeWidth={w} strokeLinecap="round" opacity={q > 0 ? 0.9 : 0} />;
  };
  const pkt = (x1: number, y1: number, x2: number, y2: number, at: number) => f > at + 24 ? [0, 1, 2].map((k) => { const t = ((f - at) / 45 + k / 3) % 1; return <circle key={k} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={10} fill={C.foam} />; }) : null;
  return (
    <AbsoluteFill>
      <Title kicker="L'idea" title="Come lavoriamo insieme" at={B(0) - 6} />
      <Svg>
        {line(340, 560, 820, 560, B(1), C.foam, 6)}{pkt(340, 560, 820, 560, B(1))}
        {line(1100, 560, 1460, 470, B(2), C.aqua, 14)}{pkt(1100, 560, 1460, 470, B(2))}
        {line(1100, 600, 1460, 760, B(3), C.gold, 5)}
        {line(1100, 620, 1460, 880, B(3) + 10, C.gold, 5)}
        <text x={1280} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.aqua} opacity={ez(f, B(2) + 20, B(2) + 30)}>PRIMA DI TUTTO</text>
      </Svg>
      {[0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', left: 140 + k * 30, top: 470 + k * 30, opacity: ez(f, B(1) - 10 + k * 5, B(1) + k * 5)}}><div style={{width: 120, height: 120, borderRadius: 60, background: C.abyss, border: `4px solid ${C.foam}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="store" size={64} color={C.foam} /></div></div>)}
      <div style={{position: 'absolute', left: 150, top: 690, fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam, opacity: ez(f, B(1), B(1) + 10)}}>Le catene</div>
      <div style={{position: 'absolute', left: 960, top: 580, transform: `translate(-50%,-50%) scale(${useIn(B(1) + 10, {damping: 11})})`}}><Emblem size={230} /></div>
      <div style={{position: 'absolute', left: 1480, top: 400, transform: `scale(${useIn(B(2) + 10, {damping: 11})})`, transformOrigin: 'left center'}}><MareItaliaMark size={0.62} /></div>
      <Pill at={B(3) + 10} x={1600} y={760} text="Aste" color={C.gold} icon="gavel" size={30} dark />
      <Pill at={B(3) + 20} x={1600} y={880} text="Barche Tirreno e Adriatico" color={C.gold} icon="boat" size={26} dark />
    </AbsoluteFill>
  );
};

/* 6 ─ ESEMPIO CONCRETO */
export const Esempio: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const steps = [
    {t: '10:00', l: 'Ordine della catena', i: 'order', b: 1},
    {t: '11:00', l: 'Conferma con Mare Italia', i: 'handshake', b: 2},
    {t: 'Notte', l: 'Camion refrigerato', i: 'truck', b: 3},
    {t: 'Mattina', l: 'Sul banco', i: 'store', b: 4},
  ];
  const prog = interpolate(f, [B(1), B(2), B(3), B(4), B(4) + 30], [0.05, 0.37, 0.69, 0.95, 1], clamp);
  return (
    <AbsoluteFill>
      <Title kicker="Un esempio concreto" title="Dall'ordine al banco in 24 ore" at={B(0) - 6} />
      <Svg>
        <line x1={260} x2={1660} y1={460} y2={460} stroke="rgba(232,251,255,0.15)" strokeWidth={10} strokeLinecap="round" />
        <line x1={260} x2={260 + 1400 * prog} y1={460} y2={460} stroke={C.aqua} strokeWidth={10} strokeLinecap="round" opacity={ez(f, B(1), B(1) + 5)} />
      </Svg>
      {steps.map((s, k) => {
        const q = useIn(B(s.b), {damping: 11});
        return (
          <div key={k} style={{position: 'absolute', left: 260 + k * 466 - 120, top: 360, width: 240, textAlign: 'center', opacity: q, transform: `scale(${0.8 + q * 0.2})`}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.gold, marginBottom: 10}}>{s.t}</div>
            <div style={{width: 110, height: 110, margin: '0 auto', borderRadius: 55, background: C.abyss, border: `5px solid ${C.aqua}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={s.i} size={62} /></div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.foam, marginTop: 12}}>{s.l}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 120, top: 700, width: 760, borderRadius: 24, background: 'rgba(6,36,74,0.85)', border: `2px solid ${C.foam}`, padding: 24, opacity: ez(f, B(1) + 10, B(1) + 20)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.foam}}>Ordine · esempio</div>
        <svg width={700} height={120}>
          <Fish sp="orata" x={70} y={40} s={0.5} /><text x={150} y={52} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.foam}>Orate · 40 kg</text>
          <Fish sp="calamaro" x={70} y={100} s={0.45} /><text x={150} y={110} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.foam}>Calamari · 25 kg</text>
        </svg>
      </div>
      <Pill at={B(2) + 30} x={1300} y={760} text="Merce bloccata da Mare Italia" color={C.aqua} icon="check" size={28} />
      <Pill at={B(4) + 20} x={1300} y={860} text="Pesce sul banco del supermercato" color={C.gold} icon="store" size={28} />
    </AbsoluteFill>
  );
};

/* 7 ─ VANTAGGI PER MARE ITALIA */
export const VantaggiMI: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const cards = [['Nuovi clienti GDO', 'senza costi commerciali: gli ordini li porta Argo Maris', 'store'], ['Ordini programmati', 'arrivano al mattino: sapete prima cosa preparare', 'calendar'], ['Pagamenti regolari', 'contratto scritto e termini chiari', 'euro'], ['Un canale in più', 'il prodotto della giornata proposto subito alle catene', 'fish']];
  return (
    <AbsoluteFill>
      <Title kicker="Per Mare Italia" title="Cosa ci guadagna Mare Italia" at={B(0) - 6} />
      {cards.map(([t, s, i], k) => <Card key={k} at={B(k + 1)} x={120 + (k % 2) * 850} y={290 + Math.floor(k / 2) * 300} w={820} h={260} num={String(k + 1)} title={t} sub={s} icon={i} color={k % 2 ? C.gold : C.aqua} />)}
    </AbsoluteFill>
  );
};

/* 8 ─ NUMERI */
export const Numeri: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const day = ez(f, B(2), B(2) + 30) * 3500, year = ez(f, B(3), B(3) + 40) * 728000;
  return (
    <AbsoluteFill>
      <Title kicker="Cifre indicative" title="Qualche numero" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 300, display: 'flex', alignItems: 'center', gap: 22, fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.foam}}>
        {['7.000 €/giorno', '×', '4 giorni', '×', '50% da Mare Italia'].map((t, i) => <span key={i} style={{opacity: ez(f, B(1) + i * 12, B(1) + i * 12 + 10), color: i === 4 ? C.aqua : C.foam}}>{t}</span>)}
      </div>
      <Big at={B(2)} x={560} y={600} text={`${eur(day)} €`} size={140} color={C.aqua} sub="DI VENDITE IN PIÙ AL GIORNO" />
      <Big at={B(3)} x={1340} y={600} text={`${eur(year)} €`} size={140} color={C.gold} sub="DI FATTURATO IN PIÙ ALL'ANNO" />
      <Pill at={B(3) + 50} x={960} y={850} text="Esempio con cifre indicative" color={C.coral} icon="doc" size={26} dark />
    </AbsoluteFill>
  );
};

/* 9 ─ VANTAGGI PER ARGO MARIS */
export const VantaggiAM: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const cards = [['Fornitore di fiducia', 'dentro il mercato, merce pronta all\'alba', 'handshake'], ['Prezzi di riferimento', 'stabili, per costruire le offerte alle catene', 'chart'], ['Leggerezza', 'la forza di un grossista vero, senza magazzino né banco', 'boat']];
  return (
    <AbsoluteFill>
      <Title kicker="Per Argo Maris" title="Cosa ci guadagna Argo Maris" at={B(0) - 6} />
      {cards.map(([t, s, i], k) => <Card key={k} at={B(k + 1)} x={120 + k * 570} y={300} w={540} h={420} num={String(k + 1)} title={t} sub={s} icon={i} color={[C.aqua, C.gold, '#7CF29A'][k]} />)}
    </AbsoluteFill>
  );
};

/* 10 ─ L'ASSORTIMENTO COMPLETO */
export const Mari: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const P = (k: string) => pt('italia', k);
  const car = P('car');
  return (
    <AbsoluteFill>
      <MapView view="italia" cam={[{s: 1.9, x: 0, y: 40}, {s: 1.9, x: 0, y: 40}]} camAt={[0, 10]}>
        <Port x={car[0]} y={car[1]} at={B(1)} label="Mercato di Roma · Mare Italia" side="r" color={C.aqua} s={1.9} />
        {TIRRENO.map((m, i) => <circle key={m.k} cx={P(m.k)[0]} cy={P(m.k)[1]} r={4.5 * ez(f, B(2) + i * 3, B(2) + i * 3 + 8)} fill={C.gold} stroke={C.abyss} strokeWidth={1} />)}
        {ADRIATICO.map((m, i) => <circle key={m.k} cx={P(m.k)[0]} cy={P(m.k)[1]} r={4.5 * ez(f, B(3) + i * 3, B(3) + i * 3 + 8)} fill={C.gold} stroke={C.abyss} strokeWidth={1} />)}
      </MapView>
      <Title kicker="Insieme" title="L'assortimento diventa completo" at={B(0) - 6} size={64} />
      <Pill at={B(1)} x={330} y={420} text="Mercato di Roma · Mare Italia" color={C.aqua} icon="warehouse" size={26} />
      <Pill at={B(2)} x={330} y={520} text="Tirreno · 11 marinerie" color={C.gold} icon="boat" size={26} dark />
      <Pill at={B(3)} x={330} y={620} text="Adriatico · 13 marinerie" color={C.gold} icon="boat" size={26} dark />
      <Pill at={B(4)} x={330} y={720} text="Estero, quando serve" color={C.violet} icon="globe" size={26} dark />
    </AbsoluteFill>
  );
};

/* 11 ─ REGOLE */
export const Regole: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  return (
    <AbsoluteFill>
      <Title kicker="Per entrambi" title="Tutto in regola" at={B(0) - 6} />
      {[['Contratto scritto', 'doc'], ['Pagamenti entro 30 giorni', 'calendar'], ['Tracciabilità di ogni lotto', 'search']].map(([t, i], k) => <Card key={k} at={B(1) + k * 14} x={120 + k * 570} y={320} w={540} h={180} title={t} icon={i} />)}
      {[['Assicurazione merci trasportate', 'truck'], ['RC prodotti', 'shield']].map(([t, i], k) => <Card key={k} at={B(2) + k * 14} x={400 + k * 570} y={560} w={540} h={180} title={t} icon={i} color={C.gold} />)}
    </AbsoluteFill>
  );
};

/* 12 ─ FINE (HyperFrames) */
export const Fine: React.FC<SP> = () => (
  <AbsoluteFill><OffthreadVideo src={staticFile('mare-italia/hf_end.mp4')} muted /></AbsoluteFill>
);

export const SCENES: Record<string, React.FC<SP>> = {
  hook: Hook, intro: Intro, chi: Chi, argo: Argo, idea: Idea, esempio: Esempio, vantaggi_mi: VantaggiMI, numeri: Numeri, vantaggi_am: VantaggiAM, mari: Mari, regole: Regole, fine: Fine,
};
export const CHAPTERS: Record<string, string> = {
  hook: 'Mare Italia', intro: 'Mare Italia', chi: 'Mare Italia', argo: 'Argo Maris', idea: "L'idea", esempio: "L'idea", vantaggi_mi: 'Vantaggi Mare Italia', numeri: 'Vantaggi Mare Italia',
  vantaggi_am: 'Vantaggi Argo Maris', mari: 'Assortimento', regole: 'Regole', fine: 'Mare Italia',
};
