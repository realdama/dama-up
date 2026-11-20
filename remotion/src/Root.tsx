import React from 'react';
import {Composition, Still} from 'remotion';
import {RvCover} from './rv/Cover';
import {RvWarp, WARP_TOTAL} from './rv/Warp';
import {Main} from './Main';
import {FPS, H, W} from './theme';
import {TOTAL} from './timeline';
import {RvMain} from './rv/RvMain';
import {RV_TOTAL} from './rv/timeline';
import {ObesoIll, TnMain} from './tonno/TnMain';
import {TN_TOTAL} from './tonno/timeline';
import {TnCover} from './tonno/Cover';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="RossoViola" component={RvMain} durationInFrames={Math.round(RV_TOTAL * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="RossoViolaFinal" component={RvWarp} durationInFrames={Math.round(WARP_TOTAL * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Tonno" component={TnMain} durationInFrames={Math.round(TN_TOTAL * FPS)} fps={FPS} width={W} height={H} />
    <Still id="TnCover" component={TnCover} width={W} height={H} />
    <Still id="TnObesoIll" component={ObesoIll} width={W} height={H} />
    <Still id="RvCover" component={RvCover} width={W} height={H} />
  </>
);
