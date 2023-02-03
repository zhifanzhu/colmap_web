import * as THREE from 'three';
import { ColmapCamera } from './types.js';

/**
 * 
 * @param {THREE.Vector3} vec 
 * @param {ColmapCamera} camera 
 * @returns {THREE.Vector3}
 */
function get_world_from_cam(vec, camera) {
    const quat = new THREE.Quaternion(camera.qvec[1], camera.qvec[2], camera.qvec[3], camera.qvec[0]);
    const transl = new THREE.Vector3(camera.tvec[0], camera.tvec[1], camera.tvec[2]);
    const world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
    const cam_to_world = world_to_cam.invert();
    // Looking through Z-axis
    const ret = vec.applyMatrix4(cam_to_world);
    return ret;
}


/**
 * 
 * @param {Array{ColmapCamera}} cameras
 * 
 * @returns {THREE.Vector3} average position
 */
function compute_average_camera_rotation(cameras) {
    let rotations = [];

    for (const camera of cameras) {
        const quat = new THREE.Quaternion(camera.qvec[1], camera.qvec[2], camera.qvec[3], camera.qvec[0]);
        const transl = new THREE.Vector3(camera.tvec[0], camera.tvec[1], camera.tvec[2]);
        const world_to_cam = new THREE.Matrix4().makeRotationFromQuaternion(quat).setPosition(transl);
        const cam_to_world = world_to_cam.invert();

        // // Looking through Z-axis
        // let origin = new THREE.Vector3(0, 0, 0).applyMatrix4(cam_to_world);
        // let left_top = new THREE.Vector3(-0.75 * d, 0.5 * d, d).applyMatrix4(cam_to_world);
        // let left_bottom = new THREE.Vector3(-0.75 * d, -0.5 * d, d).applyMatrix4(cam_to_world);
        // let right_top = new THREE.Vector3(0.75 * d, 0.5 * d, d).applyMatrix4(cam_to_world);
        // let right_bottom = new THREE.Vector3(0.75 * d, -0.5 * d, d).applyMatrix4(cam_to_world);

        // positions.push(...origin, ...left_top);
        // positions.push(...origin, ...left_bottom);
        // positions.push(...origin, ...right_top);
        // positions.push(...origin, ...right_bottom);
        // positions.push(...left_top, ...left_bottom);
        // positions.push(...left_top, ...right_top);
        // positions.push(...left_bottom, ...right_bottom);
        // positions.push(...right_top, ...right_bottom);
    }
}

export { get_world_from_cam, compute_average_camera_rotation };