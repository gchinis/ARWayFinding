const THREE = require('three');


const makeLighting = () => {
  let lights = new THREE.Object3D();

  var light1 = new THREE.PointLight(0xffffff);
  light1.position.set(0, 2, 0);
  lights.add(light1);

  let light2 = new THREE.AmbientLight( 0x404040 ); // soft white light
  lights.add(light2);

  return lights;
};

const makeRoom = () => {
  let markers = [];

  let room = new THREE.Object3D();

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
  room.add(ground);

  let pseudoMarker = new THREE.Object3D();
  let markerSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(0.21, 0.21, 0.8, 1),
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

  return { room, lights: makeLighting(), markers };
};


export {
  makeRoom
}
