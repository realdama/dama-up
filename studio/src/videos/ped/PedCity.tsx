// ELITE CITY · il "ped": personaggio 3D low-poly che cammina in città (stile giochi anni 2000, tutto originale)
import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/monoton/400.css';
import '@fontsource/kaushan-script/400.css';
import '@fontsource/orbitron/900.css';

const FPS = 30;
export const PED_FRAMES = 45 * FPS;
const STOP = 35 * FPS;           // si ferma accanto all'auto
const SPEED = 1.45;              // m/s
const W = 1080, H = 1920;
const P = {night: '#12022B', purple: '#2A0A55', violet: '#5B1A9E', magenta: '#FF2E97', pink: '#FF77D9', cyan: '#2DE2E6', orange: '#FF9A3C', yellow: '#FFE45E'};
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ez = (f: number, a: number, b: number, x = 0, y = 1) => interpolate(f, [a, b], [x, y], {...cl, easing: Easing.inOut(Easing.cubic)});
const rnd = (s: number) => { const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

/* ───── texture: caricate tutte PRIMA di montare il canvas 3D ───── */
type Tex = {head: THREE.Texture; hair: THREE.Texture; neck: THREE.Texture; shirt: THREE.Texture};
const useAllTex = (): Tex | null => {
  const [t, setT] = useState<Tex | null>(null);
  const [h] = useState(() => delayRender('texture del personaggio'));
  useEffect(() => {
    const L = new THREE.TextureLoader();
    const load = (file: string, rep?: [number, number]) => new Promise<THREE.Texture>((res, rej) => L.load(staticFile(file), (x) => {
      x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 4;
      if (rep) { x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(...rep); }
      res(x);
    }, undefined, rej));
    Promise.all([load('ped/head.jpg'), load('ped/hair.jpg', [3, 2]), load('ped/neck.jpg'), load('ped/shirt.jpg', [2, 2])])
      .then(([head, hair, neck, shirt]) => setT({head, hair, neck, shirt}));
  }, []);
  useEffect(() => { if (t) continueRender(h); }, [t]);
  return t;
};
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
  return t;
};

/* ───── posizione del personaggio ───── */
const walkT = (f: number) => Math.min(f, STOP) / FPS;
export const pedPos = (f: number) => ({x: 8.3, z: -SPEED * walkT(f)});

/* ───── riccioli platino (posizioni fisse) ───── */
const CURLS = Array.from({length: 820}).map((_, i) => {
  const th = Math.acos(1 - rnd(i * 3 + 1) * 0.44);             // calotta ampia ma corta
  const ph = rnd(i * 3 + 2) * Math.PI * 2;
  const R = 0.1215;
  const p: [number, number, number] = [Math.cos(ph) * Math.sin(th) * R * 0.92, Math.cos(th) * R + 0.004, Math.sin(ph) * Math.sin(th) * R * 1.03];
  const c = ['#EDEBE6', '#DAD8D2', '#C7C5C0', '#F7F6F2', '#A9A6A2'][Math.floor(rnd(i * 7) * 5)];
  return {p, r: 0.0058 + rnd(i * 5) * 0.0036, c};
});

/* ───── il personaggio ───── */
const Ped: React.FC<{f: number; tex: Tex}> = ({f, tex}) => {
  const {head, hair, neck: neckT, shirt} = tex;
  const walking = f < STOP;
  const blend = walking ? 1 : Math.max(0, 1 - (f - STOP) / 12); // rallenta fino all'idle
  const ph = (f / FPS) * Math.PI * 2 * 0.95;                       // ~1.9 passi al secondo
  const sw = Math.sin(ph) * blend;
  const bob = Math.abs(Math.cos(ph)) * 0.035 * blend;
  const breathe = Math.sin(f / 20) * 0.006;
  const skin = '#C58A6C';
  const {x, z} = pedPos(f);
  const leg = (side: 1 | -1) => {
    const s = sw * side;
    const thigh = s * 0.55, knee = Math.max(0, -s) * 0.9 + 0.05 + (blend < 0.2 ? 0 : 0.08);
    return (
      <group position={[side * 0.11, 0.95, 0]} rotation={[thigh, 0, 0]}>
        <mesh position={[0, -0.23, 0]}><capsuleGeometry args={[0.085, 0.36, 4, 10]} /><meshStandardMaterial color="#F2EFE8" roughness={0.8} /></mesh>
        <group position={[0, -0.47, 0]} rotation={[knee, 0, 0]}>
          <mesh position={[0, -0.21, 0]}><capsuleGeometry args={[0.072, 0.34, 4, 10]} /><meshStandardMaterial color="#ECE8DF" roughness={0.8} /></mesh>
          <mesh position={[0, -0.45, -0.05]}><boxGeometry args={[0.12, 0.08, 0.27]} /><meshStandardMaterial color="#F8F8F8" roughness={0.5} /></mesh>
          <mesh position={[0, -0.485, -0.05]}><boxGeometry args={[0.125, 0.025, 0.28]} /><meshStandardMaterial color="#222" /></mesh>
        </group>
      </group>
    );
  };
  const arm = (side: 1 | -1, baton = false) => {
    const s = -sw * side;
    return (
      <group position={[side * 0.25, 1.47, 0]} rotation={[s * 0.5, 0, side * 0.08]}>
        <mesh position={[0, -0.12, 0]} scale={[1.15, 1, 1.1]}><capsuleGeometry args={[0.075, 0.12, 4, 10]} /><meshStandardMaterial map={shirt} roughness={0.9} /></mesh>
        <mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.055, 0.2, 4, 10]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        <group position={[0, -0.32, 0]} rotation={[-0.25 - Math.max(0, s) * 0.5, 0, 0]}>
          <mesh position={[0, -0.13, 0]}><capsuleGeometry args={[0.048, 0.22, 4, 10]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
          <mesh position={[0, -0.3, 0]}><sphereGeometry args={[0.055, 12, 10]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
          {baton && <group position={[0, -0.31, 0.02]} rotation={[1.3, 0, 0]}>
            <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.022, 0.022, 0.13, 10]} /><meshStandardMaterial color="#333" /></mesh>
            <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.018, 0.02, 0.45, 10]} /><meshStandardMaterial color="#111" metalness={0.4} roughness={0.4} /></mesh>
            <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 0.14, 8]} /><meshStandardMaterial color="#444" /></mesh>
          </group>}
        </group>
      </group>
    );
  };
  return (
    <group position={[x, bob, z]} rotation={[0, Math.PI, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.075 - bob, 0]}><circleGeometry args={[0.38, 24]} /><meshBasicMaterial color="#000" transparent opacity={0.35} /></mesh>
      {leg(1)}{leg(-1)}
      <group position={[0, 0, 0]} rotation={[0, sw * 0.08, 0]}>
        {/* bacino e cintura */}
        <mesh position={[0, 0.98, 0]} scale={[1.25, 0.7, 0.9]}><sphereGeometry args={[0.15, 14, 10]} /><meshStandardMaterial color="#F2EFE8" /></mesh>
        <mesh position={[0, 1.04, 0]}><cylinderGeometry args={[0.175, 0.17, 0.05, 16]} /><meshStandardMaterial color="#3A2416" /></mesh>
        {/* busto in camicia */}
        <mesh position={[0, 1.28 + breathe, 0]} scale={[1.18, 1, 0.8]}><capsuleGeometry args={[0.16, 0.3, 6, 16]} /><meshStandardMaterial map={shirt} roughness={0.85} /></mesh>
        {/* scollo aperto e collana */}
        <mesh position={[0, 1.44, 0.128]} rotation={[-0.25, 0, Math.PI]}><circleGeometry args={[0.07, 3]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, 1.44, 0.12]} rotation={[-0.2, 0, 0]}><torusGeometry args={[0.07, 0.006, 6, 20, Math.PI]} /><meshStandardMaterial color="#E8C547" metalness={0.9} roughness={0.25} /></mesh>
        {arm(1, true)}{arm(-1)}
        {/* collo con tatuaggio */}
        <mesh position={[0, 1.6, 0]} rotation={[0, Math.PI * 0.9, 0]}><cylinderGeometry args={[0.072, 0.08, 0.17, 18]} /><meshStandardMaterial map={neckT} roughness={0.7} /></mesh>
        {/* testa */}
        <group position={[0, 1.8, 0.01]} rotation={[-0.05 + Math.sin(f / 33) * 0.03, Math.sin(f / 47) * 0.12, 0]} scale={1.32}>
          <mesh scale={[0.86, 1.1, 0.98]}><sphereGeometry args={[0.12, 48, 36]} /><meshStandardMaterial map={head} roughness={0.75} /></mesh>
          {/* capelli platino a riccioli */}
          <mesh position={[0, 0.012, -0.004]} scale={[0.92, 1.0, 1.02]}><sphereGeometry args={[0.1225, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.3]} /><meshStandardMaterial map={hair} roughness={1} color="#D9D9E0" /></mesh>
          {CURLS.map((c, i) => (
            <mesh key={i} position={c.p}><sphereGeometry args={[c.r, 6, 4]} /><meshStandardMaterial color={c.c} roughness={0.95} /></mesh>
          ))}
          {/* orecchie e orecchino */}
          {[1, -1].map((s) => (
            <group key={s} position={[s * 0.104, -0.005, -0.005]}>
              <mesh scale={[0.35, 1, 0.75]}><sphereGeometry args={[0.035, 12, 10]} /><meshStandardMaterial color={skin} /></mesh>
              {s === -1 && <mesh position={[-0.009, -0.028, 0.006]}><sphereGeometry args={[0.0065, 10, 8]} /><meshStandardMaterial color="#F2F5FA" emissive="#9AA6B8" emissiveIntensity={0.4} metalness={0.3} roughness={0.2} /></mesh>}
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};

/* ───── il pastore tedesco ───── */
const Dog: React.FC<{f: number}> = ({f}) => {
  const walking = f < STOP;
  const blend = walking ? 1 : Math.max(0, 1 - (f - STOP) / 12);
  const ph = (f / FPS) * Math.PI * 2 * 1.9;
  const {x, z} = pedPos(f);
  const sit = 0;
  const tan = '#B9773E', black = '#1E1611';
  const leg = (lx: number, lz: number, o: number) => (
    <group position={[lx, 0.4, lz]} rotation={[Math.sin(ph + o) * 0.4 * blend + (lz > 0 ? sit * 1.2 : 0), 0, 0]}>
      <mesh position={[0, -0.17, 0]}><capsuleGeometry args={[0.055, 0.24, 4, 8]} /><meshStandardMaterial color={tan} /></mesh>
      <mesh position={[0, -0.34, -0.03]} scale={[1, 0.6, 1.3]}><sphereGeometry args={[0.05, 8, 6]} /><meshStandardMaterial color={tan} /></mesh>
    </group>
  );
  return (
    <group position={[x - 0.8, Math.abs(Math.sin(ph)) * 0.02 * blend - sit * 0.06 - 0.03, z + 0.1]} rotation={[0, Math.PI, 0]} scale={0.85}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}><circleGeometry args={[0.45, 24]} /><meshBasicMaterial color="#000" transparent opacity={0.3} /></mesh>
      <group rotation={[-sit * 0.45, 0, 0]} position={[0, sit * 0.05, 0]}>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.95]}><capsuleGeometry args={[0.16, 0.4, 6, 14]} /><meshStandardMaterial color={tan} roughness={0.9} /></mesh>
        <mesh position={[0, 0.56, 0.03]} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1, 0.8]}><capsuleGeometry args={[0.16, 0.3, 6, 14]} /><meshStandardMaterial color={black} roughness={0.9} /></mesh>
        {/* collo e testa */}
        <mesh position={[0, 0.66, -0.33]} rotation={[0.7, 0, 0]}><capsuleGeometry args={[0.1, 0.16, 6, 12]} /><meshStandardMaterial color={tan} /></mesh>
        <group position={[0, 0.82, -0.42]} rotation={[Math.sin(f / 15) * 0.05, Math.sin(f / 37) * 0.25, 0]}>
          <mesh scale={[0.95, 0.9, 1.1]}><sphereGeometry args={[0.11, 16, 12]} /><meshStandardMaterial color={tan} /></mesh>
          <mesh position={[0, -0.03, -0.14]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.065, 0.19, 12]} /><meshStandardMaterial color={black} /></mesh>
          <mesh position={[0, -0.01, -0.24]}><sphereGeometry args={[0.025, 8, 6]} /><meshStandardMaterial color="#050505" roughness={0.3} /></mesh>
          <mesh position={[0, 0.06, -0.03]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.09, 12, 8]} /><meshStandardMaterial color={black} /></mesh>
          {[1, -1].map((s) => <mesh key={s} position={[s * 0.06, 0.15, 0.01]} rotation={[0.15, 0, -s * 0.2]}><coneGeometry args={[0.04, 0.13, 4]} /><meshStandardMaterial color={black} /></mesh>)}
          {[1, -1].map((s) => <mesh key={s} position={[s * 0.045, 0.03, -0.09]}><sphereGeometry args={[0.012, 8, 6]} /><meshStandardMaterial color="#2B1A0A" roughness={0.2} /></mesh>)}
          <mesh position={[0, -0.07, -0.17]} rotation={[0.4, 0, 0]} scale={[1, 0.3, 1.4]} visible={walking}><sphereGeometry args={[0.03, 8, 6]} /><meshStandardMaterial color="#E07A8A" /></mesh>
        </group>
        {/* coda */}
        <mesh position={[0, 0.5, 0.42]} rotation={[-0.9 + Math.sin(f / 6) * 0.15, Math.sin(f / 5) * 0.3, 0]}><capsuleGeometry args={[0.035, 0.32, 4, 8]} /><meshStandardMaterial color={black} /></mesh>
      </group>
      {leg(0.09, -0.22, 0)}{leg(-0.09, -0.22, Math.PI)}{leg(0.09, 0.24, Math.PI)}{leg(-0.09, 0.24, 0)}
    </group>
  );
};

/* ───── città ───── */
const City: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(() => {
    const win = canvasTex(256, 512, (c) => {
      c.fillStyle = '#fff'; c.fillRect(0, 0, 256, 512);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 4; x++) {
        const on = rnd(x * 31 + y * 7) > 0.45;
        c.fillStyle = on ? (rnd(x + y * 3) > 0.5 ? '#FFE9A8' : '#FF9AD5') : '#3B2A5C';
        c.fillRect(18 + x * 60, 16 + y * 31, 38, 20);
      }
    }, [1, 1]);
    const road = canvasTex(256, 256, (c) => {
      c.fillStyle = '#2A1F3D'; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 600; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * 256, rnd(i + 2) * 256, 2, 2); }
    }, [6, 60]);
    const walk = canvasTex(256, 256, (c) => {
      c.fillStyle = '#C9B6C9'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#9C879F'; c.lineWidth = 4;
      for (let i = 0; i <= 256; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); }
    }, [2, 80]);
    const sky = canvasTex(16, 512, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 512);
      g.addColorStop(0, '#12022B'); g.addColorStop(0.35, '#3A0F6B'); g.addColorStop(0.62, '#B8306E'); g.addColorStop(0.8, '#FF7A45'); g.addColorStop(1, '#FFD36B');
      c.fillStyle = g; c.fillRect(0, 0, 16, 512);
    });
    const sun = canvasTex(512, 512, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#FFE45E'); g.addColorStop(0.6, '#FF9A3C'); g.addColorStop(1, '#FF2E97');
      c.fillStyle = g; c.beginPath(); c.arc(256, 256, 250, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 8; i++) c.fillRect(0, 290 + i * 26 + i * i, 512, 5 + i * 2.2);
    });
    return {win, road, walk, sky, sun};
  }, []);
  const facades = ['#7FD6C9', '#F7A8C8', '#B9A6F0', '#FFC9A3', '#A8E6F0', '#F0E6A8'];
  const neon = [P.magenta, P.cyan, P.pink, P.yellow];
  const blocks = useMemo(() => Array.from({length: 26}).map((_, i) => {
    const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
    return {side, z: 12 - k * 13 - rnd(i) * 3, w: 9 + rnd(i + 1) * 3, d: 10 + rnd(i + 2) * 2, h: 8 + rnd(i + 3) * 26, c: facades[i % 6], n: neon[i % 4]};
  }), []);
  return (
    <group>
      {/* cielo e sole */}
      <mesh position={[0, 60, -260]}><planeGeometry args={[900, 260]} /><meshBasicMaterial map={tex.sky} fog={false} /></mesh>
      <mesh position={[0, 26, -255]}><planeGeometry args={[90, 90]} /><meshBasicMaterial map={tex.sun} transparent fog={false} /></mesh>
      {/* strada, marciapiedi, linee */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -100]}><planeGeometry args={[12, 260]} /><meshStandardMaterial map={tex.road} roughness={0.6} metalness={0.2} /></mesh>
      {[1, -1].map((s) => <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * 8.5, 0.06, -100]}><planeGeometry args={[5, 260]} /><meshStandardMaterial map={tex.walk} roughness={0.9} /></mesh>)}
      {[1, -1].map((s) => <mesh key={s} position={[s * 6.05, 0.05, -100]}><boxGeometry args={[0.15, 0.12, 260]} /><meshStandardMaterial color="#E9DDE9" /></mesh>)}
      {Array.from({length: 45}).map((_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 15 - i * 6]}><planeGeometry args={[0.18, 3]} /><meshBasicMaterial color={P.yellow} /></mesh>)}
      {/* palazzi art déco */}
      {blocks.map((b, i) => (
        <group key={i} position={[b.side * (11 + b.w / 2), 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}><boxGeometry args={[b.w, b.h, b.d]} /><meshStandardMaterial color={b.c} roughness={0.85} /></mesh>
          <mesh position={[-b.side * (b.w / 2 + 0.01), b.h / 2, 0]} rotation={[0, -b.side * Math.PI / 2, 0]}>
            <planeGeometry args={[b.d * 0.92, b.h * 0.92]} />
            <meshStandardMaterial map={tex.win} color="#ffffff" emissive="#ffffff" emissiveMap={tex.win} emissiveIntensity={0.55} transparent opacity={0.92} />
          </mesh>
          <mesh position={[-b.side * (b.w / 2 + 0.05), b.h - 0.4, 0]}><boxGeometry args={[0.08, 0.12, b.d]} /><meshBasicMaterial color={b.n} /></mesh>
          <mesh position={[-b.side * (b.w / 2 + 0.05), 3.2, 0]}><boxGeometry args={[0.08, 0.1, b.d]} /><meshBasicMaterial color={b.n} /></mesh>
          {i % 3 === 0 && <mesh position={[-b.side * (b.w / 2 + 0.3), 5.5, 0]} rotation={[0, -b.side * Math.PI / 2, 0]}><planeGeometry args={[3.5, 1.1]} /><meshBasicMaterial color={b.n} /></mesh>}
        </group>
      ))}
      {/* palme e lampioni */}
      {Array.from({length: 24}).map((_, i) => {
        const s = i % 2 ? 1 : -1, z = 8 - Math.floor(i / 2) * 11, sway = Math.sin(f / 25 + i) * 0.05;
        return (
          <group key={i} position={[s * 6.5, 0, z]}>
            {Array.from({length: 7}).map((_, k) => (
              <mesh key={k} position={[s * k * 0.05, 0.6 + k * 1.15, 0]} rotation={[0, 0, -s * 0.05]}><cylinderGeometry args={[0.16 - k * 0.012, 0.2 - k * 0.012, 1.15, 8]} /><meshStandardMaterial color="#6B4A35" roughness={1} /></mesh>
            ))}
            <group position={[s * 0.35, 8.4, 0]} rotation={[0, 0, sway]}>
              {Array.from({length: 8}).map((_, k) => (
                <mesh key={k} rotation={[0, (k / 8) * Math.PI * 2, -0.55]} position={[0, 0, 0]}>
                  <boxGeometry args={[3.2, 0.04, 0.55]} /><meshStandardMaterial color="#1E6B4A" roughness={0.9} />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}
      {Array.from({length: 14}).map((_, i) => {
        const s = i % 2 ? 1 : -1, z = 2.5 - Math.floor(i / 2) * 22;
        return (
          <group key={i} position={[s * 6.3, 0, z]}>
            <mesh position={[0, 2.5, 0]}><cylinderGeometry args={[0.05, 0.07, 5, 8]} /><meshStandardMaterial color="#333" /></mesh>
            <mesh position={[-s * 0.5, 4.95, 0]}><boxGeometry args={[1.1, 0.08, 0.12]} /><meshStandardMaterial color="#333" /></mesh>
            <mesh position={[-s * 0.95, 4.85, 0]}><sphereGeometry args={[0.14, 10, 8]} /><meshBasicMaterial color={P.pink} /></mesh>
            <pointLight position={[-s * 0.95, 4.6, 0]} color={P.pink} intensity={6} distance={9} />
          </group>
        );
      })}
      {/* supercar rossa parcheggiata */}
      <group position={[5.0, 0, -SPEED * STOP / FPS - 2.2]} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.45, 0]}><boxGeometry args={[1.9, 0.5, 4.4]} /><meshStandardMaterial color="#E8132B" metalness={0.5} roughness={0.25} /></mesh>
        <mesh position={[0, 0.84, 0.25]} scale={[1, 1, 1]}><boxGeometry args={[1.5, 0.36, 1.8]} /><meshStandardMaterial color="#1A0A1E" metalness={0.6} roughness={0.15} /></mesh>
        <mesh position={[0, 0.66, -1.5]} rotation={[0.18, 0, 0]}><boxGeometry args={[1.88, 0.08, 1.3]} /><meshStandardMaterial color="#E8132B" metalness={0.5} roughness={0.25} /></mesh>
        {[-0.96, 0.96].map((sx) => [0, 1, 2, 3, 4].map((k) => <mesh key={`${sx}${k}`} position={[sx, 0.45 + k * 0.07 - 0.12, 0.9]}><boxGeometry args={[0.02, 0.03, 1.4]} /><meshStandardMaterial color="#7A0A18" /></mesh>))}
        {[[-0.85, -1.4], [0.85, -1.4], [-0.85, 1.45], [0.85, 1.45]].map(([wx, wz], k) => (
          <mesh key={k} position={[wx, 0.32, wz]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.33, 0.33, 0.25, 18]} /><meshStandardMaterial color="#111" /></mesh>
        ))}
        <mesh position={[0, 0.55, -2.21]}><boxGeometry args={[1.5, 0.08, 0.02]} /><meshBasicMaterial color="#FFF6C9" /></mesh>
        <mesh position={[0, 0.5, 2.21]}><boxGeometry args={[1.6, 0.12, 0.02]} /><meshBasicMaterial color="#FF2244" /></mesh>
      </group>
    </group>
  );
};

/* ───── regia: inquadrature ───── */
const CameraRig: React.FC<{f: number}> = ({f}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const {x, z} = pedPos(f);
  useLayoutEffect(() => {
    let pos: [number, number, number], look: [number, number, number], fov = 40;
    if (f < 150) {               // A: frontale, lui cammina verso di noi
      const d = 3.6 - ez(f, 0, 150) * 0.6;
      pos = [x + 0.7, 1.65, z - d]; look = [x - 0.1, 1.45, z]; fov = 38;
    } else if (f < 600) {        // B: terza persona da dietro
      const k = ez(f, 150, 190);
      pos = [x + 0.9 * k - 0.9 * (1 - k), 2.5, z + 4.6 * k - 3 * (1 - k)]; look = [x - 0.3, 1.35, z - 4]; fov = 50;
    } else if (f < 850) {        // C: laterale
      pos = [x - 4.6, 1.35, z + 0.4]; look = [x - 0.4, 1.0, z]; fov = 40;
    } else if (f < STOP) {       // D: dal basso, davanti
      pos = [x + 0.6, 0.45, z - 2.6]; look = [x - 0.2, 1.55, z]; fov = 46;
    } else {                     // E: giro finale e gru verso il tramonto
      const t = (f - STOP) / (PED_FRAMES - STOP);
      const a = Math.PI * 0.15 + t * Math.PI * 0.9;
      const r = 3.4 + t * 3, y = 1.6 + t * 4.5;
      const a2 = -Math.PI * 0.1 + t * Math.PI * 1.1, r2 = 3.2 + t * 2.4, y2 = 1.5 + t * 2.2;
      pos = [x - Math.sin(a2) * r2, y2, z - Math.cos(a2) * r2]; look = [x - 0.3, 1.25 + t * 0.6, z]; fov = 42;
    }
    camera.position.set(...pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(...look);
  }, [f]);
  return null;
};

const Scene3D: React.FC = () => {
  const f = useCurrentFrame();
  const tex = useAllTex();
  if (!tex) return null;
  return (
    <ThreeCanvas width={W} height={H} camera={{fov: 45, near: 0.05, far: 600, position: [0, 2, 5]}} gl={{antialias: true}}>
      <color attach="background" args={['#2A0A55']} />
      <fog attach="fog" args={['#7A2A7A', 25, 190]} />
      <hemisphereLight args={['#B98CFF', '#FF8A5C', 0.9]} />
      <directionalLight position={[-6, 9, -30]} intensity={1.6} color="#FFB37A" />
      <directionalLight position={[8, 6, 10]} intensity={0.6} color="#9C7CFF" />
      <ambientLight intensity={0.25} color="#FF77D9" />
      <CameraRig f={f} />
      <City f={f} />
      <Ped f={f} tex={tex} />
      <Dog f={f} />
    </ThreeCanvas>
  );
};

/* ───── interfaccia 2D (originale) ───── */
const Neon: React.FC<{t: string; size: number; c: string; font?: string; o?: number; rot?: number}> = ({t, size, c, font = 'Monoton, sans-serif', o = 1, rot = 0}) => (
  <div style={{fontFamily: font, fontSize: size, color: '#fff', opacity: o, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap', lineHeight: 1,
    textShadow: `0 0 6px ${c}, 0 0 18px ${c}, 0 0 44px ${c}, 0 5px 0 ${c}`}}>{t}</div>
);
const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const o = ez(f, 160, 190) * (1 - ez(f, STOP + 60, STOP + 80));
  const end = ez(f, STOP + 70, STOP + 100);
  const money = 9999999 - (f < STOP ? Math.round((1 - Math.min(1, f / 600)) * 999) : 0);
  const {z} = pedPos(f);
  return (
    <AbsoluteFill>
      <div style={{opacity: o}}>
        <div style={{position: 'absolute', right: 40, top: 70, display: 'flex', gap: 22, alignItems: 'center'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontFamily: 'Orbitron', fontWeight: 900, fontSize: 30, color: P.cyan, textShadow: `0 0 10px ${P.cyan}`}}>MANGANELLO</div>
            <div style={{width: 210, height: 18, border: '3px solid #fff', background: P.magenta, marginTop: 10, boxShadow: `0 0 12px ${P.magenta}`}} />
            <div style={{width: 210, height: 18, border: '3px solid #fff', background: `linear-gradient(90deg, ${P.cyan} 80%, transparent 80%)`, marginTop: 8}} />
            <div style={{fontFamily: 'Orbitron', fontWeight: 900, fontSize: 64, color: '#7CFF8A', marginTop: 10, textShadow: '0 0 14px #2BFF5A, 4px 4px 0 #000'}}>${money}</div>
          </div>
          <div style={{width: 160, height: 160, borderRadius: 80, border: '6px solid #fff', background: `radial-gradient(${P.violet}, ${P.night})`, boxShadow: `0 0 26px ${P.pink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={110} height={110} viewBox="-55 -55 110 110"><g transform="rotate(-40)"><rect x={-8} y={-50} width={16} height={92} rx={7} fill="#111" stroke={P.cyan} strokeWidth={3} /><rect x={-11} y={8} width={22} height={32} rx={5} fill="#333" /></g></svg>
          </div>
        </div>
        {/* minimappa originale */}
        <div style={{position: 'absolute', left: 50, bottom: 90, width: 260, height: 260, borderRadius: 130, overflow: 'hidden', border: '6px solid #fff', boxShadow: `0 0 24px ${P.cyan}`, background: '#1B0B33'}}>
          <svg width={260} height={260} viewBox="-130 -130 260 260">
            <g transform={`translate(0 ${(z * 6) % 120})`}>
              {[-240, -120, 0, 120, 240].map((y) => <rect key={y} x={-140} y={y - 6} width={280} height={12} fill="#3A2A5C" />)}
              <rect x={-12} y={-400} width={24} height={800} fill="#5B4A80" />
              <rect x={40} y={-400} width={10} height={800} fill={P.pink} opacity={0.5} />
            </g>
            <path d="M 0 -18 L 12 14 L 0 6 L -12 14 Z" fill={P.yellow} stroke="#000" strokeWidth={2} />
            <circle cx={-14} cy={6} r={5} fill="#B9773E" stroke="#000" />
          </svg>
        </div>
      </div>
      {/* titoli */}
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', opacity: ez(f, 15, 35) * (1 - ez(f, 130, 155))}}>
        <Neon t="ELITE" size={150} c={P.magenta} />
        <div style={{marginTop: 6, marginLeft: 380}}><Neon t="City" size={120} c={P.cyan} font={'"Kaushan Script", cursive'} rot={-7} /></div>
      </div>
      <div style={{position: 'absolute', bottom: 170, width: '100%', textAlign: 'center', opacity: ez(f, 620, 640) * (1 - ez(f, 820, 845))}}>
        <Neon t="Ocean Drive" size={110} c={P.pink} font={'"Kaushan Script", cursive'} rot={-5} />
      </div>
      <div style={{position: 'absolute', top: 240, width: '100%', textAlign: 'center', opacity: end}}>
        <Neon t="MISSIONE" size={96} c={P.yellow} font="Orbitron" />
        <div style={{marginTop: 14}}><Neon t="COMPIUTA" size={96} c={P.yellow} font="Orbitron" /></div>
        <div style={{fontFamily: 'Orbitron', fontWeight: 900, fontSize: 70, color: '#7CFF8A', marginTop: 30, textShadow: '0 0 20px #2BFF5A, 4px 4px 0 #000'}}>$9999999</div>
      </div>
      {/* VHS */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 2px, transparent 2px, transparent 5px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 50%, transparent 58%, rgba(10,0,25,0.7) 100%)'}} />
      <AbsoluteFill style={{background: '#fff', opacity: [150, 600, 850, STOP].some((c) => f >= c && f < c + 5) ? 0.35 : 0}} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 12, PED_FRAMES - 40, PED_FRAMES], [1, 0, 0, 1], cl)}} />
    </AbsoluteFill>
  );
};

export const PedCity: React.FC = () => (
  <AbsoluteFill style={{background: '#12022B'}}>
    <Scene3D />
    <Hud />
    <Audio src={staticFile('elite/music.wav')} volume={(f) => interpolate(f, [0, 20, PED_FRAMES - 60, PED_FRAMES], [0, 1, 1, 0], cl)} />
    <Sequence from={STOP + 75} durationInFrames={30}><Audio src={staticFile('elite/cash.wav')} volume={0.5} /></Sequence>
    <Sequence from={600} durationInFrames={110}><Audio src={staticFile('elite/engine.wav')} volume={0.12} /></Sequence>
  </AbsoluteFill>
);
