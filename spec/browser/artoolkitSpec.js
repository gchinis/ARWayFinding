import { artoolkit, ARController, ARCameraParam } from "../../app/artoolkit.js";
import { waitForEvent } from "./helpers.js";

describe("jsartoolkit5 is running correctly", () => {
  const loadCameraParam = (url) => {
    return new Promise((resolve, reject) => {
      let param = new ARCameraParam(url, () => {
        resolve(param);
      });
    });
  };

  it("recognizes a marker on an image", (done) => {
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
