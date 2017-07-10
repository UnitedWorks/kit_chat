import React, { Component } from 'react';
import update from 'react-addons-update';

import logo from './logo.svg';
import './App.css';
import Message from './Message';
// import Lorem from './lorem';
import Input from './input';

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <div className="messages" ref="messages">
          { 
            this.state.messages.map((a, i, arr) => (
              <Message
                key={i}
                message={a}
                templateButton={ this.handleAction.bind(this) }
                newSender={ !(arr[i - 1]) || (arr[i - 1].local !== a.local) }/>
            ))
          }
        </div>
        <div className="quick">{
          this.state.currentQuickActions.map(
            (a)=>(
              <a href="#" onClick={ this.handleAction.bind(this, a) }>{a.title}</a>
            )
          )
        }</div>
        <Input placeholder="Hello!" submit={this.submit.bind(this)} />        
      </div>
    );
  };

  handleAction(data) {
    this.post({ type: 'action', payload: { payload: data.payload }});
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

        if (Math.round(self.refs.messages.scrollHeight - self.refs.messages.scrollTop) === self.refs.messages.clientHeight) {
          self.shouldBeEasing = false;
        }
      }
    }, 16);

    self.refs.messages.onscroll = () => {
      // self.shouldBeEasing = false;
    }

    self.post({ type: 'action', payload: { payload: 'GET_STARTED' } });
  };

  shouldBeEasing = false;

  submit(e) {
    this.send({ content: e.target.value, local: true });
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

  handleResponse(response) {
    const self = this;
    response.forEach((m)=>{
      self.pushMessage(m);

      this.setState(update(self.state, {
        currentQuickActions: {
          $set: m.quickActions || [],
        }
      }));
    });
  };

  send(message) {
    const self = this;
    self.pushMessage(message);
    self.post({ type: 'message', payload: { text: message.content } });
  };

  post(payload) {
    const self = this;
    const PROD_URL = 'https://api.kit.community/conversations/webhook/http?organization_id=5&constituent_id=1';
    const DEV_URL = 'http://127.0.0.1:5000/conversations/webhook/http?organization_id=5&constituent_id=1';
    fetch(PROD_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(a => a.json()).then(self.handleResponse.bind(self));
  }

  state = {
    messages: [],
    currentQuickActions: [],
  };
}

Math.lerp = function (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};

export default App;
