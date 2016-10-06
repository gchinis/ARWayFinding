var React = require('react');
var ReactDOM = require('react-dom');

var Camera = React.createClass({
  render: function () {
             navigator.getUserMedia = (navigator.getUserMedia ||
               navigator.webkitGetUserMedia ||
               navigator.mozGetUserMedia || 
               navigator.msGetUserMedia);

             var front = false;
             var constraints = { video: { facingMode: (front? "user" : "environment") } };

             if (navigator.getUserMedia) {
               navigator.getUserMedia(constraints,
                 function(localMediaStream) {
                   // Get a reference to the video element on the page.
                   var vid = document.getElementById('camera-stream');

                   // Create an object URL for the video stream and use this 
                   // to set the video source.
                   vid.src = window.URL.createObjectURL(localMediaStream);

                 },
                 function(err) {
                   console.log('The following error occurred when trying to use getUserMedia: ' + err);
                 }
                 );
             } else {
               alert('Sorry, your browser does not support getUserMedia');
             }
           },
});

window.cameraStream = () => {
  ReactDOM.render(<Camera />, document.getElementById('video-container'));
};
