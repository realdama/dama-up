import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, H, W, loadFonts} from '../theme';
import {Header} from '../Overlay';
import {NavyBg, Pill} from './Kit';
import {TC, TNAME, Tuna, Species} from './Tuna';

loadFonts();
const SP: Species[] = ['rosso', 'gialla', 'obeso'];

export const TnCover: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile('img/tn_rosso_salto.jpg')} style={{position: 'absolute', width: W, height: H, objectFit: 'cover', filter: 'brightness(.55) saturate(1.1) blur(2px)', transform: 'scale(1.15)'}} />
    <AbsoluteFill style={{opacity: 0.62}}><NavyBg tint="#1d3f7a" /></AbsoluteFill>
    <Header logoAt={999} />
    <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: 'rotate(-2deg)'}}>
      <div style={{display: 'inline-block', background: C.cream, color: C.navy, fontFamily: 'Inter', fontWeight: 900, fontSize: 100, lineHeight: 1.04, padding: '22px 40px', whiteSpace: 'nowrap', borderRadius: 22, boxShadow: '0 30px 80px rgba(0,0,0,.6)', borderBottom: `16px solid ${C.orange}`}}>
        IL TONNO È<br />TUTTO UGUALE?
      </div>
    </div>
    {SP.map((s, i) => (
      <div key={s} style={{position: 'absolute', left: i === 1 ? 120 : 50, top: 740 + i * 250, display: 'flex', alignItems: 'center', gap: 10}}>
        <Tuna sp={s} w={i === 0 ? 520 : 460} f={i * 7} glow={TC[s] + '88'} />
        <Pill txt={TNAME[s]} bg={TC[s]} fg={s === 'gialla' ? C.navy : '#fff'} size={40} />
      </div>
    ))}
    <div style={{position: 'absolute', top: 1560, width: '100%', textAlign: 'center'}}>
      <Img src={staticFile('logo.png')} style={{width: 190, height: 190, borderRadius: '50%', boxShadow: '0 0 0 5px #d9dee6, 0 0 50px rgba(200,215,240,.6)'}} />
    </div>
  </AbsoluteFill>
);
