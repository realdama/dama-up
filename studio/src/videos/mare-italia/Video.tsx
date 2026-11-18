import React from 'react';
import timeline from './timeline.json';
import {SCENES, CHAPTERS} from './Scenes';
import {WideVideo} from '../../lib/wide/WideVideo';
import {C} from '../../lib/kit';

export const MareItaliaFrames = timeline.frames;
export const MareItalia: React.FC<{withVoice?: boolean}> = ({withVoice = true}) => (
  <WideVideo timeline={timeline as any} scenes={SCENES} chapters={CHAPTERS} subtitle="Mare Italia × Argo Maris" withVoice={withVoice}
    noHeader={['hook', 'intro', 'fine']} noCaptions={['hook']}
    highlight={{mare: C.aqua, italia: C.aqua, argo: C.aqua, maris: C.aqua, roma: C.aqua, tirreno: C.aqua, adriatico: C.gold, esempio: C.gold, socio: C.gold, soci: C.gold,
      costa: C.gold, guadagna: C.gold, utile: C.gold, rischi: C.coral, contratto: '#7CF29A', regola: '#7CF29A', quote: C.gold, partner: C.gold}} />
);
