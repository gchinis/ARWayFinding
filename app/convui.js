// Conversational UI.

var React = require('react');
var ReactDOM = require('react-dom');

var Parent = React.createClass({
    render : function () {
    var robb = [{wait: 1000, text: "Hello, I'm Robb. How can I help you today?"}, {wait: 4000, text: "You're looking for wall paint? I know exactly where you can find some!"}, {wait: 5000, text: "Follow me!"}];
    var arrayLength = robb.length;
    setTimeout(function() { $("#ti").hide(); }, 5000);

    var convo = [];
    { for (var i = 0; i < arrayLength; i++) {
       convo.push(<Child wait={robb[i].wait} text={robb[i].text} />)
    }}

    convo.push(
      <li id="ti">
        <div className="typing-indicator chat-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </li>
    );
    return (
        <ul className="chat-list">
          {convo}
        </ul>
      )
    }
});

var Child = React.createClass({
    getInitialState : function () {
        return({hidden : "hidden"});
    },
    componentWillMount : function () {
        var that = this;
        setTimeout(function() {
            that.show();
        }, that.props.wait);
    },
    show : function () {
        this.setState({hidden : ""});
    },
    render : function () {
        return (
            <div className={this.state.hidden}>
                 <li className="chat-bubble">{this.props.text}</li>
            </div>
        )
    }
});

window.conversationalUI = () =>
{
    ReactDOM.render(
    < Parent / >,
        document.getElementById('chat-list')
    );
};