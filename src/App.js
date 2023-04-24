import './App.css';
import { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TrackballControls, useTexture } from '@react-three/drei'

import * as THREE from 'three';
import { useEffect } from 'react';

import { 
  get_world_from_cam,
 } from './math';
import { ColmapCamera, ColmapPoint3D } from './types';

const hostname = window.location.hostname;
const port = 5001;

// Input: pts: [N, 3], colors: [N, 3]
function Points3D(props) {
  const ref = useRef();
  const positions = [];
  const colors = [];
  for (const point of props.points) {
    positions.push(point.xyz[0], point.xyz[1], point.xyz[2]);
    colors.push(point.rgb[0] / 255.0, point.rgb[1] / 255.0, point.rgb[2] / 255.0);
  }
  return <points ref={ref}>
    <bufferGeometry>
      <bufferAttribute attach='attributes-position' count={positions.length / 3} array={new Float32Array(positions)} itemSize={3} />
      <bufferAttribute attach='attributes-color' count={colors.length / 3} array={new Float32Array(colors)} itemSize={3} />
    </bufferGeometry>
    <pointsMaterial size={props.size} sizeAttenuation={false} vertexColors={true}/>
  </points>
}

function CameraPrimitives(props) {
  const d = props.size;
  let positions = [];
  for (const camera of props.cameras) {
    const cam_to_world = camera.cam_to_world;

    // Looking through Z-axis
    let origin = new THREE.Vector3(0, 0, 0).applyMatrix4(cam_to_world);
    let left_top = new THREE.Vector3(-0.75 * d, 0.5 * d, d).applyMatrix4(cam_to_world);
    let left_bottom = new THREE.Vector3(-0.75 * d, -0.5 * d, d).applyMatrix4(cam_to_world);
    let right_top = new THREE.Vector3(0.75 * d, 0.5 * d, d).applyMatrix4(cam_to_world);
    let right_bottom = new THREE.Vector3(0.75 * d, -0.5 * d, d).applyMatrix4(cam_to_world);

    positions.push(...origin, ...left_top);
    positions.push(...origin, ...left_bottom);
    positions.push(...origin, ...right_top);
    positions.push(...origin, ...right_bottom);
    positions.push(...left_top, ...left_bottom);
    positions.push(...left_top, ...right_top);
    positions.push(...left_bottom, ...right_bottom);
    positions.push(...right_top, ...right_bottom);
  }
  positions = new Float32Array(positions);

  return <lineSegments visible={!props.hideCameras}>
    <bufferGeometry  attach="geometry">
      <bufferAttribute attach='attributes-position'
        count={positions.length / 3}
        array={positions}
        itemSize={3} />
    </bufferGeometry>
    <lineBasicMaterial color='#ff0000' linewidth={1} transparent={true}/>
  </lineSegments>
}


function SceneApp() {
  // console.log(hostname);
  const [isLoaded, setIsLoaded] = useState(false);
  const [colmapCameras, setColmapCameras] = useState(null);
  const [colmapPoints, setColmapPoints] = useState(null);

  const [curImg, setCurImage] = useState(null); // {url, name}

  // Interactive
  const [hideCameras, setHideCameras] = useState(false);


  useEffect(() => {
    let subpath;
    subpath = 'colmap_projects/json_models/P04_01_skeletons.json';
    fetch(`http://${hostname}:${port}/model/${subpath}`)
    .then(response => response.json())
    .then(model => {
      const points = model.points.map(e => new ColmapPoint3D(e));
      setColmapPoints(points);

      let cameras = model.images.map(e => new ColmapCamera(e));
      setColmapCameras(cameras);

      setIsLoaded(true);
    });
  }, []);

  if (isLoaded === false) { return <div>Loading...</div> }

  return <>
    <button onClick={() => setHideCameras(!hideCameras)}>Hide Cameras</button>
    <span>Num cameras: {`${colmapCameras.length}`}</span>

    <div className='container'
      style={{ width: window.innerWidth, height: window.innerHeight }}>
      <Canvas dpr={[1, 2]}>
        <color args={[0x0000000]} attach="background" />
        <ambientLight />
        {/* <OrbitControls enableDamping={false} minDistance={0.5} maxDistance={100}/> */}
        <TrackballControls enableDamping={false} minDistance={0.5} maxDistance={100}
          rotateSpeed={2.0}/>
        <axesHelper args={[1]} />

        <CameraPrimitives size={0.1} cameras={colmapCameras} hideCameras={hideCameras}/>
        <Points3D size={0.01} points={colmapPoints}/>
      </Canvas>
    </div>
  </>
}

const App = SceneApp;

export default App;
