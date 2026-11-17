import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {FPS, loadFonts} from './theme';
import {LOGO_AT, SCENES} from './timeline';
import {Grade, Photos} from './Photos';
import {Header, HookTitle, Labels, Progress, Subs} from './Overlay';
import {DistanceMap, TravelMap} from './Maps';
import {Checklist, Depth, Outro, Poll} from './Scenes';

loadFonts();
const fr = (s: number) => Math.round(s * FPS);
const seq = (k: keyof typeof SCENES) => {
  const [a, b] = SCENES[k];
  const from = fr(a) - 5;
  return {from, durationInFrames: fr(b) + 5 - from};
};

export const Main: React.FC = () => {
  const t = seq('travel'), d = seq('depth'), m = seq('distance'), c = seq('checklist'), p = seq('poll');
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Photos />
      <Grade />
      <Sequence {...t}><TravelMap dur={t.durationInFrames} /></Sequence>
      <Sequence {...d}><Depth dur={d.durationInFrames} t0={d.from / FPS} /></Sequence>
      <Sequence {...m}><DistanceMap dur={m.durationInFrames} /></Sequence>
      <Sequence {...c}><Checklist dur={c.durationInFrames} t0={c.from / FPS} /></Sequence>
      <Sequence from={p.from} durationInFrames={fr(LOGO_AT) + 10 - p.from}><Poll dur={p.durationInFrames} t0={p.from / FPS} /></Sequence>
      <HookTitle />
      <Labels />
      <Subs />
      <Header />
      <Progress />
      <Sequence from={fr(LOGO_AT) - 5}><Outro /></Sequence>
    </AbsoluteFill>
  );
};
