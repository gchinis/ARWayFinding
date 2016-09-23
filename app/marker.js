// Marker recognition functions.

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

const makeMarkerDetector = (cameraParamUrl) => {
  return loadCameraParam(cameraParamUrl).then((cameraParam) => {
    const controller = new ARController(640, 480, cameraParam);
    controller.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);

    return (imageElem) => {
      controller.detectMarker(imageElem);
      let result = [];
      let totalMarkers = controller.getMarkerNum();
      for (let i = 0; i < totalMarkers; i += 1) {
        result.push(controller.cloneMarkerInfo(controller.getMarker(i)));
      }
      return result;
    };
  });
};


export {
  makeMarkerDetector
};
