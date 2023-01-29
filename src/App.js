import './App.css';
import { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TrackballControls, useTexture } from '@react-three/drei'

import * as THREE from 'three';
import { useEffect } from 'react';

// Input: pts: [N, 3], colors: [N, 3]
function Points3D(props) {
  const ref = useRef();
  const positions = [];
  const colors = [];
  for (let key in props.points) {
    let point = props.points[key];
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
    <pointsMaterial size={props.size} sizeAttenuation={true} vertexColors={true}/>
  </points>
}

// Inputs: quat: [M, 4], transl: [M, 3] representing world to camera transformation
// we need to inverse this (quat, transl) and get [R^t | -R^t t]
// Update-1: Only with primitive lines (instead of independant objects)
//  we can have no lagging
function CameraPrimitives(props) {
  const d = props.size;
  // Image list with two lines of data per image:
  //   IMAGE_ID, QW, QX, QY, QZ, TX, TY, TZ, CAMERA_ID, NAME
  //   POINTS2D[] as (X, Y, POINT3D_ID)
  let positions = [];
  console.log('start loading cameras')
  for (let key in props.cameras) {
    let camera = props.cameras[key];
    const quat = new THREE.Quaternion(camera.qvec[1], camera.qvec[2], camera.qvec[3], camera.qvec[0]);
    const transl = new THREE.Vector3(camera.tvec[0], camera.tvec[1], camera.tvec[2]);
    const world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
    const cam_to_world = world_to_cam.invert();

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
    <lineBasicMaterial color='#ff0000' linewidth={1} />
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
    const material = new THREE.LineBasicMaterial({ color: 0xff00ff , linewidth: 20});
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

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    let subpath;
    subpath = 'colmap_projects/stables_single/P09_07-homo/sparse/0'
    // subpath = 'colmap_projects/dense_reg/P01_merge1/sparse/P01_10_all/'
    // subpath = 'colmap_projects/exp/P23_02-homo/sparse/new_all'
    fetch(`http://${hostname}:5001/model/${subpath}`)
    .then(response => response.json())
    .then(model => {
      setModel(model);
      setIsLoaded(true);
    });
  }, []);

  const [curTraj, setCurTraj] = useState(0);
  const [trajCounter, setTrajCounter] = useState(0);

  if (isLoaded === false) { return <div>Loading...</div> }

  const cameras = Object.values(model.images).sort((a, b) => {
    const frame_a = extract_vid_frame(a.name);
    const frame_b = extract_vid_frame(b.name);
    return frame_a < frame_b ? -1 : 1;
  });

  return <>
    <span>Num cameras: {`${cameras.length}`}</span>
    <div style={{ width: window.innerWidth, height: window.innerHeight }}>
      <Canvas dpr={[1, 2]}>
        <color args={[0x0000000]} attach="background" />
        <ambientLight />
        {/* <OrbitControls enableDamping={false} minDistance={0.5} maxDistance={100}/> */}
        <TrackballControls enableDamping={false} minDistance={0.5} maxDistance={100}/>
        <axesHelper args={[1]} />

        {/* <CameraPrimitives size={0.1} cameras={props.model.images}/> */}
        <Points3D size={0.01} points={model.points}/>
        <Trajectory cameras={cameras}/>
      </Canvas>
    </div>
  </>
}


export default App;
