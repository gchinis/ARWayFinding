// Conversational UI.

var React = require('react');
var ReactDOM = require('react-dom');

var Robb = React.createClass({
  render: function () {
    var robb = [
      {key: 0, wait: 1000, text: "Hi, my name is Robb."},
      {key: 1, wait: 4000, text: "Are you looking for a product? I can show you the way to any product in this store."},
      {key: 2, wait: 5000, text: "I will ask your smartphone for permission to activate the camera, so you can see me. Are you okay with that?", button: <div id="letsgo"></div> }
     ];

    var convo = [];
      for (var i = 0; i < robb.length; i++) {
        if (robb[i].button) {
          convo.push(<Chat wait={robb[i].wait} text={robb[i].text} key={robb[i].key} button={robb[i].button} />)
        } else {
          convo.push(<Chat wait={robb[i].wait} text={robb[i].text} key={robb[i].key } />)
        }
      };

    convo.push(
      <li key="ti" id="ti">
        <div className="typing-indicator chat-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </li>
    );
    setTimeout(function () {
      $("#ti").hide();
    }, 5000);
    return (
      <ul className="chat-list">
        {convo}
      </ul>
    )
  }
});

var Chat = React.createClass({
  getInitialState: function () {
    return ({hidden: "hidden"});
  },
  componentWillMount: function () {
    var that = this;
    setTimeout(function () {
      that.show();
    }, that.props.wait);
  },
  show: function () {
    this.setState({hidden: ""});
  },
  render: function () {
    return (
        <li className={"chat-bubble "+ this.state.hidden}>{this.props.text}{this.props.button ? this.props.button : ""}</li>
    )
  }
});

window.conversationalUI = () => {
  ReactDOM.render(
    < Robb />,
    document.getElementById('chat-list')
  );
};
