import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import update from 'react-addons-update';
import styled from 'styled-components';
import MessengerPlugin from 'react-messenger-plugin';

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
  overflow: hidden;
`;

const ContainerHeader = styled.div`
  display: inline-flex;
  width: 100%;
  z-index: 100;
  max-height: 64px;
  background: #FFF;
  padding: 32px 20px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #EEE;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.05);
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
      width: 32px;
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

const HelloBar = styled.div`
  background: #0084ff;
  padding: 12px 24px 10px;
  color: #FFF;
  font-size: 12px;
  text-decoration: none;
  text-align: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
  div {
    position: relative;
    top: 1px;
    margin-left: 4px;
  }
`;

const ContainerContent = styled.div`
  display: flex;
  flex: 1;
  flex-flow: column;
  overflow-y: auto;
  background: #FFF;
`;

const ContainerMessages = styled.div`
  display: flex;
  flex-flow: column;
  overflow-y: scroll;
  padding: 24px 0;
  span {
    margin: 2px 5px;
  }
`;

const QuickReplies = styled.div`
  padding: 12px 24px 0;
  overflow-x: scroll;
  min-height: 50px;
  &::-webkit-scrollbar {
    display: none;
  }
  div {
    height: 100%;
    width: ${props => props.numReplies ? `${props.numReplies * 160}px` : '0px'};
    overflow-y: hidden;
    overflow-x: scroll;
  }
  div > a {
    color: #3C3EFF;
    background: transparent;
    cursor: pointer;
    list-style: none;
    display: inline-block;
    margin: 0;
    margin-right: 5px;
    padding: 12px 14px 8px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 300;
    border: 1px solid #3C3EFF;
    border-radius: 100px;
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

    window.speechSynthesis.onvoiceschanged = function() {
      self.voices = window.speechSynthesis.getVoices();
    }
  };

  BASE_URL = process.env.NODE_ENV !== 'production' ? 'https://api.kit.community' : 'http://127.0.0.1:5000';
  state = {
    messages: [],
    currentQuickActions: [],
    constituent_id: null,
    organization_id: null,
    organization_name: null,
    openConversation: false,
    show: false,
    tts: false,
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
        organization_picture: (organization.messageEntries.filter(e => e.intro_picture_url)[0] || {}).intro_picture_url,
        organization_entries: organization.messageEntries,
        show: !!new URL(window.location.href).searchParams.get('show'),
      });
    });
  }

  componentDidMount() {
    const self = this;
    if (this.state.constituent_id === null) {
      self.post({ type: 'action', payload: { payload: 'GET_STARTED' } });
    }
    if (this.state.show) {
      self.showConversation();
    }
  };

  /* An awful hack for now */
  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem('state', JSON.stringify(nextState));
  }

  showConversation() {
    this.setState({ ...this.state, openConversation: true });
    this.source && this.source.postMessage('show', '*');
  }

  hideConversation() {
    this.setState({ ...this.state, openConversation: false });
    this.source && this.source.postMessage('hide', '*');
  }

  submit(value) {
    this.send({ content: value, local: true });
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
    const elem = ReactDOM.findDOMNode(this.refs.scrollToSpan);
    if (elem) elem.scrollIntoView(false);

    let tts = new URL(window.location.href).searchParams.get('tts');

    if (tts && !message.local && typeof message.content === 'string') {
      let utterance = new SpeechSynthesisUtterance( message.content );
      utterance.voice = window.speechSynthesis.getVoices().filter(x => (x.name === "Google US English"))[0];
      utterance.pitch = 1;
      window.speechSynthesis.speak( utterance );
    }
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
    // Scroll to Bottom of Message Section
    setTimeout(() => {
      const elem = ReactDOM.findDOMNode(this.refs.scrollToSpan);
      if (elem) elem.scrollIntoView(false);
    });
    // Return Element
    return (
      <Wrapper>
        <div style={({
          position: 'relative',
          left: this.state.openConversation ? '0' : '540px',
          overflow: 'hidden',
          border: this.state.show ? '1px solid #EEE' : 'none',
          flexDirection: 'column',
          display: this.state.openConversation ? 'flex' : 'none',
        })}>
          <ContainerHeader>
            <div>
              <img src={this.state.organization_picture} />
              <p>{this.state.organization_name ? `Hey ${this.state.organization_name}!` : 'Your Local Gov Chatbot!'}</p>
            </div>
            {!this.state.show && <img src="close.svg" onClick={() => this.hideConversation()} />}
          </ContainerHeader>
          <ContainerContent>
            <ContainerMessages>
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
              {(this.state.messages.length > 0 && !this.state.messages[this.state.messages.length - 1].local) && this.state.currentQuickActions && this.state.currentQuickActions.length > 0 && <QuickReplies numReplies={this.state.currentQuickActions.length}>
                <div>
                  {
                    this.state.currentQuickActions.map(
                      (a, i)=>(
                        <a key={i} href="#" onClick={ this.handleAction.bind(this, a) }>{a.title}</a>
                      )
                    )
                  }
                </div>
              </QuickReplies>}
              <span ref="scrollToSpan"></span>
            </ContainerMessages>
            <Input
              organizationName={this.state.organization_name}
              submit={this.submit.bind(this)}
            />
            {!this.state.show && this.state.organization_entries && this.state.organization_entries.filter(e => e.facebook_entry_id).map(entry => <HelloBar>
              <p>Always forget it's trash night? <u>Enable Reminders →</u></p>
              <MessengerPlugin
                appId="343312956038024"
                pageId="464325157245887"
                color="white"
                type="message-us"
              />
            </HelloBar>)}
          </ContainerContent>
        </div>
        <div style={({
          position: 'fixed',
          bottom: '4px',
          right: '4px',
          height: this.state.openConversation ? '0px' : '64px',
          width: this.state.openConversation ? '0px' : '64px',
          background: '#3C3EFF',
          borderRadius: '50%',
          boxShadow: '0 1px 6px rgba(0, 0, 50, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: this.state.openConversation ? '0' : '15px',
          transition: '150ms',
        })} onClick={() => this.showConversation()}>
          <div style={({
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#F11F58',
            objectFit: 'scale-down',
            boxShadow: '0 1px 2px rgba(0, 0, 50, 0.6)',
            padding: '7px 4px 4px',
            fontSize: '9px',
            fontWeight: '500',
            display: this.state.openConversation ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#FFF',
          })}>
            {this.state.messages.length}
          </div>
          <img src="convo.svg" style={({
              height: this.state.openConversation ? '0px' : '100%',
              width: this.state.openConversation ? '0px' : '100%',
          })} />
        </div>
      </Wrapper>
    );
  };
}

export default App;
