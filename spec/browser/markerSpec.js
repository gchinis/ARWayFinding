import "chai";

import { makeMarkerDetector } from "../../app/marker.js";

import { loadImage } from "./helpers.js";


describe("Markers are recognized as part of arbitrary pictures", () => {
  beforeEach(() => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div id="imageContainer"></div>'
    );
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('imageContainer'));
  });

  const cameraParamUrl = '/base/spec/testAssets/camera_para.dat';

  it("finds one marker in a picture", (done) => {
    return makeMarkerDetector(cameraParamUrl).then((detectMarkers) => {
      return loadImage('marker_3x3_id20.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).toBe(1);
        expect(markers[0].id).toBe(20);
        done();
      });
    }).catch(() => {
      done();
    });
  });

  it("finds two markers in a picture", (done) => {
    return makeMarkerDetector(cameraParamUrl).then((detectMarkers) => {
      return loadImage('marker_3x3_id1_id2.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).toBe(2);
        expect(markers[0].id).toBe(1);
        expect(markers[0].id).toBe(2);
        done();
      });
    }).catch(() => {
      done();
    });
  });
});

