import React, { Component } from 'react';
import update from 'react-addons-update';

import logo from './logo.svg';
import './App.css';
import Message from './Message';
// import Lorem from './lorem';
import Input from './input';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = JSON.parse(localStorage.getItem('state')) || this.state;
    console.log(JSON.stringify(this.state));
  };

  state = {
    messages: [],
    currentQuickActions: [],
    constituent_id: null,
    organization_id: null,
    organization_name: null,
    openConversation: false,
    shouldBeEasing: false,
  };

  render() {
    console.log(this)
    return (
      <div className="wrapper">

        <div className="interface__body" style={({
          position: 'relative',
          transition: '200ms',
          left: this.state.openConversation ? '0' : '480px',
          overflow: this.state.openConversation ? 'initial' : 'hidden',
          borderLeft: '2px solid #EDEDED'
        })}>
          <div style={({
            position: 'fixed',
            top: 0,
            zIndex: 100,
            width: '100vw',
            maxHeight: '64px',
            background: '#3C3EFF',
            padding: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 32px rgba(140, 147, 179, 0.2)',
          })}>
            <h4 style={({
                color: '#FFF'
              })}>{this.state.organization_name || 'Gov Chatbot Assistant'}</h4>
            <img
              src="close.svg"
              onClick={() => this.setState({ ...this.state, openConversation: false })}
              style={({
                height: '32px',
                width: 'auto',
                cursor: 'pointer',
              })}
            />
          </div>
          <div className="messages" ref="messages" style={({
            padding: '64px 18px',
            background: '#FFF',
          })}>
            {
              this.state.messages.map((a, i, arr) => (
                <Message
                  key={i}
                  message={a}
                  templateButton={ this.handleAction.bind(this) }
                  newSender={ !(arr[i - 1]) || (arr[i - 1].local !== a.local) }/>
              ))
            }
            <div className="quick">{
                this.state.currentQuickActions.map(
                  (a)=>(
                    <a href="#" onClick={ this.handleAction.bind(this, a) }>{a.title}</a>
                  )
                )
              }</div>
          </div>
        <Input submit={this.submit.bind(this)} />
        </div>

        <div style={({
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          height: this.state.openConversation ? '0px' : '64px',
          width: this.state.openConversation ? '0px' : '64px',
          background: '#3C3EFF',
          borderRadius: '50%',
          boxShadow: '0 4px 32px rgba(140, 147, 179, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: '150ms',
          padding: this.state.openConversation ? '0' : '8px',
        })} onClick={() => this.setState({ ...this.state, openConversation: true })}>
          <img src="convo.svg" style={({
              height: this.state.openConversation ? '0px' : 'initial',
              width: this.state.openConversation ? '0px' : 'initial',
          })} />
        </div>

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
      if (this.state.shouldBeEasing) {
        self.refs.messages.scrollTop = Math.lerp(
          self.refs.messages.scrollTop,
          self.refs.messages.scrollHeight,
          Math.min(1, (Date.now() - self.easeTime) / 5000)
        );

        if (Math.round(self.refs.messages.scrollHeight - self.refs.messages.scrollTop) === self.refs.messages.clientHeight) {
          this.state.shouldBeEasing = false;
        }
      }
    }, 16);

    // self.refs.messages.onscroll = () => {
      // this.state.shouldBeEasing = false;
    // }

    if (this.state.constituent_id === null) {
      self.post({ type: 'action', payload: { payload: 'GET_STARTED' } });
    }
  };

  /* An awful hack for now */
  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem('state', JSON.stringify(nextState));
  }

  submit(e) {
    this.send({ content: e.target.value, local: true });
    e.target.value = "";
  };

  handleResponse(response) {
    const self = this;
    response.messages.forEach((m)=>{
      self.pushMessage(m);

      this.setState(update(self.state, {
        currentQuickActions: {
          $set: m.quickActions || [],
        }
      }));
    });

    this.setState(update(this.state, {
      constituent_id: { $set: response.meta.constituent_id }
    }));
  };

  handleAction(data) {
    this.pushMessage({ content: data.title, local: true });
    this.post({ type: 'action', payload: { payload: data.payload }});
  };

  send(message) {
    const self = this;
    self.pushMessage(message);
    self.post({ type: 'message', payload: { text: message.content } });
  };

  pushMessage(message) {
    const newData = update(this.state, {
      messages: {
        $push: [message],
      }
    });

    this.setState(newData);
    this.state.shouldBeEasing = true;
    this.easeTime = Date.now();
  };

  post(payload) {
    const self = this;

    const ENV = (process.env.NODE_ENV === 'production') ? 'https://api.kit.community/conversations/webhook/http' : 'http://127.0.0.1:5000/conversations/webhook/http';
    console.log(window.location)
    fetch(ENV +
      (this.state.organization_id ? `?organization_id=${this.state.organization_id}` : '') +
      (this.state.constituent_id ? `&constituent_id=${this.state.constituent_id }` : ''), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(a => a.json()).then(self.handleResponse.bind(self));
  };
}

Math.lerp = function (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};

export default App;
