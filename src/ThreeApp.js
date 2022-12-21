import './App.css';
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function App() {
  return (
    <Canvas>
      <color args={[0x1e1e1e]} attach="background" />
      <perspectiveCamera
        fov={75} near={0.1} far={1000} aspect={window.innerWidth / window.innerHeight}
        position={[0, 0, 5]} />
      <axesHelper />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
