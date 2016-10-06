import "webrtc-adapter";
const THREE = require('three');
const Rx = require('rx') && require('rx-dom');
const TrackballControls = require('three-trackballcontrols');
import { artoolkit, ARController, ARCameraParam } from "./artoolkit.js";

import { makeMarkerDetector } from "./marker.js";
import { makeRobot } from "./robot.js";
import { makeLighting, makeRoom, multiMarkerDefs } from "./room.js";


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

const makeARView = (video, cameraProjectionMatrix) => {
  var renderer = new THREE.WebGLRenderer();
  renderer.autoClear = false;
  renderer.setClearColor(0xffffff);
  renderer.setSize(video.width, video.height);
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  var camera = new THREE.Camera();
  camera.matrixAutoUpdate = false;
  camera.projectionMatrix.copy(cameraProjectionMatrix);
  scene.add(camera);

  // To display the video, first create a texture from it.
  var videoTex = new THREE.Texture(video);

  videoTex.minFilter = THREE.LinearFilter;
  videoTex.flipY = false;

  // Then create a plane textured with the video.
  var videoPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    new THREE.MeshBasicMaterial({map: videoTex, side: THREE.DoubleSide})
  );

  // The video plane shouldn't care about the z-buffer.
  videoPlane.material.depthTest = false;
  videoPlane.material.depthWrite = false;

  // Create a camera and a scene for the video plane and
  // add the camera and the video plane to the scene.
  var videoCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
  var videoScene = new THREE.Scene();
  videoScene.add(videoPlane);
  videoScene.add(videoCamera);

  const updateFrame = (cameraTransform) => {
    renderer.clear();
    videoTex.needsUpdate = true;
    renderer.render(videoScene, videoCamera);
    renderer.render(scene, camera);

    if (cameraTransform) {
      camera.matrix.copy(cameraTransform);
    }
  };

  return { scene, updateFrame };
};

const makeDebugView = (video, scene) => {
  var debugRenderer = new THREE.WebGLRenderer();
  debugRenderer.autoClear = false;
  debugRenderer.setClearColor(0xffffff);
  debugRenderer.setSize(video.width, video.height);
  document.body.appendChild(debugRenderer.domElement);

  var debugScene = new THREE.Scene();

  var cameraPoseIndicator = new THREE.Object3D();
  cameraPoseIndicator.matrixAutoUpdate = false;
  cameraPoseIndicator.visible = false;
  debugScene.add(cameraPoseIndicator);

  var cameraAxes = createAxes();
  cameraAxes.scale.set(2, 2, 2);
  cameraPoseIndicator.add(cameraAxes);

  var debugCamera = new THREE.PerspectiveCamera(75, 4/3, 0.1, 1000);
  debugCamera.position.set(-0.4, 1.5, 0);
  debugScene.add(debugCamera);

  var controls = new TrackballControls(debugCamera, debugRenderer.domElement);
  controls.target.set(-1.2, 1.5, 0);
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.7;
  controls.panSpeed = 0.4;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  const updateFrame = (cameraTransform) => {
    controls.update();

    debugRenderer.clear();
    debugRenderer.render(scene, debugCamera);
    debugRenderer.render(debugScene, debugCamera);

    if (cameraTransform) {
      cameraPoseIndicator.matrix.copy(cameraTransform);
      cameraPoseIndicator.visible = true;
    } else {
      cameraPoseIndicator.visible = false;
    }
  };

  return { debugScene, updateFrame };
};

const makeAnimationFrameSource = (value) => {
  return Rx.Observable.generate(
    0,
    () => true,
    () => 0,
    () => value,
    Rx.Scheduler.requestAnimationFrame);
};

const makeCameraTransformsStream = (video, detectMarkers, markers) => {
  let seenMarkers = [];
  let lastTransform = new THREE.Matrix4();

  let rawTransforms = makeAnimationFrameSource(video)
        .map((video) => {
          seenMarkers = detectMarkers(video, seenMarkers);
          if (seenMarkers.length > 0) {
            lastTransform = seenMarkers[0].cameraTransform.clone().premultiply(markers[seenMarkers[0].id].matrixWorld);
          } else {
            seenMarkers = [];
          }
          return lastTransform;
        });

  return Rx.Observable.zip(
    rawTransforms,
    rawTransforms.skip(1),
    rawTransforms.skip(2),
    (t1, t2, t3) => {
      let average = new THREE.Matrix4();
      for (let i = 0; i < 16; i += 1) {
        average.elements[i] = (t1.elements[i] + t2.elements[i] + t3.elements[i]) / 3;
      }
      return average;
    });
};

const cameraLocationInScene = () => {
  let video = document.getElementById('v');

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment'
    }
  }).then((stream) => {
    video.src = window.URL.createObjectURL(stream);
    video.play();

    return makeMarkerDetector('camera/camera_para.dat', multiMarkerDefs);
  }).then(({detectMarkers, cameraProjectionMatrix}) => {
    let { room, lights, markers } = makeRoom(multiMarkerDefs);

    let { scene, updateFrame: updateARView } = makeARView(video, cameraProjectionMatrix);
    let { debugScene, updateFrame: updateDebugView } = makeDebugView(video, scene);

    var robot = makeRobot();
    robot.position.set(-3.25, 0, 0.7);
    scene.add(robot);

    scene.add(lights);

    debugScene.add(room);
    debugScene.add(lights.clone());

    let seenMarkers = [];

    let cameraTransforms = makeCameraTransformsStream(video, detectMarkers, markers);

    cameraTransforms.forEach(updateARView);
    cameraTransforms.forEach(updateDebugView);
 });
};

// TODO: Remove this when we integrate UI and 3D into a single entry point.
window.cameraLocationInScene = cameraLocationInScene;
