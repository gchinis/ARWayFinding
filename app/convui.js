// Conversational UI.

var React = require('react');
var ReactDOM = require('react-dom');

const Chat = (props) => {
  return (
      <li className="chat-bubble">{props.text}{props.button ? props.button : ""}</li>
  );
};

const Dialogue = (props) => {
  var chats = props.chats;
  var convo = [];
  for (var chat of chats) {
    if (chat.button) {
      convo.push(<Chat wait={chat.wait} text={chat.text} key={chat.key} button={chat.button} />)
    } else {
      convo.push(<Chat wait={chat.wait} text={chat.text} key={chat.key} />)
    }
  };
  return (
      <ul className="chat-list">
      {convo}
      </ul>
  );
};

const Container = (props) => {
  return (<div className="container">
      <div className="title"><b>ROBB</b> THE VIRTUAL ROBOT</div>

      <div className="robot">
        <img src="assets/robot.png" />
      </div>

      <div id="chats">
        <Dialogue {...props} />
      </div>

      <div className="help">
        <img src="assets/call-store-assistant.png" />
      </div>
    </div>
  );
};

const TypingIndicator = () => {
  return(
    <li key="ti" id="ti">
      <div className="typing-indicator chat-bubble">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </li>
  );
}
const Robb = React.createClass({
  getInitialState() {
    return ({chats: []});
  },
  componentWillMount() {
    const makeTimeoutHandler = (chat) => {
      return () => {
        console.log(chat.text);
        var newChats = this.state.chats.slice(0);
        newChats.push(chat);
        this.setState({chats: newChats});
      };
    };
    for (var chat of this.props.chats) {
      setTimeout(makeTimeoutHandler(chat), chat.wait);
    }
  },
  render() {
    return (
        <Container chats={this.state.chats} />
    )
  }
});


const FirstPage = () => {
  var robb = [
    {key: 0, wait: 1000, text: "Hi, my name is Robb."},
    {key: 1, wait: 4000, text: "Are you looking for a product? I can show you the way to any product in this store."},
    {key: 2, wait: 5000, text: "I will ask your smartphone for permission to activate the camera, so you can see me. Are you okay with that?", button: <CameraAccess /> }
  ];
  return(
    <Robb chats={robb} /> 
  );
}

const CameraAccess = React.createClass({
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
                  <a href="/convui-camera.html" onClick={this.myClick}><div className="blue-button">Ok, le&#39;s go!</div></a>
                  )
            }
});

window.conversationalUI = () => {
  ReactDOM.render(
    <FirstPage />,
    document.getElementById('container')
  );
};

export {
  Robb
};