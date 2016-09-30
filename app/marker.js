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

    const markerDefsById = [];
    for (let m of markerDefinitions) {
      markerDefsById[m.id] = m;
    }

    const makeCameraTransform = (markerIndex, markerSize, previousArtoolkitTransform) => {
      let artoolkitTransform = new Float32Array(12);
      controller.getTransMatSquare(markerIndex, 1, artoolkitTransform);
      if (previousArtoolkitTransform) {
        controller.getTransMatSquareCont(markerIndex, 1, previousArtoolkitTransform, artoolkitTransform);
      } else {
        controller.getTransMatSquare(markerIndex, 1, artoolkitTransform);
      }

      let glTransform = new Float32Array(16);
      controller.transMatToGLMat(artoolkitTransform, glTransform);

      let markerTransform = new THREE.Matrix4().fromArray(glTransform);
      let cameraTransform = new THREE.Matrix4().getInverse(markerTransform);

      cameraTransform.premultiply(new THREE.Matrix4().makeScale(
        markerSize, markerSize, markerSize
      ));

      return [artoolkitTransform, cameraTransform];
    };

    const getDetectedMarkerInfo = function* () {
      let markerCount = controller.getMarkerNum();
      for (let markerIndex = 0; markerIndex < markerCount; markerIndex += 1) {
        yield [markerIndex, controller.cloneMarkerInfo(controller.getMarker(markerIndex))];
      }
    };

    const getDetectedMarkerDefs = function* () {
      for (let [markerIndex, markerInfo] of getDetectedMarkerInfo()) {
        let markerDef = markerDefsById[markerInfo.id];
        if (markerDef !== undefined) {
          yield [markerIndex, markerInfo, markerDef];
        }
      }
    };

    const makeDetectedMarkerResults = function* (previousMarkers) {
      let previousMarkersById = [];
      if (previousMarkers) {
        for (let marker of previousMarkers) {
          previousMarkersById[marker.id] = marker;
        }
      }

      for (let [markerIndex, markerInfo, markerDef] of getDetectedMarkerDefs()) {
        let [artoolkitTransform, cameraTransform] = makeCameraTransform(markerIndex, markerDef.size,
                                                                        previousMarkersById[markerInfo.id]);
        yield {
          id: markerInfo.id,
          cameraTransform: cameraTransform,
          artoolkitTransform: artoolkitTransform
        };
      }
    };

    var cameraProjectionMatrix = new THREE.Matrix4();
    cameraProjectionMatrix.elements.set(controller.getCameraMatrix());

    return Promise.resolve({
      detectMarkers: (imageElem, previousMarkers) => {
        controller.detectMarker(imageElem);
        return Array.from(makeDetectedMarkerResults(previousMarkers));
      },
      cameraProjectionMatrix
    });
  });
};


export {
  makeMarkerDetector
};
