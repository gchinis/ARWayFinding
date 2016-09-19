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

let setUpAnimationFrame = function (videoElem, processVideoFrameFunction) {
  let animationCallback = function() {
    if (videoElem.paused || videoElem.ended) {
      return;
    }

    processVideoFrameFunction(videoElem);

    // TODO: Use requestAnimationFrame.
    setTimeout(animationCallback, 40);
  };

  // Kick-start the process.
  animationCallback();
};

let createMarkerDetector = function(canvasElem, detectionThreshold) {
  // Create a RGB raster object for the 2D canvas. JSARToolKit uses
  // raster objects to read image data.  Note that you need to set
  // canvas.changed = true on every frame.
  let raster = new NyARRgbRaster_Canvas2D(canvasElem);

  // FLARParam is the thing used by FLARToolKit to set camera
  // parameters.  Here we create a FLARParam for images with 320x240
  // pixel dimensions.
  let param = new FLARParam(320, 240);

  // The FLARMultiIdMarkerDetector is the actual detection engine for
  // marker detection.  It detects multiple ID markers. ID markers are
  // special markers that encode a number.
  let detector = new FLARMultiIdMarkerDetector(param, 1024);

  // For tracking video set continue mode to true. In continue mode,
  // the detector tracks markers across multiple frames.
  detector.setContinueMode(true);

  // Create a NyARTransMatResult object for getting the marker
  // translation matrices.
  var resultMat = new NyARTransMatResult();

  let detectMarkers = function() {
    canvasElem.changed = true;

    // Do marker detection by using the detector object on the raster object.
    // The threshold parameter determines the threshold value
    // for turning the video frame into a 1-bit black-and-white image.
    var markerCount = detector.detectMarkerLite(raster, detectionThreshold);

    var markers = {};

    // Go through the detected markers and get their IDs and
    // transformation matrices.
    for (var idx = 0; idx < markerCount; idx++) {
      // Get the ID marker data for the current marker.  ID markers
      // are special kind of markers that encode a number.  The bytes
      // for the number are in the ID marker data.
      var id = detector.getIdMarkerData(idx);

      // Read bytes from the id packet.
      var currId = -1;
      // This code handles only 32-bit numbers or shorter.
      if (id.packetLength <= 4) {
        currId = 0;
        for (var i = 0; i < id.packetLength; i++) {
          currId = (currId << 8) | id.getPacketData(i);
        }
      }

      // If this is a new id, let's start tracking it.
      if (markers[currId] == null) {
        markers[currId] = {};
      }
      // Get the transformation matrix for the detected marker.
      detector.getTransformMatrix(idx, resultMat);

      // Copy the result matrix into our marker tracker object.
      markers[currId].transform = Object.asCopy(resultMat);
    }

    return markers;
  };

  return detectMarkers;
};

let main = () => {
  window.addEventListener("load", () => {
    let videoElem = document.getElementById("video");

    let canvas1Elem = document.getElementById("c1");
    let context2D1 = canvas1Elem.getContext("2d");
    let canvas2Elem = document.getElementById("c2");
    let context2D2 = canvas2Elem.getContext("2d");

    let detectMarkers = createMarkerDetector(canvas1Elem, 170);

    videoElem.addEventListener("play", () => {
      setUpAnimationFrame(videoElem, (videoElem) => {
        chromaKey(videoElem, context2D1, context2D2,
                  videoElem.width / 2, videoElem.height / 2);

        let markers = detectMarkers();
        if (Object.keys(markers).length > 0) {
          console.log(markers);
        }
      });
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


window.DEBUG = true;
window.xxonload = function() {
  var w = Magi.Bin.load('/3dparty/walas.binm');
  w.flatNormals = false;
  w.onload = function() {
    var video = document.createElement('video');
    video.src = "/3dparty/output_4.ogg";
    video.width = 320;
    video.height = 240;
    video.loop = true;
    video.volume = 0;
    video.controls = true;
    document.body.appendChild(video);

    var canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    //document.body.appendChild(canvas);
    var debugCanvas = document.createElement('canvas');
    debugCanvas.width = 320;
    debugCanvas.height = 240;
    debugCanvas.id = 'debugCanvas';
    document.body.appendChild(debugCanvas);

    var raster = new NyARRgbRaster_Canvas2D(canvas);
    var param = new FLARParam(320,240);

    var resultMat = new NyARTransMatResult();

    var detector = new FLARMultiIdMarkerDetector(param, 80);
    detector.setContinueMode(true);

    var glCanvas = document.createElement('canvas');
    glCanvas.width = 320;
    glCanvas.height = 240;
    document.body.appendChild(glCanvas);
    var display = new Magi.Scene(glCanvas);
    param.copyCameraMatrix(display.camera.perspectiveMatrix, 100, 10000);
    display.camera.useProjectionMatrix = true;
    var videoTex = new Magi.FlipFilterQuad();
    videoTex.material.textures.Texture0 = new Magi.Texture();
    videoTex.material.textures.Texture0.image = video;
    videoTex.material.textures.Texture0.generateMipmaps = false;
    display.scene.appendChild(videoTex);

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,320,240);
    ctx.font = "24px URW Gothic L, Arial, Sans-serif";

    var times = [];
    var pastResults = {};
    var lastTime = 0;
    var cubes = {};
    setInterval(function() {
      if (video.paused) return;
      if (window.paused) return;
      if (video.currentTime == lastTime) return;
      lastTime = video.currentTime;
      ctx.drawImage(video, 0,0,320,240);
      var dt = new Date().getTime();

      videoTex.material.textures.Texture0.changed = true;

      canvas.changed = true;

      var t = new Date();
      var detected = detector.detectMarkerLite(raster, 170);
      //detector._bin_raster.getBuffer().drawOnCanvas(canvas);
      for (var idx = 0; idx<detected; idx++) {
        var id = detector.getIdMarkerData(idx);
        //read data from i_code via Marsial--Marshal経由で読み出す
        var currId;
        if (id.packetLength > 4) {
          currId = -1;
        }else{
          currId=0;
          //最大4バイト繋げて１個のint値に変換
          for (var i = 0; i < id.packetLength; i++ ) {
            currId = (currId << 8) | id.getPacketData(i);
            //console.log("id[", i, "]=", id.getPacketData(i));
          }
        }
        //console.log("[add] : ID = " + currId);
        if (!pastResults[currId]) {
          pastResults[currId] = {};
        }
        detector.getTransformMatrix(idx, resultMat);
        pastResults[currId].age = 0;
        pastResults[currId].transform = Object.asCopy(resultMat);
        if (idx == 0) times.push(new Date()-t);
      }
      for (var i in pastResults) {
        var r = pastResults[i];
        if (r.age > 5) delete pastResults[i];
        r.age++;
      }
      for (var i in cubes) cubes[i].display = false;
      for (var i in pastResults) {
        if (!cubes[i]) {
          var pivot = new Magi.Node();
          pivot.transform = mat4.identity();
          pivot.setScale(80);
          var cube;
          if (i == 64) {
            var n = new Magi.Node();
            //walas = n;
            var sc = 2.5 / (w.boundingBox.diameter);
            n.scaling = [sc, sc, sc];
            n.model = w.makeVBO();
            n.setZ(-0.85);
            n.rotation.axis = [1,0,0];
            n.rotation.angle = Math.PI;
            n.material = Magi.DefaultMaterial.get();
            n.material.floats.LightDiffuse = [1,1,1,1];
            n.material.floats.MaterialShininess = 6.0;
            n.material.floats.MaterialDiffuse = [1,1,1,1];
            cube = n;
          } else {
            cube = new Magi.Cube();
            cube.setZ(-0.125);
            cube.scaling[2] = 0.25;
          }
          pivot.appendChild(cube);
          var txt = new Magi.Text(i.toString());
          txt.setColor('black');
          txt.setFontSize(48);
          txt.setAlign(txt.centerAlign, txt.bottomAlign)
              .setZ(-0.6)
              .setY(-0.34)
              .setScale(1/80);
          cube.appendChild(txt);
          pivot.cube = cube;
          pivot.txt = txt;
          display.scene.appendChild(pivot);
          cubes[i] = pivot;
        }
        cubes[i].display = true;
        cubes[i].txt.setText(i.toString());
        var mat = pastResults[i].transform;
        var cm = cubes[i].transform;
        cm[0] = mat.m00;
        cm[1] = -mat.m10;
        cm[2] = mat.m20;
        cm[3] = 0;
        cm[4] = mat.m01;
        cm[5] = -mat.m11;
        cm[6] = mat.m21;
        cm[7] = 0;
        cm[8] = -mat.m02;
        cm[9] = mat.m12;
        cm[10] = -mat.m22;
        cm[11] = 0;
        cm[12] = mat.m03;
        cm[13] = -mat.m13;
        cm[14] = mat.m23;
        cm[15] = 1;
        //frequency = 1000-mat.m23;
      }
      if (detected == 0) times.push(new Date()-t);
      if (times.length > 100) {
        if (window.console)
          console.log(times.reduce(function(s,i){return s+i;})/times.length);
        times.splice(0);
      }
    }, 15);
  };
};