import React from 'react';
import timeline from './timeline.json';
import {SCENES, CHAPTERS} from './Scenes';
import {WideVideo} from '../../lib/wide/WideVideo';
import {C} from '../../lib/kit';

export const gdoFrames = timeline.frames;
export const GdoV6: React.FC<{withVoice?: boolean}> = ({withVoice = true}) => (
  <WideVideo timeline={timeline as any} scenes={SCENES} chapters={CHAPTERS} subtitle="Il buyer del pesce per la GDO" withVoice={withVoice}
    noHeader={['intro']} noCaptions={[]}
    highlight={{tirreno: C.aqua, adriatico: C.gold, civitavecchia: C.gold, fiumicino: C.gold, anzio: C.gold, margine: C.gold, ricarico: C.gold,
      trasporti: C.aqua, utile: C.gold, aste: C.aqua, barche: C.aqua, mercato: C.aqua, regola: '#7CF29A', ifs: C.gold, broker: C.gold, centesimi: C.gold,
      factoring: C.gold, asl: C.aqua, haccp: C.aqua, inps: C.coral, attenzione: C.coral, estero: C.gold, plus: C.gold, argo: C.aqua, maris: C.aqua}} />
);
