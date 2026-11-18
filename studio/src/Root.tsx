import React from 'react';
import {Composition} from 'remotion';
import {MareSalato} from './videos/mare-salato/Video';
import mareSalato from './videos/mare-salato/timeline.json';
import {CoopEtruria, coopFrames} from './videos/coop-etruria/Video';
import {GdoV6, gdoFrames} from './videos/gdo-v6/Video';
import {MareItalia, MareItaliaFrames} from './videos/mare-italia/Video';
import {Socio, SocioFrames} from './videos/socio/Video';
import {EliteCity, ELITE_FRAMES} from './videos/elite-city/EliteCity';
import {GlTest} from './videos/ped/GlTest';
import {PedCity, PED_FRAMES} from './videos/ped/PedCity';
import {TestMap, TestKit} from './videos/_test/Test';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MareSalato" component={MareSalato} durationInFrames={mareSalato.frames} fps={30} width={1080} height={1920} defaultProps={{withVoice: true}} />
    <Composition id="CoopEtruria" component={CoopEtruria} durationInFrames={coopFrames} fps={30} width={1920} height={1080} defaultProps={{withVoice: true}} />
    <Composition id="GdoV6" component={GdoV6} durationInFrames={gdoFrames} fps={30} width={1920} height={1080} defaultProps={{withVoice: true}} />
    <Composition id="MareItalia" component={MareItalia} durationInFrames={MareItaliaFrames} fps={30} width={1920} height={1080} defaultProps={{withVoice: true}} />
    <Composition id="Socio" component={Socio} durationInFrames={SocioFrames} fps={30} width={1920} height={1080} defaultProps={{withVoice: true}} />
    <Composition id="EliteCity" component={EliteCity} durationInFrames={ELITE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PedCity" component={PedCity} durationInFrames={PED_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="GlTest" component={GlTest} durationInFrames={30} fps={30} width={540} height={960} />
    <Composition id="TestMap" component={TestMap as any} durationInFrames={60} fps={30} width={1920} height={1080} defaultProps={{v: 'centro'}} />
    <Composition id="TestKit" component={TestKit} durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);
