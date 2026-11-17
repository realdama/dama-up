import React from 'react';
import {Composition} from 'remotion';
import {MareSalato} from './videos/mare-salato/Video';
import mareSalato from './videos/mare-salato/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MareSalato" component={MareSalato} durationInFrames={mareSalato.frames} fps={30}
      width={1080} height={1920} defaultProps={{withVoice: true}} />
  </>
);
