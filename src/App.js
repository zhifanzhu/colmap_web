import './App.css';
import { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TrackballControls, useTexture } from '@react-three/drei'

import * as THREE from 'three';
import { useEffect } from 'react';

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
  const [pointer, raycaster, camera, scene] = useThree(
    (state) => [state.pointer, state.raycaster, state.camera, state.scene]);
  const onclick = (e) => {
    console.log('click');
    raycaster.setFromCamera(pointer, camera)
    // const intersect = raycaster.intersectObject(ref.current);
    // console.log(intersect);
    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log(intersects);
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
  console.log('start loading cameras')
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
  console.log('end loading cameras')

  return <lineSegments>
    <bufferGeometry attach="geometry">
      <bufferAttribute attach='attributes-position'
        count={positions.length / 3}
        array={positions}
        itemSize={3} />
    </bufferGeometry>
    <lineBasicMaterial color='#ff0000' linewidth={1} transparent={true}/>
  </lineSegments>
}

// Input: vec : THREE.Vector3, camera : colmap.Camera
function get_world_from_cam(vec, camera) {
    const quat = new THREE.Quaternion(camera.qvec[1], camera.qvec[2], camera.qvec[3], camera.qvec[0]);
    const transl = new THREE.Vector3(camera.tvec[0], camera.tvec[1], camera.tvec[2]);
    const world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
    const cam_to_world = world_to_cam.invert();
    // Looking through Z-axis
    const ret = vec.applyMatrix4(cam_to_world);
    return ret;
}


function Trajectory(props) {
  const FPS = 10; // 30;
  const TrajLength = 8;

  let lines = [];
  for (let i = 0; i < TrajLength; i++) {
    const points = new Float32Array([0, 0, 0, 0, 0, 1]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff , linewidth: 40});
    const line = new THREE.Line(geometry, material);
    lines.push( line );
  }

  useFrame((state, delta) => {
    const index = Math.floor(state.clock.elapsedTime * FPS);

    for (let i = 0; i < TrajLength; i++) {
      const positions = lines[i].geometry.attributes.position.array;
      if (index - i - 1 < 0) { return; }
      const cam_idx = (index - i) % props.cameras.length;
      const cur_cam = props.cameras[cam_idx];
      const prev_cam = props.cameras[cam_idx - 1];
      const st = get_world_from_cam(new THREE.Vector3(0, 0, 0), cur_cam);
      const ed = get_world_from_cam(new THREE.Vector3(0, 0, 0), prev_cam);

      positions[0] = st.x;
      positions[1] = st.y;
      positions[2] = st.z;
      positions[3] = ed.x;
      positions[4] = ed.y;
      positions[5] = ed.z;
      lines[i].geometry.attributes.position.needsUpdate = true
    }
  });

  return <group>{lines.map(e => <primitive object={e} position={[0, 0, 0]} />)}</group>
}

// Input: name: string
// Output: int = vid_frame : string
function extract_vid_frame(name) {
  const vid = /P\d{2,}_\d{2,3}/.exec(name)[0];
  const frame = /\d{10,}/.exec(name)[0];
  return `${vid}_${frame}`;
}

function SceneApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [colmapCameras, setColmapCameras] = useState(null);
  const [colmapPoints, setColmapPoints] = useState(null);

  const [curImg, setCurImage] = useState(null);
  const [curTraj, setCurTraj] = useState(0);
  const [trajCounter, setTrajCounter] = useState(0);


  useEffect(() => {
    let subpath;
    subpath = 'colmap_projects/stables_single/P09_07-homo/sparse/0'
    // subpath = 'colmap_projects/dense_reg/P01_merge1/sparse/P01_10_all/'
    // subpath = 'colmap_projects/exp/P23_02-homo/sparse/new_all'
    // subpath = 'colmap_projects/homo_merged/P02/sparse/0/'
    fetch(`http://${hostname}:${port}/model/${subpath}`)
    .then(response => response.json())
    .then(model => {
      const points = Object.values(model.points).map(e => new ColmapPoint3D(e));
      setColmapPoints(points);

      let cameras = Object.values(model.images).map(e => new ColmapCamera(e));
      cameras = cameras.sort((a, b) => {
        const frame_a = extract_vid_frame(a.name);
        const frame_b = extract_vid_frame(b.name);
        return frame_a < frame_b ? -1 : 1;
      });
      setColmapCameras(cameras);

      setIsLoaded(true);
    });
    fetch(`http://${hostname}:${port}/image`)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      setCurImage(url);
    });
  }, []);

  if (isLoaded === false) { return <div>Loading...</div> }

  console.log(colmapCameras[0].name);
  return <>
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

        <CameraPrimitives size={0.1} cameras={colmapCameras}/>
        <Points3D size={0.01} points={colmapPoints}/>
        {/* <Trajectory cameras={colmapCameras}/> */}
      </Canvas>
    </div>

    <div className='overlay'>
      <img src={curImg} width={384} alt='image'/>
      <p>Image PlaceHolder</p>
    </div>
  </>
}

const App = SceneApp;

export default App;
