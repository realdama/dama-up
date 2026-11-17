import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Fish, Icon, Card, Header, Title, C} from '../../lib/wide/ui';
import {MapView, Port, pt, Route, Fleet, Storm, SeaLabel} from '../../lib/wide/MapView';

export const TestMap: React.FC<{v: string}> = ({v}) => {
  const view = v as any;
  const P = (k: string) => pt(view, k);
  return (
    <AbsoluteFill>
      <MapView view={view}>
        {['civitavecchia', 'fiumicino', 'anzio', 'car', 'adrP1', 'adrP2', 'adrP3', 'adrP4', 'roma', 'scozia', 'olanda', 'grecia', 'croazia', 'turchia'].map((k) => (
          <Port key={k} x={P(k)[0]} y={P(k)[1]} at={0} label={k} />
        ))}
        <SeaLabel x={P('tir2')[0]} y={P('tir2')[1]} at={0} text="TIRRENO" />
      </MapView>
    </AbsoluteFill>
  );
};
export const TestKit: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Header subtitle="per Unicoop Etruria" chapter="Il pesce locale" idx={3} total={17} progress={0.3} />
    <Title kicker="Il nostro mare" title="Dal Tirreno alla piattaforma" at={-30} />
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      {['triglia', 'alice', 'calamaro', 'gambero', 'spada', 'ricciola', 'orata', 'spigola', 'salmone'].map((s, i) => (
        <Fish key={s} sp={s} x={250 + (i % 5) * 340} y={480 + Math.floor(i / 5) * 220} s={1} />
      ))}
    </svg>
    <div style={{position: 'absolute', left: 120, top: 900, display: 'flex', gap: 20}}>
      {['order', 'truck', 'boat', 'fish', 'check', 'clock', 'euro', 'shield', 'people', 'store', 'warehouse', 'gavel', 'doc', 'bank', 'snow', 'globe', 'storm', 'handshake', 'pin', 'thermo', 'box', 'money'].map((n) => <Icon key={n} name={n} size={60} />)}
    </div>
  </AbsoluteFill>
);
