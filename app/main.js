import "webrtc-adapter";
const THREE = require('three');
import { artoolkit, ARController, ARCameraParam } from "./artoolkit.js";

const createAxes = (parentObject) => {
  var coneX = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 1),
	  new THREE.MeshLambertMaterial({
      color: 0xff0000,
      wireframe: false
    })
  );
  coneX.rotateZ(Math.PI / 2);
  coneX.translateY(0.5);

  var coneY = new THREE.Mesh(
	  //new THREE.BoxGeometry(1,1,1),
    new THREE.ConeGeometry(0.1, 1),
	  new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      wireframe: false
    })
  );
  coneY.translateY(0.5);

  var coneZ = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 1),
	  new THREE.MeshLambertMaterial({
      color: 0x0000ff,
      wireframe: false
    })
  );
  coneZ.rotateX(Math.PI / 2);
  coneZ.translateY(0.5);

  parentObject.add(coneX);
  parentObject.add(coneY);
  parentObject.add(coneZ);
};

const cameraLocationInScene = () => {
  var cMat = new THREE.Matrix4();
  var tMat = new THREE.Matrix4();

  var video = document.getElementById('v');

  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xffffff);
  var scene = new THREE.Scene();

  renderer.setSize(video.width, video.height);

  document.body.appendChild(renderer.domElement);

  // Create a camera and a marker root object for your Three.js scene.
  var camera = new THREE.Camera();
  scene.add(camera);

  var light = new THREE.PointLight(0xffffff);
  light.position.set(400, 500, 100);
  scene.add(light);
  light = new THREE.PointLight(0xffffff);
  light.position.set(-400, -500, -100);
  scene.add(light);

  var markerRoot = new THREE.Object3D();
  markerRoot.matrixAutoUpdate = false;

  markerRoot.wasVisible = false;
  markerRoot.markerMatrix = new Float64Array(12);
  markerRoot.matrixAutoUpdate = false;
  camera.matrixAutoUpdate = false;

  createAxes(markerRoot);

  // Add the marker root to your scene.
  scene.add(markerRoot);
  var arController = null;

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment'
    }
  }).then((stream) => {
    video.src = window.URL.createObjectURL(stream);
    video.play();
  });

  var artoolkitTransform = new Float32Array(12);
  var glTransform = new Float32Array(16);

  // On every frame do the following:
  function tick() {
	  requestAnimationFrame(tick);

	  if (!arController) {
		  return;
	  }

	  arController.detectMarker(video);
	  var markerNum = arController.getMarkerNum();
    var markerInfo;
    for (var i = 0; i < markerNum; i++) {
			markerInfo = arController.getMarker(i);
      if (markerInfo.id === 2) {
        break;
      }
    }
    if (i === markerNum) {
      markerInfo = null;
    }

	  if (markerInfo) {
			if (markerInfo.dir !== markerInfo.dirPatt) {
			  arController.setMarkerInfoDir(i, markerInfo.dirMatrix);
      }

		  if (markerRoot.visible) {
			  arController.getTransMatSquareCont(
          i,
          1,
          artoolkitTransform,
          artoolkitTransform);
		  } else {
			  arController.getTransMatSquare(
          i /* Marker index */,
          1 /* Marker width */,
          artoolkitTransform);
		  }
      arController.transMatToGLMat(artoolkitTransform, glTransform);
      markerRoot.matrix.elements.set(glTransform);

		  markerRoot.visible = true;
	  } else {
		  markerRoot.visible = false;
	  }

	  arController.debugDraw();

	  // Render the scene.
	  renderer.autoClear = false;
	  renderer.clear();
	  renderer.render(scene, camera);
  }

  tick();

  var cameraParam = new ARCameraParam();
  cameraParam.onload = function() {
	  arController = new ARController(320, 240, cameraParam);
    arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);
	  arController.debugSetup();

	  var camera_mat = arController.getCameraMatrix();

	  camera.projectionMatrix.elements.set(camera_mat);

  };
  cameraParam.load('3dparty/jsartoolkit5/Data/camera_para.dat');
};


const objectOnMarker = () => {
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

      var light = new THREE.PointLight(0xffffff);
      light.position.set(400, 500, 100);
      arScene.scene.add(light);
      light = new THREE.PointLight(0xffffff);
      light.position.set(-400, -500, -100);
      arScene.scene.add(light);

      // See /doc/patterns/Matrix code 3x3 (72dpi)/20.png
      var markerRoot = arController.createThreeBarcodeMarker(2);

      // var sphere = new THREE.Mesh(
      //   new THREE.SphereGeometry(0.5, 8, 8),
      //   new THREE.MeshNormalMaterial()
      // );
      // sphere.material.shading = THREE.FlatShading;
      // sphere.position.z = 0.5;
      // markerRoot.add(sphere);

      createAxes(markerRoot);
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
        //rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
        //sphere.rotation.z += rotationV;
        rotationV *= 0.8;

        requestAnimationFrame(tick);
      };

      tick();
    }
  });
};


//objectOnMarker();
cameraLocationInScene();
