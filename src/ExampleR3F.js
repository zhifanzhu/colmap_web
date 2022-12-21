import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function Box(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef()
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (mesh.current.rotation.x += delta))
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Cube() {
  const ref = useRef();
  useFrame( (state, delta) => {
    ref.current.rotation.x += 0.01; 
    ref.current.rotation.y += 0.01;
  });
  return <mesh ref={ref}>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color={0x00ff00} />
  </mesh>
}

function App() {
  return (
    <div style={{ width: window.innerWidth, height: window.innerHeight }}>
      <Canvas>
        <color args={[0x1e1e1e]} attach="background" />
        <perspectiveCamera
          fov={75} near={0.1} far={1000} aspect={window.innerWidth / window.innerHeight}
          position={[0, 0, 5]} />
        <Cube />
      </Canvas>
    </div>
  )
}

export default App;