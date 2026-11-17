// Scene condivise tra i video Argo Maris: marinerie (Tirreno / Adriatico) e consegna (piattaforma / hub / diretta)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FONT, SP, useScene, useIn, ez, Title, Icon, Emblem, Truck} from './ui';
import {MapView, Port, pt, Route, Fleet, Storm, SeaLabel} from './MapView';

const TS = 0.62;
const AS = 0.6, AX = 150, AY = 144;
type PortDef = {k: string; label: string; cue: string; side?: 'l' | 'r'};
export const TIRRENO: PortDef[] = [
  {k: 'viareggio', label: 'Viareggio', cue: 'viareggio'},
  {k: 'livorno', label: 'Livorno', cue: 'livorno'},
  {k: 'piombino', label: 'Piombino', cue: 'piombino'},
  {k: 'castiglione', label: 'Castiglione della Pescaia', cue: 'castiglione', side: 'r'},
  {k: 'santostefano', label: 'Porto Santo Stefano', cue: 'stefano'},
  {k: 'portoercole', label: 'Porto Ercole', cue: 'ercole', side: 'r'},
  {k: 'civitavecchia', label: 'Civitavecchia', cue: 'civitavecchia'},
  {k: 'fiumicino', label: 'Fiumicino', cue: 'fiumicino'},
  {k: 'anzio', label: 'Anzio', cue: 'anzio'},
  {k: 'terracina', label: 'Terracina', cue: 'terracina'},
  {k: 'gaeta', label: 'Gaeta', cue: 'gaeta', side: 'r'},
];
export const ADRIATICO: PortDef[] = [
  {k: 'chioggia', label: 'Chioggia', cue: 'chioggia', side: 'r'},
  {k: 'cesenatico', label: 'Cesenatico', cue: 'cesenatico', side: 'l'},
  {k: 'rimini', label: 'Rimini', cue: 'rimini', side: 'r'},
  {k: 'fano', label: 'Fano', cue: 'fano', side: 'r'},
  {k: 'ancona', label: 'Ancona', cue: 'ancona', side: 'r'},
  {k: 'civitanova', label: 'Civitanova Marche', cue: 'civitanova', side: 'r'},
  {k: 'sanbenedetto', label: 'San Benedetto del Tronto', cue: 'benedetto', side: 'r'},
  {k: 'giulianova', label: 'Giulianova', cue: 'giulianova', side: 'r'},
  {k: 'pescara', label: 'Pescara', cue: 'pescara', side: 'l'},
  {k: 'ortona', label: 'Ortona', cue: 'ortona', side: 'r'},
  {k: 'vasto', label: 'Vasto', cue: 'vasto', side: 'l'},
  {k: 'termoli', label: 'Termoli', cue: 'termoli', side: 'r'},
  {k: 'manfredonia', label: 'Manfredonia', cue: 'manfredonia', side: 'r'},
];

/** Tirreno: 11 marinerie da Viareggio a Gaeta, flotte che rientrano, rotte verso Roma */
export const MarinerieTirreno: React.FC<SP & {kicker?: string; title?: string; children?: React.ReactNode; routesAt?: number}> = ({kicker = 'Il nostro mare', title = 'Le marinerie del Tirreno', children, routesAt, ...p}) => {
  const {B, Wd} = useScene(p);
  const P = (k: string) => pt('tirrenoV', k);
  const car = P('car');
  const rAt = routesAt ?? B(3);
  return (
    <AbsoluteFill>
      <MapView view="tirrenoV" cam={[{s: 0.8, x: 100, y: 40}, {s: TS, x: 100, y: 127}]} camAt={[0, 90]}>
        <SeaLabel x={420} y={900} at={B(0)} text="MAR TIRRENO" size={56} s={TS} />
        {TIRRENO.map((m) => <Port key={m.k} x={P(m.k)[0]} y={P(m.k)[1]} at={Wd(m.cue)} label={m.label} side={m.side ?? 'l'} s={TS} />)}
        {TIRRENO.filter((_, i) => i % 2 === 0).map((m, i) => (
          <Fleet key={m.k} to={P(m.k)} from={[P(m.k)[0] - 200, P(m.k)[1] + 90]} at={Wd(m.cue)} n={2} s={TS} />
        ))}
        <Port x={car[0]} y={car[1]} at={rAt - 10} label="Mercato di Roma" side="r" color={C.aqua} s={TS} />
        {TIRRENO.map((m, i) => <Route key={m.k} a={P(m.k)} b={car} at={rAt + i * 3} dur={34} color={C.aqua} bend={0.08} width={3} dot={i % 3 === 0} s={TS} />)}
      </MapView>
      <Title kicker={kicker} title={title} at={B(0) - 6} size={70} />
      <div style={{position: 'absolute', right: 70, top: 150, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.gold, opacity: ez(useCurrentFrame(), Wd(TIRRENO[0].cue), Wd(TIRRENO[0].cue) + 10)}}>
        11 MARINERIE · DA VIAREGGIO A GAETA
      </div>
      {children}
    </AbsoluteFill>
  );
};

/** Adriatico: 13 marinerie da Chioggia a Manfredonia + Tirreno fermo per mare grosso */
export const MarinerieAdriatico: React.FC<SP & {kicker?: string; title?: string}> = ({kicker = 'Lo sguardo si allarga', title = 'Le marinerie dell\'Adriatico', ...p}) => {
  const {f, B, Wd} = useScene(p);
  const P = (k: string) => pt('adriaticoV', k);
  const hub = P('car');
  const regia = Wd('regia'), fermo = Wd('fermo');
  const hubIn = useIn(regia, {damping: 10});
  return (
    <AbsoluteFill>
      <MapView view="adriaticoV" cam={[{s: 0.78, x: 150, y: 60}, {s: AS, x: AX, y: AY}]} camAt={[0, 90]}>
        <SeaLabel x={1480} y={330} at={B(0)} text="MAR ADRIATICO" size={44} rot={38} color={C.gold} s={AS} />
        <SeaLabel x={330} y={1040} at={B(0)} text="TIRRENO" size={36} s={AS} />
        {ADRIATICO.map((m) => <Port key={m.k} x={P(m.k)[0]} y={P(m.k)[1]} at={Wd(m.cue)} label={m.label} side={m.side ?? 'r'} s={AS} />)}
        {ADRIATICO.filter((_, i) => i % 3 === 0).map((m) => (
          <Fleet key={m.k} to={P(m.k)} from={[P(m.k)[0] + 320, P(m.k)[1] - 80]} at={Wd(m.cue)} n={1} color={C.gold} s={AS} />
        ))}
        <Storm x={P('tir1')[0] + 60} y={P('tir1')[1]} at={fermo} r={110} s={AS} />
        {ADRIATICO.map((m, i) => <Route key={m.k} a={P(m.k)} b={hub} at={regia + i * 3} dur={34} color={C.gold} bend={-0.06} width={3} dot={i % 3 === 0} s={AS} />)}
        {(['civitavecchia', 'fiumicino', 'anzio'] as const).map((k, i) => <Route key={k} a={P(k)} b={hub} at={regia + i * 5} dur={30} color={C.aqua} bend={0.2} width={3} s={AS} />)}
      </MapView>
      <div style={{position: 'absolute', left: 960 + AS * (hub[0] - 960 + AX), top: 540 + AS * (hub[1] - 540 + AY), transform: `translate(-50%,-50%) scale(${hubIn})`}}><Emblem size={96} ring={C.gold} /></div>
      <Title kicker={kicker} title={title} at={B(0) - 6} size={70} />
      <div style={{position: 'absolute', right: 70, top: 150, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.gold, opacity: ez(f, Wd(ADRIATICO[0].cue), Wd(ADRIATICO[0].cue) + 10)}}>
        13 MARINERIE · DA CHIOGGIA A MANFREDONIA
      </div>
      <div style={{position: 'absolute', left: 120, top: 290, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderRadius: 999, background: 'rgba(2,11,26,0.85)',
        border: `3px solid ${C.coral}`, opacity: ez(f, fermo, fermo + 12)}}>
        <Icon name="storm" size={44} color={C.coral} />
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.foam}}>Tirreno fermo → l'Adriatico lavora</span>
      </div>
    </AbsoluteFill>
  );
};

/** diagramma consegna: piattaforma, hub logistico, consegna diretta */
export const ConsegnaDiagram: React.FC<SP & {platAt: number; hubAt: number; directAt: number; prosAt?: number; consAt?: number; tipAt?: number; tip?: string; kicker?: string; title?: string; chips?: {at: number; t: string}[]}> = ({
  platAt, hubAt, directAt, prosAt, consAt, tipAt, tip, kicker = 'Logistica', title = 'Dove consegnare', chips = [], ...p
}) => {
  const {f, B} = useScene(p);
  const src = {x: 250, y: 580};
  const mids = [{x: 860, y: 360, l: 'Piattaforma', s: 'centro di distribuzione della catena', i: 'box', at: platAt, c: C.aqua},
    {x: 860, y: 580, l: 'Hub logistico', s: 'trasportatore a temperatura controllata', i: 'warehouse', at: hubAt, c: C.violet}];
  const stores = [{x: 1500, y: 300}, {x: 1500, y: 470}, {x: 1500, y: 640}];
  const direct = {x: 1500, y: 830};
  const dP = ez(f, directAt, directAt + 50);
  const truckX = src.x + 120 + (direct.x - src.x - 220) * ((((f - directAt) / 110) % 1 + 1) % 1);
  return (
    <AbsoluteFill>
      <Title kicker={kicker} title={title} at={B(0) - 6} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {mids.map((m, i) => {
          const q = ez(f, m.at, m.at + 24);
          return (
            <g key={i} opacity={q}>
              <line x1={src.x + 80} y1={src.y} x2={src.x + 80 + (m.x - src.x - 160) * q} y2={src.y + (m.y - src.y) * q} stroke={m.c} strokeWidth={6} strokeLinecap="round" />
              {stores.map((s, k) => <line key={k} x1={m.x + 90} y1={m.y} x2={m.x + 90 + (s.x - m.x - 160) * ez(f, m.at + 20 + k * 6, m.at + 40 + k * 6)} y2={m.y + (s.y - m.y) * ez(f, m.at + 20 + k * 6, m.at + 40 + k * 6)} stroke={m.c} strokeWidth={3} opacity={0.6} strokeDasharray="10 8" />)}
            </g>
          );
        })}
        <g opacity={ez(f, directAt, directAt + 10)}>
          <path d={`M ${src.x + 80} ${src.y + 40} Q 900 ${direct.y + 60} ${direct.x - 80} ${direct.y}`} stroke={C.gold} strokeWidth={9} fill="none" strokeLinecap="round"
            strokeDasharray={1400} strokeDashoffset={1400 * (1 - dP)} />
          {dP > 0.99 && <g transform={`translate(${truckX} ${direct.y + 20 - Math.sin(((truckX - src.x) / (direct.x - src.x)) * Math.PI) * 60})`}><Truck x={0} y={0} s={0.32} /></g>}
          <text x={900} y={direct.y + 110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.gold}>CONSEGNA DIRETTA</text>
        </g>
      </svg>
      <div style={{position: 'absolute', left: src.x, top: src.y, transform: `translate(-50%,-50%) scale(${useIn(B(0), {damping: 11})})`, textAlign: 'center'}}>
        <Emblem size={150} />
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.foam, marginTop: 8}}>Argo Maris</div>
      </div>
      {mids.map((m, i) => {
        const q = useIn(m.at, {damping: 11});
        return (
          <div key={i} style={{position: 'absolute', left: m.x - 90, top: m.y - 90, width: 180, textAlign: 'center', transform: `scale(${q})`, opacity: q}}>
            <div style={{width: 130, height: 130, margin: '0 auto', borderRadius: 65, background: C.abyss, border: `5px solid ${m.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={m.i} size={72} color={m.c} /></div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.foam, marginTop: 6, whiteSpace: 'nowrap'}}>{m.l}</div>
          </div>
        );
      })}
      {stores.map((s, k) => (
        <div key={k} style={{position: 'absolute', left: s.x - 45, top: s.y - 45, opacity: ez(f, Math.min(platAt, hubAt) + 30 + k * 6, Math.min(platAt, hubAt) + 40 + k * 6)}}>
          <div style={{width: 90, height: 90, borderRadius: 45, background: C.abyss, border: `3px solid ${C.foam}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="store" size={50} color={C.foam} /></div>
        </div>
      ))}
      <div style={{position: 'absolute', left: direct.x - 70, top: direct.y - 70, transform: `scale(${useIn(directAt + 30, {damping: 9})})`}}>
        <div style={{width: 140, height: 140, borderRadius: 70, background: C.abyss, border: `6px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 50px ${C.gold}66`}}><Icon name="store" size={80} color={C.gold} /></div>
      </div>
      <div style={{position: 'absolute', left: 1610, top: 250, width: 280}}>
        {prosAt !== undefined && (
          <div style={{opacity: ez(f, prosAt, prosAt + 12), marginBottom: 20, padding: '16px 20px', borderRadius: 20, background: 'rgba(124,242,154,0.12)', border: '2px solid #7CF29A'}}>
            {['+ freschezza', '− passaggi', '− ore di viaggio'].map((t, i) => <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: '#7CF29A'}}>{t}</div>)}
          </div>
        )}
        {consAt !== undefined && (
          <div style={{opacity: ez(f, consAt, consAt + 12), padding: '16px 20px', borderRadius: 20, background: 'rgba(255,107,107,0.12)', border: `2px solid ${C.coral}`}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.coral, marginBottom: 6}}>SERVONO</div>
            {['mezzi refrigerati', 'orari di scarico', 'più fermate = più costi'].map((t, i) => <div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.foam}}>• {t}</div>)}
          </div>
        )}
      </div>
      {chips.map((c, i) => (
        <div key={i} style={{position: 'absolute', left: 1610, top: 520 + i * 90, width: 290, padding: '12px 18px', borderRadius: 18, background: 'rgba(2,11,26,0.85)', border: `2px solid ${C.aqua}`, fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.foam, opacity: ez(f, c.at, c.at + 12)}}>{c.t}</div>
      ))}
      {tipAt !== undefined && tip && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 940, display: 'flex', justifyContent: 'center', opacity: 0}} />
      )}
      {tipAt !== undefined && tip && (
        <div style={{position: 'absolute', left: 120, top: 268, maxWidth: 600, padding: '14px 22px', borderRadius: 20, background: 'rgba(255,201,74,0.14)', border: `2px solid ${C.gold}`,
          fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.gold, opacity: ez(f, tipAt, tipAt + 12)}}>CONSIGLIO: {tip}</div>
      )}
    </AbsoluteFill>
  );
};
