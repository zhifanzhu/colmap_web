/**
 * 
 * @param {string} path containing vid (e.g. P01_01) and frame (10 digit)
 * @returns {string} vid_frame
 */
function epickitchens_frame(name) {
  const vid = /P\d{2,}_\d{2,3}/.exec(name)[0];
  const frame = /\d{10,}/.exec(name)[0];
  return `${vid}_${frame}`;
}

export { epickitchens_frame };