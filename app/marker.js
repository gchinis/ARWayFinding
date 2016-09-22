// Marker recognition functions.

const makeMarkerDetector = (cameraParamUrl) => {
  // Dummy.
  return Promise.resolve((image) => {
    return [
      {
        id: 56
      },
      {
        id: 48
      },
      {
        id: 12
      },
      {
        id: 5
      },
      {
        id: 25
      },
    ];
  });
};


export {
  makeMarkerDetector
};
