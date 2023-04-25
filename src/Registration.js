import './App.css';
import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, TrackballControls, useTexture } from '@react-three/drei';

import { ColmapCamera, ColmapPoint3D } from './types';
import { Points3D, CameraPrimitives, SimpleLines } from './ThreeComponent';

const hostname = window.location.hostname;
const port = 5001;


function Dummy() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(5.191492201997082, 13.22890506900179, -13.026706921870169);
    camera.rotation.set(-2.561939582688825, 0.116014612657904, 0.06161117814921492);
    camera.up.set(-0.12504418338304474, -0.45870001225757945, -0.8797489704210854);
  }, [camera]);

  return <></>
}

function Registration() {
  // Reading registration file and models
  // const [regFile, setRegFile] = useState(null);

  // skeletons
  const [isLoaded, setIsLoaded] = useState(false);
  const [colmapCameras, setColmapCameras] = useState(null);
  const [colmapPoints, setColmapPoints] = useState(null);
  const [lines, setLines] = useState(null);

  // Interactive
  const [hideCameras, setHideCameras] = useState(false);

  useEffect(() => {
    // setRegFile('colmap_projects/registration/P04A/P04A.json')
    const regFile = 'colmap_projects/registration/P04A/P04A.json';
    fetch(`http://${hostname}:${port}/registration/${regFile}`)
    .then(response => response.json())
    .then(model => {
      const points = model.points.map(e => new ColmapPoint3D(e));
      setColmapPoints(points);

      console.log(model.lines)
      setLines(model.lines)
      // let cameras = model.images.map(e => new ColmapCamera(e));
      // setColmapCameras(cameras);

      setIsLoaded(true);
    });

  }, []);

  if (isLoaded === false) { return <div>Loading...</div> }

  return <>
    <div>
      <label>registration json</label><input type="text" placeholder="Enter a path to a json" /><br></br>
      &nbsp;&nbsp;<button onClick={() => console.log('clicked')}>Load</button>
    </div>
    <div>
      <button onClick={() => setHideCameras(!hideCameras)}>Hide Cameras</button>
      {/* <span>Num cameras: {`${colmapCameras.length}`}</span> */}
    </div>

    <div className='container'
      style={{ width: window.innerWidth, height: window.innerHeight }}>
      <Canvas dpr={[1, 2]}>
        <color args={[0x0000000]} attach="background" />
        <ambientLight />
        <Dummy />
        {/* <OrbitControls enableDamping={false} minDistance={0.5} maxDistance={100}/> */}
        <TrackballControls enableDamping={false} minDistance={0.5} maxDistance={100}
          rotateSpeed={2.0}/>
        <axesHelper args={[1]} />

        {/* <CameraPrimitives size={0.1} cameras={colmapCameras} hideCameras={hideCameras}/> */}
        <Points3D size={0.01} points={colmapPoints}/>
        <SimpleLines lines={lines}/>
      </Canvas>
    </div>
  </>
}

export default Registration;
