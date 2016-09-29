// Marker recognition functions.

const Promise = require("bluebird");
const THREE = require("three");

import { artoolkit, ARController, ARCameraParam } from "./artoolkit.js";

const loadCameraParam = (url) => {
  return new Promise((resolve, reject) => {
    let param = new ARCameraParam(
      url,
      () => { console.log("param loading succeded"); resolve(param); },
      () => { console.log("param loading failed"); reject(); }
    );
  });
};

const makeMarkerDetector = (cameraParamUrl, markerDefinitions) => {
  return loadCameraParam(cameraParamUrl).then((cameraParam) => {
    const controller = new ARController(640, 480, cameraParam);
    controller.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);

    const markerToDef = [];
    for (let m of markerDefinitions) {
      markerToDef[m.id] = m;
    }

    return (imageElem) => {
      controller.detectMarker(imageElem);
      let detectedMarkers = [];
      let totalMarkers = controller.getMarkerNum();
      for (let i = 0; i < totalMarkers; i += 1) {
        let markerInfo = controller.cloneMarkerInfo(controller.getMarker(i));
        let markerDef = markerToDef[markerInfo.id];
        if (markerDef !== undefined) {
          let artoolkitTransform = new Float32Array(12);
          let glTransform = new Float32Array(16);

          controller.getTransMatSquare(i, 1, artoolkitTransform);
          controller.transMatToGLMat(artoolkitTransform, glTransform);

          let markerTransform = new THREE.Matrix4().fromArray(glTransform);
          let cameraTransform = new THREE.Matrix4().getInverse(markerTransform);

          cameraTransform.premultiply(new THREE.Matrix4().makeScale(
            markerDef.size, markerDef.size, markerDef.size
          ));

          detectedMarkers.push({
            id: markerInfo.id,
            cameraTransform: cameraTransform
          });
        }
      }
      return detectedMarkers;
    };
  });
};


export {
  makeMarkerDetector
};
