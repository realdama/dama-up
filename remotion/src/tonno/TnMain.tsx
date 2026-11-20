import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, FPS, loadFonts} from '../theme';
import {Grade, Photos} from '../Photos';
import {Header, Labels, Progress, Subs} from '../Overlay';
import {Outro} from '../Scenes';
import {IdCard} from '../rv/Scenes';
import {Caldi, Hook, Med, Oceano, Quota, Re, Regole, Sicilia, Storia} from './ScenesA';
import {Asta, Carne, Cucina, Poll, Profondo, Swooshes} from './ScenesB';
import {TN_HIDE_SUBS, TN_LOGO_AT, TN_SCENES, TN_SHOTS, TN_TOTAL} from './timeline';
import {TC, TLATIN, TNAME, Tuna} from './Tuna';
import {NavyBg} from './Kit';
import words from './words.json';

loadFonts();
const fr = (s: number) => Math.round(s * FPS);
type K = keyof typeof TN_SCENES;
const S: React.FC<{k: K; render: (dur: number, t0: number) => React.ReactNode}> = ({k, render}) => {
  const [a, b] = TN_SCENES[k];
  const from = Math.max(0, fr(a) - 5);
  const dur = fr(b) + 5 - from;
  return <Sequence from={from} durationInFrames={dur}>{render(dur, from / FPS)}</Sequence>;
};

// Foto (CC0 / pubblico dominio, specie verificata)
export const PH = {
  rosso: 'tn_rosso_salto',
  gialla: 'tn_gialla',
  obeso: 'tn_obeso',
  tonnara: 'tn_tonnara',
  regole: 'tn_rosso_salto',
  mercato: 'tn_mercato',
  asta: 'tn_asta',
};
const hookPh = {rosso: [PH.rosso, '55% 50%'], gialla: [PH.gialla, '78% 45%'], obeso: [PH.obeso, '50% 50%']} as const;

// Illustrazione per la carta del tonno obeso (sfondo foto per Still)
export const ObesoIll: React.FC = () => (
  <AbsoluteFill>
    <NavyBg tint="#1d3f7a" />
    <div style={{position: 'absolute', left: 40, top: 700}}><Tuna sp="obeso" w={1000} glow="rgba(110,160,255,.55)" /></div>
  </AbsoluteFill>
);

export const TnMain: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.navyDeep}}>
    <Photos shots={TN_SHOTS} />
    <Grade />
    <S k="hook" render={(d) => <Hook dur={d} photos={hookPh as never} />} />
    <S k="re" render={(d, t) => <Re dur={d} t0={t} />} />
    <S k="oceano" render={(d, t) => <Oceano dur={d} t0={t} />} />
    <S k="med" render={(d, t) => <Med dur={d} t0={t} tonnara={PH.tonnara} />} />
    <S k="storia" render={(d, t) => <Storia dur={d} t0={t} phase="giu" />} />
    <S k="regole" render={(d, t) => <Regole dur={d} t0={t} bg={PH.regole} />} />
    <S k="tornato" render={(d, t) => <Storia dur={d} t0={t} phase="su" />} />
    <S k="quota" render={(d, t) => <Quota dur={d} t0={t} />} />
    <S k="sicilia" render={(d, t) => <Sicilia dur={d} t0={t} />} />
    <S k="caldi" render={(d, t) => <Caldi dur={d} t0={t} />} />
    <S k="gialla" render={(d, t) => <IdCard dur={d} t0={t} color={TC.gialla} tint="#4a3a10" photo={PH.gialla} pos="62% 50%" num="02" name={TNAME.gialla} latin={TLATIN.gialla} rows={[['MARI TROPICALI', 51.49], ['PIÙ PICCOLO', 52.25], ['PINNE GIALLO ACCESO', 53.43]]} />} />
    <S k="carne" render={(d, t) => <Carne dur={d} t0={t} bg={PH.mercato} />} />
    <S k="obeso" render={(d, t) => <IdCard dur={d} t0={t} color={TC.obeso} tint="#16306a" photo={PH.obeso} pos="50% 50%" num="03" name={TNAME.obeso} latin={TLATIN.obeso} rows={[['TOZZO', 63.4], ['OCCHI ENORMI', 64.38]]} />} />
    <S k="profondo" render={(d, t) => <Profondo dur={d} t0={t} />} />
    <S k="asta" render={(d, t) => <Asta dur={d} t0={t} bg={PH.asta} />} />
    <S k="cucina" render={(d, t) => <Cucina dur={d} t0={t} photos={{rosso: 'tn_sashimi', gialla: null, obeso: 'tn_tartare'}} />} />
    <Swooshes times={[3.4, 10.5, 17.2, 21.95, 29.75, 34.12, 38.45, 46.45, 47.98, 49.95, 54.33, 60.25, 65.15, 69.95, 72.25, 79.45]} />
    <Labels shots={TN_SHOTS} />
    <Subs groups={words as never} hide={TN_HIDE_SUBS} />
    <S k="poll" render={(d, t) => <Poll dur={d + 10} t0={t} photos={hookPh as never} />} />
    <Header logoAt={TN_LOGO_AT} />
    <Progress total={TN_TOTAL} />
    <Sequence from={fr(TN_LOGO_AT) - 5}><Outro /></Sequence>
  </AbsoluteFill>
);

