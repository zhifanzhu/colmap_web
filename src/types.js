import * as THREE from 'three';

/**
 * @typedef {ColmapCamera} ColmapCamera
 * @property {number} camera_id
 * @property {number} id
 * @property {string} name
 * @property {number[]} point3D_ids
 * @property {number[4]} qvec
 * @property {number[3]} tvec
 * @property {number[]} xys
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
    // Image list with two lines of data per image:
    //   IMAGE_ID, QW, QX, QY, QZ, TX, TY, TZ, CAMERA_ID, NAME
    //   POINTS2D[] as (X, Y, POINT3D_ID)
    this.camera_id = camera.camera_id;
    this.id = camera.id;
    this.name = camera.name;
    this.point3D_ids = camera.point3D_ids;
    this.qvec = camera.qvec;
    this.tvec = camera.tvec;
    this.xys = camera.xys;

    // Inputs: quat: [M, 4], transl: [M, 3] representing world to camera transformation
    // we need to inverse this (quat, transl) and get [R^t | -R^t t]
    // Update-1: Only with primitive lines (instead of independant objects)
    //  we can have no lagging
    const quat = new THREE.Quaternion(camera.qvec[1], camera.qvec[2], camera.qvec[3], camera.qvec[0]);
    const transl = new THREE.Vector3(camera.tvec[0], camera.tvec[1], camera.tvec[2]);
    this.position = transl;
    this.quaternion = quat;
    this.world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
    this.cam_to_world = this.world_to_cam.invert();
  }
}

/**
 * @typedef {ColmapPoint3D} ColmapPoint3D
 * @property {number} id
 * @property {number[]} image_ids
 * @property {number[]} point2D_idxs
 * @property {number[3]} rgb
 * @property {number[3]} xyz
 * @property {number} error
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
    this.id = point3D.id;
    this.image_ids = point3D.image_ids;
    this.point2D_idxs = point3D.point2D_idxs;
    this.rgb = point3D.rgb;
    this.xyz = point3D.xyz;
    this.error = point3D.error;

    this.position = new THREE.Vector3(point3D.xyz[0], point3D.xyz[1], point3D.xyz[2]);
    // this.color = new THREE.Color(`rgb(${point3D.rgb[0]}, ${point3D.rgb[1]}, ${point3D.rgb[2]})`);
  }
}

export { ColmapCamera, ColmapPoint3D };