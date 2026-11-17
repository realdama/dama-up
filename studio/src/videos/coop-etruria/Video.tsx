import React from 'react';
import timeline from './timeline.json';
import {SCENES, CHAPTERS} from './Scenes';
import {WideVideo} from '../../lib/wide/WideVideo';
import {C} from '../../lib/kit';

export const coopFrames = timeline.frames;
export const CoopEtruria: React.FC<{withVoice?: boolean}> = ({withVoice = true}) => (
  <WideVideo timeline={timeline as any} scenes={SCENES} chapters={CHAPTERS} subtitle="per Unicoop Etruria" withVoice={withVoice}
    noHeader={['hook', 'intro', 'fine']} noCaptions={['hook', 'fine']}
    highlight={{mare: C.aqua, tirreno: C.aqua, adriatico: C.gold, civitavecchia: C.gold, fiumicino: C.gold, anzio: C.gold, fresco: C.aqua, buono: C.gold,
      rotazione: C.gold, continuità: C.aqua, qualità: C.gold, locale: C.gold, orate: C.gold, scozia: C.gold, olanda: C.gold, grecia: C.gold, croazia: C.gold, turchia: C.gold,
      referente: C.gold, fiuto: C.gold, quattrocento: C.aqua, freddo: C.aqua, ghiaccio: C.aqua, plus: C.gold, argo: C.aqua, maris: C.aqua}} />
);
