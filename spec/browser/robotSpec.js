const THREE = require('three');
import { expect } from "chai";

import { makeRobot } from "../../app/robot.js";


describe("Robot 3D object", () => {
  it("is properly created", () => {
    const robot = makeRobot();

    expect(robot).to.be.an.instanceof(THREE.Object3D);
    expect(robot.children).to.not.be.empty;
  });
});
