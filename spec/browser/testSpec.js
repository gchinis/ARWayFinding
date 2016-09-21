import "babel-polyfill";

import { artoolkit, ARController, ARCameraParam } from "../../app/artoolkit.js";

describe("markers", () => {
  // Wait for an event to fire once on the given object.
  const waitForEvent = (eventTarget, eventType) => {
    return new Promise((resolve, reject) => {
      let listener = (...args) => {
        eventTarget.removeEventListener(eventType, listener);
        resolve(...args);
      };
      eventTarget.addEventListener(eventType, listener);
    });
  };

  const loadCameraParam = (url) => {
    return new Promise((resolve, reject) => {
      let param = new ARCameraParam(url, () => {
        resolve(param);
      });
    });
  };

  it("recognizes a given marker", (done) => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<img width="640" height="480" id="marker" src="/base/spec/testAssets/marker_3x3_id21.jpg"></img>'
    );

    let imageElem = document.getElementById('marker');
    expect(imageElem).not.toBe(undefined);
    waitForEvent(imageElem, 'load').then(() => {
      return loadCameraParam('/base/spec/testAssets/camera_para.dat');
    }).then((cameraParam) => {
      let controller = new ARController(640, 480, cameraParam);
      controller.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);
      controller.detectMarker(imageElem);
      expect(controller.getMarkerNum()).toBe(1);
      expect(controller.getMarker(0).id).toBe(20);
      done();
    });
  });
});
