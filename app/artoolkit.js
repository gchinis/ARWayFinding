// Wrapper module for jsartoolkit5.

var THREE = require('three');

require("script!./3dparty/jsartoolkit5/build/artoolkit.debug.js");
require("script!./3dparty/jsartoolkit5/js/artoolkit.api.js");

window.THREE = THREE;
require("script!./3dparty/jsartoolkit5/js/artoolkit.three.js");
//delete window.THREE;

var [artoolkit, ARController, ARCameraParam] = [
  window.artoolkit,
  window.ARController,
  window.ARCameraParam
];

//delete window.artoolkit, window.ARController, window.ARCameraParam;

export { artoolkit, ARController, ARCameraParam };
