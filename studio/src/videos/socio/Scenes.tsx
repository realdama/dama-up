import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {C, FONT, MONO, clamp, SP, useScene, useIn, ez, Title, Card, Icon, Fish, Emblem} from '../../lib/wide/ui';
import {Svg, Pill, Big} from '../coop-etruria/Scenes';
import {Idea as IdeaGdo, Roadmap as RoadmapGdo} from '../gdo-v6/Scenes';
import {Box4647, MareItaliaMark} from '../mare-italia/Scenes';

const eur = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const Intro: React.FC<SP> = () => (
  <AbsoluteFill><OffthreadVideo src={staticFile('socio/hf_intro.mp4')} muted /></AbsoluteFill>
);

export const Idea = IdeaGdo;

export const Perche: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const cards = [['Margini bassi nella GDO', 'intorno al 3%: un buon buyer fa risparmiare', 'chart'], ['Il mercato di Roma', 'uno dei più grandi d\'Italia, oltre 400 aziende', 'warehouse'], ['Due mari vicini', 'Tirreno e Adriatico, a rotazione', 'boat']];
  return (
    <AbsoluteFill>
      <Title kicker="Il mercato" title="Perché funziona" at={B(0) - 6} />
      {cards.map(([t, s, i], k) => <Card key={k} at={B(k + 1)} x={120 + k * 570} y={300} w={540} h={400} num={String(k + 1)} title={t} sub={s} icon={i} color={[C.gold, C.aqua, '#7CF29A'][k]} />)}
    </AbsoluteFill>
  );
};

export const Partner: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  return (
    <AbsoluteFill>
      <Title kicker="Non partiamo da soli" title="Il partner al mercato: Mare Italia" at={B(0) - 6} size={66} />
      <div style={{position: 'absolute', right: 120, top: 130, transform: `scale(${useIn(B(1), {damping: 11})})`}}><MareItaliaMark size={0.8} /></div>
      <Box4647 at={B(1)} y={380} />
      <Pill at={B(2)} x={600} y={760} text="Da Mare Italia: la base" color={C.aqua} icon="warehouse" size={30} />
      <Pill at={B(2) + 25} x={1300} y={760} text="Aste e barche: il completamento" color={C.gold} icon="boat" size={30} />
    </AbsoluteFill>
  );
};

export const Giornata: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const steps = [{t: '10:00', l: 'Arriva l\'ordine', i: 'order', b: 1}, {t: '12:00', l: 'Prezzi e merce bloccata', i: 'scale', b: 2}, {t: '15:00', l: 'Asta', i: 'gavel', b: 3}, {t: 'Sera / notte', l: 'Documenti e consegna', i: 'truck', b: 4}, {t: 'Mattina', l: 'Sul banco', i: 'store', b: 4}];
  const prog = interpolate(f, [B(1), B(2), B(3), B(4), B(4) + 80], [0.05, 0.28, 0.52, 0.76, 1], clamp);
  return (
    <AbsoluteFill>
      <Title kicker="Un esempio concreto" title="Una giornata tipo" at={B(0) - 6} />
      <Svg>
        <line x1={220} x2={1700} y1={470} y2={470} stroke="rgba(232,251,255,0.15)" strokeWidth={10} strokeLinecap="round" />
        <line x1={220} x2={220 + 1480 * prog} y1={470} y2={470} stroke={C.aqua} strokeWidth={10} strokeLinecap="round" opacity={ez(f, B(1), B(1) + 5)} />
      </Svg>
      {steps.map((s, k) => {
        const q = useIn(B(s.b) + (k === 4 ? 70 : 0), {damping: 11});
        return (
          <div key={k} style={{position: 'absolute', left: 220 + k * 370 - 120, top: 370, width: 240, textAlign: 'center', opacity: q, transform: `scale(${0.8 + q * 0.2})`}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.gold, marginBottom: 10}}>{s.t}</div>
            <div style={{width: 104, height: 104, margin: '0 auto', borderRadius: 52, background: C.abyss, border: `5px solid ${C.aqua}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={s.i} size={58} /></div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 26, color: C.foam, marginTop: 12}}>{s.l}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 120, top: 690, width: 700, borderRadius: 24, background: 'rgba(6,36,74,0.85)', border: `2px solid ${C.foam}`, padding: 22, opacity: ez(f, B(1) + 10, B(1) + 20)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.foam}}>Ordine · esempio</div>
        <svg width={640} height={110}>
          <Fish sp="orata" x={60} y={36} s={0.45} /><text x={130} y={46} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.foam}>Orate · 40 kg</text>
          <Fish sp="calamaro" x={60} y={92} s={0.4} /><text x={130} y={100} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.foam}>Calamari · 25 kg</text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const Ruoli: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const col = (at: number, x: number, title: string, color: string, items: [string, string][]) => {
    const q = useIn(at, {damping: 12});
    return (
      <div style={{position: 'absolute', left: x, top: 290, width: 800, height: 540, borderRadius: 28, background: 'rgba(6,36,74,0.8)', border: `3px solid ${color}`, padding: 32, opacity: q, transform: `translateY(${(1 - q) * 50}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Icon name="user" size={70} color={color} /><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color}}>{title}</span></div>
        {items.map(([t, i], k) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 24, opacity: ez(f, at + 15 + k * 12, at + 25 + k * 12)}}>
            <Icon name={i} size={48} color={C.foam} /><span style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.foam}}>{t}</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Title kicker="Una proposta" title="Come ci dividiamo il lavoro" at={B(0) - 6} />
      {col(B(1), 120, 'Socio acquisti', C.aqua, [['Mercato di Roma', 'warehouse'], ['Aste e barche', 'gavel'], ['Fornitori, Mare Italia', 'handshake']])}
      {col(B(2), 1000, 'Socio vendite', C.gold, [['Catene e ordini', 'store'], ['Documenti e amministrazione', 'doc'], ['Logistica e consegne', 'truck']])}
      <Pill at={B(3)} x={960} y={900} text="Ognuno fa ciò che sa fare meglio · c'è sempre qualcuno che risponde" color={'#7CF29A'} icon="check" size={26} dark />
    </AbsoluteFill>
  );
};

export const Costi: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const rows: [string, string, number][] = [['Apertura SRLS', '≈ 320 €', B(1)], ['Commercialista', '1.000–3.000 €/anno', B(2)], ['Corso HACCP e pratiche sanitarie', 'poche centinaia di €', B(3)], ['Assicurazioni', '% sul fatturato', B(4)], ['Cassa per le aste (con anticipo fatture)', '≈ 4.200 €', B(5)]];
  const tot = useIn(B(6), {damping: 9});
  return (
    <AbsoluteFill>
      <Title kicker="Cifre indicative" title="Quanto costa partire" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 290, width: 1100, borderRadius: 20, background: '#F4F7FA', padding: '26px 40px', boxShadow: '0 30px 80px rgba(0,0,0,0.45)', transform: 'rotate(-0.8deg)', opacity: ez(f, B(0), B(0) + 12)}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.abyss, borderBottom: `4px solid ${C.abyss}`, paddingBottom: 10}}>BUDGET DI PARTENZA · ESEMPIO</div>
        {rows.map(([k, v, at], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px dashed #9FB2C4', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#30465C', opacity: ez(f, at, at + 12)}}>
            <span>{k}</span><span style={{fontFamily: MONO, color: C.abyss}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1300, top: 380, width: 500, height: 380, borderRadius: 30, background: 'linear-gradient(160deg, rgba(124,242,154,0.22), rgba(6,36,74,0.9))', border: '3px solid #7CF29A', textAlign: 'center', paddingTop: 60, opacity: tot, transform: `scale(${0.8 + 0.2 * tot})`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.foam}}>In tutto, si parte con</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#7CF29A', lineHeight: 1.2}}>{'< 10.000 €'}</div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: C.foam, marginTop: 10}}>cifre indicative, da verificare</div>
      </div>
    </AbsoluteFill>
  );
};

export const Guadagni: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  return (
    <AbsoluteFill>
      <Title kicker="I conti" title="Quanto si guadagna" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 120, top: 300, display: 'flex', gap: 20, fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.foam}}>
        {['7.000 €', '×', '4 gg', '×', '52 sett.', '='].map((t, i) => <span key={i} style={{opacity: ez(f, B(1) + i * 8, B(1) + i * 8 + 8)}}>{t}</span>)}
        <span style={{color: C.gold, opacity: ez(f, B(1) + 50, B(1) + 60)}}>≈ {eur(ez(f, B(1) + 50, B(1) + 80) * 1456000)} €/anno</span>
      </div>
      {[{l: 'Utile prima delle tasse', v: 134200, at: B(2), c: C.foam}, {l: 'Dopo le tasse della società', v: 96800, at: B(3), c: C.aqua}].map((b, i) => {
        const q = ez(f, b.at, b.at + 30);
        return (
          <div key={i} style={{position: 'absolute', left: 120, top: 450 + i * 200, width: 1680, opacity: ez(f, b.at, b.at + 8)}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: 'rgba(232,251,255,0.8)'}}>{b.l} <span style={{fontSize: 24, color: C.gold}}>(ricarico 15% · trasporti 2%)</span></div>
            <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 10}}>
              <div style={{height: 70, width: (b.v / 140000) * 1200 * q, borderRadius: 16, background: b.c}} />
              <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 56, color: b.c}}>≈ {eur(b.v * q)} €</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Divisione: React.FC<SP> = (p) => {
  const {f, B} = useScene(p);
  const split = ez(f, B(1), B(1) + 40);
  const after = ez(f, B(2), B(2) + 40);
  const person = (x: number, color: string) => (
    <div style={{position: 'absolute', left: x, top: 300, width: 560, height: 470, borderRadius: 30, background: 'rgba(6,36,74,0.8)', border: `3px solid ${color}`, textAlign: 'center', paddingTop: 30, opacity: split, transform: `translateX(${(x < 900 ? -1 : 1) * (1 - split) * 120}px)`}}>
      <Icon name="user" size={110} color={color} />
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.foam, marginTop: 10}}>Socio al 50%</div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 58, color: C.foam, marginTop: 10}}>≈ {eur(48400 - after * (48400 - 35800))} €</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: 'rgba(232,251,255,0.7)'}}>{after > 0.5 ? "all'anno, dopo il 26% sui dividendi" : "all'anno, prima del dividendo"}</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.gold, marginTop: 16, opacity: ez(f, B(2) + 40, B(2) + 55)}}>≈ 2.980 €/mese</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Title kicker="Esempio: soci al 50%" title="Ora dividiamo" at={B(0) - 6} />
      <div style={{position: 'absolute', left: 960, top: 560, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: 1 - split * 0.85}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 90, color: C.aqua}}>96.800 €</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.foam}}>utile dopo le tasse della società</div>
      </div>
      {person(120, C.aqua)}{person(1240, C.gold)}
      <Pill at={B(3)} x={960} y={905} text="Scenario prudente (ricarico 7%): ≈ 880 €/mese a testa" color={C.coral} icon="chart" size={26} dark />
      <Pill at={B(4)} x={960} y={840} text="– contributi INPS personali · forma scelta dal commercialista" color={C.foam} icon="doc" size={22} dark />
    </AbsoluteFill>
  );
};

export const Quote: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const cards = [['50 · 50', 'soci alla pari: stesso capitale, stesso lavoro', 'handshake'], ['Quote diverse', 'chi mette più capitale, chi più lavoro', 'scale'], ['Tutto per iscritto', 'ruoli, quote, decisioni, uscita di un socio', 'doc']];
  return (
    <AbsoluteFill>
      <Title kicker="Le quote" title="Come possiamo dividerci la società" at={B(0) - 6} size={64} />
      {cards.map(([t, s, i], k) => <Card key={k} at={B(k + 1)} x={120 + k * 570} y={300} w={540} h={400} num={String(k + 1)} title={t} sub={s} icon={i} color={[C.aqua, C.gold, '#7CF29A'][k]} />)}
    </AbsoluteFill>
  );
};

export const Rischi: React.FC<SP> = (p) => {
  const {B} = useScene(p);
  const cards = [['Invenduto', 'compriamo solo su ordine', 'order'], ['Cliente che non paga', 'assicurazione crediti o factoring pro soluto', 'euro'], ['Camion senza freddo', 'assicurazione merci trasportate', 'truck'], ['Mare grosso', 'Adriatico e mercato al posto del Tirreno', 'storm']];
  return (
    <AbsoluteFill>
      <Title kicker="Rischi" title="Li conosciamo e li gestiamo" at={B(0) - 6} />
      {cards.map(([t, s, i], k) => (
        <Card key={k} at={B(k + 1)} x={120 + (k % 2) * 850} y={290 + Math.floor(k / 2) * 300} w={820} h={260} num={String(k + 1)} title={t} sub={'→ ' + s} icon={i} color={k % 2 ? C.gold : C.aqua}>
          <div style={{position: 'absolute', right: 26, bottom: 22}}><Icon name="shield" size={64} color="#7CF29A" sw={6} /></div>
        </Card>
      ))}
    </AbsoluteFill>
  );
};

export const Roadmap = RoadmapGdo;

export const Fine: React.FC<SP> = () => (
  <AbsoluteFill><OffthreadVideo src={staticFile('socio/hf_end.mp4')} muted /></AbsoluteFill>
);

export const SCENES: Record<string, React.FC<SP>> = {
  intro: Intro, idea: Idea, perche: Perche, partner: Partner, giornata: Giornata, ruoli: Ruoli, costi: Costi, guadagni: Guadagni,
  divisione: Divisione, quote: Quote, rischi: Rischi, roadmap: Roadmap, fine: Fine,
};
export const CHAPTERS: Record<string, string> = {
  intro: 'Il progetto', idea: "L'idea", perche: "L'idea", partner: 'Il partner', giornata: 'Il lavoro', ruoli: 'Il lavoro', costi: 'I costi',
  guadagni: 'I guadagni', divisione: 'I guadagni', quote: 'Le quote', rischi: 'I rischi', roadmap: 'Partenza', fine: 'Argo Maris',
};
