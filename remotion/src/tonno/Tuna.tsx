import React from 'react';

// Tonno stilizzato (profilo laterale). Parametri per specie: tozzezza, occhio, pinne.
export type Species = 'rosso' | 'gialla' | 'obeso';
export const TC = {rosso: '#e0453a', gialla: '#f5b800', obeso: '#4f8df5'} as const;
export const TNAME = {rosso: 'TONNO ROSSO', gialla: 'PINNA GIALLA', obeso: 'TONNO OBESO'} as const;
export const TLATIN = {rosso: 'THUNNUS THYNNUS', gialla: 'THUNNUS ALBACARES', obeso: 'THUNNUS OBESUS'} as const;

const SP = {
  rosso: {k: 1.0, eye: 6, fin: '#1d2c4a', fin2: 22, stripe: 'rgba(170,190,215,.35)', top: '#0f2a52'},
  gialla: {k: 0.86, eye: 6, fin: '#f5c400', fin2: 62, stripe: 'rgba(255,205,40,.75)', top: '#11325e'},
  obeso: {k: 1.2, eye: 11, fin: '#24375c', fin2: 26, stripe: 'rgba(110,160,255,.45)', top: '#0d2346'},
};

export const Tuna: React.FC<{sp: Species; w: number; flip?: boolean; f?: number; glow?: string; style?: React.CSSProperties}> = ({sp, w, flip, f = 0, glow, style}) => {
  const s = SP[sp];
  const k = s.k;
  const y = (d: number) => 80 + d * k;
  const wag = Math.sin(f / 4) * 5; // coda che batte
  const id = 'tg' + sp;
  const body = `M10 ${y(2)} C40 ${y(-40)} 120 ${y(-52)} 200 ${y(-50)} C260 ${y(-48)} 300 ${y(-30)} 332 ${y(-8) + 0.3} L340 80 L332 ${y(8)} C300 ${y(30)} 260 ${y(46)} 200 ${y(47)} C120 ${y(48)} 40 ${y(38)} 10 ${y(2)} Z`;
  const fin2 = s.fin2;
  return (
    <div style={{position: 'relative', width: w, height: w * 0.45, display: 'inline-block', ...style}}>
    {glow && <div style={{position: 'absolute', left: '-6%', top: '0%', width: '112%', height: '100%', background: `radial-gradient(ellipse at 45% 50%, ${glow} 0%, rgba(0,0,0,0) 62%)`}} />}
    <svg width={w} height={w * 0.45} viewBox="0 -40 400 240" style={{position: 'relative', overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.top} />
          <stop offset="42%" stopColor="#2f5f9a" />
          <stop offset="55%" stopColor="#b8c7d8" />
          <stop offset="100%" stopColor="#f2f5f8" />
        </linearGradient>
      </defs>
      {/* coda a mezzaluna */}
      <g transform={`rotate(${wag} 338 80)`}>
        <path d="M334 80 L388 14 C380 46 374 64 370 80 C374 96 380 114 388 146 Z" fill={s.top} />
        <path d="M334 80 L346 74 L346 86 Z" fill={s.fin} />
      </g>
      {/* pinne dorsali e anale */}
      <path d={`M150 ${y(-48)} L184 ${y(-80)} L200 ${y(-49)} Z`} fill={s.top} />
      <path d={`M236 ${y(-42)} L262 ${y(-42) - fin2} L276 ${y(-36)} Z`} fill={s.fin} />
      <path d={`M236 ${y(40)} L262 ${y(40) + fin2} L276 ${y(34)} Z`} fill={s.fin} />
      {/* pinnule gialle */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <React.Fragment key={i}>
          <path d={`M${284 + i * 8} ${y(-30 + i * 4)} l5 -8 l3 9 Z`} fill="#ffd23a" />
          <path d={`M${284 + i * 8} ${y(30 - i * 4)} l5 8 l3 -9 Z`} fill="#ffd23a" />
        </React.Fragment>
      ))}
      <path d={body} fill={`url(#${id})`} />
      {/* fascia laterale */}
      <path d={`M70 ${y(-6)} C150 ${y(-14)} 250 ${y(-12)} 330 ${y(-2)}`} stroke={s.stripe} strokeWidth={7 * k} fill="none" strokeLinecap="round" />
      {/* opercolo */}
      <path d={`M86 ${y(-34)} C70 ${y(-10)} 72 ${y(14)} 88 ${y(32)}`} stroke="rgba(10,25,50,.45)" strokeWidth="3" fill="none" />
      {/* pinna pettorale */}
      <path d={`M104 ${y(0)} C150 ${y(-2)} 196 ${y(8)} ${sp === 'gialla' ? 236 : 222} ${y(18)} C190 ${y(16)} 150 ${y(14)} 104 ${y(10)} Z`} fill={s.top} opacity={0.9} />
      {/* occhio */}
      <circle cx={46} cy={y(-10)} r={s.eye + 3} fill="#e9eef5" />
      <circle cx={46} cy={y(-10)} r={s.eye} fill="#0a1222" />
      <circle cx={44} cy={y(-12)} r={s.eye * 0.3} fill="#fff" />
      {/* bocca */}
      <path d={`M12 ${y(4)} L30 ${y(6)}`} stroke="rgba(10,25,50,.6)" strokeWidth="2.5" />
    </svg>
    </div>
  );
};
