import { should } from "chai";
var chai = require('chai');
chai.use(require('chai-dom'));
var React = require('react');
var ReactDOM = require('react-dom');
import { Robb } from "../../app/convui.js"


describe("welcome page", () => {
  beforeEach(() => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div id="testContainer"></div>'
    );
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('testContainer'));
  });

  it('renders Robbs text', () => {
    ReactDOM.render(
      < Robb />,
      document.getElementById('testContainer'));

    chai.expect(document.querySelectorAll('ul li')).to.have.text('Hi, my name is Robb.Are you looking for a product? I can show you the way to any product in this store.I will ask your smartphone for permission to activate the camera, so you can see me. Are you okay with that?');
    chai.expect(document.querySelector('ul.chat-list')).to.have.length(4);
  });
});