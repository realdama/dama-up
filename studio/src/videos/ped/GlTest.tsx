import React from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {EffectComposer, Bloom, Vignette} from '@react-three/postprocessing';
import {useCurrentFrame, AbsoluteFill} from 'remotion';
export const GlTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#222'}}>
      <ThreeCanvas width={540} height={960} camera={{position: [0, 1, 4], fov: 50}} shadows gl={{toneMapping: THREE.ACESFilmicToneMapping}}>
        <color attach="background" args={['#1a1030']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 4, 2]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
        <mesh rotation={[0.4, f * 0.05, 0]} position={[0, 0.6, 0]} castShadow><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="hotpink" /></mesh>
        <mesh position={[1.2, 0.3, 0]}><sphereGeometry args={[0.25, 16, 16]} /><meshBasicMaterial color={[4, 1, 3]} toneMapped={false} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10, 10]} /><meshStandardMaterial color="#888" /></mesh>
        <EffectComposer><Bloom intensity={1.2} luminanceThreshold={0.8} mipmapBlur /><Vignette darkness={0.6} /></EffectComposer>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
