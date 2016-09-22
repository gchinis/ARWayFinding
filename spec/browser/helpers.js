// Wait for an event to fire once on the given object.
const waitForEvent = (eventTarget, eventType) => {
  return new Promise((resolve, reject) => {
    let listener = (...args) => {
      eventTarget.removeEventListener(eventType, listener);
      resolve(...args);
    };
    eventTarget.addEventListener(eventType, listener);
  });
};

// Adds an image element to the DOM for the given image (name relative
// to asset directory), and waits for the image to load. Returns a
// promise that resolves to the image element.
const baseImagePath = '/base/spec/testAssets/';
const loadImage = (fileName) => {
  document.body.insertAdjacentHTML(
    'afterbegin',
    '<img width="640" height="480" id="marker" src="/base/spec/testAssets/marker_3x3_id21.jpg"></img>'
  );

  let imageElem = document.getElementById('marker');
  expect(imageElem).not.toBe(undefined);

  return waitForEvent(imageElem, 'load').then(() => {
    console.log("loaded");
    return Promise.resolve(imageElem);
  });
};


export {
  waitForEvent,
  loadImage
};
