var React = require('react');
var ReactDOM = require('react-dom');

var Hello = React.createClass({
  myClick: function () {
             navigator.getUserMedia = (navigator.getUserMedia ||
               navigator.webkitGetUserMedia ||
               navigator.mozGetUserMedia || 
               navigator.msGetUserMedia);

             if (navigator.getUserMedia) {
               navigator.getUserMedia({video: true},
                 function(localMediaStream) {
                   // Get a reference to the video element on the page.
                   //          var vid = document.getElementById('camera-stream');

                   // Create an object URL for the video stream and use this 
                   // to set the video source.
                   //         vid.src = window.URL.createObjectURL(localMediaStream);

                 },
                 function(err) {
                   console.log('The following error occurred when trying to use getUserMedia: ' + err);
                 }
                 );
             } else {
               alert('Sorry, your browser does not support getUserMedia');
             }
           },
    render: function() {
              return (
                  <a href="#" onClick={this.myClick}><div className="blue-button">Ok, le&#39;s go!</div></a>
                  )
            }
});

window.letsgo = () => {
  ReactDOM.render(<Hello />, document.getElementById('letsgo'));
};
