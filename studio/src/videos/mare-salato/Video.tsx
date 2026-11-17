import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import timeline from './timeline.json';
import {SCENES} from './Scenes';
import {Captions} from '../../lib/Captions';
import {C, FONT, rand, clamp} from '../../lib/kit';

const OVER = 8; // frame di sovrapposizione tra le scene

const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 0%, ${C.deep} 0%, ${C.abyss} 70%)`}}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute'}}>
        {/* raggi di luce */}
        {[0, 1, 2, 3].map((i) => (
          <polygon key={i} points={`${200 + i * 230 + Math.sin(f / 70 + i) * 40},0 ${300 + i * 230 + Math.sin(f / 70 + i) * 40},0 ${120 + i * 260},1920 ${-40 + i * 260},1920`}
            fill={C.aqua} opacity={0.035} />
        ))}
        {/* bollicine */}
        {Array.from({length: 34}).map((_, i) => {
          const sp = 1 + rand(i) * 2.2;
          const y = 1980 - ((f * sp + rand(i + 1) * 2000) % 2100);
          return <circle key={i} cx={rand(i + 2) * 1080 + Math.sin(f / 30 + i) * 14} cy={y} r={3 + rand(i + 3) * 9}
            fill="none" stroke={C.foam} strokeWidth={2} opacity={0.12 + rand(i + 4) * 0.12} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Header: React.FC<{title: string}> = ({title}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const n = timeline.scenes.length;
  return (
    <div style={{position: 'absolute', top: 70, left: 50, right: 50}}>
      <div style={{display: 'flex', gap: 8}}>
        {timeline.scenes.map((s, i) => {
          const p = interpolate(t, [s.start, s.start + s.dur], [0, 1], clamp);
          return (
            <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: 'rgba(232,251,255,0.18)', overflow: 'hidden'}}>
              <div style={{width: `${p * 100}%`, height: '100%', background: C.foam}} />
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 26, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: 2, color: C.abyss, background: C.aqua,
          padding: '12px 30px', borderRadius: 40, opacity: interpolate(f, [0, 15], [0, 1], clamp)}}>
          {title.toUpperCase()}
        </div>
      </div>
      {n === 0 ? null : null}
    </div>
  );
};

export const MareSalato: React.FC<{withVoice?: boolean}> = ({withVoice = true}) => {
  const {fps} = useVideoConfig();
  const words = timeline.scenes.flatMap((s) => s.words);
  return (
    <AbsoluteFill style={{backgroundColor: C.abyss}}>
      <Background />
      {timeline.scenes.map((sc, i) => {
        const Comp = SCENES[sc.id];
        const from = Math.max(0, Math.round(sc.start * fps) - (i === 0 ? Math.round(sc.start * fps) : OVER));
        const offset = Math.round(sc.start * fps) - from;
        const last = i === timeline.scenes.length - 1;
        const dur = last ? timeline.frames - from : Math.round((sc.start + sc.dur) * fps) - from + OVER;
        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} name={sc.id}>
            <SceneWrap dur={dur} last={last}>
              <Comp sc={sc} offset={offset} />
            </SceneWrap>
          </Sequence>
        );
      })}
      <Header title="Perché il mare è salato?" />
      <Captions words={words} y={1500}
        highlight={{sale: C.gold, salatissimo: C.coral, pioggia: C.aqua, acida: '#A7F070', sodio: C.gold, cloro: C.aqua,
          magnesio: C.violet, miliardi: C.gold, sole: C.gold, evaporare: C.aqua, resta: C.gold, milioni: C.gold,
          trentacinque: C.gold, grammi: C.gold, cucchiaini: C.aqua, grattacielo: C.aqua, cinquanta: C.gold, seguici: C.coral, mare: C.aqua}}
        replace={{trentacinque: '35', cinquanta: '50'}} />
      {withVoice && <Audio src={staticFile('mare-salato/voice.wav')} />}
    </AbsoluteFill>
  );
};

const SceneWrap: React.FC<{dur: number; last: boolean; children: React.ReactNode}> = ({dur, last, children}) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, OVER + 4], [0, 1], clamp);
  const out = last ? 1 : interpolate(f, [dur - OVER - 2, dur], [1, 0], clamp);
  const scale = 1.06 - 0.06 * inn + (1 - out) * 0.05;
  const blur = (1 - inn) * 14 + (1 - out) * 14;
  return (
    <AbsoluteFill style={{opacity: Math.min(inn, out), transform: `scale(${scale})`, filter: `blur(${blur}px)`}}>
      {children}
    </AbsoluteFill>
  );
};
