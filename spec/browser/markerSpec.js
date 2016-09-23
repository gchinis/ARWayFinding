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

  it("finds zero markers in a picture without markers", (done) => {
    return makeMarkerDetector(cameraParamUrl).then((detectMarkers) => {
      return loadImage('marker_no_markers.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).toBe(0);
        done();
      });
    }).catch(() => {
      done.fail("makeMarkerDetector failed");
    });
  });

  it("finds one marker in a picture", (done) => {
    return makeMarkerDetector(cameraParamUrl).then((detectMarkers) => {
      return loadImage('marker_3x3_id20.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).toBe(1);
        expect(markers[0].id).toBe(20);
        done();
      });
    }).catch(() => {
      done.fail("makeMarkerDetector failed");
    });
  });

  it("finds two markers in a picture", (done) => {
    return makeMarkerDetector(cameraParamUrl).then((detectMarkers) => {
      return loadImage('marker_3x3_id1_id2.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).toBe(2);
        expect(markers[0].id).toBe(19);
        expect(markers[1].id).toBe(2);
        done();
      });
    }).catch(() => {
      done.fail("makeMarkerDetector failed");
    });
  });

  // TODO: jsartoolkit5 apparently doesn't report errors correctly.
  xit("reports a failure if camera params can't be read", (done) => {
    return makeMarkerDetector('/base/spec/testAssets/marker_3x3_id20.jpg').then((detectMarkers) => {
      done.fail("No failure reported");
    }).catch(() => {
      done();
    });
  });
});

