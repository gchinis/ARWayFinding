import { artoolkit, ARController, ARCameraParam } from "../../app/artoolkit.js";
import { waitForEvent, loadImage } from "./helpers.js";

describe("jsartoolkit5 is running correctly", () => {
  beforeEach(() => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div id="imageContainer"></div>'
    );
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('imageContainer'));
  });

  const loadCameraParam = (url) => {
    return new Promise((resolve, reject) => {
      let param = new ARCameraParam(url, () => {
        resolve(param);
      });
    });
  };

  it("recognizes a marker on an image", (done) => {
    loadImage('marker_3x3_id20.jpg').then((imageElem) => {
      return loadCameraParam('/base/spec/testAssets/camera_para.dat').then((cameraParam) => {
        let controller = new ARController(640, 480, cameraParam);
        controller.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);
        controller.detectMarker(imageElem);
        expect(controller.getMarkerNum()).toBe(1);
        expect(controller.getMarker(0).id).toBe(20);
        done();
      });
    });
  });
});
