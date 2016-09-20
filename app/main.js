var THREE = require('three');

require('./3dparty/jsartoolkit5/js/artoolkit.api.js');
var {artoolkit, ARController, ARCameraParam} = require("exports?window.ARController&window.artoolkit&window.ARCameraParam!./3dparty/jsartoolkit5/js/artoolkit.three.js");
console.log(ARController.getUserMediaThreeScene);

window.THREE = THREE;
window.ARThreeOnLoad = function() {
	ARController.getUserMediaThreeScene({
    maxARVideoSize: 320,
    cameraParam: '3dparty/jsartoolkit5/Data/camera_para-iPhone 5 rear 640x480 1.0m.dat',
    onSuccess: function(arScene, arController, arCamera) {

  		document.body.className = arController.orientation;

  		arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);

  		var renderer = new THREE.WebGLRenderer({antialias: true});
  		if (arController.orientation === 'portrait') {
  			var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
  			var h = window.innerWidth;
  			renderer.setSize(w, h);
  			renderer.domElement.style.paddingBottom = (w-h) + 'px';
  		} else {
  			if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
  				renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
  			} else {
  				renderer.setSize(arController.videoWidth, arController.videoHeight);
  				document.body.className += ' desktop';
  			}
  		}

  		document.body.insertBefore(renderer.domElement, document.body.firstChild);

  		// See /doc/patterns/Matrix code 3x3 (72dpi)/20.png
  		var markerRoot = arController.createThreeBarcodeMarker(20);

  		var sphere = new THREE.Mesh(
  			new THREE.SphereGeometry(0.5, 8, 8),
  			new THREE.MeshNormalMaterial()
  		);
  		sphere.material.shading = THREE.FlatShading;
  		sphere.position.z = 0.5;
  		markerRoot.add(sphere);
  		arScene.scene.add(markerRoot);

  		var rotationV = 0;
  		var rotationTarget = 0;

  		renderer.domElement.addEventListener('click', function(ev) {
  			ev.preventDefault();
  			rotationTarget += 1;
  		}, false);

  		var tick = function() {
  			arScene.process();
  			arScene.renderOn(renderer);
  			rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
  			sphere.rotation.z += rotationV;
  			rotationV *= 0.8;

  			requestAnimationFrame(tick);
  		};

  		tick();
    }
  });

	delete window.ARThreeOnLoad;

};
