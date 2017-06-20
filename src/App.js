import React, { Component } from 'react';
import update from 'react-addons-update';

import logo from './logo.svg';
import './App.css';
import Message from './Message';
import Lorem from './lorem';
import Input from './input';

class App extends Component {
  render() {
    return (
      <div className="wrapper">
      <div className="messages" ref="messages">
        { this.state.messages.map((a, i)=> <Message key={i} message={a} />) }
      </div>
        <Input placeholder="Hello!" submit={this.submit.bind(this)} />
      </div>
    );
  };

  componentDidMount() {
    const self = this;
    // setInterval(()=>{
    //   self.pushMessage({
    //     content: (new Lorem()).generate(Math.floor(8)),
    //     local: Math.random() > .5
    //   });
    // }, 1000);

    setInterval(()=> {
      if (self.shouldBeEasing) {
        self.refs.messages.scrollTop = Math.lerp(
          self.refs.messages.scrollTop,
          self.refs.messages.scrollHeight,
          Math.min(1, (Date.now() - self.easeTime) / 5000)
        );
      }
    }, 16);

    self.refs.messages.onscroll = () => {
      // self.shouldBeEasing = false;
    }
  };

  shouldBeEasing = false;

  submit(e) {
    // console.log(e);
    this.post({ content: e.target.value, local: true });
  };

  pushMessage(message) {
    const newData = update(this.state, {
      messages: {
        $push: [message],
      }
    });

    this.setState(newData);
    this.shouldBeEasing = true;
    this.easeTime = Date.now();
  };

  post(message) {
    const self = this;
    self.pushMessage(message);

    fetch('https://api.kit.community/conversations/webhook/http?constituent_id=9', {
      method: "POST",
      body: JSON.stringify({ text: message.content })
    }).then(a => a.json())
    .then((response) => {
      response.forEach((m)=>{
        self.pushMessage(m);
      });
    });
  }

  state = {
    messages: [],
  };
}

Math.lerp = function (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};

export default App;
