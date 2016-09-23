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

// Adds an image element to the DOM (inside a preexisting element with
// id imageContainer) for the given image (name relative to asset
// directory), and waits for the image to load. Returns a promise that
// resolves to the image element.
const baseImagePath = '/base/spec/testAssets/';
const loadImage = (fileName) => {
  return new Promise((resolve, reject) => {
    const imageElem = document.createElement('img');
    imageElem.setAttribute('width', '640');
    imageElem.setAttribute('height', '480');

    let listener = () => {
      imageElem.removeEventListener('load', listener);
      resolve(imageElem);
    };
    imageElem.addEventListener('load', listener);

    document.getElementById('imageContainer').appendChild(imageElem);

    imageElem.setAttribute('src', `/base/spec/testAssets/${fileName}`);
  });
};


export {
  waitForEvent,
  loadImage
};
