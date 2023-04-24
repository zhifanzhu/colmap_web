import * as THREE from 'three';

/**
 * @typedef {ColmapCamera} ColmapCamera
 * @property {number[7]} qw, qx, qy, qz, tx, ty, tz
 * 
 * @property {THREE.Vector3} position
 * @property {THREE.Quaternion} quaternion
 * @property {THREE.Matrix4} cam_to_world
 * @property {THREE.Matrix4} world_to_cam
 * 
 */
class ColmapCamera {
  /**
   * 
   * @param {Object} camera 
   */
  constructor(camera) {
    // Inputs: quat: [M, 4], transl: [M, 3] representing world to camera transformation
    // we need to inverse this (quat, transl) and get [R^t | -R^t t]
    // Update-1: Only with primitive lines (instead of independant objects)
    //  we can have no lagging
    const quat = new THREE.Quaternion(camera[1], camera[2], camera[3], camera[0]);
    const transl = new THREE.Vector3(camera[4], camera[5], camera[6]);
    this.position = transl;
    this.quaternion = quat;
    this.world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
    this.cam_to_world = this.world_to_cam.invert();
  }
}

/**
 * @typedef {ColmapPoint3D} ColmapPoint3D
 * @property {number[6]} xyzrgb
 * 
 * @property {THREE.Vector3} position
 * @property {THREE.Color} color
 */
class ColmapPoint3D {
  /**
   * 
   * @param {Object} point3D 
   */
  constructor(point3D) {
    this.xyz = [point3D[0], point3D[1], point3D[2]];
    this.rgb = [point3D[3], point3D[4], point3D[5]];
    this.position = new THREE.Vector3(point3D[0], point3D[1], point3D[2]);
    // this.color = new THREE.Color(`rgb(${point3D[3]}, ${point3D[4]}, ${point3D[5]})`);
  }
}

export { ColmapCamera, ColmapPoint3D };