let chromaKey = function(videoElem, context2D1, context2D2,
                         width, height) {
  context2D1.drawImage(videoElem, 0, 0, width, height);
  let frame = context2D1.getImageData(0, 0, width, height);
  let l = frame.data.length / 4;

  for (let i = 0; i < l; i++) {
    let r = frame.data[i * 4 + 0];
    let g = frame.data[i * 4 + 1];
    let b = frame.data[i * 4 + 2];
    if (g < 50 && r > 100 && b < 50)
      frame.data[i * 4 + 3] = 0;
  }
  context2D2.putImageData(frame, 0, 0);
  return;
};

let setUpAnimationFrame = function (videoElem, context2D1, context2D2,
                                    width, height) {
  let animationCallback = function() {
    if (videoElem.paused || videoElem.ended) {
      return;
    }

    chromaKey(videoElem, context2D1, context2D2, width, height);

    // TODO: Use requestAnimationFrame.
    setTimeout(animationCallback, 40);
  };

  // Kick-start the process.
  animationCallback();
};

let main = () => {
  window.addEventListener("load", () => {
    let videoElem = document.getElementById("video");

    let canvas1Elem = document.getElementById("c1");
    let context2D1 = canvas1Elem.getContext("2d");
    let canvas2Elem = document.getElementById("c2");
    let context2D2 = canvas2Elem.getContext("2d");

    videoElem.addEventListener("play", () => {
      setUpAnimationFrame(videoElem, context2D1, context2D2,
                          videoElem.width / 2, videoElem.height / 2);
    }, false);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoElem.src = window.URL.createObjectURL(stream);
        videoElem.play();
      });
    }
  });
};

main();
