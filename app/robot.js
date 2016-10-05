const THREE = require('three');


const makeRobot = () => {
  const robotColor = 0xe54230;
  const robotRadius = 0.25;
  const bodyHeight = 0.4;
  const eyeRadius = 0.05;

  var robot = new THREE.Object3D();

  var robotBody = new THREE.Mesh(
    new THREE.CylinderGeometry(robotRadius, robotRadius, bodyHeight, 15, 10, true),
    new THREE.MeshLambertMaterial({
      color: robotColor,
      wireframe: false
    })
  );
  robotBody.position.y = 0.2;
  robot.add(robotBody);

  var robotHead = new THREE.Mesh(
    new THREE.SphereGeometry(robotRadius, 15, 15, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({
      color: robotColor,
      wireframe: false
    })
  );
  robotHead.position.y = bodyHeight;
  robot.add(robotHead);

  var robotEye1 = new THREE.Mesh(
    new THREE.SphereGeometry(eyeRadius, 5),
    new THREE.MeshLambertMaterial({
      color: 0x000000,
      wireframe: false
    })
  );
  robotEye1.translateY(bodyHeight);
  robotEye1.rotateY(-Math.PI / 6);
  robotEye1.rotateZ(Math.PI / 8);
  robotEye1.translateX(robotRadius);
  robot.add(robotEye1);

  var robotEye2 = new THREE.Mesh(
    new THREE.SphereGeometry(eyeRadius, 5),
    new THREE.MeshLambertMaterial({
      color: 0x000000,
      wireframe: false
    })
  );
  robotEye2.translateY(bodyHeight);
  robotEye2.rotateY(Math.PI / 6);
  robotEye2.rotateZ(Math.PI / 8);
  robotEye2.translateX(robotRadius);
  robot.add(robotEye2);

  return robot;
};


export {
  makeRobot
};
