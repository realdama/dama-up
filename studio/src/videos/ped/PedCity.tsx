// ELITE CITY · il "ped" v2: cammina in città con il cane, poi sale sulla supercar e gira per il lungomare
// Tutto originale (personaggio, città, interfaccia, musica): omaggio di genere ai giochi anni 2000.
import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/kaushan-script/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/monoton/400.css';

const FPS = 30;
export const PED_FRAMES = 1790;
const STOP = 930;                // arriva accanto all'auto
const DRIVE = 1020;              // stacco: è in macchina
const END = 1740;                // titoli finali
const SPEED = 1.45;              // camminata m/s
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
const Ped: React.FC<{f: number; tex: Tex; pos?: [number, number, number]; rotY?: number; seated?: boolean; npc?: string}> = ({f, tex, pos, rotY = Math.PI, seated = false, npc}) => {
  const {head, hair, neck: neckT, shirt} = tex;
  const walking = !seated && f < STOP;
  const blend = walking ? 1 : Math.max(0, 1 - (f - STOP) / 12); // rallenta fino all'idle
  const ph = (f / FPS) * Math.PI * 2 * 0.95;                       // ~1.9 passi al secondo
  const sw = Math.sin(ph) * blend;
  const bob = Math.abs(Math.cos(ph)) * 0.035 * blend;
  const breathe = Math.sin(f / 20) * 0.006;
  const skin = '#C58A6C';
  const {x, z} = pos ? {x: pos[0], z: pos[2]} : pedPos(f);
  const leg = (side: 1 | -1) => {
    const s = sw * side;
    const thigh = seated ? -1.45 : s * 0.55, knee = seated ? -1.4 : Math.max(0, -s) * 0.9 + 0.05 + (blend < 0.2 ? 0 : 0.08);
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
        <mesh position={[0, -0.12, 0]} scale={[1.15, 1, 1.1]}><capsuleGeometry args={[0.075, 0.12, 4, 10]} /><meshStandardMaterial map={npc ? null : shirt} color={npc ?? '#ffffff'} roughness={0.9} /></mesh>
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
    <group position={[x, (pos ? pos[1] : 0) + bob, z]} rotation={[0, rotY, 0]}>
      {!seated && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.075 - bob, 0]}><circleGeometry args={[0.38, 24]} /><meshBasicMaterial color="#000" transparent opacity={0.35} /></mesh>}
      {leg(1)}{leg(-1)}
      <group position={[0, 0, 0]} rotation={[0, sw * 0.08, 0]}>
        {/* bacino e cintura */}
        <mesh position={[0, 0.98, 0]} scale={[1.25, 0.7, 0.9]}><sphereGeometry args={[0.15, 14, 10]} /><meshStandardMaterial color="#F2EFE8" /></mesh>
        <mesh position={[0, 1.04, 0]}><cylinderGeometry args={[0.175, 0.17, 0.05, 16]} /><meshStandardMaterial color="#3A2416" /></mesh>
        {/* busto in camicia */}
        <mesh position={[0, 1.28 + breathe, 0]} scale={[1.18, 1, 0.8]}><capsuleGeometry args={[0.16, 0.3, 6, 16]} /><meshStandardMaterial map={npc ? null : shirt} color={npc ?? '#ffffff'} roughness={0.85} /></mesh>
        {/* scollo aperto e collana */}
        <mesh position={[0, 1.44, 0.128]} rotation={[-0.25, 0, Math.PI]}><circleGeometry args={[0.07, 3]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, 1.44, 0.12]} rotation={[-0.2, 0, 0]}><torusGeometry args={[0.07, 0.006, 6, 20, Math.PI]} /><meshStandardMaterial color="#E8C547" metalness={0.9} roughness={0.25} /></mesh>
        {arm(1, true)}{arm(-1)}
        {/* collo con tatuaggio */}
        <mesh position={[0, 1.6, 0]} rotation={[0, Math.PI * 0.9, 0]}><cylinderGeometry args={[0.072, 0.08, 0.17, 18]} /><meshStandardMaterial map={npc ? null : neckT} color={npc ? '#C68E6A' : '#ffffff'} roughness={0.7} /></mesh>
        {/* testa */}
        <group position={[0, 1.8, 0.01]} rotation={[-0.05 + Math.sin(f / 33) * 0.03, Math.sin(f / 47) * 0.12, 0]} scale={1.32}>
          <mesh scale={[0.86, 1.1, 0.98]}><sphereGeometry args={[0.12, npc ? 16 : 48, npc ? 12 : 36]} /><meshStandardMaterial map={npc ? null : head} color={npc ? '#C68E6A' : '#ffffff'} roughness={0.75} /></mesh>
          {npc ? <mesh position={[0, 0.02, 0]} scale={[0.92, 1, 1.02]}><sphereGeometry args={[0.125, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42]} /><meshStandardMaterial color="#2A1C14" /></mesh> : <>
          {/* capelli platino a riccioli */}
          <mesh position={[0, 0.012, -0.004]} scale={[0.92, 1.0, 1.02]}><sphereGeometry args={[0.1225, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.3]} /><meshStandardMaterial map={hair} roughness={1} color="#D9D9E0" /></mesh>
          {CURLS.map((c, i) => (
            <mesh key={i} position={c.p}><sphereGeometry args={[c.r, 6, 4]} /><meshStandardMaterial color={c.c} roughness={0.95} /></mesh>
          ))}
          </>}
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
const Dog: React.FC<{f: number; pos?: [number, number, number]; still?: boolean}> = ({f, pos, still}) => {
  const walking = !still && f < STOP;
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
    <group position={pos ?? [x - 0.8, Math.abs(Math.sin(ph)) * 0.02 * blend - sit * 0.06 - 0.03, z + 0.1]} rotation={[0, Math.PI, 0]} scale={0.85}>
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

/* ───── auto: posizione e guida ───── */
const CAR0 = {x: 4.6, z: -SPEED * STOP / FPS - 2.6};
const carDist = (f: number) => {
  const t = Math.max(0, f - DRIVE) / FPS;
  return t < 4 ? 0.5 * 3.75 * t * t : 30 + 15 * (t - 4);
};
const carPos = (f: number) => ({x: CAR0.x - Math.min(1, Math.max(0, (f - DRIVE) / 90)) * 1.4, z: CAR0.z - carDist(f)});
const focusZ = (f: number) => (f < DRIVE ? pedPos(f).z : carPos(f).z);

/* ───── supercar rossa scoperta (stile anni '80, senza marchi) ───── */
const SuperCar: React.FC<{f: number; color?: string; driving?: boolean; tex?: Tex}> = ({f, color = '#D8102A', driving, tex}) => {
  const {x, z} = carPos(f);
  const spin = driving ? carDist(f) / 0.33 : 0;
  const red = <meshStandardMaterial color={color} metalness={0.55} roughness={0.28} />;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.48, 0.1]}><boxGeometry args={[1.98, 0.5, 4.3]} />{red}</mesh>
      <mesh position={[0, 0.42, -2.2]} rotation={[0.22, 0, 0]}><boxGeometry args={[1.9, 0.32, 0.6]} />{red}</mesh>
      <mesh position={[0, 0.72, -1.35]} rotation={[0.12, 0, 0]}><boxGeometry args={[1.9, 0.06, 1.5]} />{red}</mesh>
      <mesh position={[0, 0.76, 1.35]}><boxGeometry args={[1.96, 0.1, 1.6]} />{red}</mesh>
      {/* abitacolo scoperto */}
      <mesh position={[0, 0.7, -0.05]}><boxGeometry args={[1.6, 0.12, 1.5]} /><meshStandardMaterial color="#1A1014" /></mesh>
      {[-0.4, 0.4].map((sx) => <mesh key={sx} position={[sx, 0.95, 0.45]}><boxGeometry args={[0.55, 0.55, 0.15]} /><meshStandardMaterial color="#2B1A12" roughness={0.6} /></mesh>)}
      <mesh position={[0, 1.02, -0.62]} rotation={[-0.55, 0, 0]}><boxGeometry args={[1.7, 0.5, 0.04]} /><meshStandardMaterial color="#9FC3E8" transparent opacity={0.35} metalness={0.8} roughness={0.05} /></mesh>
      <mesh position={[-0.4, 0.95, -0.55]} rotation={[-1.1, 0, 0]}><torusGeometry args={[0.17, 0.025, 6, 18]} /><meshStandardMaterial color="#111" /></mesh>
      {/* prese d'aria laterali */}
      {[-1.0, 1.0].map((sx) => [0, 1, 2, 3, 4].map((k) => <mesh key={`${sx}${k}`} position={[sx, 0.35 + k * 0.08, 0.9]}><boxGeometry args={[0.03, 0.035, 1.5]} /><meshStandardMaterial color="#6E0A16" /></mesh>))}
      {/* posteriore: griglia nera e luci */}
      <mesh position={[0, 0.52, 2.27]}><boxGeometry args={[1.9, 0.26, 0.04]} /><meshStandardMaterial color="#0A0A0A" /></mesh>
      <mesh position={[0, 0.52, 2.29]}><boxGeometry args={[1.7, 0.08, 0.02]} /><meshBasicMaterial color="#FF2244" /></mesh>
      <mesh position={[0, 0.5, -2.48]}><boxGeometry args={[1.5, 0.05, 0.02]} /><meshBasicMaterial color="#FFF3C4" /></mesh>
      {[[-0.88, -1.45], [0.88, -1.45], [-0.9, 1.5], [0.9, 1.5]].map(([wx, wz], k) => (
        <group key={k} position={[wx, 0.33, wz]} rotation={[spin, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.33, 0.33, 0.27, 20]} /><meshStandardMaterial color="#111" roughness={0.9} /></mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[wx > 0 ? 0.14 : -0.14, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.02, 5]} /><meshStandardMaterial color="#C8C8D0" metalness={0.8} roughness={0.3} /></mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[2.3, 4.9]} /><meshBasicMaterial color="#000" transparent opacity={0.35} /></mesh>
    </group>
  );
};

/* ───── texture della città ───── */
const useCityTex = () => useMemo(() => {
  const asphalt = canvasTex(256, 256, (c) => {
    c.fillStyle = '#4B4752'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) { const g = 60 + rnd(i) * 70; c.fillStyle = `rgba(${g},${g},${g + 8},0.35)`; c.fillRect(rnd(i + 1) * 256, rnd(i + 2) * 256, 2, 2); }
    for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(20,18,24,0.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(rnd(i * 9) * 256, 0); c.lineTo(rnd(i * 9 + 1) * 256, 256); c.stroke(); }
  }, [3, 120]);
  const concrete = canvasTex(256, 256, (c) => {
    c.fillStyle = '#BDB5B9'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(90,80,90,${rnd(i) * 0.12})`; c.fillRect(rnd(i + 1) * 256, rnd(i + 2) * 256, 2, 2); }
    c.strokeStyle = '#8F858C'; c.lineWidth = 3; for (let i = 0; i <= 256; i += 128) { c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); }
  }, [2, 110]);
  const grass = canvasTex(128, 128, (c) => {
    c.fillStyle = '#4F7A3A'; c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 1500; i++) { c.fillStyle = rnd(i) > 0.5 ? '#5F8F45' : '#3E6630'; c.fillRect(rnd(i + 1) * 128, rnd(i + 2) * 128, 2, 3); }
  }, [1, 160]);
  const leaf = canvasTex(256, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, '#2E5A2A'); g.addColorStop(1, '#6E9A3E');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 32);
    for (let x = 0; x <= 256; x += 8) c.lineTo(x, 32 - (1 - x / 256) * 6 - Math.sin(x / 256 * Math.PI) * 24 * (x % 16 ? 1 : 0.55));
    for (let x = 256; x >= 0; x -= 8) c.lineTo(x, 32 + (1 - x / 256) * 6 + Math.sin(x / 256 * Math.PI) * 24 * (x % 16 ? 1 : 0.55));
    c.fill(); c.strokeStyle = '#2A4A20'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 32); c.lineTo(256, 32); c.stroke();
  });
  const sky = canvasTex(16, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#2B2440'); g.addColorStop(0.45, '#5A4766'); g.addColorStop(0.72, '#9B6A7A'); g.addColorStop(0.88, '#E0957A'); g.addColorStop(1, '#F6C08A');
    c.fillStyle = g; c.fillRect(0, 0, 16, 512);
  });
  const win = canvasTex(256, 512, (c) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 512);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 4; x++) { c.fillStyle = rnd(x * 31 + y * 7) > 0.5 ? '#FFE3A8' : '#3C3A4C'; c.fillRect(18 + x * 60, 16 + y * 31, 38, 20); }
  });
  const signs = ['ELITE BAR', 'BARBIERE', 'PESCHERIA', 'DINER 24H', 'GELATERIA', 'MOTEL', 'PIZZA', 'BOUTIQUE', 'TATTOO', 'CAFFÈ', 'NIGHT CLUB', 'HOTEL'].map((t, i) => canvasTex(512, 128, (c) => {
    const bg = ['#FDF6E8', '#1C1430', '#FDF6E8', '#2A0A55', '#FFFFFF', '#1C1430'][i % 6];
    const fg = [P.magenta, P.cyan, '#1A6E9E', P.pink, '#D62F6A', P.yellow][i % 6];
    c.fillStyle = bg; c.fillRect(0, 0, 512, 128); c.strokeStyle = fg; c.lineWidth = 8; c.strokeRect(6, 6, 500, 116);
    c.fillStyle = fg; c.font = 'bold 64px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, 256, 68);
  }));
  const awnings = ['#E2457A', '#2AA7A0', '#F2A93B', '#7B5FD0'].map((col) => canvasTex(128, 64, (c) => {
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#FFFFFF' : col; c.fillRect(i * 16, 0, 16, 64); }
  }));
  return {asphalt, concrete, grass, leaf, sky, win, signs, awnings};
}, []);

/* ───── palma realistica ───── */
const Palm: React.FC<{x: number; z: number; h: number; seed: number; leaf: THREE.Texture; f: number}> = ({x, z, h, seed, leaf, f}) => {
  const lean = (rnd(seed) - 0.5) * 0.5;
  const segs = 9, top: [number, number] = [Math.sin(lean) * h * 0.5, h];
  return (
    <group position={[x, 0, z]}>
      {Array.from({length: segs}).map((_, k) => {
        const t = k / segs, yy = t * h + h / segs / 2;
        return <mesh key={k} position={[Math.sin(lean) * h * 0.5 * t * t, yy, 0]} rotation={[0, 0, -lean * t]}><cylinderGeometry args={[0.15 - t * 0.04, 0.17 - t * 0.04, h / segs + 0.02, 8]} /><meshStandardMaterial color={k % 2 ? '#7A5C44' : '#6B4F3A'} roughness={1} /></mesh>;
      })}
      <group position={[top[0], top[1], 0]} rotation={[0, seed, Math.sin(f / 30 + seed) * 0.03]}>
        {Array.from({length: 12}).map((_, k) => (
          <group key={k} rotation={[0, (k / 12) * Math.PI * 2, 0]}>
            <mesh position={[0.9, 0.12, 0]} rotation={[Math.PI / 2, 0, 0.25 - (k % 3) * 0.12]}><planeGeometry args={[1.9, 0.55]} /><meshStandardMaterial map={leaf} transparent alphaTest={0.3} side={THREE.DoubleSide} roughness={0.9} /></mesh>
            <mesh position={[2.4, -0.45, 0]} rotation={[Math.PI / 2, 0, -0.6 - (k % 3) * 0.15]}><planeGeometry args={[1.5, 0.45]} /><meshStandardMaterial map={leaf} transparent alphaTest={0.3} side={THREE.DoubleSide} roughness={0.9} /></mesh>
          </group>
        ))}
        <mesh><sphereGeometry args={[0.28, 8, 6]} /><meshStandardMaterial color="#5A4A2E" /></mesh>
      </group>
    </group>
  );
};

/* ───── auto del traffico ───── */
const CarBox: React.FC<{x: number; z: number; rotY: number; color: string; lights?: boolean}> = ({x, z, rotY, color, lights}) => (
  <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.55, 0]}><boxGeometry args={[1.85, 0.6, 4.4]} /><meshStandardMaterial color={color} metalness={0.4} roughness={0.35} /></mesh>
    <mesh position={[0, 1.08, 0.25]}><boxGeometry args={[1.6, 0.5, 2.2]} /><meshStandardMaterial color="#20222C" metalness={0.6} roughness={0.15} /></mesh>
    {[[-0.85, -1.4], [0.85, -1.4], [-0.85, 1.4], [0.85, 1.4]].map(([wx, wz], k) => <mesh key={k} position={[wx, 0.3, wz]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.24, 12]} /><meshStandardMaterial color="#111" /></mesh>)}
    {lights && <><mesh position={[0.6, 0.6, -2.21]}><boxGeometry args={[0.3, 0.14, 0.02]} /><meshBasicMaterial color="#FFF6D0" /></mesh><mesh position={[-0.6, 0.6, -2.21]}><boxGeometry args={[0.3, 0.14, 0.02]} /><meshBasicMaterial color="#FFF6D0" /></mesh></>}
    <mesh position={[0, 0.6, 2.21]}><boxGeometry args={[1.6, 0.1, 0.02]} /><meshBasicMaterial color="#C0182E" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[2.2, 4.8]} /><meshBasicMaterial color="#000" transparent opacity={0.3} /></mesh>
  </group>
);

/* ───── la città (si costruisce solo vicino alla camera) ───── */
const City: React.FC<{f: number; tex: Tex}> = ({f, tex}) => {
  const T = useCityTex();
  const fz = focusZ(f);
  const near = (z: number) => z < fz + 40 && z > fz - 190;
  const facade = ['#E8C9A8', '#B8D8D0', '#E6B8C4', '#D8D0E8', '#F0E2B0', '#C9E0E8'];
  const shops = useMemo(() => {
    const out: {side: number; z: number; len: number; h: number; c: string; sign: number; aw: number; tall: boolean}[] = [];
    for (const side of [1, -1]) { let z = 30; let i = 0; while (z > -460) { const len = 10 + rnd(i * 13 + side) * 6; out.push({side, z: z - len / 2, len, h: 4.5 + rnd(i * 7 + side) * 3, c: facade[(i + (side > 0 ? 0 : 3)) % 6], sign: (i * 5 + (side > 0 ? 0 : 7)) % 12, aw: i % 4, tall: rnd(i * 3 + side * 5) > 0.72}); z -= len + 0.6; i++; } }
    return out;
  }, []);
  const palms = useMemo(() => Array.from({length: 110}).map((_, i) => ({side: i % 2 ? 1 : -1, z: 22 - Math.floor(i / 2) * 9 - rnd(i) * 2, h: 7 + rnd(i + 3) * 4, seed: i})), []);
  const time = f / FPS;
  return (
    <group>
      <mesh position={[0, 70, fz - 330]}><planeGeometry args={[1400, 300]} /><meshBasicMaterial map={T.sky} fog={false} /></mesh>
      <mesh position={[0, 8, fz - 320]}><circleGeometry args={[40, 32]} /><meshBasicMaterial color="#FFD9A0" transparent opacity={0.55} fog={false} /></mesh>
      {/* strada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -200]}><planeGeometry args={[12, 520]} /><meshStandardMaterial map={T.asphalt} roughness={0.85} /></mesh>
      {[-0.13, 0.13].map((lx) => <mesh key={lx} rotation={[-Math.PI / 2, 0, 0]} position={[lx, 0.015, -200]}><planeGeometry args={[0.12, 520]} /><meshBasicMaterial color="#E8C230" /></mesh>)}
      {Array.from({length: 90}).map((_, i) => [-3, 3].map((lx) => { const z = 25 - i * 6; return near(z) ? <mesh key={`${i}${lx}`} rotation={[-Math.PI / 2, 0, 0]} position={[lx, 0.015, z]}><planeGeometry args={[0.12, 2.6]} /><meshBasicMaterial color="#E9E6EE" /></mesh> : null; }))}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[s * 6.05, 0.08, -200]}><boxGeometry args={[0.18, 0.16, 520]} /><meshStandardMaterial color="#D9D2D6" /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[s * 6.75, 0.13, -200]}><planeGeometry args={[1.2, 520]} /><meshStandardMaterial map={T.grass} roughness={1} /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[s * 8.9, 0.14, -200]}><planeGeometry args={[3.2, 520]} /><meshStandardMaterial map={T.concrete} roughness={0.95} /></mesh>
        </group>
      ))}
      {/* negozi bassi con tende e insegne, alberghi alti dietro */}
      {shops.filter((b) => near(b.z)).map((b, i) => (
        <group key={i} position={[b.side * 14.5, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}><boxGeometry args={[8, b.h, b.len]} /><meshStandardMaterial color={b.c} roughness={0.9} /></mesh>
          <mesh position={[-b.side * 4.01, 1.5, 0]} rotation={[0, -b.side * Math.PI / 2, 0]}><planeGeometry args={[b.len * 0.8, 2.2]} /><meshStandardMaterial color="#2A2333" emissive="#FFB870" emissiveIntensity={0.25} metalness={0.5} roughness={0.2} /></mesh>
          <mesh position={[-b.side * 4.6, 2.9, 0]} rotation={[0, 0, b.side * 0.35]}><boxGeometry args={[1.4, 0.06, b.len * 0.85]} /><meshStandardMaterial map={T.awnings[b.aw]} roughness={0.9} /></mesh>
          <mesh position={[-b.side * 4.03, 3.7, 0]} rotation={[0, -b.side * Math.PI / 2, 0]}><planeGeometry args={[Math.min(6, b.len * 0.7), 1.1]} /><meshStandardMaterial map={T.signs[b.sign]} emissive="#ffffff" emissiveMap={T.signs[b.sign]} emissiveIntensity={0.35} /></mesh>
          {b.tall && <group position={[b.side * 8, 0, 0]}>
            <mesh position={[0, 11, 0]}><boxGeometry args={[9, 22, b.len]} /><meshStandardMaterial color={facade[(i + 2) % 6]} roughness={0.9} /></mesh>
            <mesh position={[-b.side * 4.52, 11.5, 0]} rotation={[0, -b.side * Math.PI / 2, 0]}><planeGeometry args={[b.len * 0.9, 20]} /><meshStandardMaterial map={T.win} emissive="#ffffff" emissiveMap={T.win} emissiveIntensity={0.3} /></mesh>
          </group>}
        </group>
      ))}
      {palms.filter((p) => near(p.z)).map((p) => <Palm key={p.seed} x={p.side * 6.75} z={p.z} h={p.h} seed={p.seed} leaf={T.leaf} f={f} />)}
      {/* lampioni e semafori */}
      {Array.from({length: 30}).map((_, i) => { const s = i % 2 ? 1 : -1, z = 15 - Math.floor(i / 2) * 32; return near(z) ? (
        <group key={i} position={[s * 6.4, 0, z]}>
          <mesh position={[0, 3.2, 0]}><cylinderGeometry args={[0.07, 0.09, 6.4, 8]} /><meshStandardMaterial color="#3A3A44" /></mesh>
          <mesh position={[-s * 0.8, 6.3, 0]}><boxGeometry args={[1.7, 0.1, 0.15]} /><meshStandardMaterial color="#3A3A44" /></mesh>
          <mesh position={[-s * 1.55, 6.15, 0]}><boxGeometry args={[0.5, 0.12, 0.3]} /><meshBasicMaterial color="#FFE0A8" /></mesh>
        </group>) : null; })}
      {[-60, -170, -290, -400].map((z) => near(z) ? (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[6.5, 3.4, 0]}><cylinderGeometry args={[0.12, 0.14, 6.8, 8]} /><meshStandardMaterial color="#5A5A64" /></mesh>
          <mesh position={[0.5, 6.6, 0]}><boxGeometry args={[12, 0.18, 0.18]} /><meshStandardMaterial color="#5A5A64" /></mesh>
          {[-2.5, 2.5].map((lx) => <group key={lx} position={[lx, 6.1, 0]}><mesh><boxGeometry args={[0.4, 1.0, 0.3]} /><meshStandardMaterial color="#222" /></mesh>
            <mesh position={[0, -0.3, 0.16]}><circleGeometry args={[0.12, 12]} /><meshBasicMaterial color="#3CFF6A" /></mesh>
            <mesh position={[0, 0.3, 0.16]}><circleGeometry args={[0.12, 12]} /><meshBasicMaterial color="#401010" /></mesh></group>)}
        </group>) : null)}
      {/* auto parcheggiate (lato destro e sinistro) */}
      {Array.from({length: 22}).map((_, i) => { const s = i % 2 ? 1 : -1, z = -10 - Math.floor(i / 2) * 37 - rnd(i) * 8;
        if (s > 0 && Math.abs(z - CAR0.z) < 9) return null;
        return near(z) ? <CarBox key={i} x={s * 5.0} z={z} rotY={s > 0 ? 0 : Math.PI} color={['#7A1E2C', '#E9E4D8', '#2E5E8A', '#3E7A5A', '#C9A227', '#5B3A7A'][i % 6]} /> : null; })}
      {/* traffico in senso opposto */}
      {Array.from({length: 14}).map((_, i) => { const z = -440 + ((i * 41 + time * 13) % 470); return near(z) ? <CarBox key={i} x={-3.1} z={z} rotY={Math.PI} lights color={['#E9E4D8', '#1F4E79', '#8A1C2B', '#2C2C34', '#F0C419', '#4A8A6A', '#B0B4BC'][i % 7]} /> : null; })}
      {/* passanti */}
      {Array.from({length: 12}).map((_, i) => {
        const s = i % 2 ? 1 : -1, dir = i % 3 ? 1 : -1;
        const z = -10 - i * 34 + dir * time * 1.2 * (i % 3 === 0 ? 1 : -1);
        const px = s * (8.3 + (s > 0 ? 1.4 : 0));
        if (s > 0 && f < DRIVE && Math.abs(z - pedPos(f).z) < 4) return null;
        return near(z) ? <Ped key={i} f={f + i * 13} tex={tex} pos={[px, 0, z]} rotY={dir * (i % 3 === 0 ? 0 : Math.PI)} npc={['#2E6DB4', '#F2F2F2', '#E3B23C', '#3E8E5E', '#C0392B', '#8E44AD'][i % 6]} /> : null;
      })}
    </group>
  );
};

/* ───── regia ───── */
const CameraRig: React.FC<{f: number}> = ({f}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    let pos: [number, number, number], look: [number, number, number], fov = 45;
    const {x, z} = pedPos(f), c = carPos(f);
    if (f < 150) { const d = 3.6 - ez(f, 0, 150) * 0.6; pos = [x + 0.7, 1.65, z - d]; look = [x - 0.1, 1.45, z]; fov = 38; }
    else if (f < 540) { const k = ez(f, 150, 185); pos = [x + 0.6 * k + 0.7 * (1 - k), 2.3, z + 4.2 * k - 3 * (1 - k)]; look = [x - 0.2, 1.3, z - 4]; fov = 50; }
    else if (f < 760) { pos = [x - 4.4, 1.35, z + 0.4]; look = [x - 0.4, 1.0, z]; fov = 40; }
    else if (f < STOP) { pos = [x + 0.6, 0.45, z - 2.6]; look = [x - 0.2, 1.55, z]; fov = 46; }
    else if (f < DRIVE) { const t = (f - STOP) / (DRIVE - STOP); pos = [x + 1.1 - t * 0.8, 1.85 - t * 0.2, z + 3.6 - t * 0.8]; look = [x - 1.7, 0.95, z - 2.4]; fov = 46; }
    else if (f < 1300) { const sway = Math.sin(f / 40) * 0.25; pos = [c.x + sway, 2.5, c.z + 7.2]; look = [c.x, 1.0, c.z - 7]; fov = 52; }
    else if (f < 1430) { pos = [c.x - 1.9, 0.75, c.z - 9.5 + (f - 1300) * 0.05]; look = [c.x, 0.9, c.z]; fov = 42; }
    else { const sway = Math.sin(f / 45) * 0.3; pos = [c.x + 0.4 + sway, 3.0, c.z + 8.5]; look = [c.x, 1.0, c.z - 9]; fov = 54; }
    camera.position.set(...pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(...look);
  }, [f]);
  return null;
};

const Scene3D: React.FC = () => {
  const f = useCurrentFrame();
  const tex = useAllTex();
  if (!tex) return null;
  const c = carPos(f);
  const driving = f >= DRIVE;
  return (
    <ThreeCanvas width={W} height={H} camera={{fov: 45, near: 0.05, far: 700, position: [0, 2, 5]}} gl={{antialias: true}}>
      <color attach="background" args={['#3A3050']} />
      <fog attach="fog" args={['#7E6276', 40, 230]} />
      <hemisphereLight args={['#C9B0E0', '#B07A5C', 0.95]} />
      <directionalLight position={[-10, 14, -40]} intensity={1.5} color="#FFC08A" />
      <directionalLight position={[10, 8, 20]} intensity={0.45} color="#A090FF" />
      <CameraRig f={f} />
      <City f={f} tex={tex} />
      <SuperCar f={f} driving={driving} />
      {!driving && <Ped f={f} tex={tex} />}
      {!driving && <Dog f={f} />}
      {driving && <Ped f={f} tex={tex} seated pos={[c.x - 0.4, -0.27, c.z + 0.35]} />}
      {driving && <Dog f={f} still pos={[c.x + 0.42, 0.33, c.z + 0.3]} />}
    </ThreeCanvas>
  );
};

/* ───── interfaccia (design originale) ───── */
const Neon: React.FC<{t: string; size: number; c: string; font?: string; rot?: number}> = ({t, size, c, font = 'Monoton, sans-serif', rot = 0}) => (
  <div style={{fontFamily: font, fontSize: size, color: '#fff', transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap', lineHeight: 1, textShadow: `0 0 6px ${c}, 0 0 18px ${c}, 0 0 44px ${c}, 0 5px 0 ${c}`}}>{t}</div>
);
const District: React.FC<{at: number; name: string}> = ({at, name}) => {
  const f = useCurrentFrame();
  const o = ez(f, at, at + 15) * (1 - ez(f, at + 80, at + 100));
  return <div style={{position: 'absolute', bottom: 330, width: '100%', textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 20}px)`}}><Neon t={name} size={96} c={P.pink} font={'"Kaushan Script", cursive'} rot={-4} /></div>;
};
const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const o = ez(f, 160, 190) * (1 - ez(f, END - 10, END + 10));
  const mins = 20 * 60 + 47 + Math.floor(f / 30);
  const clock = `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  const z = focusZ(f);
  return (
    <AbsoluteFill>
      <div style={{opacity: o}}>
        <div style={{position: 'absolute', right: 34, top: 60, padding: '18px 22px', borderRadius: 26, background: 'linear-gradient(160deg, rgba(42,10,85,0.75), rgba(18,2,43,0.6))', border: `3px solid ${P.cyan}`, boxShadow: `0 0 24px ${P.cyan}66`, display: 'flex', gap: 20, alignItems: 'center'}}>
          <div style={{textAlign: 'right', fontFamily: 'Orbitron'}}>
            <div style={{fontWeight: 900, fontSize: 52, color: P.cyan, textShadow: `0 0 12px ${P.cyan}`}}>{clock}</div>
            <div style={{fontWeight: 900, fontSize: 58, color: '#7CFF8A', textShadow: '0 0 14px #2BFF5A, 3px 3px 0 #000'}}>$9999999</div>
            <div style={{display: 'flex', gap: 18, justifyContent: 'flex-end', fontWeight: 700, fontSize: 34, marginTop: 4}}>
              <span style={{color: P.pink}}>♥ 100</span><span style={{color: '#B9C4FF'}}>⬢ 100</span>
            </div>
          </div>
          <div style={{width: 150, height: 150, clipPath: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)', background: `linear-gradient(160deg, ${P.magenta}, ${P.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={110} height={110} viewBox="-55 -55 110 110"><g transform="rotate(-40)"><rect x={-8} y={-50} width={16} height={92} rx={7} fill="#111" stroke="#fff" strokeWidth={3} /><rect x={-11} y={8} width={22} height={32} rx={5} fill="#333" /></g></svg>
          </div>
        </div>
        <div style={{position: 'absolute', left: 44, bottom: 80, width: 270, height: 270, borderRadius: 135, overflow: 'hidden', border: `6px solid ${P.cyan}`, boxShadow: `0 0 24px ${P.cyan}`, background: '#25203A'}}>
          <svg width={270} height={270} viewBox="-135 -135 270 270">
            <g transform={`translate(0 ${(-z * 3) % 160})`}>
              {[-320, -160, 0, 160, 320].map((y) => <rect key={y} x={-150} y={y - 6} width={300} height={12} fill="#CFCFE0" />)}
              <rect x={-14} y={-500} width={28} height={1000} fill="#E8E8F2" />
              <rect x={30} y={-500} width={70} height={1000} fill="#4F8A4A" opacity={0.7} />
              <rect x={-110} y={-500} width={60} height={1000} fill="#4F8A4A" opacity={0.7} />
            </g>
            <path d="M 0 -18 L 12 14 L 0 6 L -12 14 Z" fill={P.yellow} stroke="#000" strokeWidth={2} />
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', opacity: ez(f, 15, 35) * (1 - ez(f, 130, 155))}}>
        <Neon t="ELITE" size={150} c={P.magenta} />
        <div style={{marginTop: 6, marginLeft: 380}}><Neon t="City" size={120} c={P.cyan} font={'"Kaushan Script", cursive'} rot={-7} /></div>
      </div>
      <District at={560} name="Ocean Boulevard" />
      <District at={1050} name="Lungomare" />
      <District at={1320} name="Porto Elite" />
      <District at={1560} name="Viale delle Palme" />
      <div style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', opacity: ez(f, END, END + 20)}}>
        <Neon t="MISSIONE" size={96} c={P.yellow} font="Orbitron" />
        <div style={{marginTop: 14}}><Neon t="COMPIUTA" size={96} c={P.yellow} font="Orbitron" /></div>
        <div style={{fontFamily: 'Orbitron', fontWeight: 900, fontSize: 70, color: '#7CFF8A', marginTop: 30, textShadow: '0 0 20px #2BFF5A, 4px 4px 0 #000'}}>$9999999</div>
      </div>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 5px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(10,0,25,0.6) 100%)'}} />
      <AbsoluteFill style={{background: '#fff', opacity: [150, 540, 760, STOP, DRIVE, 1300, 1430].some((c) => f >= c && f < c + 5) ? 0.3 : 0}} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 12, PED_FRAMES - 30, PED_FRAMES], [1, 0, 0, 1], cl)}} />
    </AbsoluteFill>
  );
};

export const PedCity: React.FC = () => (
  <AbsoluteFill style={{background: '#12022B'}}>
    <Scene3D />
    <Hud />
    <Audio src={staticFile('elite/music.wav')} volume={(f) => interpolate(f, [0, 20, PED_FRAMES - 45, PED_FRAMES], [0, 1, 1, 0], cl)} />
    <Sequence from={DRIVE} durationInFrames={110}><Audio src={staticFile('elite/engine.wav')} volume={0.4} /></Sequence>
    <Sequence from={END + 20} durationInFrames={30}><Audio src={staticFile('elite/cash.wav')} volume={0.5} /></Sequence>
  </AbsoluteFill>
);
