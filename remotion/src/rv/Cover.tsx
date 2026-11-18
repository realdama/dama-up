import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, H, W, loadFonts} from '../theme';
import {RV_COL} from './timeline';

loadFonts();
// Copertina TikTok (fotogramma statico)
export const RvCover: React.FC = () => (
  <AbsoluteFill style={{background: C.navyDeep}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H / 2, overflow: 'hidden'}}>
      <Img src={staticFile('img/gambero.jpg')} style={{width: W, height: H / 2, objectFit: 'cover', objectPosition: '42% 42%', filter: 'contrast(1.08) saturate(1.2)'}} />
    </div>
    <div style={{position: 'absolute', left: 0, top: H / 2, width: W, height: H / 2, overflow: 'hidden'}}>
      <Img src={staticFile('img/viola1.jpg')} style={{width: W, height: H / 2, objectFit: 'cover', objectPosition: '55% 50%', transform: 'scale(1.2)', filter: 'contrast(1.08) saturate(1.15)'}} />
    </div>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,15,32,.85) 0%, rgba(6,15,32,.15) 22%, rgba(6,15,32,.55) 42%, rgba(6,15,32,.75) 50%, rgba(6,15,32,.55) 58%, rgba(6,15,32,.1) 78%, rgba(6,15,32,.85) 100%)'}} />
    <div style={{position: 'absolute', left: 0, top: H / 2 - 6, width: W, height: 12, background: `linear-gradient(90deg, ${RV_COL.rosso}, #fff, ${RV_COL.viola})`}} />
    <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', fontFamily: 'Cinzel', fontWeight: 700, fontSize: 50, letterSpacing: 10, color: C.silver}}>DAMA RESERVÈE</div>
    <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center'}}>
      <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 210, lineHeight: 0.95, color: RV_COL.rosso, WebkitTextStroke: '14px #fff', paintOrder: 'stroke fill', filter: 'drop-shadow(0 18px 40px rgba(0,0,0,.6))'}}>ROSSO</div>
      <div style={{display: 'inline-block', margin: '18px 0', background: C.orange, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 84, width: 140, height: 140, lineHeight: '140px', borderRadius: '50%', border: '8px solid #fff'}}>o</div>
      <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 210, lineHeight: 0.95, color: RV_COL.viola, WebkitTextStroke: '14px #fff', paintOrder: 'stroke fill', filter: 'drop-shadow(0 18px 40px rgba(0,0,0,.6))'}}>VIOLA?</div>
    </div>
    <div style={{position: 'absolute', top: 1390, width: '100%', textAlign: 'center'}}>
      <span style={{display: 'inline-block', background: C.cream, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 58, padding: '14px 36px', borderRadius: 50, boxShadow: '0 16px 50px rgba(0,0,0,.5)'}}>LA DIFFERENZA CHE PAGHI</span>
    </div>
    <Img src={staticFile('logo.png')} style={{position: 'absolute', left: W / 2 - 80, top: 1600, width: 160, height: 160, borderRadius: '50%', boxShadow: '0 0 0 3px rgba(207,213,222,.5), 0 12px 40px rgba(0,0,0,.6)'}} />
  </AbsoluteFill>
);
