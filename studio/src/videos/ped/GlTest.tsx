import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, AbsoluteFill} from 'remotion';
export const GlTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#222'}}>
      <ThreeCanvas width={540} height={960} camera={{position: [0, 1, 4], fov: 50}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <mesh rotation={[0.4, f * 0.05, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="hotpink" /></mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
