import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import update from 'react-addons-update';
import styled from 'styled-components';

import Message from './Message';
import Input from './Input';

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  max-height: 100vh;
  height: 100%;
  width: 100%;
  max-width: 800px;
  margin: 0px auto;
`;

const ContainerHeader = styled.div`
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100vw;
  max-height: 64px;
  background: #FFF;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #EEE;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  color: #3C3EFF;
  font-weight: 400;
  div {
    display: flex;
    align-items: center;
    p {
      padding-top: 4px;
    }
    img {
      height: 32px;
      width: auto;
      border-radius: 50%;
      opacity: 1;
    }
  }
  img {
    height: 20px;
    width: auto;
    cursor: pointer;
    margin: 8px;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
`;

const ContainerMessages = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-flow: column;
  min-height: 100vh;
  overflow-y: auto;
  padding: 64px 16px 96px;
  background: #FFF;
`;

const QuickReplies = styled.div`
  display: inline;
  flex-flow: row nowrap;
  align-content: space-between;
  padding: 5px;
  margin: 12px 0;
  overflow-x: auto;
  white-space: nowrap;
  &::-webkit-scrollbar {
    display: none;
  }
  a {
    flex: auto 0 0;
    color: #3237ff;
    text-decoration: none;
    min-width: 100%;
    padding: 5px 15px 5px 0px;
    font-weight: 300;
    &:hover {
      cursor: pointer;
    }
  }
`;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = JSON.parse(localStorage.getItem('state')) || this.state;
    // Grab Parent Window
    const self = this;
    window.addEventListener('message', function(e) {
      if (e.data === 'init') self.source = e.source;
    });
  };

  BASE_URL = process.env.NODE_ENV === 'production' ? 'https://api.kit.community' : 'http://127.0.0.1:5000';
  state = {
    messages: [],
    currentQuickActions: [],
    constituent_id: null,
    organization_id: null,
    organization_name: null,
    openConversation: false,
  };

  componentWillMount() {
    const orgId = new URL(window.location.href).searchParams.get('organization_id');
    this.setState({
      ...this.state,
      organization_id: orgId,
      openConversation: false,
    });
    return fetch(`${this.BASE_URL}/accounts/organization?id=${orgId}`, {
      method: "GET",
    }).then(p => p.json()).then(({ organization }) => {
      return this.setState({
        ...this.state,
        organization_name: organization.name,
        organization_picture: organization.messageEntries.filter(e => e.intro_picture_url)[0].intro_picture_url,
      });
    });
  }

  componentDidMount() {
    const self = this;
    if (this.state.constituent_id === null) {
      self.post({ type: 'action', payload: { payload: 'GET_STARTED' } });
    }
  };

  /* An awful hack for now */
  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem('state', JSON.stringify(nextState));
  }

  showConversation() {
    this.setState({ ...this.state, openConversation: true });
    this.source.postMessage('show', '*');
  }

  hideConversation() {
    this.setState({ ...this.state, openConversation: false });
    this.source.postMessage('hide', '*');
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
    const elem = ReactDOM.findDOMNode(this.refs.messages);
    if (elem) elem.scrollIntoView(false);
  };

  post(payload) {
    const self = this;
    fetch(`${this.BASE_URL}/conversations/webhook/http` +
      (this.state.organization_id ? `?organization_id=${this.state.organization_id}` : '') +
      (this.state.constituent_id ? `&constituent_id=${this.state.constituent_id }` : ''), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(a => a.json()).then(self.handleResponse.bind(self));
  };

  render() {
    return (
      <Wrapper>
        <div style={({
          position: 'relative',
          transition: '100ms',
          left: this.state.openConversation ? '0' : '540px',
          overflow: this.state.openConversation ? 'initial' : 'hidden',
          borderLeft: '1px solid #EEE'
        })}>
          <ContainerHeader>
            <div>
              <img src={this.state.organization_picture} />
              <p>{this.state.organization_name ? `Hey ${this.state.organization_name}!` : 'Your Local Gov Chatbot!'}</p>
            </div>
            <img src="close.svg" onClick={() => this.hideConversation()} />
          </ContainerHeader>
          <ContainerMessages ref="messages">
            {
              this.state.messages.map((a, i, arr) => (
                <Message
                  key={i}
                  message={a}
                  organization={({
                    name: this.state.organization_name,
                    picture: this.state.organization_picture,
                  })}
                  templateButton={ this.handleAction.bind(this) }
                  newSender={ !(arr[i - 1]) || (arr[i - 1].local !== a.local) }/>
              ))
            }
            <QuickReplies>
              {
                this.state.currentQuickActions.map(
                  (a, i)=>(
                    <a key={i} href="#" onClick={ this.handleAction.bind(this, a) }>{a.title}</a>
                  )
                )
              }
            </QuickReplies>
          </ContainerMessages>
          <Input
            organizationName={this.state.organization_name}
            submit={this.submit.bind(this)}
          />
        </div>
        <div style={({
          position: 'fixed',
          bottom: '4px',
          right: '4px',
          height: this.state.openConversation ? '0px' : '64px',
          width: this.state.openConversation ? '0px' : '64px',
          background: '#3C3EFF',
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: '150ms',
          padding: this.state.openConversation ? '0' : '8px',
        })} onClick={() => this.showConversation()}>
          <img src="convo.svg" style={({
              height: this.state.openConversation ? '0px' : 'initial',
              width: this.state.openConversation ? '0px' : 'initial',
          })} />
        </div>
      </Wrapper>
    );
  };
}

export default App;
