import "webrtc-adapter";
const THREE = require('three');
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
  coneZ.rotateX(Math.PI / 2);
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
  var scene = new THREE.Scene();

  var axes = createAxes();
  axes.scale.set(1, 1, 1);
  scene.add(axes);

  renderer.setSize(video.width, video.height);

  document.body.appendChild(renderer.domElement);

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
    new THREE.BoxGeometry(4, 2.4, 6, 5, 5, 5),
    //new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({
      color: 0x00ffff,
      wireframe: false,
      side: THREE.DoubleSide
    })
  );
  walls.position.y = 1.15;
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

  var marker = new THREE.Object3D();
  marker.rotation.x = -Math.PI / 2;
  //createAxes(marker);
  room.add(marker);

  var camera = new THREE.PerspectiveCamera(40, 4/3, 0.1, 1000);
  //var camera = new THREE.Camera();
  //camera.matrixAutoUpdate = false;
  //camera.position.set(10, 6, 10);
  camera.position.set(2, 1.5, 3);
  camera.lookAt(new THREE.Vector3(0, 1.5, 0));
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

      if (marker.visible) {
        arController.getTransMatSquareCont(
          i,
          0.07,
          artoolkitTransform,
          artoolkitTransform);
      } else {
        arController.getTransMatSquare(
          i,
          0.07,
          artoolkitTransform);
      }
      arController.transMatToGLMat(artoolkitTransform, glTransform);
      //marker.matrix.elements.set(glTransform);

      marker.visible = true;
    } else {
      marker.visible = false;
    }

    arController.debugDraw();

    // Render the scene.
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
    //camera.projectionMatrix.elements.set(camera_mat);
    //camera.projectionMatrix.multiply(new THREE.Matrix4().makeScale(1, 1, -1));
    console.log(new THREE.Vector3().set(0, 0, -1).unproject(camera).z,
                new THREE.Vector3().set(0, 0, 1).unproject(camera).z);
    //[camera.position.x, camera.position.y, camera.position.z] = [10, 10, 10];
    //camera.rotation.x = -Math.PI / 2;
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
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
