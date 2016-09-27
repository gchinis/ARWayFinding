// Conversational UI.

var React = require('react');
var ReactDOM = require('react-dom');

const initConvUI = () => {
  ReactDOM.render(
    <h1>Hello, I'm the robot!</h1>,
    document.getElementById('example')
  );
};


// TODO: Remove this when we integrate UI and 3D into a single entry point.
window.initConvUI = initConvUI;

