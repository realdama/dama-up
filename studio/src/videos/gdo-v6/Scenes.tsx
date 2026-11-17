import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {C, FONT, MONO, rand, clamp, SP, useScene, useIn, ez, Title, Card, Icon, Fish, SPECIES, Emblem, Truck, Boat, W, H} from '../../lib/wide/ui';
import {MapView, Port, pt, Route, Fleet} from '../../lib/wide/MapView';
import {Svg, Pill, Big, Adriatico as AdriaticoCoop, Estero as EsteroCoop} from '../coop-etruria/Scenes';
import {MarinerieTirreno, ConsegnaDiagram} from '../../lib/wide/Shared';

const eur = (n: number, dec = 0) => {
  const [i, d] = n.toFixed(dec).split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : '');
};
const Count: React.FC<{at: number; to: number; from?: number; dur?: number; dec?: number; pre?: string; suf?: string}> = ({at, to, from = 0, dur = 30, dec = 0, pre = '', suf = ''}) => {
  const f = useCurrentFrame();
  return <>{pre}{eur(ez(f, at, at + dur, from, to), dec)}{suf}</>;
};
const Node: React.FC<{at: number; x: number; y: number; icon?: string; label: string; color?: string; size?: number; emblem?: boolean; sub?: string}> = ({at, x, y, icon, label, color = C.aqua, size = 150, emblem, sub}) => {
  const p = useIn(at, {damping: 11});
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, opacity: Math.min(1, p * 1.5), textAlign: 'center', width: 360}}>
      <div style={{width: size, height: size, borderRadius: size / 2, margin: '0 auto', background: C.abyss, border: `5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 50px ${color}33`}}>
        {emblem ? <Emblem size={size * 0.86} ring={color} /> : <Icon name={icon!} size={size * 0.55} color={color} sw={5} />}
      </div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.foam, marginTop: 14}}>{label}</div>
      {sub && <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 22, color, marginTop: 4}}>{sub}</div>}
    </div>
  );
};
/** freccia animata con pacchetti che scorrono */
const Flow: React.FC<{a: [number, number]; b: [number, number]; at: number; color?: string; label?: string; packets?: boolean; dash?: boolean}> = ({a, b, at, color = C.aqua, label, packets = true}) => {
  const f = useCurrentFrame();
  const p = ez(f, at, at + 24);
  const x = a[0] + (b[0] - a[0]) * p, y = a[1] + (b[1] - a[1]) * p;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return (
    <g opacity={f >= at ? 1 : 0}>
      <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
      {p > 0.98 && <polygon points="0,-14 26,0 0,14" fill={color} transform={`translate(${b[0]} ${b[1]}) rotate(${(ang * 180) / Math.PI}) translate(-26 0)`} />}
      {packets && p > 0.98 && [0, 1, 2].map((k) => {
        const t = ((f - at) / 40 + k / 3) % 1;
        return <circle key={k} cx={a[0] + (b[0] - a[0]) * t} cy={a[1] + (b[1] - a[1]) * t} r={9} fill={C.foam} stroke={color} strokeWidth={3} />;
      })}
      {label && <text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 - 22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={color} opacity={p}>{label}</text>}
    </g>
  );
};

/* 1 ─ INTRO */
export const Intro: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const ag = [['Come funziona', 'boat'], ['Perché conviene', 'chart'], ['Quanto costa partire', 'euro'], ['Quanto si guadagna', 'money']];
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile('gdo-v6/hf_intro.mp4')} muted />
      {ag.map(([t, i], k) => <Pill key={k} at={B(3) + k * 9} x={[290, 720, 1180, 1640][k]} y={830} text={t} color={k % 2 ? C.gold : C.aqua} icon={i} size={27} dark />)}
    </AbsoluteFill>
  );
};

/* 2 ─ IDEA */
export const Idea: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const cat: [number, number] = [330, 560], am: [number, number] = [960, 560];
  const src = [{y: 360, l: 'Mercato di Roma', i: 'warehouse', k: 'mercato'}, {y: 560, l: 'Aste', i: 'gavel', k: 'aste'}, {y: 760, l: 'Barche', i: 'boat', k: 'barche'}];
  const doc = ez(f, B(1) + 10, B(1) + 50);
  const back = f > B(3);
  return (
    <AbsoluteFill>
      <Title kicker="L'idea" title="Semplice: un ordine, il pesce migliore" at={B(0) - 6} size={64} />
      <Svg>
        {src.map((s, i) => <Flow key={i} a={[am[0] + 90, am[1]]} b={[1460, s.y]} at={Wd(s.k)} color={C.aqua} />)}
        {back && <Flow a={[am[0] - 90, am[1] + 40]} b={[cat[0] + 90, cat[1] + 40]} at={B(3)} color={C.gold} label="pesce + margine" />}
        <Flow a={[cat[0] + 90, cat[1] - 40]} b={[am[0] - 90, am[1] - 40]} at={B(1)} color={C.foam} label="1 ordine" packets={false} />
        <g transform={`translate(${cat[0] + 90 + (am[0] - cat[0] - 180) * doc} ${cat[1] - 110})`} opacity={doc > 0 && doc < 1 ? 1 : 0}><g transform="translate(-30 -30)"><Icon name="order" size={60} color={C.foam} /></g></g>
      </Svg>
      <Node at={B(0)} x={cat[0]} y={cat[1]} icon="store" label="La catena" color={C.foam} />
      <Node at={B(1)} x={am[0]} y={am[1]} emblem label="Argo Maris" color={C.aqua} size={170} />
      {src.map((s, i) => (
        <div key={i} style={{position: 'absolute', left: 1480, top: s.y - 50, display: 'flex', alignItems: 'center', gap: 18, opacity: ez(f, Wd(s.k), Wd(s.k) + 12)}}>
          <div style={{width: 100, height: 100, borderRadius: 50, background: C.abyss, border: `4px solid ${C.aqua}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={s.i} size={58} /></div>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.foam}}>{s.l}</span>
        </div>
      ))}
      {['1 fornitore', '1 referente', '1 fattura'].map((t, i) => <Pill key={i} at={B(4) + 4 + i * 10} x={560 + i * 400} y={900} text={t} color={C.gold} size={36} />)}
    </AbsoluteFill>
  );
};

/* 3 ─ MODELLO */
export const Modello: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  return (
    <AbsoluteFill>
      <Title kicker="Il modello" title="Acquisti in outsourcing" at={B(0) - 6} />
      <Card at={B(0) + 10} x={120} y={330} w={540} h={380} num="1" title="Outsourcing" icon="handshake" sub="Un'azienda esterna fa gli acquisti al posto del cliente." />
      <Card at={B(2)} x={690} y={330} w={540} h={380} num="2" title="Buying agent" icon="money" color={C.gold}
        sub="Compra a nome suo, rivende con il suo margine e si prende il rischio." >
        <div style={{display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap'}}>
          {['compra', 'rivende', 'rischio'].map((t, i) => <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.abyss, background: C.gold, borderRadius: 14, padding: '6px 14px', opacity: ez(f, B(2) + 20 + i * 10, B(2) + 30 + i * 10)}}>{t}</span>)}
        </div>
      </Card>
      <Card at={B(3)} x={1260} y={330} w={540} h={380} num="3" title="Per l'ASL: broker" icon="doc" color={C.coral} sub="Intermediario senza deposito.">
        <div style={{marginTop: 30}}>
          {[['warehouse', 'Niente magazzino'], ['store', 'Niente banco']].map(([i, t], k) => {
            const q = ez(f, B(3) + 30 + k * 18, B(3) + 44 + k * 18);
            return (
              <div key={k} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16}}>
                <div style={{position: 'relative'}}><Icon name={i} size={60} color={C.foam} />
                  <svg width={60} height={60} style={{position: 'absolute', left: 0, top: 0}}><line x1={6} y1={54} x2={6 + 48 * q} y2={54 - 48 * q} stroke={C.coral} strokeWidth={7} strokeLinecap="round" /></svg></div>
                <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.foam}}>{t}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* 4 ─ QUATTRO MOTIVI (con mini-esempi animati) */
export const Motivi: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const mini = (k: number) => {
    const t = f - B(k + 1);
    if (k === 0) { // 10 fornitori → 1
      const m = ez(t, 20, 60);
      return <svg width={420} height={90}>{Array.from({length: 10}).map((_, i) => <circle key={i} cx={30 + i * 40 + (210 - 30 - i * 40) * m} cy={45} r={14} fill={i === 0 || m < 0.95 ? C.aqua : 'transparent'} opacity={1 - m * 0.6 + (i === 0 ? 0.6 : 0)} />)}
        <text x={210} y={86} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill={C.gold} opacity={m}>10 → 1</text></svg>;
    }
    if (k === 1) { // confronto prezzi
      const vals = [0.8, 0.95, 0.62, 0.88, 0.7];
      return <svg width={420} height={90}>{vals.map((v, i) => { const h = ez(t, 10 + i * 4, 30 + i * 4) * v * 70; const best = i === 2 && t > 50; return <rect key={i} x={20 + i * 80} y={80 - h} width={56} height={h} rx={8} fill={best ? C.gold : C.aqua} opacity={best || t < 50 ? 1 : 0.4} />; })}</svg>;
    }
    if (k === 2) { // fornitore assente → altro
      const sw = t > 40;
      return <svg width={420} height={90}><g transform="translate(110 45)"><circle r={34} fill={sw ? 'rgba(255,107,107,0.2)' : C.aqua} stroke={C.coral} strokeWidth={sw ? 4 : 0} />{sw && <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke={C.coral} strokeWidth={6} />}</g>
        <g transform="translate(300 45)" opacity={ez(t, 45, 60)}><circle r={34} fill="#7CF29A" /><path d="M -14 0 L -4 11 L 16 -11" stroke={C.abyss} strokeWidth={6} fill="none" /></g>
        <path d="M 160 45 L 250 45" stroke={C.foam} strokeWidth={4} opacity={ez(t, 45, 60)} /></svg>;
    }
    const days = [0.5, 0.9, 0.35, 0.7, 1, 0.45]; // volumi flessibili
    return <svg width={420} height={90}>{days.map((v, i) => { const h = (0.3 + 0.7 * Math.abs(Math.sin(t / 20 + i))) * v * 70 * ez(t, 0, 20); return <rect key={i} x={20 + i * 66} y={80 - h} width={46} height={h} rx={8} fill={C.violet} />; })}</svg>;
  };
  const cards = [['Meno lavoro interno', 'Un fornitore invece di dieci.', 'people'], ['Prezzo migliore', 'Ogni giorno si confronta tutto il mercato.', 'euro'], ['Continuità', 'Se uno non ha la merce, la trova un altro.', 'check'], ['Flessibilità', 'Volumi giorno per giorno, zero costi fissi.', 'chart']];
  return (
    <AbsoluteFill>
      <Title kicker="Per la catena" title="Perché comprare da un'azienda esterna?" at={B(0) - 6} size={62} />
      {cards.map(([t, s, i], k) => (
        <Card key={k} at={B(k + 1)} x={120 + (k % 2) * 850} y={300 + Math.floor(k / 2) * 300} w={820} h={270} num={String(k + 1)} title={t} sub={s} icon={i} color={[C.aqua, C.gold, '#7CF29A', C.violet][k]}>
          <div style={{position: 'absolute', right: 26, bottom: 18}}>{mini(k)}</div>
        </Card>
      ))}
    </AbsoluteFill>
  );
};

/* 5 ─ MARGINI GDO */
export const Margini: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const fillGold = ez(f, B(2) + 10, B(2) + 60);
  return (
    <AbsoluteFill>
      <Title kicker="Margini bassi" title="Ogni centesimo conta" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 360}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 210, color: C.gold, lineHeight: 1, opacity: ez(f, B(1), B(1) + 10)}}><Count at={B(1)} to={2.7} dur={40} dec={1} suf="%" /></div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.foam, marginTop: 10, opacity: ez(f, B(1) + 10, B(1) + 20)}}>margine operativo dei maggiori gruppi GDO</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.aqua, marginTop: 8, opacity: ez(f, B(1) + 20, B(1) + 30)}}>Mediobanca · anno 2024</div>
      </div>
      <Svg>
        <text x={1460} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.foam} opacity={ez(f, B(2), B(2) + 10)}>Su 100 € di vendite</text>
        {Array.from({length: 100}).map((_, i) => {
          const r = Math.floor(i / 10), c = i % 10;
          const q = ez(f, B(2) + r * 2 + c, B(2) + r * 2 + c + 10);
          const gold = i >= 97 ? Math.min(1, fillGold * 3) : 0;
          return <g key={i} transform={`translate(${1200 + c * 54} ${370 + r * 52}) scale(${q})`}>
            <circle r={22} fill={gold > 0.5 ? C.gold : 'rgba(28,143,214,0.45)'} stroke={gold > 0.5 ? '#FFE9A8' : 'none'} strokeWidth={3} />
            {i === 99 && gold > 0.5 && <rect x={-22 + 44 * 0.7} y={-23} width={44 * 0.3 + 2} height={46} fill={C.abyss} />}
          </g>;
        })}
        <text x={1460} y={930} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.gold} opacity={fillGold}>ne restano meno di 3</text>
      </Svg>
      <Pill at={B(3)} x={520} y={820} text="Ogni centesimo risparmiato pesa" color={C.aqua} icon="euro" size={32} />
    </AbsoluteFill>
  );
};

/* 6 ─ PERCHÉ COOP */
export const Coop: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const cards = [
    ['Conosce già il lavoro', 'Ordini Coop, piattaforme, fornitori del mercato di Roma.', 'handshake'],
    ['Solo pesce', 'Ogni giorno sceglie tra tanti fornitori, aste e barche.', 'fish'],
    ['Lavora in regola', 'Contratto scritto · tracciabilità · pagamento a 30 giorni · IFS Broker.', 'shield'],
    ['Difende il margine', 'Prezzo migliore, senza cambiare l\'organizzazione.', 'chart'],
  ];
  return (
    <AbsoluteFill>
      <Title kicker="Perché proprio noi" title="Perché Coop dovrebbe scegliere Argo Maris?" at={B(0) - 6} size={60} />
      {cards.map(([t, s, i], k) => <Card key={k} at={B(k + 1)} x={120 + (k % 2) * 850} y={300 + Math.floor(k / 2) * 290} w={820} h={260} num={String(k + 1)} title={t} sub={s} icon={i} color={k === 3 ? C.gold : C.aqua} />)}
    </AbsoluteFill>
  );
};

/* 7 ─ GIORNATA (24 ore) */
export const Giornata: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const x0 = 140, x1 = 1780, y = 600;
  const hx = (h: number) => x0 + ((h - 8) / 24) * (x1 - x0);
  const ev = [
    {h: 11, l: 'Ordini', s: '10:00–12:00', i: 'order', b: 1},
    {h: 13, l: 'Listini e blocco merce', s: 'subito dopo', i: 'scale', b: 2},
    {h: 15, l: 'Aste', s: '15:00', i: 'gavel', b: 3},
    {h: 19, l: 'Conferme e documenti', s: 'sera', i: 'doc', b: 4},
    {h: 26, l: 'Carico e consegna', s: 'notte', i: 'truck', b: 5},
    {h: 31, l: 'Nei magazzini, fresco', s: 'mattina dopo', i: 'warehouse', b: 6},
  ];
  const now = interpolate(f, [B(1), B(2), B(3), B(4), B(5), B(6), B(6) + 30], [10, 13, 15, 19, 25, 30, 31], clamp);
  const night = now > 20 && now < 30;
  return (
    <AbsoluteFill>
      <Title kicker="Una giornata" title="Gli orari veri" at={B(0) - 6} />
      <Svg>
        <defs><linearGradient id="sky2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5EC8F2" /><stop offset="0.35" stopColor="#F7D35C" /><stop offset="0.5" stopColor="#F7A35C" /><stop offset="0.6" stopColor="#1B2B5A" /><stop offset="0.9" stopColor="#0B1433" /><stop offset="1" stopColor="#5EC8F2" />
        </linearGradient></defs>
        <rect x={x0} y={y - 14} width={x1 - x0} height={28} rx={14} fill="url(#sky2)" />
        {Array.from({length: 25}).map((_, i) => i % 2 === 0 && <text key={i} x={hx(8 + i)} y={y + 60} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill="rgba(232,251,255,0.55)">{String((8 + i) % 24).padStart(2, '0')}</text>)}
        <g transform={`translate(${hx(now)} ${y})`} opacity={ez(f, B(1) - 10, B(1))}>
          <circle r={28} fill={night ? '#DDE6F5' : C.gold} />{night && <circle cx={11} cy={-8} r={23} fill="#1B2B5A" />}
        </g>
        {ev.map((e, i) => {
          const q = useIn(B(e.b), {damping: 11});
          const up = i % 2 === 0;
          return (
            <g key={i} transform={`translate(${hx(e.h)} ${y}) scale(${q})`} opacity={q}>
              <line x1={0} y1={up ? -20 : 20} x2={0} y2={up ? -70 : 70} stroke={C.aqua} strokeWidth={3} />
              <g transform={`translate(0 ${up ? -130 : 130})`}>
                <circle r={58} fill={C.abyss} stroke={C.aqua} strokeWidth={4} />
                <g transform="translate(-34 -34)"><Icon name={e.i} size={68} /></g>
                <text y={up ? -82 : 100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.foam}>{e.l}</text>
                <text y={up ? -112 : 130} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={C.gold}>{e.s}</text>
              </g>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/* 8 ─ UN ORDINE, PIÙ FORNITORI */
export const Split: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const rows = [{sp: 'orata', l: 'Orate', s: 'Grossista · mercato di Roma', i: 'warehouse', b: 1, c: C.aqua}, {sp: 'spigola', l: 'Spigole', s: 'Asta delle 15:00', i: 'gavel', b: 2, c: C.gold}, {sp: 'triglia', l: 'Pesce del giorno', s: 'Direttamente da una barca', i: 'boat', b: 3, c: C.coral}];
  const merge = f > B(4);
  return (
    <AbsoluteFill>
      <Title kicker="Il cuore del lavoro" title="Un ordine, più fornitori" at={B(0) - 6} />
      <Svg>
        {rows.map((r, i) => {
          const y = 410 + i * 170;
          return (
            <g key={i}>
              <Flow a={[560, 600]} b={[820, y]} at={B(r.b)} color={r.c} packets={false} />
              <Flow a={[1300, y]} b={[1540, 600]} at={B(4) + i * 6} color={r.c} />
            </g>
          );
        })}
      </Svg>
      <div style={{position: 'absolute', left: 120, top: 470, width: 440, height: 260, borderRadius: 26, background: 'rgba(6,36,74,0.85)', border: `3px solid ${C.foam}`, padding: 26, opacity: ez(f, B(0), B(0) + 12)}}>
        <div style={{display: 'flex', gap: 14, alignItems: 'center'}}><Icon name="order" size={54} color={C.foam} /><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.foam}}>Ordine catena</span></div>
        {['Orate', 'Spigole', 'Pesce del giorno'].map((t, i) => <div key={i} style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, color: 'rgba(232,251,255,0.8)', marginTop: 12}}>• {t}</div>)}
      </div>
      {rows.map((r, i) => {
        const q = useIn(B(r.b) + 10, {damping: 12});
        return (
          <div key={i} style={{position: 'absolute', left: 820, top: 410 + i * 170 - 64, width: 480, height: 128, borderRadius: 24, background: 'rgba(2,11,26,0.9)', border: `3px solid ${r.c}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', opacity: q, transform: `scale(${0.8 + q * 0.2})`}}>
            <svg width={120} height={90}><Fish sp={r.sp} x={60} y={45} s={0.5} /></svg>
            <div><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.foam}}>{r.l}</div><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 21, color: r.c}}>{r.s}</div></div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 1540, top: 600, transform: `translate(0,-50%) scale(${useIn(B(4) + 20, {damping: 11})})`, transformOrigin: 'left center'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
          <Pill at={B(4) + 20} x={150} y={-50} text="1 consegna" color={C.gold} icon="truck" size={30} />
          <Pill at={B(4) + 30} x={150} y={50} text="1 fattura" color={C.gold} icon="doc" size={30} />
        </div>
      </div>
      <div style={{opacity: merge ? 0 : 0}} />
    </AbsoluteFill>
  );
};

/* 9 ─ MERCATO DI ROMA */
export const Car: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const cols = 20, rows = 20, sz = 26, gap = 6, x0 = 1120, y0 = 290;
  const build = ez(f, B(1) - 10, B(1) + 50);
  const rot = f > B(3) ? Math.floor((f - B(3)) / 16) : -1;
  const down = f > B(4) ? 189 : -1, near = f > B(4) + 24 ? 190 : -1;
  const crown = useIn(B(3) + 30, {damping: 8});
  return (
    <AbsoluteFill>
      <Title kicker="Il primo vantaggio" title="Centro Agroalimentare di Roma" at={B(0) - 6} size={66} />
      <Big at={Wd('quattrocento')} x={470} y={450} text="+400" size={190} color={C.aqua} sub="AZIENDE" />
      <div style={{position: 'absolute', left: 120, top: 640, width: 760}}>
        {[['Un magazzino virtuale', 2, C.foam, 'warehouse'], ['Ogni giorno prezzo e qualità migliori', 3, C.gold, 'star'], ['Merce mancante? Un altro a pochi metri', 4, C.aqua, 'check']].map(([t, b, c, i], k) => {
          const q = useIn(B(b as number), {damping: 13});
          return <div key={k} style={{display: 'flex', gap: 16, alignItems: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: c as string, opacity: q, transform: `translateX(${(1 - q) * -40}px)`, marginBottom: 18}}><Icon name={i as string} size={46} color={c as string} />{t}</div>;
        })}
      </div>
      <Svg>
        {Array.from({length: cols * rows}).map((_, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const o = Math.max(0, Math.min(1, build * (cols + rows) - (r + c)));
          let col = 'rgba(28,143,214,0.55)';
          if (rot >= 0 && [(rot * 37) % 400, (rot * 53 + 91) % 400, (rot * 71 + 203) % 400].includes(i)) col = C.aqua;
          if (f > B(3) + 30 && i === 77 && down < 0) col = C.gold;
          if (i === down) col = C.coral;
          if (i === near) col = '#7CF29A';
          return <rect key={i} x={x0 + c * (sz + gap)} y={y0 + r * (sz + gap)} width={sz} height={sz} rx={6} fill={col} opacity={o} />;
        })}
        <g transform={`translate(${x0 + (77 % cols) * (sz + gap) + sz / 2} ${y0 + Math.floor(77 / cols) * (sz + gap) - 14}) scale(${crown})`} opacity={down < 0 ? 1 : 0}>
          <path d="M -24 0 L -18 -28 L -7 -13 L 0 -34 L 7 -13 L 18 -28 L 24 0 Z" fill={C.gold} />
        </g>
        {near > 0 && <text x={x0 + (190 % cols) * (sz + gap) + 60} y={y0 + Math.floor(190 / cols) * (sz + gap) + 22} fontFamily={FONT} fontWeight={900} fontSize={28} fill="#7CF29A">← pronto</text>}
      </Svg>
    </AbsoluteFill>
  );
};

/* 10 ─ TIRRENO: 11 marinerie + specie */
export const Tirreno: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const fish = [['triglia', 'triglie'], ['alice', 'alici'], ['calamaro', 'calamari'], ['gambero', 'gamberi'], ['ricciola', 'ricciole'], ['spada', 'spada']];
  return (
    <MarinerieTirreno {...p} kicker="Il nostro mare" title="Le marinerie del Tirreno" routesAt={B(3)}>
      <div style={{position: 'absolute', left: 60, top: 600, display: 'flex', flexWrap: 'wrap', width: 520, gap: 4, padding: '10px 14px', borderRadius: 26, background: 'rgba(2,11,26,0.85)', opacity: ez(f, B(3), B(3) + 10)}}>
        {fish.map(([sp, k], i) => {
          const q = ez(f, Wd(k) - 4, Wd(k) + 14);
          return <div key={i} style={{textAlign: 'center', width: 160, opacity: q, transform: `translateY(${(1 - q) * 30}px)`}}>
            <svg width={150} height={74}><Fish sp={sp} x={75} y={37} s={0.5} /></svg>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 21, color: C.foam}}>{SPECIES[sp].name}</div>
          </div>;
        })}
      </div>
      <Pill at={B(4)} x={1420} y={260} text="Chilometri pochi, freschezza tanta" color={C.gold} icon="star" size={28} />
    </MarinerieTirreno>
  );
};

/* 11 ─ ADRIATICO (stessa scena del video Coop) */
export const Adriatico = AdriaticoCoop;

/* 12 ─ COMPRARE ALLA FONTE: tre canali */
export const Fonte: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const clk = (at: number, hours: number, x: number, label: string, c: string) => {
    const q = ez(f, at, at + 50);
    const a = q * Math.PI * 2 * (hours / 24) * 2 * 0.5;
    return (
      <g transform={`translate(${x} 0)`} opacity={ez(f, at - 6, at + 4)}>
        <circle r={56} fill={C.abyss} stroke={c} strokeWidth={5} />
        <path d={`M 0 0 L 0 -56 A 56 56 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * 56} ${-Math.cos(a) * 56} Z`} fill={c} opacity={0.35} />
        <text y={12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={C.foam}>{Math.round(q * hours)}h</text>
        <text y={90} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={c}>{label}</text>
      </g>
    );
  };
  const guarantee = ez(f, B(3) + 10, B(3) + 50);
  return (
    <AbsoluteFill>
      <Title kicker="Alla fonte" title="Come si compra: tre canali" at={B(0) - 6} size={66} />
      <Card at={B(1)} x={120} y={280} w={540} h={300} num="1" icon="warehouse" title="Grossisti del mercato" sub="Un conto con ognuno. Contratto scritto: paghi a 30 giorni dalla consegna (legge sui deperibili)." />
      <Card at={B(2)} x={690} y={280} w={540} h={300} num="2" icon="gavel" color={C.gold} title="Aste" sub="Registrazione al mercato ittico. Regolamento del mercato: spesso garanzia (deposito o fideiussione) e tempi di pagamento." />
      <Card at={B(4)} x={1260} y={280} w={540} h={300} num="3" icon="boat" color={C.coral} title="Barche" sub="Prima vendita: registrazione come acquirente sul portale del Ministero dell'Agricoltura." />
      <div style={{position: 'absolute', left: 120, top: 610, width: 540, height: 270, borderRadius: 26, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.gold}`, padding: 22, opacity: ez(f, B(3), B(3) + 12)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.gold}}>Fideiussione = la banca garantisce per te</div>
        <svg width={500} height={170} style={{marginTop: 6}}>
          <g transform="translate(70 90)"><Icon name="user" size={80} color={C.foam} /></g>
          <g transform="translate(240 90)" opacity={guarantee}><Icon name="bank" size={90} color={C.gold} /></g>
          <g transform="translate(420 90)"><Icon name="gavel" size={80} color={C.foam} /></g>
          <path d={`M 120 90 L ${120 + 70 * guarantee} 90`} stroke={C.gold} strokeWidth={5} />
          <path d={`M 300 90 L ${300 + 70 * guarantee} 90`} stroke={C.gold} strokeWidth={5} />
          <text x={250} y={165} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.foam} opacity={guarantee}>se non paghi tu, paga la banca</text>
        </svg>
      </div>
      <div style={{position: 'absolute', left: 690, top: 610, width: 540, height: 270, borderRadius: 26, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.coral}`, padding: 22, opacity: ez(f, B(5), B(5) + 12)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.foam}}>Nota di vendita → Capitaneria</div>
        <svg width={500} height={190}><g transform="translate(0 80)">{clk(B(5) + 20, 24, 110, 'ONLINE', C.aqua)}{clk(B(5) + 40, 48, 270, 'SU CARTA', C.coral)}</g>
          <g transform="translate(380 40)" opacity={ez(f, B(5) + 60, B(5) + 70)}>{Array.from({length: 22}).map((_, i) => <rect key={i} x={i * 4.5} y={0} width={rand(i) > 0.5 ? 3 : 1.5} height={70} fill={C.foam} />)}<text x={50} y={100} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill={C.aqua}>codice lotto</text></g>
        </svg>
      </div>
      <div style={{position: 'absolute', left: 1260, top: 610, width: 540, height: 270, borderRadius: 26, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.aqua}`, padding: 26, opacity: ez(f, B(6), B(6) + 12)}}>
        <Icon name="globe" size={70} color={C.aqua} />
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam, marginTop: 10}}>Borsa Merci Telematica</div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: C.aqua}}>iscrizione gratuita · aperta agli intermediari</div>
      </div>
    </AbsoluteFill>
  );
};

/* 13 ─ POCO BUDGET */
export const Budget: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const cash = interpolate(f, [B(5), B(5) + 30, B(6), B(6) + 40], [0, 21000, 21000, 4200], clamp);
  return (
    <AbsoluteFill>
      <Title kicker="Poco capitale" title="Tutte le opzioni, dalla più semplice" at={B(0) - 6} size={62} />
      {[['Solo su ordine', 'Niente magazzino, niente invenduto.', 'order'], ['Usa i 30 giorni', 'Paghi i fornitori quando incassi dalla catena.', 'calendar'], ['Parti dal mercato di Roma', 'Poi aggiungi aste e barche.', 'gavel']].map(([t, s, i], k) => (
        <Card key={k} at={B(k + 1)} x={120} y={300 + k * 190} w={760} h={170} num={String(k + 1)} title={t} sub={s} color={[C.aqua, C.gold, C.coral][k]} />
      ))}
      <div style={{position: 'absolute', left: 960, top: 300, width: 840, height: 580, borderRadius: 28, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.gold}`, padding: 34, opacity: ez(f, B(4), B(4) + 12)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.gold, letterSpacing: 3}}>4 · ALL'ASTA SOLO UNA PARTE</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 20}}>
          <svg width={180} height={180} viewBox="-90 -90 180 180">
            <circle r={80} fill="rgba(28,143,214,0.35)" />
            <path d={`M 0 0 L 0 -80 A 80 80 0 0 1 ${Math.sin(Math.PI * 2 * 0.2 * ez(f, B(4) + 10, B(4) + 40)) * 80} ${-Math.cos(Math.PI * 2 * 0.2 * ez(f, B(4) + 10, B(4) + 40)) * 80} Z`} fill={C.gold} />
            <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.foam}>20%</text>
          </svg>
          <div><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.foam}}><Count at={B(4) + 20} to={1200} dur={30} pre="≈ " suf=" €" /></div><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, color: C.gold}}>al giorno all'asta</div></div>
        </div>
        <div style={{marginTop: 40, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: 'rgba(232,251,255,0.8)', opacity: ez(f, B(5), B(5) + 10)}}>Cassa necessaria</div>
        <div style={{height: 60, borderRadius: 16, background: 'rgba(232,251,255,0.1)', marginTop: 10, position: 'relative', overflow: 'hidden', opacity: ez(f, B(5), B(5) + 10)}}>
          <div style={{height: 60, width: `${(cash / 21000) * 100}%`, background: f > B(6) ? `linear-gradient(90deg, #7CF29A, ${C.aqua})` : C.coral, borderRadius: 16}} />
          <div style={{position: 'absolute', left: 20, top: 8, fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.abyss}}>{eur(Math.round(cash / 100) * 100)} €</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16, fontFamily: FONT, fontWeight: 800, fontSize: 26}}>
          <span style={{color: C.coral, opacity: ez(f, B(5) + 20, B(5) + 30)}}>pagando subito: ≈ 21.000 €</span>
          <span style={{color: '#7CF29A', opacity: ez(f, B(6) + 30, B(6) + 40)}}>anticipo fatture 80%: ≈ 4.200 €</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 14 ─ GUADAGNO AL CHILO */
export const Chilo: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const steps = [
    {b: 1, t: 'Acquisto', v: '6,00 €/kg', c: C.foam},
    {b: 2, t: '+ ricarico 15%', v: '6,90 €/kg', c: C.aqua},
    {b: 3, t: 'Margine', v: '0,90 €/kg', c: C.gold},
  ];
  return (
    <AbsoluteFill>
      <Title kicker="Il prezzo · indicativo" title="Il guadagno al chilo" at={B(0) - 6} />
      <Svg>
        <g transform={`translate(420 640) scale(${useIn(B(1), {damping: 12})})`}>
          <rect x={-220} y={60} width={440} height={30} rx={10} fill="#8DA2B5" />
          <rect x={-30} y={90} width={60} height={110} fill="#6D8296" />
          <rect x={-160} y={200} width={320} height={30} rx={10} fill="#8DA2B5" />
          <Fish sp="orata" x={0} y={0} s={1.7} />
          <g transform="translate(130 -110) rotate(8)"><rect x={-90} y={-36} width={180} height={72} rx={14} fill={C.gold} />
            <text y={14} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill={C.abyss}>{f > B(2) + 20 ? '6,90 €' : '6,00 €'}</text></g>
        </g>
      </Svg>
      {steps.map((s, i) => {
        const q = useIn(B(s.b), {damping: 12});
        return (
          <div key={i} style={{position: 'absolute', left: 900, top: 320 + i * 190, width: 880, height: 160, borderRadius: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px',
            background: i === 2 ? 'rgba(255,201,74,0.12)' : 'rgba(6,36,74,0.75)', border: `3px solid ${s.c}`, opacity: q, transform: `translateX(${(1 - q) * 80}px)`}}>
            <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.foam}}>{s.t}</span>
            <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 64, color: s.c}}>{s.v}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 900, top: 900, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: 'rgba(232,251,255,0.65)', opacity: ez(f, B(3) + 20, B(3) + 30)}}>prima dei trasporti · prezzi indicativi</div>
    </AbsoluteFill>
  );
};

/* 15 ─ TRASPORTI */
export const Trasporti: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const rows = [{pc: '1%', kg: '≈ 0,07 €', g: '70 €', y: 14560, b: 2}, {pc: '2%', kg: '≈ 0,14 €', g: '140 €', y: 29120, b: 3}, {pc: '3%', kg: '≈ 0,21 €', g: '210 €', y: 43680, b: 4}];
  const cols = [380, 680, 1000, 1360];
  return (
    <AbsoluteFill>
      <Title kicker="Trasporti" title="Tra l'1% e il 3% del prezzo" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 290, display: 'flex', gap: 20, opacity: ez(f, B(1), B(1) + 10)}}>
        {['Fattura media 7.000 €/giorno', '4 giorni a settimana', '52 settimane'].map((t, i) => <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.abyss, background: C.aqua, borderRadius: 20, padding: '8px 18px'}}>{t}</span>)}
      </div>
      <div style={{position: 'absolute', left: 120, top: 390, width: 1680}}>
        <div style={{display: 'flex', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: 'rgba(232,251,255,0.6)', paddingBottom: 12, opacity: ez(f, B(1), B(1) + 10)}}>
          <span style={{width: cols[0]}}>Trasporto</span><span style={{width: cols[1] - cols[0]}}>€ al kg</span><span style={{width: cols[2] - cols[1]}}>€ al giorno</span><span>€ all'anno</span>
        </div>
        {rows.map((r, i) => {
          const q = useIn(B(r.b), {damping: 13});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', height: 120, marginBottom: 16, borderRadius: 22, background: 'rgba(6,36,74,0.75)', border: `2px solid ${[C.aqua, C.gold, C.coral][i]}`, opacity: q, transform: `translateY(${(1 - q) * 40}px)`, fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.foam}}>
              <span style={{width: cols[0], paddingLeft: 30, fontSize: 60, color: [C.aqua, C.gold, C.coral][i]}}>{r.pc}</span>
              <span style={{width: cols[1] - cols[0]}}>{r.kg}</span>
              <span style={{width: cols[2] - cols[1]}}>{r.g}</span>
              <span><Count at={B(r.b) + 10} to={r.y} dur={30} pre="≈ " suf=" €" /></span>
            </div>
          );
        })}
      </div>
      <Pill at={B(5)} x={960} y={880} text="1 punto di trasporto ≈ 14.500 € l'anno" color={C.gold} icon="truck" size={36} />
    </AbsoluteFill>
  );
};

/* 16 ─ UTILE */
export const Utile: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const max = 210000;
  const bars = [{l: 'Ricarico 7%', a: 25000, b: 54000, c: C.aqua, at: B(3)}, {l: 'Ricarico 15%', a: 120000, b: 149000, c: C.gold, at: B(4)}, {l: 'Ricarico 20%', a: 172000, b: 202000, c: C.coral, at: B(5)}];
  const X0 = 500, WW = 1000;
  return (
    <AbsoluteFill>
      <Title kicker="Utile della società" title="Quanto guadagna Argo Maris" at={B(0) - 6} size={66} />
      <div style={{position: 'absolute', left: 120, top: 290, display: 'flex', alignItems: 'center', gap: 18, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.foam, opacity: ez(f, B(1), B(1) + 10)}}>
        {['7.000 €', '×', '4 gg', '×', '52 sett.', '='].map((t, i) => <span key={i} style={{opacity: ez(f, B(1) + i * 8, B(1) + i * 8 + 8)}}>{t}</span>)}
        <span style={{color: C.gold, fontSize: 52, opacity: ez(f, B(1) + 50, B(1) + 60)}}><Count at={B(1) + 50} to={1456000} dur={30} pre="≈ " suf=" €/anno" /></span>
      </div>
      <div style={{position: 'absolute', left: 120, top: 380, display: 'flex', gap: 16, opacity: ez(f, B(2), B(2) + 10)}}>
        {['– trasporti 1–3%', '– banca e assicurazione 1%', '– costi fissi ≈ 12.000 €'].map((t, i) => <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.coral, border: `2px solid ${C.coral}`, borderRadius: 18, padding: '6px 16px', opacity: ez(f, B(2) + i * 12, B(2) + i * 12 + 10)}}>{t}</span>)}
      </div>
      <Svg>
        {[0, 50000, 100000, 150000, 200000].map((v, i) => (
          <g key={i} opacity={ez(f, B(3) - 10, B(3))}>
            <line x1={X0 + (v / max) * WW} x2={X0 + (v / max) * WW} y1={490} y2={850} stroke="rgba(232,251,255,0.12)" strokeWidth={2} />
            <text x={X0 + (v / max) * WW} y={880} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill="rgba(232,251,255,0.5)">{v / 1000}k</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const q = ez(f, b.at, b.at + 30);
          const y = 520 + i * 115;
          return (
            <g key={i} opacity={ez(f, b.at, b.at + 8)}>
              <text x={X0 - 30} y={y + 40} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={34} fill={b.c}>{b.l}</text>
              <rect x={X0} y={y + 10} width={(b.a / max) * WW * q} height={50} rx={10} fill={b.c} opacity={0.35} />
              <rect x={X0 + (b.a / max) * WW} y={y + 10} width={((b.b - b.a) / max) * WW * q} height={50} rx={10} fill={b.c} />
              <text x={X0 + (b.b / max) * WW * Math.max(q, 0.01) + 20} y={y + 48} fontFamily={MONO} fontWeight={700} fontSize={32} fill={C.foam} opacity={q}>{eur(b.a / 1000)}–{eur(b.b / 1000)} mila €</text>
            </g>
          );
        })}
      </Svg>
      <Pill at={B(6)} x={960} y={920} text="Valgono solo se la catena accetta il prezzo" color={C.coral} icon="shield" size={30} dark />
    </AbsoluteFill>
  );
};

/* 17 ─ DIECI CENTESIMI */
export const Centesimi: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const coin = useIn(B(0), {damping: 9});
  return (
    <AbsoluteFill>
      <Title kicker="Un esempio che fa capire tutto" title="Dieci centesimi" at={B(0) - 6} size={84} />
      <Svg>
        <g transform={`translate(440 620) scale(${coin}) rotate(${(1 - coin) * 180})`}>
          <circle r={190} fill="#C98A3B" /><circle r={160} fill="#E2A955" stroke="#F5CD7E" strokeWidth={6} />
          <text y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill="#7A4E1A">10</text>
          <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#7A4E1A">CENT / kg</text>
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 860, top: 330}}>
        {[
          {b: 1, l: 'Pesce venduto in un anno', v: <Count at={B(1) + 10} to={211000} dur={40} pre="≈ " suf=" kg" />, c: C.aqua},
          {b: 2, l: 'Valore di 10 cent in più', v: <Count at={B(2) + 10} to={21000} dur={40} pre="≈ " suf=" €/anno" />, c: C.gold},
          {b: 2, l: 'Ogni mese', v: <Count at={B(2) + 40} to={1700} dur={30} pre="+ di " suf=" €" />, c: '#7CF29A', d: 30},
        ].map((r, i) => {
          const q = useIn(B(r.b) + (r.d ?? 0), {damping: 12});
          return (
            <div key={i} style={{marginBottom: 34, opacity: q, transform: `translateX(${(1 - q) * 60}px)`}}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: 'rgba(232,251,255,0.75)'}}>{r.l}</div>
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 84, color: r.c}}>{r.v}</div>
            </div>
          );
        })}
      </div>
      <Pill at={B(3)} x={1290} y={900} text="Comprare bene è tutto" color={C.gold} icon="star" size={38} />
    </AbsoluteFill>
  );
};

/* 18 ─ COME GIRANO I SOLDI */
export const Soldi: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const adv = ez(f, B(3) + 10, B(3) + 40) * 0.8;
  const risk = ez(f, B(4) + 30, B(4) + 60);
  return (
    <AbsoluteFill>
      <Title kicker="Pagamenti" title="Come girano i soldi" at={B(0) - 6} />
      <Svg>
        <Flow a={[420, 470]} b={[860, 470]} at={B(1)} color={C.gold} label="paga" />
        <Flow a={[1060, 470]} b={[1500, 470]} at={B(1) + 20} color={C.gold} label="paga" />
      </Svg>
      <Node at={B(1) - 10} x={330} y={470} icon="store" label="Catena" color={C.foam} size={140} />
      <Node at={B(1)} x={960} y={470} emblem label="Argo Maris" size={150} />
      <Node at={B(1) + 10} x={1590} y={470} icon="boat" label="Fornitori" color={C.foam} size={140} />
      <Pill at={B(2)} x={645} y={350} text="30 giorni · contratto scritto" color={C.aqua} size={24} dark />
      <Pill at={B(2) + 10} x={1275} y={350} text="30 giorni · contratto scritto" color={C.aqua} size={24} dark />
      <div style={{position: 'absolute', left: 120, top: 700, width: 820, height: 190, borderRadius: 26, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.aqua}`, padding: 26, opacity: ez(f, B(3), B(3) + 12)}}>
        <div style={{display: 'flex', gap: 16, alignItems: 'center'}}><Icon name="bank" size={52} /><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam}}>Anticipo fatture</span><span style={{marginLeft: 'auto', fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.aqua}}>70–80%</span></div>
        <div style={{height: 40, borderRadius: 12, background: 'rgba(232,251,255,0.1)', marginTop: 22}}><div style={{height: 40, width: `${adv * 100}%`, background: C.aqua, borderRadius: 12}} /></div>
      </div>
      <div style={{position: 'absolute', left: 980, top: 700, width: 820, height: 190, borderRadius: 26, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.gold}`, padding: 26, opacity: ez(f, B(4), B(4) + 12)}}>
        <div style={{display: 'flex', gap: 16, alignItems: 'center'}}><Icon name="shield" size={52} color={C.gold} /><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam}}>Factoring pro soluto</span><span style={{marginLeft: 'auto', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.gold}}>costo 1–3%</span></div>
        <svg width={760} height={70} style={{marginTop: 10}}>
          <text x={0} y={46} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.foam}>rischio insoluto</text>
          <g transform={`translate(${260 + risk * 380} 36)`}><circle r={24} fill={C.coral} /><text y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.abyss}>!</text></g>
          <text x={760} y={46} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.gold} opacity={risk}>→ al factor</text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* 18b ─ STRUMENTI FINANZIARI */
export const Strumenti: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const adv = ez(f, B(1) + 20, B(1) + 50) * 0.8;
  const risk = ez(f, B(2) + 40, B(2) + 70);
  const fido = ez(f, B(3) + 20, B(3) + 50);
  return (
    <AbsoluteFill>
      <Title kicker="Strumenti finanziari" title="Spiegati semplici" at={B(0) - 6} />
      <Card at={B(1)} x={120} y={280} w={820} h={300} num="1" icon="bank" title="Anticipo fatture" sub="Fatturi alla catena: la banca ti anticipa subito il 70–80%. Quando la catena paga, la banca si riprende i soldi.">
        <div style={{height: 34, borderRadius: 10, background: 'rgba(232,251,255,0.1)', marginTop: 18}}><div style={{height: 34, width: `${adv * 100}%`, borderRadius: 10, background: C.aqua}} /></div>
      </Card>
      <Card at={B(2)} x={980} y={280} w={820} h={300} num="2" icon="shield" color={C.gold} title="Factoring pro soluto" sub="Vendi la fattura al factor: ti paga subito e, se la catena non paga, il rischio è suo. Costo 1–3%.">
        <svg width={760} height={60} style={{marginTop: 10}}><text x={0} y={40} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.foam}>rischio</text>
          <g transform={`translate(${130 + risk * 480} 30)`}><circle r={22} fill={C.coral} /><text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.abyss}>!</text></g>
          <text x={760} y={40} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.gold} opacity={risk}>al factor</text></svg>
      </Card>
      <Card at={B(3)} x={120} y={610} w={820} h={290} num="3" icon="money" color="#7CF29A" title="Fido bancario + Fondo di Garanzia PMI" sub="Una riserva di cassa. Il Fondo di Garanzia per le PMI garantisce alla banca una parte del prestito.">
        <svg width={760} height={50} style={{marginTop: 8}}><rect x={0} y={10} width={740} height={30} rx={10} fill="rgba(232,251,255,0.1)" /><rect x={0} y={10} width={740 * fido} height={30} rx={10} fill="#7CF29A" opacity={0.35} /><rect x={0} y={10} width={740 * fido * 0.6} height={30} rx={10} fill="#7CF29A" />
          <text x={12} y={33} fontFamily={FONT} fontWeight={800} fontSize={18} fill={C.abyss} opacity={fido}>parte garantita dal Fondo</text></svg>
      </Card>
      <Card at={B(4)} x={980} y={610} w={820} h={290} num="4" icon="star" color={C.violet} title="Finanziamenti agevolati" sub="Per le nuove imprese, per esempio Invitalia, se hai i requisiti. Da verificare con il commercialista." />
    </AbsoluteFill>
  );
};

/* 19 ─ ASSICURAZIONI con esempi */
export const Assicurazioni: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const para = ['Solo su ordine', 'Più fornitori', 'Cassa di sicurezza', 'Pro soluto per i clienti a rischio'];
  const refund = ez(f, B(1) + 60, B(1) + 100);
  const temp = interpolate(f, [B(3) + 30, B(3) + 90], [0, 14], clamp);
  return (
    <AbsoluteFill>
      <Title kicker="Protezioni" title="Tre assicurazioni, tre esempi" at={B(0) - 6} size={66} />
      <Card at={B(1)} x={120} y={280} w={540} h={420} num="1" icon="euro" title="Crediti" sub="Il cliente non ti paga? Rimborso di solito tra l'80 e il 90%. Premio: piccola % del fatturato.">
        <div style={{marginTop: 18, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.coral, opacity: ez(f, B(1) + 30, B(1) + 40)}}>fattura non pagata: 10.000 €</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#7CF29A', opacity: refund}}>rimborso: {eur(8000 * refund)}–{eur(9000 * refund)} €</div>
      </Card>
      <Card at={B(2)} x={690} y={280} w={540} h={420} num="2" icon="shield" color={C.gold} title="RC prodotti" sub="Un lotto difettoso fa stare male qualcuno: copre i danni. Con l'estensione, anche il ritiro dagli scaffali.">
        <svg width={480} height={110} style={{marginTop: 10}} opacity={ez(f, B(2) + 40, B(2) + 50)}>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 70} y={20} width={56} height={60} rx={8} fill={i === 2 ? C.coral : 'rgba(232,251,255,0.3)'} transform={i === 2 ? `translate(${ez(f, B(2) + 80, B(2) + 110) * 200} ${-ez(f, B(2) + 80, B(2) + 110) * 10})` : ''} />)}
          <rect x={10} y={84} width={300} height={8} fill="#8DA2B5" />
          <text x={400} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.coral} opacity={ez(f, B(2) + 100, B(2) + 110)}>RITIRO</text>
        </svg>
      </Card>
      <Card at={B(3)} x={1260} y={280} w={540} h={420} num="3" icon="truck" color={C.coral} title="Merci trasportate" sub="Di notte il camion perde il freddo e il carico si rovina: copre la merce persa, perdite e avarie.">
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14}}>
          <Icon name="thermo" size={70} color={temp > 6 ? C.coral : C.aqua} />
          <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 52, color: temp > 6 ? C.coral : C.aqua}}>{temp.toFixed(0)} °C</span>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 26, color: '#7CF29A', opacity: ez(f, B(3) + 100, B(3) + 110)}}>coperto ✓</span>
        </div>
      </Card>
      <div style={{position: 'absolute', left: 120, top: 740, opacity: ez(f, B(4), B(4) + 10), fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.gold, letterSpacing: 3}}>I PARACADUTE</div>
      {para.map((t, i) => <Pill key={i} at={B(4) + 15 + i * 16} x={[250, 600, 960, 1490][i]} y={830} text={t} color="#7CF29A" icon="check" size={26} dark />)}
    </AbsoluteFill>
  );
};

/* 20 ─ IN REGOLA: passo per passo */
export const Regole: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const steps = [
    {t: 'Notifica sanitaria', s: 'SCIA al SUAP del comune → trasmessa all\'ASL, come intermediario senza deposito', i: 'doc', flow: ['SCIA', 'SUAP', 'ASL']},
    {t: 'HACCP', s: 'corso e piano di autocontrollo: controlli, registri, rintracci ogni lotto', i: 'check'},
    {t: 'Registrazione al Ministero', s: 'acquirente di prima vendita, per comprare dalle barche', i: 'boat'},
    {t: 'Qualifica della catena', s: 'questionario fornitore: visura, documenti, assicurazioni, contratto', i: 'handshake'},
  ];
  return (
    <AbsoluteFill>
      <Title kicker="In regola" title="Passo per passo" at={B(0) - 6} />
      {steps.map((st, k) => {
        const q = useIn(B(k + 1), {damping: 13});
        return (
          <div key={k} style={{position: 'absolute', left: 120, top: 280 + k * 160, width: 1680, height: 140, borderRadius: 24, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.aqua}`, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px', opacity: q, transform: `translateX(${(1 - q) * -60}px)`}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.abyss, background: C.aqua, borderRadius: 16, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{k + 1}</div>
            <Icon name={st.i} size={60} />
            <div style={{width: 760}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.foam}}>{st.t}</div><div style={{fontFamily: FONT, fontWeight: 600, fontSize: 23, color: 'rgba(232,251,255,0.75)'}}>{st.s}</div></div>
            {st.flow && <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              {st.flow.map((x, i) => <React.Fragment key={i}>
                <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.abyss, background: [C.aqua, C.gold, '#7CF29A'][i], borderRadius: 14, padding: '8px 18px', opacity: ez(f, B(1) + 20 + i * 18, B(1) + 30 + i * 18)}}>{x}</span>
                {i < 2 && <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.foam, opacity: ez(f, B(1) + 28 + i * 18, B(1) + 36 + i * 18)}}>→</span>}
              </React.Fragment>)}
            </div>}
            <div style={{marginLeft: 'auto'}}><Icon name="check" size={56} color="#7CF29A" sw={6} /></div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 20b ─ IFS BROKER: come si ottiene */
export const Ifs: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const badge = useIn(B(0) + 10, {damping: 10});
  const steps = [{t: 'Ente accreditato', s: 'scegli chi ti certifica', i: 'search', b: 1}, {t: 'Procedure', s: 'fornitori · tracciabilità · reclami · ritiro', i: 'doc', b: 2}, {t: 'Audit', s: 'anche a distanza', i: 'check', b: 3}, {t: 'Certificato', s: 'vale 1 anno · rinnovo annuale', i: 'star', b: 3}];
  return (
    <AbsoluteFill>
      <Title kicker="Certificazione" title="IFS Broker: come si ottiene" at={B(0) - 6} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(330 560) scale(${badge})`}>
          {Array.from({length: 20}).map((_, i) => <path key={i} d="M 0 -150 L 16 -124 L -16 -124 Z" fill={C.gold} transform={`rotate(${i * 18 + f * 0.4})`} />)}
          <circle r={118} fill={C.gold} /><circle r={100} fill="none" stroke={C.abyss} strokeWidth={4} />
          <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.abyss}>IFS</text>
          <text y={56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.abyss}>BROKER</text>
        </g>
        <line x1={640} x2={640 + 1100 * ez(f, B(1), B(3) + 60)} y1={560} y2={560} stroke={C.aqua} strokeWidth={8} strokeLinecap="round" />
      </svg>
      {steps.map((st, k) => {
        const q = useIn(B(st.b) + (k === 3 ? 60 : 0), {damping: 11});
        const x = 700 + k * 340;
        return (
          <div key={k} style={{position: 'absolute', left: x - 140, top: 470, width: 280, textAlign: 'center', opacity: q, transform: `translateY(${(1 - q) * 40}px)`}}>
            <div style={{width: 120, height: 120, margin: '0 auto', borderRadius: 60, background: C.abyss, border: `5px solid ${k === 3 ? C.gold : C.aqua}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={st.i} size={64} color={k === 3 ? C.gold : C.aqua} /></div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam, marginTop: 16}}>{st.t}</div>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 22, color: 'rgba(232,251,255,0.75)', marginTop: 6}}>{st.s}</div>
          </div>
        );
      })}
      <Pill at={B(4)} x={760} y={850} text="Preparazione: alcuni mesi" color={C.aqua} icon="calendar" size={28} dark />
      <Pill at={B(4) + 50} x={1360} y={850} text="Una leva forte con le catene" color={C.gold} icon="star" size={28} />
    </AbsoluteFill>
  );
};

/* 20c ─ CONSEGNA: piattaforma, hub, diretta */
export const Consegna: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  return <ConsegnaDiagram {...p} kicker="Logistica" title="Dove consegni: tre strade" platAt={B(1)} hubAt={B(2)} directAt={B(3)} prosAt={B(4)} consAt={B(4) + 60} tipAt={B(5)}
    tip="Parti dalla piattaforma; proponi la diretta per i negozi vicini o il pesce più delicato." />;
};

/* 20d ─ LEVE */
export const Leve: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const lv = [['Prezzo', '10 cent/kg cambiano il suo margine', 'euro'], ['Continuità', 'due mari + mercato di Roma, a rotazione', 'storm'], ['Freschezza', 'pesce locale e consegna diretta', 'snow'], ['Semplicità', '1 fornitore · 1 referente · 1 fattura', 'handshake'], ['Sicurezza', 'contratto · tracciabilità · assicurazioni · IFS', 'shield']];
  const tilt = interpolate(f, [B(1), B(5) + 40], [12, -8], clamp);
  return (
    <AbsoluteFill>
      <Title kicker="Trattativa" title="Su cosa fare leva con la catena" at={B(0) - 6} size={64} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform="translate(330 640)">
          <polygon points="-40,120 40,120 0,40" fill={C.gold} />
          <g transform={`translate(0 40) rotate(${tilt})`}><rect x={-260} y={-14} width={520} height={28} rx={10} fill={C.aqua} /></g>
          <g transform={`translate(${-220} ${40 - Math.sin((tilt * Math.PI) / 180) * 220 - 70})`}><rect x={-60} y={0} width={120} height={56} rx={10} fill={C.coral} /><text y={38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.abyss}>CATENA</text></g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 520, top: 760, transform: 'translate(-50%,-50%)'}}><Emblem size={110} /></div>
      {lv.map(([t, s, i], k) => {
        const q = useIn(B(k + 1), {damping: 12});
        return (
          <div key={k} style={{position: 'absolute', left: 760, top: 280 + k * 128, width: 1040, height: 112, borderRadius: 22, background: 'rgba(6,36,74,0.78)', border: `2px solid ${k === 0 ? C.gold : C.aqua}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', opacity: q, transform: `translateX(${(1 - q) * 80}px)`}}>
            <Icon name={i} size={54} color={k === 0 ? C.gold : C.aqua} />
            <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.foam, width: 260}}>{t}</span>
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: 'rgba(232,251,255,0.8)'}}>{s}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 20e ─ GLOSSARIO */
export const Glossario: React.FC<SP> = (p) => {
  const {B, Wd} = useScene(p);
  const terms: [string, string, number][] = [
    ['Buying agent', 'compri a nome tuo, rivendi con il tuo margine', B(1)],
    ['Broker senza deposito', 'niente magazzino: dal fornitore al cliente', B(2)],
    ['Prima vendita', 'il primo acquisto del pescato, appena sbarcato', B(3)],
    ['Nota di vendita', 'il documento che registra la prima vendita', Wd('nota')],
    ['Anticipo fatture', 'la banca ti anticipa i soldi della fattura', B(4)],
    ['Pro soluto', 'il rischio del mancato pagamento passa al factor', Wd('soluto')],
    ['Piattaforma', 'il magazzino centrale della catena', B(5)],
    ['Consegna diretta', 'dritto al punto vendita', Wd('consegna')],
  ];
  return (
    <AbsoluteFill>
      <Title kicker="Ripasso" title="Le parole del mestiere" at={B(0) - 6} />
      {terms.map(([t, s, at], k) => (
        <Card key={k} at={at} x={120 + (k % 2) * 850} y={280 + Math.floor(k / 2) * 160} w={820} h={140} title={t} sub={s} color={k % 2 ? C.gold : C.aqua} />
      ))}
    </AbsoluteFill>
  );
};

/* 21 ─ COSTI SOCIETÀ *//* 21 ─ COSTI SOCIETÀ */
export const Societa: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const rec = useIn(B(1), {damping: 13});
  const cap = ez(f, B(2) + 10, B(2) + 60);
  return (
    <AbsoluteFill>
      <Title kicker="La società" title="Quanto costa aprirla" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 300, width: 760, borderRadius: 18, background: '#F4F7FA', padding: '30px 38px', boxShadow: '0 30px 80px rgba(0,0,0,0.45)', opacity: rec, transform: `translateY(${(1 - rec) * 80}px) rotate(-1.5deg)`}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.abyss, borderBottom: `4px solid ${C.abyss}`, paddingBottom: 12}}>SRLS · modello standard</div>
        {[['Imposta di registro', '200 €'], ['Diritti Camera di Commercio', '≈ 120 €'], ['Onorario del notaio', '0 €']].map(([k, v], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px dashed #9FB2C4', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#30465C', opacity: ez(f, B(1) + 20 + i * 15, B(1) + 30 + i * 15)}}>
            <span>{k}</span><span style={{fontFamily: MONO, color: C.abyss}}>{v}</span>
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: 18, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.abyss, opacity: ez(f, B(1) + 70, B(1) + 80)}}><span>Totale</span><span style={{fontFamily: MONO}}>≈ 320 €</span></div>
      </div>
      <div style={{position: 'absolute', left: 980, top: 300, width: 820, borderRadius: 26, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.aqua}`, padding: 30, opacity: ez(f, B(2), B(2) + 10)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam}}>Capitale sociale</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 64, color: C.aqua, marginTop: 8}}>{eur(1 + Math.round(cap * 9998))} €</div>
        <div style={{height: 20, borderRadius: 10, background: 'rgba(232,251,255,0.1)', marginTop: 12}}><div style={{height: 20, width: `${cap * 100}%`, borderRadius: 10, background: C.aqua}} /></div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 22, color: 'rgba(232,251,255,0.6)', marginTop: 8}}><span>da 1 €</span><span>fino a 9.999 €</span></div>
      </div>
      <div style={{position: 'absolute', left: 980, top: 620, width: 820, borderRadius: 26, background: 'rgba(6,36,74,0.75)', border: `2px solid ${C.gold}`, padding: 30, opacity: ez(f, B(3), B(3) + 10)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam}}>Ogni anno</div>
        {[['Commercialista', '1.000–3.000 €'], ['Diritti camerali', '≈ 120–200 €']].map(([k, v], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.foam, opacity: ez(f, B(3) + 10 + i * 30, B(3) + 20 + i * 30)}}><span>{k}</span><span style={{fontFamily: MONO, color: C.gold}}>{v}</span></div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 22 ─ QUANTO RESTA A TE */
export const Stipendio: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const bars = [{l: 'Utile prima delle tasse', v: 134200, at: B(2), c: C.foam}, {l: 'Dopo IRES 24% + IRAP ≈ 4%', v: 96800, at: B(3), c: C.aqua}, {l: 'Dopo imposta sui dividendi 26%', v: 71600, at: B(4), c: C.gold}];
  const max = 140000, base = 860, HH = 420;
  return (
    <AbsoluteFill>
      <Title kicker="Lo stipendio" title="Quanto resta a te" at={B(0) - 6} />
      <Pill at={B(1)} x={560} y={300} text="Scenario centrale: ricarico 15% · trasporti 2%" color={C.aqua} size={26} dark />
      <Svg>
        {bars.map((b, i) => {
          const q = ez(f, b.at, b.at + 30);
          const h = (b.v / max) * HH * q;
          const x = 200 + i * 300;
          return (
            <g key={i} opacity={ez(f, b.at, b.at + 6)}>
              <rect x={x} y={base - h} width={210} height={h} rx={14} fill={b.c} opacity={0.9} />
              <text x={x + 105} y={base - h - 22} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={C.foam}>≈ {eur(Math.round((b.v * q) / 100) * 100)} €</text>
              <foreignObject x={x - 30} y={base + 14} width={270} height={90}><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 21, color: 'rgba(232,251,255,0.75)', textAlign: 'center'}}>{b.l}</div></foreignObject>
            </g>
          );
        })}
      </Svg>
      <div style={{position: 'absolute', left: 1180, top: 360, width: 620, height: 300, borderRadius: 30, background: 'linear-gradient(160deg, rgba(255,201,74,0.22), rgba(6,36,74,0.9))', border: `3px solid ${C.gold}`, textAlign: 'center', paddingTop: 34, opacity: ez(f, B(4) + 30, B(4) + 40), transform: `scale(${0.85 + 0.15 * ez(f, B(4) + 30, B(4) + 45)})`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.foam}}>al mese, quasi</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 130, color: C.gold, lineHeight: 1.1}}><Count at={B(4) + 30} to={5970} dur={40} pre="" suf=" €" /></div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.aqua, opacity: ez(f, B(5), B(5) + 10)}}>con ricarico prudente 7%: ≈ 1.760 €</div>
      </div>
      <Pill at={B(6)} x={1490} y={760} text="– contributi INPS personali" color={C.coral} icon="doc" size={26} dark />
      <Pill at={B(6) + 50} x={1490} y={850} text="La forma migliore la sceglie il commercialista" color={C.foam} icon="handshake" size={22} dark />
    </AbsoluteFill>
  );
};

/* 23 ─ ESTERO (plus) */
export const Estero = EsteroCoop;

/* 24 ─ TABELLA DI MARCIA */
export const Roadmap: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const ms = [{t: 'Mese 1', s: 'Società · ASL · registrazioni · contratti fornitori e trasporto', i: 'doc'}, {t: 'Mese 2', s: 'Primi ordini della catena, comprando al mercato di Roma', i: 'warehouse'}, {t: 'Mese 4', s: 'Aste e barche di Tirreno e Adriatico · anticipo fatture · assicurazione crediti', i: 'boat'}, {t: 'Anno 1', s: 'Certificazione IFS Broker e più catene', i: 'star'}];
  const prog = interpolate(f, [B(1), B(2), B(3), B(4), B(4) + 30], [0.05, 0.37, 0.69, 0.95, 1], clamp);
  const x0 = 260, x1 = 1660;
  return (
    <AbsoluteFill>
      <Title kicker="Partenza" title="La tabella di marcia" at={B(0) - 6} />
      <Svg>
        <line x1={x0} x2={x1} y1={480} y2={480} stroke="rgba(232,251,255,0.15)" strokeWidth={10} strokeLinecap="round" />
        <line x1={x0} x2={x0 + (x1 - x0) * prog} y1={480} y2={480} stroke={C.aqua} strokeWidth={10} strokeLinecap="round" opacity={ez(f, B(1), B(1) + 5)} />
        <g transform={`translate(${x0 + (x1 - x0) * prog} 450)`} opacity={ez(f, B(1), B(1) + 5)}><Boat x={0} y={0} s={1.6} color={C.gold} /></g>
      </Svg>
      {ms.map((m, i) => {
        const q = useIn(B(i + 1), {damping: 11});
        const x = x0 + ((x1 - x0) / 3) * i;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 480, transform: `translate(-50%, -50%)`, opacity: q}}>
            <div style={{width: 90, height: 90, borderRadius: 45, background: i === 3 ? C.gold : C.aqua, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${q})`, margin: '0 auto'}}><Icon name={m.i} size={52} color={C.abyss} sw={6} /></div>
            <div style={{position: 'absolute', left: -160, top: 120, width: 410, textAlign: 'center'}}>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: i === 3 ? C.gold : C.aqua}}>{m.t}</div>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 25, color: C.foam, marginTop: 10, lineHeight: 1.35}}>{m.s}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 25 ─ FINE: sintesi + chiusura HyperFrames */
export const Fine: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  return (
    <AbsoluteFill>
      <Title kicker="In sintesi" title="Argo Maris compra bene per la GDO" at={B(0) - 6} size={66} />
      {[['warehouse', 'Mercato di Roma'], ['gavel', 'Aste'], ['boat', 'Barche']].map(([i, t], k) => <Pill key={k} at={B(0) + 60 + k * 14} x={420 + k * 540} y={420} text={t} color={C.aqua} icon={i} size={40} />)}
      {['Un solo fornitore', 'Prezzi migliori', 'Tutto in regola'].map((t, k) => <Pill key={k} at={B(1) + k * 14} x={420 + k * 540} y={600} text={t} color={C.gold} icon="check" size={40} />)}
      <Pill at={B(2)} x={960} y={780} text="Cifre indicative: da verificare con il commercialista" color={C.coral} icon="doc" size={28} dark />
      <Sequence from={B(3) - 12}>
        <OffthreadVideo src={staticFile('gdo-v6/hf_end.mp4')} muted />
      </Sequence>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<SP>> = {
  intro: Intro, idea: Idea, modello: Modello, motivi: Motivi, margini: Margini, coop: Coop, giornata: Giornata, split: Split, car: Car,
  tirreno: Tirreno, adriatico: Adriatico, fonte: Fonte, budget: Budget, chilo: Chilo, trasporti: Trasporti, utile: Utile, centesimi: Centesimi,
  soldi: Soldi, assicurazioni: Assicurazioni, regole: Regole, societa: Societa, stipendio: Stipendio, estero: Estero, roadmap: Roadmap, fine: Fine,
  consegna: Consegna, strumenti: Strumenti, ifs: Ifs, leve: Leve, glossario: Glossario,
};
export const CHAPTERS: Record<string, string> = {
  intro: 'Il progetto', idea: 'Il modello', modello: 'Il modello', motivi: 'Perché conviene', margini: 'Perché conviene', coop: 'Perché conviene',
  giornata: 'La giornata', split: 'La giornata', car: 'Dove compriamo', tirreno: 'Il Tirreno', adriatico: "L'Adriatico", fonte: 'Dove compriamo',
  budget: 'Poco capitale', strumenti0: '', chilo: 'I numeri', trasporti: 'I numeri', utile: 'I numeri', centesimi: 'I numeri', soldi: 'Soldi e protezioni',
  assicurazioni: 'Soldi e protezioni', regole: 'Regole e costi', societa: 'Regole e costi', stipendio: 'Quanto resta a te', estero: 'Il plus: estero',
  roadmap: 'Partenza', fine: 'Argo Maris', consegna: 'La consegna', strumenti: 'Poco capitale', ifs: 'Regole e costi', leve: 'Le tue leve', glossario: 'Le parole',
};
