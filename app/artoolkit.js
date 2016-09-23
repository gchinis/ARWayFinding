// Wrapper module for jsartoolkit5.
//
// This module imports jsartoolkit5's Javascript files and offers
// their public symbols as regular module exports. It requieres quite
// a bit of Webpack hackery to work at all.

if (!window.artoolkit) {
  var THREE = require('three');

  // The main module is translated from C using emscripten and has to be
  // included in pristine form to work at all, hence the "script"
  // loader.
  require("script!./3dparty/jsartoolkit5/build/artoolkit.debug.js");

  require("./3dparty/jsartoolkit5/js/artoolkit.api.js");

  // In order for this module to run its initialization function, THREE
  // must be avaiable globally.
  window.THREE = THREE;
  require("imports?THREE=three&artoolkit=>window.artoolkit&ARController=>window.ARController&ARCameraParam=>window.ARCameraParam!./3dparty/jsartoolkit5/js/artoolkit.three.js");
  delete window.THREE;
}

// Retrieve the exported variables from the window object.
var [artoolkit, ARController, ARCameraParam] = [
  window.artoolkit,
  window.ARController,
  window.ARCameraParam
];

// Remove the names from the global namespace.
//
// FIXME: The artoolkit name can't be eliminated because it's
// referenced by functions in the main artoolkit file although it's
// only defined in the api file.
// delete window.artoolkit;
//delete window.ARController;
//delete window.ARCameraParam;

export { artoolkit, ARController, ARCameraParam };
