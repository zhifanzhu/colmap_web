import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function CameraCone(props) {
  return <mesh quaternion={[-0.707, 0, 0, 0.707]}>
    <coneGeometry args={[1, 1, 4, 1, false, Math.PI/4]} />
    <meshStandardMaterial depthTest={false} wireframe={true} transparent={true}
      color={0xff00ff} opacity={1} />
  </mesh>
}

// quat: [4,], pos: [3,], size: float
function Frustum(props) {
  const ref = useRef();
  const d = props.size;
  const origin = [0, 0, 0];
  // Looking through Z-axis
  const left_top = [-0.75 * d, 0.5 * d, d];
  const left_bottom = [-0.75 * d, -0.5 * d, d];
  const right_top = [0.75 * d, 0.5 * d, d];
  const right_bottom = [0.75 * d, -0.5 * d, d];
  const positions = new Float32Array([
    ...origin, ...left_top,
    ...origin, ...left_bottom,
    ...origin, ...right_top,
    ...origin, ...right_bottom,
    ...left_top, ...left_bottom,
    ...left_top, ...right_top,
    ...left_bottom, ...right_bottom,
    ...right_top, ...right_bottom
  ]);

  return <group ref={ref} position={props.position} quaternion={props.quaternion}>
    <mesh position={[0, 0, d]}>
      <planeGeometry args={[1.5 * d, d, 1, 1]} />
      <meshBasicMaterial color='#ff0000' side={THREE.DoubleSide} transparent={true} opacity={0.3} />
    </mesh>
    <lineSegments>
      <bufferGeometry attach="geometry">
        <bufferAttribute attach='attributes-position'
          count={positions.length / 3}
          array={positions}
          itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color='#ff0000' linewidth={1} />
    </lineSegments>
  </group>
}