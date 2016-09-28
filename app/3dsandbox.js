import "webrtc-adapter";
const THREE = require('three');
const TrackballControls = require('three-trackballcontrols');
import { artoolkit, ARController, ARCameraParam } from "./artoolkit.js";

const createAxes = () => {
  var axes = new THREE.Object3D();

  var coneX = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 1),
    new THREE.MeshLambertMaterial({
      color: 0xff0000,
      wireframe: false
    })
  );
  coneX.rotateZ(-Math.PI / 2);
  coneX.translateY(0.5);

  var coneY = new THREE.Mesh(
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
  coneZ.rotateX(-Math.PI / 2);
  coneZ.translateY(0.5);

  axes.add(coneX);
  axes.add(coneY);
  axes.add(coneZ);

  return axes;
};

const cameraLocationInScene = () => {
  var video = document.getElementById('v');

  var renderer = new THREE.WebGLRenderer();
  renderer.autoClear = false;
  renderer.setClearColor(0xffffff);
  renderer.setSize(video.width, video.height);
  document.body.appendChild(renderer.domElement);

  var debugRenderer = new THREE.WebGLRenderer();
  debugRenderer.autoClear = false;
  debugRenderer.setClearColor(0xffffff);
  debugRenderer.setSize(video.width, video.height);
  document.body.appendChild(debugRenderer.domElement);

  var scene = new THREE.Scene();

  var light = new THREE.PointLight(0xffffff);
  //light.position.set(30, 50, 50);
  light.position.set(0, 2, 0);
  scene.add(light);
  light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );
  //light = new THREE.PointLight(0xffffff);
  //light.position.set(-400, -500, -100);
  //scene.add(light);

  var room = new THREE.Object3D();
  scene.add(room);

  var walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 6, 5, 5, 5),
    //new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({
      color: 0x00ffff,
      wireframe: false,
      side: THREE.DoubleSide
    })
  );
  walls.position.y = 1.2;
  room.add(walls);

  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 8, 8),
    new THREE.MeshLambertMaterial({
      color: 0xcfcfcf,
      wireframe: false,
      side: THREE.DoubleSide
    })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  var pseudoMarker = new THREE.Object3D();
  var markerSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.08, 0.8, 1),
    new THREE.MeshLambertMaterial({
      color: 0xcf2828,
      wireframe: false
    })
  );
  pseudoMarker.add(markerSurface);
  pseudoMarker.rotation.y = Math.PI / 2;
  pseudoMarker.position.set(-1.98, 1.5, 0);
  room.add(pseudoMarker);

  var cameraPoseIndicator = new THREE.Object3D();
  cameraPoseIndicator.matrixAutoUpdate = false;
  cameraPoseIndicator.visible = false;
  scene.add(cameraPoseIndicator);
  //pseudoMarker.add(cameraPoseIndicator);

  var cameraAxes = createAxes();
  cameraAxes.scale.set(0.5, 0.5, 0.5);
  //cameraPoseIndicator.add(cameraAxes);

  var debugCamera = new THREE.PerspectiveCamera(75, 4/3, 0.1, 1000);
  debugCamera.position.set(-0.4, 1.5, 0);
  scene.add(debugCamera);

  var controls = new TrackballControls(debugCamera, debugRenderer.domElement);
  controls.target.set(-1.2, 1.5, 0);
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.7;
  controls.panSpeed = 0.4;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  //var camera = new THREE.PerspectiveCamera(45, 4/3, 0.1, 1000);
  var camera = new THREE.Camera();
  camera.matrixAutoUpdate = false;
  scene.add(camera);


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

      if (cameraPoseIndicator.visible) {
        arController.getTransMatSquareCont(
          i,
          1,
          artoolkitTransform,
          artoolkitTransform);
      } else {
        arController.getTransMatSquare(
          i,
          1,
          artoolkitTransform);
      }
      arController.transMatToGLMat(artoolkitTransform, glTransform);

      var markerTransform = new THREE.Matrix4().fromArray(glTransform);
      var cameraTransform = new THREE.Matrix4().getInverse(markerTransform);

      cameraTransform.premultiply(new THREE.Matrix4().makeScale(0.08, 0.08, 0.08));
      cameraTransform.premultiply(pseudoMarker.matrixWorld);

      camera.matrix.copy(cameraTransform);
      cameraPoseIndicator.matrix.copy(cameraTransform);

      //console.log(new THREE.Vector4(0, 0, 0, 1).applyMatrix4(cameraTransform));

      cameraPoseIndicator.visible = true;
    } else {
      cameraPoseIndicator.visible = false;
    }

    arController.debugDraw();

    controls.update();

    // Render the scene.
    renderer.clear();
    renderer.render(scene, camera);
    debugRenderer.clear();
    debugRenderer.render(scene, debugCamera);
  }

  tick();

  var cameraParam = new ARCameraParam();
  cameraParam.onload = function() {
    arController = new ARController(320, 240, cameraParam);
    arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);
    //arController.debugSetup();

    var cameraMat = arController.getCameraMatrix();
    camera.projectionMatrix.elements.set(cameraMat);
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

      markerRoot.add(createAxes());
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

// TODO: Remove this when we integrate UI and 3D into a single entry point.
window.objectOnMarker = objectOnMarker;
window.cameraLocationInScene = cameraLocationInScene;
