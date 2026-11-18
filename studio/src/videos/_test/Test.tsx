import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Fish, SPECIES, C, FONT} from '../../lib/wide/ui';
import {MapView, Port, pt, SeaLabel} from '../../lib/wide/MapView';

export const TestMap: React.FC<{v: string}> = ({v}) => <AbsoluteFill><MapView view={v as any} /></AbsoluteFill>;
export const TestKit: React.FC = () => {
  const keys = Object.keys(SPECIES);
  return (
    <AbsoluteFill>
      <Backdrop />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {keys.map((k, i) => {
          const x = 140 + (i % 8) * 235, y = 110 + Math.floor(i / 8) * 205;
          return <g key={k}><Fish sp={k} x={x} y={y} s={0.75} /><text x={x} y={y + 85} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.foam}>{SPECIES[k].name}</text></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
