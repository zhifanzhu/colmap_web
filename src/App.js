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

// Inputs: quat: [M, 4], transl: [M, 3] representing world to camera transformation
// we need to inverse this (quat, transl) and get [R^t | -R^t t]
// Update-1: Have to convert list of Frustums into primitives to improve performance
function CameraFrustums(props) {
  const ref = useRef()
  // Image list with two lines of data per image:
  //   IMAGE_ID, QW, QX, QY, QZ, TX, TY, TZ, CAMERA_ID, NAME
  //   POINTS2D[] as (X, Y, POINT3D_ID)
  const frustums = [];
  for (let key in props.cameras) {
    let camera = props.cameras[key];
    const quat = new THREE.Quaternion(camera.qvec[1], camera.qvec[2], camera.qvec[3], camera.qvec[0]);
    const transl = new THREE.Vector3(camera.tvec[0], camera.tvec[1], camera.tvec[2]);
    const world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
    const cam_to_world = world_to_cam.invert();
    
    const inv_quat = new THREE.Quaternion().setFromRotationMatrix(cam_to_world);
    const inv_transl = new THREE.Vector3().setFromMatrixPosition(cam_to_world);
    const quat_w = [inv_quat.x, inv_quat.y, inv_quat.z, inv_quat.w]; // world space
    const transl_w = [inv_transl.x, inv_transl.y, inv_transl.z];
    frustums.push(<Frustum key={key} size={props.size} quaternion={quat_w} position={transl_w} />);
  }
  return <group>{frustums}</group>
}

// Inputs: quat: [M, 4], transl: [M, 3] representing world to camera transformation
// we need to inverse this (quat, transl) and get [R^t | -R^t t]
// Update-1: Have to convert list of Frustums into primitives to improve performance
function InstancedCameraCones(props) {
  const ref = useRef();
  const d = props.size;
  // Image list with two lines of data per image:
  //   IMAGE_ID, QW, QX, QY, QZ, TX, TY, TZ, CAMERA_ID, NAME
  //   POINTS2D[] as (X, Y, POINT3D_ID)
  const matrices = [];
  for (let key in props.cameras) {
    let camera = props.cameras[key];
    const quat = new THREE.Quaternion(camera.qvec[1], camera.qvec[2], camera.qvec[3], camera.qvec[0]);
    const transl = new THREE.Vector3(camera.tvec[0], camera.tvec[1], camera.tvec[2]);
    const world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
    let cam_to_world = world_to_cam.invert();
    const cone_align = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion(-0.7071067811865476, 0, 0, 0.7071067811865476));
    cam_to_world = cam_to_world.multiply(cone_align);
    matrices.push(cam_to_world);
  }
  console.log(matrices.length);
  // return <group>{frustums}</group>
  useEffect(() => {
    for (let i = 0; i < matrices.length; i++) {
      ref.current.setMatrixAt(i, matrices[i]);
    }
  }, [])
  return <instancedMesh ref={ref} args={[null, null, matrices.length]}>
    <coneGeometry args={[d, d, 4, 1, false, Math.PI/4]} />
    <meshBasicMaterial color='#ff0000'/>
    {/* <meshStandardMaterial depthTest={false} wireframe={true} transparent={true}
      color={0xff00ff} opacity={1} /> */}
  </instancedMesh>
}

function Trajectory(props) {
  const curTime = useRef();
  const curIndex = useRef();
  const FPS = 30;

  useFrame((state, delta) => {
    const scene = state.scene;
    // const time = Math.floor(Date.now() / 1000);
    // if (time != curTime.current) {
    //   curTime.current = time;
    // }
    const index = Math.floor(state.clock.elapsedTime * FPS);
    if (index === curIndex.current) { return; }
    const curCam = props.cameras[index % props.cameras.length];
  });

  return <></>
}

function App(props) {
  // fetch with blocking
  const [curTraj, setCurTraj] = useState(0);
  const [trajCounter, setTrajCounter] = useState(0);

  const cameras = Object.values(props.model.images).sort((a, b) => a.id - b.id);

  return <>
    <span>Hello</span>
    <div style={{ width: window.innerWidth, height: window.innerHeight }}>
      <Canvas dpr={[1, 2]}>
        <color args={[0xfffffff]} attach="background" />
        <ambientLight />
        <OrbitControls enableDamping={false} minDistance={0.5} maxDistance={100}/>
        <axesHelper args={[1]} />

        {/* <Frustum size={1} quaternion={[0, 0, 0, 1]} position={[0, 0, 0]} /> */}
        {/* <CameraCone /> */}
        {/* <CameraFrustums size={0.1} cameras={props.model.images}/> */}
        <InstancedCameraCones size={0.1} cameras={props.model.images}/>
        {/* <Points3D size={0.01} points={props.model.points}/> */}
        {/* <Points3DTest /> */}
        {/* <Trajectory cameras={props.model.images} points={props.model.points}/> */}
      </Canvas>
    </div>
  </>
}


export default App;
