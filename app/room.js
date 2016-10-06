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

const oneMarkerDefs = [
  { id: 2,
    size: 0.21,
    position: [-4.24, 1.5, 2],
    orientation: Math.PI / 2,
    color: 0x087026
  }
];

const makeRoom = (markerDefs) => {
  let room = new THREE.Object3D();

  let walls = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 2.5, 13, 10, 10, 10),
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

  let markers = [];
  markerDefs.forEach((markerDef) => {
    let marker = new THREE.Object3D();
    let markerSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(markerDef.size, markerDef.size, 1, 1),
      new THREE.MeshLambertMaterial({
        color: markerDef.color,
        wireframe: false
      })
    );
    marker.add(markerSurface);
    marker.rotation.y = markerDef.orientation;
    marker.position.set(markerDef.position[0], markerDef.position[1], markerDef.position[2]);
    room.add(marker);

    markers[markerDef.id] = marker;
  });

  return { room, lights: makeLighting(), markers };
};


export {
  oneMarkerDefs,
  makeRoom
}
