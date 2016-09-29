const THREE = require('three');

import { makeMarkerDetector } from "../../app/marker.js";

import { expect } from "chai";

import { testPromise, loadImage } from "./helpers.js";


describe("Marker recognition", () => {
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
  const markerDefinitions = [
    { id: 2, size: 0.08 },
    { id: 19, size: 0.15 },
    { id: 20, size: 0.10 }
  ];

  const determineCameraPosition = (cameraTransform) => {
    return new THREE.Vector4(0, 0, 0, 1).applyMatrix4(cameraTransform);
  };

  it("finds zero markers in a picture without markers", testPromise(() => {
    return makeMarkerDetector(cameraParamUrl, markerDefinitions).then((detectMarkers) => {
      return loadImage('marker_no_markers.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).to.equal(0);
      });
    });
  }));

  it("finds one marker in a picture", testPromise(() => {
    return makeMarkerDetector(cameraParamUrl, markerDefinitions).then((detectMarkers) => {
      return loadImage('marker_3x3_id20.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).to.equal(1);
        expect(markers[0].id).to.equal(20);
      });
    });
  }));

  it("finds two markers in a picture", testPromise(() => {
    return makeMarkerDetector(cameraParamUrl, markerDefinitions).then((detectMarkers) => {
      return loadImage('marker_3x3_id1_id2.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).to.equal(2);
        expect(markers.some((m) => m.id === 19)).to.equal(true);
        expect(markers.some((m) => m.id === 2)).to.equal(true);
      });
    });
  }));

  it("finds only one marker in a picture with more markers", testPromise(() => {
    return makeMarkerDetector(cameraParamUrl, [markerDefinitions[0]]).then((detectMarkers) => {
      return loadImage('marker_3x3_id1_id2.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).to.equal(1);
        expect(markers[0].id).to.equal(2);
      });
    });
  }));

  it("determines right camera position when marker is seen from front", testPromise(() => {
    return makeMarkerDetector(cameraParamUrl, markerDefinitions).then((detectMarkers) => {
      return loadImage('marker_3x3_seen_from_front.jpg').then((image) => {
        let markers = detectMarkers(image);
        expect(markers.length).to.equal(1);
        expect(markers[0].id).to.equal(2);

        var cameraPos = determineCameraPosition(markers[0].cameraTransform);
        expect(cameraPos.x).to.be.within(-0.2, 0.2);
        expect(cameraPos.y).to.be.within(-0.2, 0.2);
        expect(cameraPos.z).to.be.within(0.2, 0.4);
      });
    });
  }));

  // TODO: jsartoolkit5 apparently doesn't report errors correctly.
  xit("reports a failure if camera params can't be read", (done) => {
    return makeMarkerDetector('/base/spec/testAssets/marker_3x3_id20.jpg', markers).then((detectMarkers) => {
      done.fail("No failure reported");
    }).catch(() => {
      done();
    });
  });
});

