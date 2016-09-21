
describe("markers", () => {
  it("recognizes a given marker", function() {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<img id="marker" src="/base/spec/testAssets/marker1.jpg"></img>'
    );
    const marker = '/base/spec/testAssets/marker1.jpg';
    expect(document.getElementById('marker')).not.toBe(undefined);
  });
});
