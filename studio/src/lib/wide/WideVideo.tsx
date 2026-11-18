import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Backdrop, Header, Captions16, SP, SceneData, clamp} from './ui';

const OVER = 10;
const Wrap: React.FC<{dur: number; first: boolean; last: boolean; children: React.ReactNode}> = ({dur, first, last, children}) => {
  const f = useCurrentFrame();
  const inn = first ? 1 : interpolate(f, [0, OVER + 6], [0, 1], clamp);
  const out = last ? 1 : interpolate(f, [dur - OVER - 4, dur], [1, 0], clamp);
  const x = (1 - inn) * 80 - (1 - out) * 80;
  return (
    <AbsoluteFill style={{opacity: Math.min(inn, out), transform: `translateX(${x}px) scale(${1 + (1 - inn) * 0.03})`, filter: `blur(${(1 - Math.min(inn, out)) * 12}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

export const WideVideo: React.FC<{
  timeline: {frames: number; total: number; scenes: SceneData[]; slug: string};
  scenes: Record<string, React.FC<SP>>; chapters: Record<string, string>; subtitle: string;
  highlight?: Record<string, string>; withVoice?: boolean; noHeader?: string[]; noCaptions?: string[]; partnerImg?: string;
}> = ({timeline, scenes, chapters, subtitle, highlight, withVoice = true, noHeader = [], noCaptions = [], partnerImg}) => {
  const {fps} = useVideoConfig();
  const f = useCurrentFrame();
  const t = f / fps;
  const chapNames = Array.from(new Set(timeline.scenes.map((s) => chapters[s.id])));
  const cur = timeline.scenes.find((s) => t >= s.start - 0.2 && t < s.start + s.dur) ?? timeline.scenes[0];
  const words = timeline.scenes.filter((s) => !noCaptions.includes(s.id)).flatMap((s) => s.words);
  return (
    <AbsoluteFill style={{background: '#020B1A'}}>
      <Backdrop />
      {timeline.scenes.map((sc, i) => {
        const Comp = scenes[sc.id];
        const st = Math.round(sc.start * fps);
        const from = i === 0 ? 0 : st - OVER;
        const offset = st - from;
        const last = i === timeline.scenes.length - 1;
        const dur = last ? timeline.frames - from : Math.round((sc.start + sc.dur) * fps) - from + OVER;
        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} name={sc.id}>
            <Wrap dur={dur} first={i === 0} last={last}><Comp sc={sc} offset={offset} dur={dur} /></Wrap>
          </Sequence>
        );
      })}
      {!noHeader.includes(cur.id) && (
        <Header subtitle={subtitle} chapter={chapters[cur.id]} idx={chapNames.indexOf(chapters[cur.id]) + 1} total={chapNames.length} progress={t / timeline.total} partnerImg={partnerImg} />
      )}
      <Captions16 words={words} highlight={highlight} />
      {withVoice && <Audio src={staticFile(`${timeline.slug}/voice.wav`)} />}
    </AbsoluteFill>
  );
};
