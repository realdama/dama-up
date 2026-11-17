import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {FPS, H, W} from './theme';
import {TOTAL} from './timeline';
import {RvMain} from './rv/RvMain';
import {RV_TOTAL} from './rv/timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="RossoViola" component={RvMain} durationInFrames={Math.round(RV_TOTAL * FPS)} fps={FPS} width={W} height={H} />
  </>
);
