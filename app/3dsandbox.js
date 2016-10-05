import "webrtc-adapter";
const THREE = require('three');
const TrackballControls = require('three-trackballcontrols');
import { artoolkit, ARController, ARCameraParam } from "./artoolkit.js";

import { makeMarkerDetector } from "./marker.js";


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

const makeLighting = function* () {
  var light = new THREE.PointLight(0xffffff);
  //light.position.set(30, 50, 50);
  light.position.set(0, 2, 0);
  yield light;

  light = new THREE.AmbientLight( 0x404040 ); // soft white light
  yield light;
  //light = new THREE.PointLight(0xffffff);
  //light.position.set(-400, -500, -100);
  //scene.add(light);
};

const makeRoom = () => {
  let objects = [], markers = [];

  let room = new THREE.Object3D();
  objects.push(room);

  let walls = new THREE.Mesh(
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

  let ground = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 8, 8),
    new THREE.MeshLambertMaterial({
      color: 0xcfcfcf,
      wireframe: false,
      side: THREE.DoubleSide
    })
  );
  ground.rotation.x = -Math.PI / 2;
  objects.push(ground);

  let pseudoMarker = new THREE.Object3D();
  let markerSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.08, 0.8, 1),
    new THREE.MeshLambertMaterial({
      color: 0xcf2828,
      wireframe: false
    })
  );
  pseudoMarker.add(markerSurface);
  //pseudoMarker.add(createAxes());
  pseudoMarker.rotation.y = Math.PI / 2;
  pseudoMarker.position.set(-1.98, 1.5, 0);
  room.add(pseudoMarker);
  markers.push(pseudoMarker);

  return [objects, markers];
};

const makeRobot = () => {
  var robot = new THREE.Object3D();

  var robotBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.4, 15, 10),
    new THREE.MeshLambertMaterial({
      color: 0xcf2828,
      wireframe: false
    })
  );
  robotBody.position.y = 0.2;
  robot.add(robotBody);

  var robotHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 15),
    new THREE.MeshLambertMaterial({
      color: 0xcf2828,
      wireframe: false
    })
  );
  robotHead.position.y = 0.4;
  robot.add(robotHead);

  return robot;
};

const addElements = (container, elements) => {
  for (let element of elements) {
    container.add(element);
  }
};

const cameraLocationInScene = () => {
  let video = document.getElementById('v');

  var renderer = new THREE.WebGLRenderer();
  renderer.autoClear = false;
  renderer.setClearColor(0xffffff);
  renderer.setSize(video.width, video.height);
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  var robot = makeRobot();
  robot.position.set(-1.2, 0, 0);
  scene.add(robot);

  addElements(scene, makeLighting());

  var camera = new THREE.Camera();
  camera.matrixAutoUpdate = false;
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


  var debugRenderer = new THREE.WebGLRenderer();
  debugRenderer.autoClear = false;
  debugRenderer.setClearColor(0xffffff);
  debugRenderer.setSize(video.width, video.height);
  document.body.appendChild(debugRenderer.domElement);

  var debugScene = new THREE.Scene();

  let [roomObjects, markers] = makeRoom();
  addElements(debugScene, roomObjects);
  addElements(debugScene, makeLighting());

  var cameraPoseIndicator = new THREE.Object3D();
  cameraPoseIndicator.matrixAutoUpdate = false;
  cameraPoseIndicator.visible = false;
  debugScene.add(cameraPoseIndicator);

  var cameraAxes = createAxes();
  cameraAxes.scale.set(2, 2, 2);
  cameraPoseIndicator.add(cameraAxes);

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


  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment'
    }
  }).then((stream) => {
    video.src = window.URL.createObjectURL(stream);
    video.play();

    return makeMarkerDetector('camera/camera_para.dat', [{ id: 2, size: 0.08 }]);
  }).then(({detectMarkers, cameraProjectionMatrix}) => {
    camera.projectionMatrix.copy(cameraProjectionMatrix);

    function tick() {
      requestAnimationFrame(tick);

      let seenMarkers = detectMarkers(video);
      if (seenMarkers.length > 0) {
        let cameraTransform = seenMarkers[0].cameraTransform.clone()
              .premultiply(markers[0].matrixWorld);

        camera.matrix.copy(cameraTransform);
        cameraPoseIndicator.matrix.copy(cameraTransform);

        cameraPoseIndicator.visible = true;
      } else {
        cameraPoseIndicator.visible = false;
      }

      //arController.debugDraw();

      controls.update();

      renderer.clear();
      videoTex.needsUpdate = true;
      renderer.render(videoScene, videoCamera);
      renderer.render(scene, camera);

      debugRenderer.clear();
      debugRenderer.render(scene, debugCamera);
      debugRenderer.render(debugScene, debugCamera);
    }

    tick();
  });
};

// TODO: Remove this when we integrate UI and 3D into a single entry point.
window.cameraLocationInScene = cameraLocationInScene;
