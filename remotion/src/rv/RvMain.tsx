import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, FPS, loadFonts} from '../theme';
import {Grade, Photos} from '../Photos';
import {Header, Labels, Progress, Subs} from '../Overlay';
import {Outro} from '../Scenes';
import {pts, P} from '../Maps';
import {Calibro, Chain, Hook, IdCard, Meno6, MedMap, Stamps, TeamPoll, UE, ZoneMap} from './Scenes';
import {RV_COL, RV_CUT_AT, RV_HIDE_SUBS, RV_LOGO_AT, RV_SCENES, RV_SHIFT, RV_SHOTS, RV_TOTAL, rvSh} from './timeline';
import words from './words.json';
import {Swooshes} from './Fx';

loadFonts();
const fr = (s: number) => Math.round(s * FPS);
type K = keyof typeof RV_SCENES;
const seq = (k: K) => {
  const [a, b] = RV_SCENES[k];
  // le scene dopo il taglio partono prima; i tempi interni (parole) restano quelli originali
  const shifted = a >= RV_CUT_AT - 2.5;
  const from = Math.max(0, fr(k === 'ue' ? 39.45 : rvSh(a)) - 5);
  return {from, durationInFrames: fr(rvSh(b)) + 5 - from, t0: from / FPS - (shifted ? RV_SHIFT : 0)};
};
const S: React.FC<{k: K; render: (dur: number, t0: number) => React.ReactNode}> = ({k, render}) => {
  const s = seq(k);
  return <Sequence from={s.from} durationInFrames={s.durationInFrames}>{render(s.durationInFrames, s.t0)}</Sequence>;
};

const lz = [pts.civitavecchia, pts.fiumicino, pts.anzio];
const lzc: P = [(lz[0][0] + lz[2][0]) / 2 + 20, (lz[0][1] + lz[2][1]) / 2 + 40];

export const RvMain: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.navyDeep}}>
    <Photos shots={RV_SHOTS} />
    <Grade />
    <S k="hook" render={(d) => <Hook dur={d} />} />
    <S k="med" render={(d, t) => <MedMap dur={d} t0={t} />} />
    <S k="idRosso" render={(d, t) => <IdCard dur={d} t0={t} color={RV_COL.rosso} tint="#4a1a22" photo="gambero" pos="62% 40%" num="01" ill="ill_rosso" name="GAMBERO ROSSO" latin="ARISTAEOMORPHA FOLIACEA" rows={[['ROSSO INTENSO', 10.3], ['UNIFORME', 11.06], ['PIÙ GRANDE', 11.92], ['CARNOSO', 12.38]]} />} />
    <S k="sicilia" render={(d, t) => <ZoneMap dur={d} t0={t} cam0={{cx: 1420, cy: -4590, w: 760}} cam1={{cx: 1400, cy: -4545, w: 560}} card={['CANALE DI SICILIA', 14.98]} boatsAt={16.42} pins={[{p: pts.mazara, t: 16.3, color: RV_COL.rosso, tag: 'MAZARA DEL VALLO', tagSub: 'LA FLOTTA'}]} />} />
    <S k="idViola" render={(d, t) => <IdCard dur={d} t0={t} color={RV_COL.viola} tint="#35204f" photo="viola1" pos="50% 45%" num="02" ill="ill_viola" name="GAMBERO VIOLA" latin="ARISTEUS ANTENNATUS" rows={[['RIFLESSI VIOLA-ROSATI', 19.88], ['PIÙ SLANCIATO', 21.2], ['PIÙ DOLCE', 22.96], ['E DELICATO', 23.52]]} />} />
    <S k="italia" render={(d, t) => <ZoneMap dur={d} t0={t} cam0={{cx: 1430, cy: -5150, w: 1700}} cam1={{cx: 1467, cy: -5180, w: 1320}} card={['DOVE TROVI IL VIOLA', 24.3]} pins={[
      {p: pts.lazio, t: 24.6, color: RV_COL.viola, label: 'LAZIO', side: 'r'},
      {p: pts.sardegna, t: 25.84, color: RV_COL.viola, label: 'SARDEGNA', side: 'r'},
      {p: pts.genova, t: 26.46, color: RV_COL.viola, label: 'LIGURIA', side: 'r'},
      {p: pts.puglia, t: 27.3, color: RV_COL.viola, label: 'PUGLIA', side: 'l'},
      {p: pts.gallipoli, t: 28.8, color: C.orange, label: 'GALLIPOLI ★', side: 'l'},
    ]} />} />
    <S k="calibro" render={(d, t) => <Calibro dur={d} t0={t} />} />
    <S k="ue" render={(d, t) => <UE dur={d} t0={t} />} />
    <S k="meno6" render={(d, t) => <Meno6 dur={d} t0={t} />} />
    <S k="chain" render={(d, t) => <Chain dur={d} t0={t} />} />
    <S k="lazio" render={(d, t) => <ZoneMap dur={d} t0={t} cam0={{cx: lzc[0], cy: lzc[1], w: 560}} cam1={{cx: lzc[0], cy: lzc[1], w: 380}} card={['LE ASTE DEL LAZIO', 63.8]} pins={[
      {p: pts.civitavecchia, t: 65.4, color: C.orange, label: 'CIVITAVECCHIA', side: 'r'},
      {p: pts.fiumicino, t: 66.0, color: C.orange, label: 'FIUMICINO', side: 'r'},
      {p: pts.anzio, t: 66.5, color: C.orange, label: 'ANZIO', side: 'r'},
    ]} extra={(f, at) => (
      <div style={{position: 'absolute', top: 1150, width: '100%', display: 'flex', justifyContent: 'center', gap: 24}}>
        {f >= at(67.84) && <span style={{display: 'inline-block', background: RV_COL.rosso, color: '#fff', fontFamily: 'Inter', fontWeight: 900, fontSize: 54, padding: '12px 34px', borderRadius: 50}}>ROSSI</span>}
        {f >= at(68.2) && <span style={{display: 'inline-block', background: RV_COL.viola, color: '#fff', fontFamily: 'Inter', fontWeight: 900, fontSize: 54, padding: '12px 34px', borderRadius: 50}}>+ VIOLA</span>}
      </div>
    )} />} />
    <S k="stamps" render={(d, t) => <Stamps dur={d} t0={t} />} />
    <Swooshes times={[3.58, 8.84, 13.04, 17.92, 24.24, 29.36, 39.45, 49.37, 56.89, 60.31, 65.97, 68.55, 73.03]} />
    <Labels shots={RV_SHOTS} />
    <Subs groups={words as never} hide={RV_HIDE_SUBS} />
    <S k="poll" render={(d, t) => <TeamPoll dur={d + 10} t0={t} />} />
    <Header logoAt={RV_LOGO_AT} />
    <Progress total={RV_TOTAL} />
    <Sequence from={fr(RV_LOGO_AT) - 5}><Outro /></Sequence>
  </AbsoluteFill>
);
