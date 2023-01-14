import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function Frustum(props) {
  // no pointer events
  return (
    <mesh {...props}>
      <frustumGeometry args={[1, 1, 1, 1, 1, 1, 1]} />
      <meshBasicMaterial color={0x00ff00} />
    </mesh>
  )
}


function MainCanvas(props) {
  return (
    <Canvas>
      <Frustum />
    </Canvas>
  )
}