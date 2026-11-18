// Argo Maris — scene "pro" condivise (v3): ufficio cartoon, piattaforma ordini, catalogo specie, allevato,
// frutti di mare, zone FAO, importazioni, broker vs diretto, contatto unico, controllo freschezza, foto dal CAR.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, MONO, SP, useScene, useIn, ez, Title, Icon, Fish, SPECIES, Emblem, Truck, Boat, W, H, rand, clamp} from './ui';
import {MapView, Port, pt, Route, zonesOf} from './MapView';

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{children}</svg>;
const Chip: React.FC<{at: number; x: number; y: number; t: string; c?: string; icon?: string; size?: number; dark?: boolean}> = ({at, x, y, t, c = C.aqua, icon, size = 28, dark}) => {
  const p = useIn(at, {damping: 11, stiffness: 170});
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, opacity: Math.min(1, p * 1.5), display: 'flex', alignItems: 'center', gap: 12,
      padding: `${size * 0.35}px ${size * 0.75}px`, borderRadius: 999, background: dark ? 'rgba(2,11,26,0.88)' : c, border: dark ? `3px solid ${c}` : 'none', whiteSpace: 'nowrap', boxShadow: `0 10px 30px ${c}33`}}>
      {icon && <Icon name={icon} size={size * 1.15} color={dark ? c : C.abyss} sw={6} />}
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: dark ? C.foam : C.abyss}}>{t}</span>
    </div>
  );
};

/* ───────── personaggio cartoon (flat, professionale) ───────── */
type Pose = 'desk' | 'stand' | 'tablet' | 'phone' | 'clipboard';
export const Person: React.FC<{x: number; y: number; s?: number; shirt?: string; hair?: string; skin?: string; pose?: Pose; headset?: boolean; cap?: boolean; seed?: number; logo?: boolean}> = ({
  x, y, s = 1, shirt = '#1C5FA8', hair = '#2B1D14', skin = '#E2B08C', pose = 'stand', headset, cap, seed = 0, logo = true,
}) => {
  const f = useCurrentFrame();
  const type = pose === 'desk' ? Math.sin(f / 2.2 + seed) * 2 : 0;
  const nod = Math.sin(f / 23 + seed) * 2.5;
  const breathe = Math.sin(f / 18 + seed) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {pose !== 'desk' && <>
        <rect x={-26} y={70} width={22} height={110} rx={10} fill="#22324A" />
        <rect x={4} y={70} width={22} height={110} rx={10} fill="#22324A" />
        <rect x={-32} y={172} width={30} height={14} rx={7} fill="#111" /><rect x={2} y={172} width={30} height={14} rx={7} fill="#111" />
      </>}
      <path d={`M -44 ${80 + breathe} Q -46 -8 0 -12 Q 46 -8 44 ${80 + breathe} Z`} fill={shirt} />
      <path d="M -12 -10 L 0 14 L 12 -10 Z" fill="#fff" opacity={0.9} />
      {logo && <circle cx={22} cy={18} r={7} fill="#fff" opacity={0.85} />}
      {/* braccia per posa */}
      {pose === 'desk' && <>
        <path d={`M -40 10 Q -60 50 -26 ${62 + type}`} stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d={`M 40 10 Q 60 50 26 ${62 - type}`} stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <circle cx={-24} cy={64 + type} r={9} fill={skin} /><circle cx={24} cy={64 - type} r={9} fill={skin} />
      </>}
      {pose === 'stand' && <>
        <path d="M -42 10 Q -54 50 -46 92" stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d="M 42 10 Q 54 50 46 92" stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <circle cx={-46} cy={96} r={9} fill={skin} /><circle cx={46} cy={96} r={9} fill={skin} />
      </>}
      {(pose === 'tablet' || pose === 'clipboard') && <>
        <path d="M -40 10 Q -50 50 -14 52" stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d="M 40 10 Q 50 50 14 52" stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${-8 + Math.sin(f / 30 + seed) * 2} 0 44)`}>
          <rect x={-34} y={20} width={68} height={48} rx={7} fill={pose === 'tablet' ? '#1A2233' : '#C9A26B'} stroke="#0A0F18" strokeWidth={3} />
          {pose === 'tablet' ? <rect x={-28} y={26} width={56} height={36} rx={4} fill={C.aqua} opacity={0.75} /> : <><rect x={-26} y={28} width={52} height={36} fill="#fff" />{[0, 1, 2].map((k) => <rect key={k} x={-20} y={34 + k * 9} width={34 - k * 6} height={3} fill="#9AA" />)}</>}
        </g>
        <circle cx={-14} cy={52} r={9} fill={skin} /><circle cx={14} cy={52} r={9} fill={skin} />
      </>}
      {pose === 'phone' && <>
        <path d="M -42 10 Q -54 50 -46 92" stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d="M 42 10 Q 58 -10 30 -40" stroke={shirt} strokeWidth={18} fill="none" strokeLinecap="round" />
        <circle cx={-46} cy={96} r={9} fill={skin} /><circle cx={28} cy={-44} r={9} fill={skin} />
        <rect x={22} y={-66} width={12} height={26} rx={3} fill="#111" />
      </>}
      {/* testa */}
      <g transform={`rotate(${nod} 0 -30)`}>
        <rect x={-9} y={-24} width={18} height={14} fill={skin} />
        <ellipse cx={0} cy={-48} rx={27} ry={30} fill={skin} />
        <path d={cap ? 'M -29 -52 Q -28 -84 0 -84 Q 28 -84 29 -52 L 44 -50 L 29 -46 Z' : 'M -28 -50 Q -30 -84 0 -82 Q 30 -84 28 -50 Q 20 -66 0 -64 Q -18 -66 -28 -50 Z'} fill={cap ? '#1C5FA8' : hair} />
        <circle cx={-9} cy={-46} r={3} fill="#1A1A1A" /><circle cx={9} cy={-46} r={3} fill="#1A1A1A" />
        <path d="M -8 -34 Q 0 -29 8 -34" stroke="#7A3B2A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {headset && <><path d="M -28 -50 Q 0 -96 28 -50" stroke="#1A1A1A" strokeWidth={5} fill="none" /><rect x={-34} y={-58} width={10} height={18} rx={4} fill="#1A1A1A" /><path d="M -29 -42 Q -24 -26 -8 -28" stroke="#1A1A1A" strokeWidth={3} fill="none" /></>}
      </g>
    </g>
  );
};

/* ───────── scrivania con monitor ───────── */
const Desk: React.FC<{x: number; y: number; screen?: 'chart' | 'map' | 'orders' | 'route'; on?: number}> = ({x, y, screen = 'chart', on = 1}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-120} y={70} width={240} height={14} rx={4} fill="#8B6B4E" /><rect x={-110} y={84} width={10} height={70} fill="#6B4E36" /><rect x={100} y={84} width={10} height={70} fill="#6B4E36" />
      <rect x={-70} y={-40} width={140} height={92} rx={8} fill="#141C2B" stroke="#0A0F18" strokeWidth={4} />
      <rect x={-8} y={52} width={16} height={18} fill="#2A3346" />
      <g opacity={on}>
        <rect x={-62} y={-32} width={124} height={76} rx={4} fill="#0D2440" />
        {screen === 'chart' && [0, 1, 2, 3, 4].map((i) => { const hh = 14 + Math.abs(Math.sin(f / 20 + i)) * 40; return <rect key={i} x={-52 + i * 22} y={36 - hh} width={14} height={hh} fill={i === 3 ? C.gold : C.aqua} />; })}
        {screen === 'orders' && [0, 1, 2, 3].map((i) => <g key={i}><rect x={-54} y={-24 + i * 17} width={108} height={12} rx={3} fill={((Math.floor(f / 25) + i) % 4) === 0 ? C.gold : '#1E3E66'} /><circle cx={-46} cy={-18 + i * 17} r={3} fill="#7CF29A" /></g>)}
        {screen === 'map' && <><path d="M -40 -20 Q -20 -30 -6 -14 Q 6 0 20 -6 Q 36 10 30 30" stroke={C.aqua} strokeWidth={4} fill="none" />{[0, 1, 2].map((i) => <circle key={i} cx={-30 + i * 28} cy={-10 + i * 12} r={4 + Math.sin(f / 8 + i) * 1.5} fill={C.gold} />)}</>}
        {screen === 'route' && <><path d="M -50 30 L -10 0 L 20 10 L 50 -24" stroke={C.aqua} strokeWidth={4} fill="none" strokeDasharray="6 5" /><rect x={-54 + ((f * 1.2) % 100)} y={-4 - ((f * 1.2) % 100) * 0.3} width={14} height={8} fill={C.gold} /></>}
      </g>
    </g>
  );
};

/* 1 ─ UFFICIO ARGO MARIS (cartoon) ─ beat: 0 squadra · 1 commerciale · 2 esploratori · 3 qualità · 4 logistica */
export const Ufficio: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const lit = (i: number) => (f >= B(i) ? 1 : 0.35);
  const ring = (i: number) => (f >= B(i) && f < B(i) + 999 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Title kicker="La squadra" title="Gli uffici di Argo Maris" at={B(0) - 6} />
      <Svg>
        {/* stanza */}
        <rect x={80} y={275} width={1760} height={625} rx={30} fill="#E9EEF4" />
        <rect x={80} y={760} width={1760} height={140} rx={0} fill="#C9D3DF" />
        <rect x={80} y={275} width={1760} height={625} rx={30} fill="none" stroke="#0A1A2E" strokeWidth={6} />
        {/* finestre con il mare */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${170 + i * 210} 310)`}>
            <rect width={180} height={150} rx={10} fill="#7FC8F0" stroke="#3A4A5E" strokeWidth={5} />
            <rect y={95} width={180} height={55} fill={C.sea} />
            <path d={`M 0 ${100 + Math.sin(f / 12 + i) * 3} q 45 -10 90 0 t 90 0`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} />
            <g transform={`translate(${60 + ((f * 0.4 + i * 60) % 120)} 92)`}><Boat x={0} y={0} s={0.7} color="#fff" /></g>
          </g>
        ))}
        {/* parete: mappa dei due mari */}
        <g transform="translate(860 310)">
          <rect width={300} height={190} rx={10} fill="#0D2440" stroke="#3A4A5E" strokeWidth={5} />
          <path d="M 120 20 Q 150 60 140 100 Q 170 130 200 170" stroke="#2C6E4E" strokeWidth={34} fill="none" strokeLinecap="round" />
          {[[90, 70], [110, 120], [140, 150], [205, 60], [225, 100], [245, 135]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={5 + Math.sin(f / 8 + i) * 1.5} fill={i < 3 ? C.aqua : C.gold} />)}
          <text x={150} y={185} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={14} fill={C.foam}>TIRRENO · ADRIATICO</text>
        </g>
        {/* lavagna ordini */}
        <g transform="translate(1210 310)">
          <rect width={280} height={190} rx={10} fill="#FFFFFF" stroke="#3A4A5E" strokeWidth={5} />
          <text x={20} y={34} fontFamily={FONT} fontWeight={900} fontSize={20} fill={C.abyss}>ORDINI DI OGGI</text>
          {['Coop · Orate 40 kg', 'Coop · Calamari 25 kg', 'GDO · Triglie 15 kg', 'GDO · Cozze 60 kg'].map((t, i) => (
            <g key={i} transform={`translate(20 ${58 + i * 32})`} opacity={ez(f, B(1) + i * 8, B(1) + i * 8 + 10)}>
              <rect width={18} height={18} rx={4} fill={f > B(1) + 40 + i * 12 ? '#3CCB6A' : '#DDE3EA'} />
              <text x={30} y={15} fontFamily={FONT} fontWeight={700} fontSize={17} fill="#2A3A4E">{t}</text>
            </g>
          ))}
        </g>
        {/* logo in parete */}
        <foreignObject x={1570} y={300} width={220} height={220}><div style={{width: 210, height: 210}}><Emblem size={200} /></div></foreignObject>
        {/* postazioni */}
        <g opacity={lit(1)}><Desk x={330} y={640} screen="orders" /><Person x={330} y={600} s={0.9} pose="desk" headset shirt="#1C5FA8" seed={1} /></g>
        <g opacity={lit(1)}><Desk x={620} y={640} screen="chart" /><Person x={620} y={600} s={0.9} pose="desk" headset shirt="#2A7A6E" hair="#5A3A22" skin="#C68E6A" seed={2} /></g>
        <g opacity={lit(3)}><Person x={980} y={590} s={0.95} pose="clipboard" shirt="#E8EEF4" hair="#1A1A1A" seed={3} logo={false} /><rect x={1040} y={700} width={110} height={70} rx={8} fill="#fff" stroke="#9AB" strokeWidth={3} /><text x={1095} y={745} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={C.sea}>0,8 °C</text></g>
        <g opacity={lit(4)}><Desk x={1330} y={640} screen="route" /><Person x={1330} y={600} s={0.9} pose="desk" headset shirt="#7B5FD0" hair="#3A2A1A" skin="#D9A07E" seed={4} /></g>
        <g opacity={lit(2)}><Person x={1650} y={590} s={0.95} pose="tablet" cap shirt="#1C5FA8" seed={5} /></g>
        {/* telefoni che squillano */}
        {f > B(1) && [0, 1].map((i) => <g key={i} opacity={Math.max(0, Math.sin((f - B(1)) / 4 + i * 2))}><text x={300 + i * 290} y={500} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.coral}>((•))</text></g>)}
      </Svg>
      {[[1, 470, 'Ufficio commerciale', 'phone', C.aqua], [2, 1650, "Esploratori d'asta", 'gavel', C.gold], [3, 1040, 'Controllo qualità', 'check', '#3CCB6A'], [4, 1330, 'Logistica', 'truck', C.violet]].map(([b, x, t, i, c]) => (
        <Chip key={t as string} at={B(b as number)} x={x as number} y={850} t={t as string} icon={i as string} c={c as string} size={26} />
      ))}
      <div style={{opacity: ring(0) * 0}} />
    </AbsoluteFill>
  );
};

/* 2 ─ PIATTAFORMA ORDINI ─ beat: 0 intro · 1 sceglie dal listino · 2 quantità e invio · 3 stati · 4 fattura e documenti */
const CATALOG: [string, string, string, string][] = [
  ['car/sanpietro.jpg', 'Pesce San Pietro', 'FAO 37.1.3 · Tirreno', '14,90'], ['car/mazzancolle.jpg', 'Mazzancolle', 'FAO 37.2.1 · Adriatico', '18,50'],
  ['car/seppie.jpg', 'Seppie', 'FAO 37.1.3 · Tirreno', '11,80'], ['car/pagelli.jpg', 'Pagelli', 'FAO 37.1.3 · Tirreno', '9,40'],
  ['car/gallinelle.jpg', 'Gallinelle', 'FAO 37.2.1 · Adriatico', '8,90'], ['car/scorfani.jpg', 'Scorfani', 'FAO 37.1.3 · Tirreno', '16,20'],
];
export const Piattaforma: React.FC<SP & {client?: string; clientImg?: string}> = ({client = 'Punto vendita', clientImg, ...p}) => {
  const {f, B} = useScene(p);
  const lap = useIn(B(0), {damping: 13});
  const step = f < B(1) ? 0 : f < B(3) ? 1 : 2;
  const qty = [8, 12, 0, 6, 0, 10];
  const statuses = [['Ordine ricevuto', '10:02'], ['Merce assegnata', '11:15'], ['In viaggio a 0–2 °C', '02:40'], ['Consegnato', '06:30']];
  const cursor = interpolate(f, [B(1), B(1) + 30, B(1) + 60, B(2), B(2) + 30, B(2) + 55], [0, 1, 2, 3, 4, 5], clamp);
  const cpos = [[620, 470], [880, 470], [620, 640], [1120, 470], [1220, 780], [1320, 790]];
  const ci = Math.floor(cursor), cf = cursor - ci;
  const cx = cpos[ci][0] + ((cpos[Math.min(5, ci + 1)][0] - cpos[ci][0]) * cf), cy = cpos[ci][1] + ((cpos[Math.min(5, ci + 1)][1] - cpos[ci][1]) * cf);
  const sent = f > B(2) + 58;
  return (
    <AbsoluteFill>
      <Title kicker="Ordinare è semplice" title="L'area clienti Argo Maris" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 300, top: 260, width: 1320, height: 640, transform: `translateY(${(1 - lap) * 300}px)`, opacity: lap}}>
        {/* laptop */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: '#0E1522', border: '14px solid #1E2738', boxShadow: '0 40px 90px rgba(0,0,0,0.55)', overflow: 'hidden'}}>
          <div style={{height: 64, background: 'linear-gradient(90deg, #06244A, #0A4C8C)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 16}}>
            <Emblem size={44} />
            <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.foam, letterSpacing: 2}}>ARGO MARIS · AREA CLIENTI</span>
            <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
              {clientImg && <Img src={staticFile(clientImg)} style={{height: 46, borderRadius: 8, border: '2px solid #fff'}} />}
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 20, color: C.foam}}>{client}</span>
            </div>
          </div>
          {step < 2 ? (
            <div style={{padding: 22, display: 'flex', gap: 22}}>
              <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14}}>
                {CATALOG.map(([img, n, o, pr], i) => (
                  <div key={i} style={{background: '#16213A', borderRadius: 14, overflow: 'hidden', border: `3px solid ${qty[i] && f > B(1) + 12 + i * 10 ? C.gold : 'transparent'}`, opacity: ez(f, B(0) + 10 + i * 4, B(0) + 20 + i * 4)}}>
                    <Img src={staticFile(img)} style={{width: '100%', height: 120, objectFit: 'cover'}} />
                    <div style={{padding: '8px 12px'}}>
                      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 20, color: C.foam}}>{n}</div>
                      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.aqua}}>{o}</div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4}}>
                        <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.gold}}>{pr} €/kg</span>
                        <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.foam, background: '#0A4C8C', borderRadius: 8, padding: '2px 10px'}}>{f > B(1) + 12 + i * 10 ? qty[i] : 0} kg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{width: 300, background: '#16213A', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
                <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 22, color: C.foam}}>Il tuo ordine</div>
                {CATALOG.map(([, n], i) => qty[i] && f > B(1) + 12 + i * 10 ? <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 17, color: C.foam}}><span>{n}</span><span style={{fontFamily: MONO}}>{qty[i]} kg</span></div> : null)}
                <div style={{marginTop: 'auto', fontFamily: FONT, fontWeight: 700, fontSize: 16, color: C.aqua, opacity: ez(f, B(2), B(2) + 10)}}>Consegna: domani 6:30 · punto vendita</div>
                <div style={{borderRadius: 12, padding: '14px 0', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 22, background: sent ? '#3CCB6A' : C.gold, color: C.abyss, transform: `scale(${sent ? 1 : 1 + 0.04 * Math.sin(f / 4)})`}}>{sent ? 'INVIATO ✓' : 'INVIA ORDINE'}</div>
              </div>
            </div>
          ) : (
            <div style={{padding: 30, display: 'flex', gap: 30}}>
              <div style={{flex: 1}}>
                <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 26, color: C.foam, marginBottom: 18}}>Ordine n. 2611 · stato in tempo reale</div>
                {statuses.map(([t, h], i) => {
                  const q = ez(f, B(3) + 8 + i * 22, B(3) + 20 + i * 22);
                  return (
                    <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, opacity: 0.35 + q * 0.65}}>
                      <div style={{width: 46, height: 46, borderRadius: 23, background: q > 0.5 ? '#3CCB6A' : '#2A3550', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={['order', 'check', 'truck', 'store'][i]} size={30} color={C.abyss} sw={6} /></div>
                      <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.foam, flex: 1}}>{t}</span>
                      <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.aqua}}>{h}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{width: 380, display: 'flex', flexDirection: 'column', gap: 14, opacity: ez(f, B(4), B(4) + 12)}}>
                {[['Fattura unica', 'doc'], ['Documenti di trasporto', 'truck'], ['Etichette e tracciabilità', 'search'], ['Certificati sanitari', 'shield']].map(([t, i], k) => (
                  <div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, background: '#16213A', borderRadius: 14, padding: '16px 18px', opacity: ez(f, B(4) + k * 10, B(4) + k * 10 + 10)}}>
                    <Icon name={i} size={36} /><span style={{fontFamily: FONT, fontWeight: 800, fontSize: 21, color: C.foam, flex: 1}}>{t}</span><span style={{fontFamily: MONO, fontWeight: 700, fontSize: 16, color: C.gold}}>PDF ↓</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {step < 2 && f > B(1) && <svg width={W} height={H} style={{position: 'absolute'}}><path transform={`translate(${cx} ${cy})`} d="M 0 0 L 0 34 L 9 26 L 16 42 L 22 39 L 15 24 L 27 24 Z" fill="#fff" stroke="#000" strokeWidth={2} /></svg>}
    </AbsoluteFill>
  );
};

/* 3 ─ CATALOGO SPECIE ─ beat: 0 intro · 1 locale A · 2 locale B · 3 pesce azzurro · 4 molluschi · 5 crostacei */
const GROUPS: [string, string, string[]][] = [
  ['Pesce locale · Tirreno e Adriatico', C.aqua, ['triglia', 'scorfano', 'gallinella', 'sanpietro', 'pagello', 'dentice', 'sarago']],
  ['Pesce locale · Tirreno e Adriatico', C.aqua, ['ricciola', 'leccia', 'spigola', 'orata', 'cefalo', 'sogliola', 'rombo']],
  ['Pesce azzurro', '#7FB8FF', ['alice', 'sardina', 'sgombro', 'palamita', 'tonno', 'spada']],
  ['Molluschi', '#FF77D9', ['seppia', 'calamaro', 'polpo', 'moscardino']],
  ['Crostacei', C.coral, ['gambero', 'gamberorosso', 'mazzancolla', 'scampo', 'aragosta']],
];
const CUE: Record<string, string> = {triglia: 'triglie', scorfano: 'scorfani', gallinella: 'gallinelle', sanpietro: 'pietro', pagello: 'pagelli', dentice: 'dentici', sarago: 'saraghi', ricciola: 'ricciole', leccia: 'lecce',
  spigola: 'spigole', orata: 'orate', cefalo: 'cefali', sogliola: 'sogliole', rombo: 'rombi', alice: 'alici', sardina: 'sardine', sgombro: 'sgombri', palamita: 'palamite', tonno: 'tonno', spada: 'spada',
  seppia: 'seppie', calamaro: 'calamari', polpo: 'polpi', moscardino: 'moscardini', gambero: 'rosa', gamberorosso: 'rossi', mazzancolla: 'mazzancolle', scampo: 'scampi', aragosta: 'aragoste',
  cozza: 'cozze', vongola: 'vongole', tellina: 'telline', fasolaro: 'fasolari', cannolicchio: 'cannolicchi', ostrica: 'ostriche', salmone: 'salmone', merluzzo: 'merluzzo', ombrina: 'ombrine'};
export const Specie: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const g = Math.max(0, Math.min(4, [1, 2, 3, 4, 5].filter((b) => f >= B(b) - 4).length - 1));
  const [name, col, list] = GROUPS[g];
  const counter = GROUPS.slice(0, g + 1).reduce((a, x) => a + x[2].length, 0);
  return (
    <AbsoluteFill>
      <Title kicker="Le specie" title="Quale pesce trattiamo" at={B(0) - 6} />
      <div style={{position: 'absolute', right: 110, top: 150, textAlign: 'right', opacity: ez(f, B(1), B(1) + 10)}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 72, color: C.gold, lineHeight: 1}}>{counter}+</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.foam}}>specie in questo video</div>
      </div>
      <div key={g} style={{position: 'absolute', left: 120, top: 300, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: col, opacity: ez(f, B(g + 1) - 4, B(g + 1) + 8)}}>{name}</div>
      <Svg>
        {list.map((sp, i) => {
          const at = Wd(CUE[sp] ?? sp) - 6;
          const q = ez(f, Math.min(at, B(g + 1) + 60), Math.min(at, B(g + 1) + 60) + 14);
          const cols = list.length > 5 ? 4 : list.length;
          const x = 300 + (i % cols) * (1320 / Math.max(1, cols - 1 || 1)) * (cols > 1 ? 1 : 0) + (cols === 1 ? 660 : 0);
          const y = 480 + Math.floor(i / cols) * 230;
          return (
            <g key={`${g}-${sp}`} opacity={q} transform={`translate(${(1 - q) * 120} 0)`}>
              <rect x={x - 150} y={y - 95} width={300} height={200} rx={24} fill="rgba(6,36,74,0.75)" stroke={col} strokeWidth={3} />
              <Fish sp={sp} x={x - 6} y={y - 10} s={0.92} />
              <text x={x} y={y + 82} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.foam}>{SPECIES[sp].name}</text>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/* 4 ─ ALLEVATO ─ beat: 0 intro · 1 orate spigole ombrine · 2 Italia Grecia Turchia Croazia · 3 etichetta */
export const Allevato: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const lab = useIn(B(3), {damping: 12});
  return (
    <AbsoluteFill>
      <Title kicker="Volumi tutto l'anno" title="Il pesce d'allevamento" at={B(0) - 6} />
      <Svg>
        <rect x={0} y={560} width={W} height={360} fill="#0A4C8C" opacity={0.55} />
        {[0, 1, 2].map((i) => {
          const cx = 360 + i * 300, q = ez(f, B(0) + 10 + i * 8, B(0) + 30 + i * 8);
          return (
            <g key={i} transform={`translate(${cx} 600) scale(${q})`}>
              <ellipse rx={120} ry={34} fill="none" stroke="#C9D3DF" strokeWidth={10} />
              <ellipse cy={6} rx={120} ry={34} fill="#0D2440" opacity={0.6} />
              {Array.from({length: 9}).map((_, k) => <line key={k} x1={-120 + k * 30} y1={0} x2={-110 + k * 27} y2={210} stroke="rgba(232,251,255,0.25)" strokeWidth={2} />)}
              {Array.from({length: 5}).map((_, k) => <g key={k} transform={`translate(${-70 + ((f * 0.8 + k * 40 + i * 30) % 140)} ${70 + k * 26})`}><Fish sp={['orata', 'spigola', 'ombrina'][(k + i) % 3]} x={0} y={0} s={0.28} flip={k % 2 === 0} /></g>)}
            </g>
          );
        })}
        {[['orata', 'orate', 1260], ['spigola', 'spigole', 1500], ['ombrina', 'ombrine', 1740]].map(([sp, cue, x]) => {
          const q = ez(f, Wd(cue as string) - 4, Wd(cue as string) + 12);
          return <g key={sp as string} opacity={q}><Fish sp={sp as string} x={x as number} y={360} s={0.9} /><text x={x as number} y={445} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.foam}>{SPECIES[sp as string].name}</text></g>;
        })}
      </Svg>
      {[['Italia', 'italiani'], ['Grecia', 'grecia'], ['Turchia', 'turchia'], ['Croazia', 'croazia']].map(([t, cue], i) => <Chip key={t} at={Wd(cue)} x={1260 + (i % 2) * 300} y={560 + Math.floor(i / 2) * 80} t={t} icon="pin" c={C.gold} size={26} dark />)}
      <div style={{position: 'absolute', left: 1180, top: 720, width: 620, borderRadius: 16, background: '#F4F7FA', padding: '18px 24px', transform: `scale(${lab}) rotate(-1.5deg)`, opacity: lab, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
        {[['Denominazione', 'Orata (Sparus aurata)'], ['Metodo di produzione', 'Allevato'], ['Paese di allevamento', 'Grecia']].map(([k, v], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid #C9D6E3' : 'none', fontFamily: FONT}}>
            <span style={{fontWeight: 700, fontSize: 21, color: '#4A6075'}}>{k}</span><span style={{fontWeight: 900, fontSize: 22, color: C.abyss, background: i > 0 && f > B(3) + 20 ? '#FFE9A8' : 'transparent'}}>{v}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 5 ─ FRUTTI DI MARE ─ beat: 0 intro · 1 specie · 2 zone classificate + depurazione · 3 vivi + etichetta */
export const FruttiMare: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const list = ['cozza', 'vongola', 'tellina', 'fasolaro', 'cannolicchio', 'ostrica'];
  const steps = [['Zona di produzione', 'classificata A o B', 'wave'], ['Centro di depurazione', 'acqua di mare filtrata', 'snow'], ['Centro di spedizione', 'confezioni chiuse', 'box'], ['Al banco', 'vivi e sigillati', 'store']];
  const lab = useIn(B(3) + 10, {damping: 12});
  return (
    <AbsoluteFill>
      <Title kicker="Molluschi bivalvi" title="I frutti di mare" at={B(0) - 6} />
      <div style={{position: 'absolute', right: 110, top: 130, width: 420, height: 236, borderRadius: 20, overflow: 'hidden', border: `4px solid ${C.foam}`, opacity: ez(f, B(0), B(0) + 12)}}>
        <OffthreadVideo src={staticFile('car/clip_cassette.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '85% 70%'}} />
        <div style={{position: 'absolute', left: 10, bottom: 8, fontFamily: FONT, fontWeight: 800, fontSize: 16, color: '#fff', background: 'rgba(2,11,26,0.7)', padding: '3px 10px', borderRadius: 8}}>Al mercato · ripresa reale</div>
      </div>
      <Svg>
        {list.map((sp, i) => {
          const q = ez(f, Wd(CUE[sp]) - 4, Wd(CUE[sp]) + 12);
          const x = 230 + i * 260;
          return <g key={sp} opacity={q} transform={`translate(0 ${(1 - q) * 40})`}><circle cx={x} cy={430} r={92} fill="rgba(6,36,74,0.75)" stroke={C.aqua} strokeWidth={3} /><Fish sp={sp} x={x} y={425} s={sp === 'cannolicchio' ? 0.85 : 1.1} /><text x={x} y={555} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.foam}>{SPECIES[sp].name}</text></g>;
        })}
      </Svg>
      {steps.map(([t, s, i], k) => {
        const q = useIn(B(2) + k * 16, {damping: 12});
        return (
          <div key={k} style={{position: 'absolute', left: 120 + k * 380, top: 620, width: 340, height: 150, borderRadius: 22, background: 'rgba(6,36,74,0.85)', border: `3px solid ${C.aqua}`, padding: '16px 20px', opacity: q, transform: `translateY(${(1 - q) * 40}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Icon name={i} size={42} /><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 25, color: C.foam}}>{t}</span></div>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 21, color: 'rgba(232,251,255,0.8)', marginTop: 10}}>{s}</div>
            {k < 3 && <div style={{position: 'absolute', right: -32, top: 52, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.gold}}>→</div>}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 1140, top: 790, width: 660, borderRadius: 14, background: '#F4F7FA', padding: '10px 20px', transform: `scale(${lab})`, transformOrigin: 'left top', opacity: lab, display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontFamily: FONT, fontWeight: 800, fontSize: 18, color: C.abyss}}>
        {['Specie', 'Zona di produzione', 'N° centro riconosciuto', 'Data di confezionamento', 'Vivi al momento dell\'acquisto'].map((t, i) => <span key={i} style={{opacity: ez(f, B(3) + 16 + i * 8, B(3) + 26 + i * 8)}}>✓ {t}</span>)}
      </div>
    </AbsoluteFill>
  );
};

/* 6 ─ ZONE FAO ─ beat: 0 intro · 1 Med 37 + Tirreno · 2 Adriatico + Ionio · 3 Atlantico 27 e 34 · 4 in etichetta */
const centroid = (d: string): [number, number] => {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  let x = 0, y = 0, k = 0;
  for (let i = 0; i + 1 < n.length; i += 2) { x += n[i]; y += n[i + 1]; k++; }
  return [x / Math.max(1, k), y / Math.max(1, k)];
};
export const Fao: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const Z = zonesOf('fao');
  const r = pt('fao', 'roma2');
  const med = {s: 2.15, x: W / 2 - r[0] + 60, y: H / 2 - r[1] - 40};
  const all = {s: 1.05, x: 60, y: -80};
  const S = f < B(3) - 10 ? med.s : all.s;
  const zone = (k: string, at: number, c: string, label: string, off: [number, number] = [0, 0]) => {
    const q = ez(f, at, at + 18);
    const lo = k.startsWith('37') ? (S > 1.5 ? 1 : 0) : 1;
    const [cx, cy] = centroid(Z[k] ?? '');
    return (
      <g key={k} opacity={q}>
        <path d={Z[k]} fill={c} opacity={0.42 + 0.12 * Math.sin(f / 10)} stroke={c} strokeWidth={3 / S} />
        <g opacity={lo} transform={`translate(${cx + off[0]} ${cy + off[1]}) scale(${(0.7 + q * 0.3) / S})`}>
          <rect x={-74} y={-24} width={148} height={48} rx={12} fill="rgba(2,11,26,0.92)" stroke={c} strokeWidth={3} />
          <text y={9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={C.foam}>{label}</text>
        </g>
      </g>
    );
  };
  const lab = useIn(B(4), {damping: 12});
  return (
    <AbsoluteFill>
      <MapView view="fao" cam={[med, med, all]} camAt={[0, B(3) - 30, B(3) + 10]}>
        {zone('37.1.1', B(1) + 10, '#9AB8FF', '37.1.1')}
        {zone('37.1.2', B(1) + 16, '#9AB8FF', '37.1.2')}
        {zone('37.1.3', B(1) + 30, C.aqua, '37.1.3', [-20, 10])}
        {zone('37.3.1', B(1) + 22, '#9AB8FF', '37.3.1')}
        {zone('37.3.2', B(1) + 26, '#9AB8FF', '37.3.2')}
        {zone('37.2.1', B(2), C.gold, '37.2.1', [10, -10])}
        {zone('37.2.2', B(2) + 30, '#7CF29A', '37.2.2', [-30, -40])}
        {zone('27', B(3), C.violet, 'FAO 27', [-60, -40])}
        {zone('34', B(3) + 40, C.coral, 'FAO 34', [-20, 0])}
        {S < 1.5 && (() => { const [mx, my] = centroid(Z['37.2.2'] ?? ''); return <g transform={`translate(${mx - 60} ${my - 40})`}><rect x={-80} y={-26} width={160} height={52} rx={12} fill="rgba(2,11,26,0.92)" stroke={C.aqua} strokeWidth={3} /><text y={10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={C.foam}>FAO 37</text></g>; })()}
      </MapView>
      <Title kicker="L'origine" title="Le zone FAO" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 110, top: 290, padding: '10px 20px', borderRadius: 16, background: 'rgba(2,11,26,0.85)', opacity: ez(f, B(1), B(1) + 10)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.foam}}>Mediterraneo = <span style={{color: C.aqua}}>zona 37</span></div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 20, color: 'rgba(232,251,255,0.75)'}}>schema indicativo delle sottozone</div>
      </div>
      <div style={{position: 'absolute', right: 110, top: 740, width: 560, borderRadius: 16, background: '#F4F7FA', padding: '14px 22px', transform: `scale(${lab}) rotate(-1deg)`, opacity: lab, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
        {[['Specie', 'Triglia di fango'], ['Zona di cattura', 'FAO 37.1.3 · Mar Tirreno'], ['Attrezzo', 'Reti da traino']].map(([k, v], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontFamily: FONT, borderBottom: i < 2 ? '1px solid #C9D6E3' : 'none'}}><span style={{fontWeight: 700, fontSize: 20, color: '#4A6075'}}>{k}</span><span style={{fontWeight: 900, fontSize: 21, color: C.abyss, background: i === 1 ? '#FFE9A8' : 'transparent'}}>{v}</span></div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 7 ─ IMPORTAZIONI ─ beat: 0 intro · 1 Norvegia · 2 Francia, Spagna, Portogallo · 3 Marocco, Senegal · 4 Tunisia, Egitto · 5 documenti */
export const Import: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const P = (k: string) => pt('fao', k);
  const roma = P('roma2');
  const C2 = [
    {k: 'norvegia', l: 'Norvegia', at: B(1), sp: ['salmone', 'merluzzo'], side: 'r' as const},
    {k: 'francia', l: 'Francia', at: Wd('francia'), sp: ['ostrica', 'cozza'], side: 'l' as const},
    {k: 'spagna', l: 'Spagna', at: Wd('spagna'), sp: ['gambero', 'polpo'], side: 'r' as const},
    {k: 'portogallo', l: 'Portogallo', at: Wd('portogallo'), sp: ['sardina', 'polpo'], side: 'l' as const},
    {k: 'marocco', l: 'Marocco', at: Wd('marocco'), sp: ['polpo', 'sardina'], side: 'l' as const},
    {k: 'senegal', l: 'Senegal', at: Wd('senegal'), sp: ['seppia', 'dentice'], side: 'r' as const},
    {k: 'tunisia', l: 'Tunisia', at: Wd('tunisia'), sp: ['orata', 'polpo'], side: 'r' as const},
    {k: 'egitto', l: 'Egitto', at: Wd('egitto'), sp: ['cefalo', 'spigola'], side: 'l' as const},
  ];
  const docs = useIn(B(5), {damping: 12});
  return (
    <AbsoluteFill>
      <MapView view="fao" italy="#2A6FA8" cam={[{s: 0.98, x: 80, y: -175}, {s: 0.98, x: 80, y: -175}]} camAt={[0, 10]}>
        <Port x={roma[0]} y={roma[1]} at={0} label="Roma" side="r" color={C.aqua} />
        {C2.map((c) => (
          <g key={c.k}>
            <Port x={P(c.k)[0]} y={P(c.k)[1]} at={c.at} label={c.l} side={c.side} big />
            <Route a={P(c.k)} b={roma} at={c.at + 6} dur={34} color={C.gold} bend={c.k === 'egitto' || c.k === 'tunisia' ? 0.15 : -0.15} />
            {c.sp.map((sp, i) => <g key={sp} opacity={ez(f, c.at + 14 + i * 6, c.at + 26 + i * 6)}><Fish sp={sp} x={P(c.k)[0] + (c.side === 'r' ? 80 : -80) + i * (c.side === 'r' ? 70 : -70)} y={P(c.k)[1] + 50} s={0.32} /></g>)}
          </g>
        ))}
      </MapView>
      <Title kicker="Il plus" title="Le importazioni" at={B(0) - 6} />
      <div style={{position: 'absolute', right: 80, top: 650, width: 520, borderRadius: 22, background: 'rgba(2,11,26,0.9)', border: `3px solid #7CF29A`, padding: '18px 22px', opacity: docs, transform: `translateY(${(1 - docs) * 40}px)`}}>
        {['Certificati sanitari', 'Controlli ai posti di frontiera (extra UE)', 'Tracciabilità di ogni lotto'].map((t, i) => <div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.foam, marginBottom: 6, opacity: ez(f, B(5) + i * 10, B(5) + 10 + i * 10)}}>✓ {t}</div>)}
      </div>
    </AbsoluteFill>
  );
};

/* 8 ─ BROKER vs CONTATTO DIRETTO ─ beat: 0 domanda · 1 senza buyer · 2 con Argo Maris · 3 prezzi su tutto il mercato · 4 conclusione */
export const BrokerVsDiretto: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const chaos = f >= B(1), calm = f >= B(2);
  const rows = [['Fornitori da gestire', '10', '1'], ['Telefonate al giorno', '10+', '1'], ['Fatture al mese', '200+', '1 sola'], ['Consegne da controllare', '10', '1'], ['Prezzi confrontati', 'pochi', 'tutto il mercato']];
  return (
    <AbsoluteFill>
      <Title kicker="Perché conviene" title="Buyer o contatto diretto?" at={B(0) - 6} />
      <Svg>
        <g opacity={ez(f, B(1) - 6, B(1) + 6)}>
          <rect x={110} y={270} width={820} height={400} rx={28} fill="rgba(255,107,107,0.08)" stroke={C.coral} strokeWidth={3} />
          <text x={140} y={320} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.coral}>SENZA BUYER</text>
          <Person x={520} y={500} s={1.05} pose="desk" shirt="#5A6A80" seed={9} logo={false} />
          <Desk x={520} y={540} screen="orders" />
          {chaos && Array.from({length: 10}).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + f / 40, r = 210 + Math.sin(f / 6 + i) * 10;
            return <g key={i} transform={`translate(${520 + Math.cos(a) * r * 1.4} ${470 + Math.sin(a) * r * 0.6})`} opacity={ez(f, B(1) + i * 3, B(1) + i * 3 + 8)}>
              <circle r={30} fill="#fff" stroke={C.coral} strokeWidth={3} />
              <g transform="translate(-20 -20)"><Icon name={['phone', 'doc', 'truck', 'warehouse', 'boat'][i % 5]} size={40} color={C.coral} sw={6} /></g>
            </g>;
          })}
        </g>
        <g opacity={ez(f, B(2) - 6, B(2) + 6)}>
          <rect x={990} y={270} width={820} height={400} rx={28} fill="rgba(124,242,154,0.08)" stroke="#7CF29A" strokeWidth={3} />
          <text x={1020} y={320} fontFamily={FONT} fontWeight={900} fontSize={32} fill="#7CF29A">CON ARGO MARIS</text>
          <Person x={1300} y={500} s={1.05} pose="phone" shirt="#3E8E5E" seed={3} logo={false} />
          <line x1={1360} y1={440} x2={1560} y2={440} stroke="#7CF29A" strokeWidth={5} strokeDasharray="10 8" strokeDashoffset={-f} opacity={calm ? 1 : 0} />
        </g>
      </Svg>
      {calm && <div style={{position: 'absolute', left: 1580, top: 370, transform: `scale(${useIn(B(2) + 10, {damping: 10})})`}}><Emblem size={140} /></div>}
      <div style={{position: 'absolute', left: 110, top: 690, width: 1700, opacity: ez(f, B(2) + 20, B(2) + 34)}}>
        {rows.map(([k, a, b], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', height: 40, fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.foam, borderBottom: '1px solid rgba(232,251,255,0.12)', opacity: ez(f, B(2) + 20 + i * 8, B(2) + 30 + i * 8)}}>
            <span style={{width: 620}}>{k}</span><span style={{width: 540, color: C.coral, fontFamily: MONO}}>{a}</span><span style={{color: '#7CF29A', fontFamily: MONO, fontSize: i === 4 && f > B(3) ? 28 : 24}}>{b}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 9 ─ UN CONTATTO CHE SI OCCUPA DI TUTTO ─ beat: 0 intro · 1 messaggio sera → banco · 2 manca/problema · 3 tutto in un numero */
export const Contatto: React.FC<SP & {client?: string}> = ({client = 'Punto vendita', ...p}) => {
  const {f, B} = useScene(p);
  const msgs: [number, boolean, string][] = [
    [B(1), true, 'Ciao! Per domani 40 kg di orate e 20 kg di cozze?'],
    [B(1) + 40, false, 'Confermato ✓ Orate 6,00 €/kg · Cozze 2,90 €/kg. Consegna 6:30.'],
    [B(2), true, 'Il fornitore delle triglie è senza merce…'],
    [B(2) + 40, false, 'Già sostituito: triglie dall\'asta di Civitavecchia, stesso prezzo 👍'],
  ];
  const tasks = ['Ricerca', 'Prezzi', 'Qualità', 'Documenti', 'Logistica', 'Reclami'];
  return (
    <AbsoluteFill>
      <Title kicker="Il vero potenziale" title="Un contatto che fa tutto" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 170, top: 260, width: 470, height: 680, borderRadius: 54, background: '#0B0F18', border: '12px solid #232A3A', boxShadow: '0 40px 90px rgba(0,0,0,0.5)', overflow: 'hidden', opacity: ez(f, B(0), B(0) + 12)}}>
        <div style={{height: 90, background: '#075E54', display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 0'}}>
          <Emblem size={52} /><div><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 22, color: '#fff'}}>Argo Maris · il tuo buyer</div><div style={{fontFamily: FONT, fontSize: 15, color: '#CDEFE6'}}>online</div></div>
        </div>
        <div style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: '#E9DFD3', height: '100%'}}>
          {msgs.map(([at, me, t], i) => {
            const q = ez(f, at, at + 10);
            return <div key={i} style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '82%', background: me ? '#DCF8C6' : '#fff', borderRadius: 14, padding: '10px 14px', fontFamily: FONT, fontWeight: 600, fontSize: 19, color: '#111', opacity: q, transform: `translateY(${(1 - q) * 16}px)`, boxShadow: '0 2px 4px rgba(0,0,0,0.15)'}}>
              {me && <div style={{fontWeight: 900, fontSize: 14, color: '#075E54'}}>{client}</div>}{t}
            </div>;
          })}
        </div>
      </div>
      <Svg>
        <g transform="translate(1240 590)">
          {tasks.map((t, i) => {
            const a = (i / tasks.length) * Math.PI * 2 - Math.PI / 2;
            const q = ez(f, B(3) + i * 8, B(3) + i * 8 + 12);
            const x = Math.cos(a) * 300, y = Math.sin(a) * 250;
            return <g key={t} opacity={0.25 + q * 0.75}>
              <line x1={0} y1={0} x2={x * q} y2={y * q} stroke={C.gold} strokeWidth={4} />
              <g transform={`translate(${x} ${y})`}><rect x={-100} y={-34} width={200} height={68} rx={34} fill={q > 0.5 ? C.gold : 'rgba(6,36,74,0.9)'} stroke={C.gold} strokeWidth={3} />
                <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={q > 0.5 ? C.abyss : C.foam}>{t}</text></g>
            </g>;
          })}
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 1240, top: 590, transform: `translate(-50%,-50%) scale(${useIn(B(0) + 10, {damping: 11})})`}}><Emblem size={210} /></div>
    </AbsoluteFill>
  );
};

/* 10 ─ CONTROLLO FRESCHEZZA ─ beat: 0 intro · 1 i cinque segni · 2 temperatura e lotto · 3 se non è perfetto non parte */
export const Freschezza: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  const pts: [string, string, number, number, number, number][] = [
    ['occhio', 'Occhio vivo e convesso', 747, 494, 470, 330],
    ['branchie', 'Branchie rosso brillante', 808, 525, 640, 770],
    ['pelle', 'Pelle lucida', 990, 470, 1080, 330],
    ['carne', 'Carne soda', 1090, 540, 1420, 700],
    ['odore', 'Odore di mare', 668, 525, 330, 560],
  ];
  const stamp = useIn(B(3) + 10, {damping: 8});
  const temp = interpolate(f, [B(2), B(2) + 50], [9, 0.5], clamp);
  return (
    <AbsoluteFill>
      <Title kicker="Qualità" title="Come si controlla il pesce" at={B(0) - 6} />
      <Svg>
        <g transform="translate(940 520) scale(3.2)" opacity={ez(f, B(0), B(0) + 14)}><Fish sp="spigola" x={0} y={0} /></g>
        <circle cx={808} cy={525} r={18} fill="#E0303A" opacity={ez(f, Wd('branchie'), Wd('branchie') + 10) * 0.7} />
        {pts.map(([k, t, x, y, lx, ly]) => {
          const q = ez(f, Wd(k) - 2, Wd(k) + 12);
          return <g key={k} opacity={q}>
            <circle cx={x} cy={y} r={14} fill="none" stroke={C.gold} strokeWidth={4} /><circle cx={x} cy={y} r={5} fill={C.gold} />
            <line x1={x} y1={y} x2={lx} y2={ly} stroke={C.gold} strokeWidth={3} />
            <rect x={lx - 170} y={ly - 30} width={340} height={60} rx={30} fill="rgba(2,11,26,0.9)" stroke={C.gold} strokeWidth={3} />
            <text x={lx} y={ly + 9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={25} fill={C.foam}>✓ {t}</text>
          </g>;
        })}
      </Svg>
      <div style={{position: 'absolute', left: 110, top: 850, display: 'flex', alignItems: 'center', gap: 16, opacity: ez(f, B(2), B(2) + 10)}}>
        <Icon name="thermo" size={60} color={temp < 3 ? C.aqua : C.coral} /><span style={{fontFamily: MONO, fontWeight: 700, fontSize: 52, color: temp < 3 ? C.aqua : C.coral}}>{temp.toFixed(1).replace('.', ',')} °C</span>
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.foam}}>ghiaccio fondente · lotto tracciato</span>
      </div>
      <div style={{position: 'absolute', right: 110, top: 840, transform: `rotate(-4deg) scale(${2 - stamp})`, opacity: stamp, border: `7px solid ${C.coral}`, borderRadius: 16, padding: '6px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 38, color: C.coral, background: 'rgba(2,11,26,0.7)'}}>LOTTO NON PERFETTO = NON PARTE</div>
    </AbsoluteFill>
  );
};

/* 11 ─ FOTO DAL MERCATO (reali) ─ beat: 0 intro · 1 scorfani gallinelle san pietro triglie · 2 seppie mazzancolle pagelli aragoste · 3 selezionato */
const PHOTOS: [string, string, string][] = [
  ['scorfani', 'Scorfani, gallinella e calamaretti', 'scorfani'], ['gallinelle', 'Gallinelle', 'gallinelle'], ['sanpietro', 'Pesce San Pietro', 'pietro'], ['misto', 'Triglie, scorfano e San Pietro', 'triglie'],
  ['seppie', 'Seppie', 'seppie'], ['mazzancolle', 'Mazzancolle', 'mazzancolle'], ['pagelli', 'Pagelli', 'pagelli'], ['aragosta', 'Aragosta', 'aragoste'],
];
export const CarFoto: React.FC<SP> = (p) => {
  const {f, B, Wd} = useScene(p);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 0.35}}>
        <OffthreadVideo src={staticFile('car/clip_banco.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(2,11,26,0.92) 0%, rgba(2,11,26,0.45) 40%, rgba(2,11,26,0.85) 100%)'}} />
      <Title kicker="Dal mercato, ogni mattina" title="Il pesce vero" at={B(0) - 6} />
      <div style={{position: 'absolute', right: 110, top: 150, width: 300, height: 530, borderRadius: 20, overflow: 'hidden', border: `5px solid ${C.foam}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', opacity: ez(f, B(0), B(0) + 12)}}>
        <OffthreadVideo src={staticFile('car/clip_banco.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 10, bottom: 10, fontFamily: FONT, fontWeight: 800, fontSize: 16, color: '#fff', background: 'rgba(2,11,26,0.75)', padding: '3px 10px', borderRadius: 8}}>Smistamento · ripresa reale</div>
      </div>
      {PHOTOS.map(([img, cap, cue], i) => {
        const at = Math.min(Wd(cue) - 4, (i < 4 ? B(1) : B(2)) + i % 4 * 20 + 30);
        const q = useIn(at, {damping: 12});
        const col = i % 4, row = Math.floor(i / 4);
        const rot = [-4, 3, -2, 4][col] + row;
        return (
          <div key={img} style={{position: 'absolute', left: 120 + col * 350, top: 290 + row * 320, width: 310, height: 300, background: '#fff', padding: '12px 12px 46px', boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
            transform: `rotate(${rot}deg) scale(${0.6 + 0.4 * q}) translateY(${(1 - q) * 300}px)`, opacity: Math.min(1, q * 1.5)}}>
            <Img src={staticFile(`car/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 18, color: C.abyss}}>{cap}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', right: 110, top: 720, width: 300, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.gold, textAlign: 'right', opacity: ez(f, B(3), B(3) + 12)}}>Selezionato cassetta per cassetta</div>
    </AbsoluteFill>
  );
};

/* ───────── registro scene pro (per video) ───────── */
export const proScenes = (client: string, clientImg?: string): Record<string, React.FC<SP>> => ({
  ufficio: Ufficio, specie: Specie, carfoto: CarFoto, allevato: Allevato, frutti: FruttiMare, fao: Fao, import: Import,
  broker: BrokerVsDiretto, freschezza: Freschezza,
  piattaforma: (p: SP) => <Piattaforma {...p} client={client} clientImg={clientImg} />,
  contatto: (p: SP) => <Contatto {...p} client={client} />,
});
export const PRO_CHAPTERS: Record<string, string> = {
  ufficio: 'La squadra', piattaforma: 'Ordini', contatto: 'Un solo contatto', carfoto: 'Il pesce', specie: 'Il pesce', allevato: 'Il pesce',
  frutti: 'Frutti di mare', fao: 'Origine', import: 'Importazioni', broker: 'Perché un buyer', freschezza: 'Qualità',
};
