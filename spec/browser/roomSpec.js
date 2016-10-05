const THREE = require('three');
import { expect } from "chai";

import { makeRoom } from "../../app/room.js";


describe("Room 3D object", () => {
  it("is properly created", () => {
    const { room, lights, markers } = makeRoom();

    expect(room).to.be.an.instanceof(THREE.Object3D);
    expect(room.children).to.not.be.empty;
    expect(lights.children).to.not.be.empty;
    expect(markers).to.not.be.empty;
  });
});
