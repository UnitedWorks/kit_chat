import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import update from 'react-addons-update';
import styled, { css } from 'styled-components';
import MessengerPlugin from 'react-messenger-plugin';

import Message from './Message';
import Input from './Input';

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  max-height: 90vh;
  height: 100%;
  max-width: 800px;
  overflow: hidden;
  ${props => {
    if (!props.hinting) {
      return css`
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        margin: 32px;
      `;
    }
  }}
  ${props => {
    if (!props.isMobile && !props.hinting) {
      return css`
        border-radius: 12px;
        border-bottom: 2px solid #3C3EFF;
      `;
    } else if (props.isMobile) {
      return css`
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        margin: 0;
        max-height: 100vh;
      `;
    }
  }}
`;

const ContainerHeader = styled.div`
  display: inline-flex;
  width: 100%;
  z-index: 100;
  max-height: 58px;
  background: #FFF;
  padding: 24px 20px;
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
    margin: 24px;
    margin-right: 0;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
`;

const HelloBar = styled.div`
  display: inline-flex;
  background: #FFF;
  border-top: 1px solid #EEE;
  color: #0084ff;
  font-weight: 300;
  padding: 10px 24px 9px;
  font-size: 12px;
  text-decoration: none;
  text-align: center;
  justify-content: center;
  align-items: center;
  div {
    margin-right: 2px;
    margin-bottom: 1px;
  }
  ${props => props.show ? '' : 'position: absolute;'}
  ${props => props.show ? '' : 'top: -500px;'}
`;

const ContainerContent = styled.div`
  display: flex;
  flex: 1;
  flex-flow: column;
  overflow-y: auto;
  background: #FFF;
  border-radius: 0 0 8px 8px;
`;

const ContainerMessages = styled.div`
  display: flex;
  flex-flow: column;
  overflow-y: scroll;
  height: 100vh;
  span {
    margin: 2px 0;
  }
`;

const QuickReplies = styled.div`
  padding: 12px 24px 0;
  overflow-x: scroll;
  min-height: 58px;
  &::-webkit-scrollbar {
    display: none;
  }
  div {
    display: flex;
    justify-content: flex-end;
    height: 100%;
    width: 100%;
    overflow-y: hidden;
    overflow-x: scroll;
  }
  div > a {
    vertical-align: middle;
    color: #3C3EFF;
    background: transparent;
    cursor: pointer;
    list-style: none;
    display: inline-block;
    margin: 0;
    margin-left: 8px;
    padding: 8px 14px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 300;
    border: 1px solid #3C3EFF;
    border-radius: 100px;
  }
`;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = JSON.parse(localStorage.getItem('state')) || this.state;
    // Force a default
    this.state.hinting = false;
    this.state.isMobile = false;
    // Grab Parent Window
    const self = this;
    window.addEventListener('message', (e) => {
      if (e.data === 'init') {
        self.source = e.source;
        self.setState({ ...self.state, hinting: false });
        setTimeout(() => {
          if (!this.state.openConversation) {
            self.source && self.source.postMessage('hint', '*');
            self.setState({ ...self.state, hinting: true });
          }
        }, 15000);
      } else if (e.data === 'isMobile') {
        self.setState({ ...self.state, isMobile: true });
      } else if (e.data === 'isNotMobile') {
        self.setState({ ...self.state, isMobile: false });
      }
    });

    window.speechSynthesis.onvoiceschanged = () => {
      self.voices = window.speechSynthesis.getVoices();
    }
  };

  BASE_URL = process.env.NODE_ENV === 'production' ? 'https://api.kit.community' : 'http://127.0.0.1:5000';
  state = {
    messages: [],
    currentQuickActions: [],
    constituent_id: null,
    organization_id: null,
    organization_name: null,
    openConversation: false,
    show: false,
    tts: false,
    hinting: false,
    showHelloBar: false,
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
    this.setState({ ...this.state, openConversation: false, hinting: false });
    this.source && this.source.postMessage('hide', '*');
  }

  hideHint() {
    this.setState({ ...this.state, hinting: false });
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
          $set: m.quickActions ? m.quickActions.filter(a => a.title && a.title.indexOf('Turn O') === -1) : [], // Filter notification related quick replies
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
    const mentionsNotifications = typeof message.content === 'string' && (message.content.toLowerCase().includes('notification') || message.content.toLowerCase().includes('reminder'));
    let newData = null;
    // We should support web notifications via service worker, but we don't have a mechanism for pushing?
    if (mentionsNotifications) {
      newData = update(this.state, {
        messages: {
          $push: message.local ? [message] : [{
            content: "Service reminders and alerts are available via Facebook Messenger",
          }],
        },
        showHelloBar: { $set: true },
      });
    } else {
      newData = update(this.state, {
        messages: {
          $push: [message],
        },
        showHelloBar: {
          $set: false,
        },
      });
    }
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

  clearLogs() {
    this.setState({
      ...this.state,
      messages: [],
    });
  }

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
      <Wrapper hinting={this.state.hinting && !this.state.openConversation} isMobile={this.state.isMobile}>
        <div style={({
          position: 'relative',
          left: this.state.openConversation ? '0' : '540px',
          overflow: 'hidden',
          flexDirection: 'column',
          display: this.state.openConversation ? 'flex' : 'none',
        })}>
          <ContainerHeader>
            <div>
              <p>{this.state.organization_name ? `${this.state.organization_name} Chatbot` : 'Your Local Gov Chatbot'}<sup style={({ fontSize: '8px', padding: '4px' })}>BETA</sup></p>
            </div>
            <div>
              <img src="reset.svg" onClick={() => this.clearLogs()} />
              {!this.state.show && <img src="close.svg" onClick={() => this.hideConversation()} />}
            </div>
          </ContainerHeader>
          <ContainerContent>
            <ContainerMessages>
              {
                this.state.messages.slice(-50).map((a, i, arr) => (
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
                    this.state.currentQuickActions.filter(a => a.title).map(
                      (a, i) => (
                        <a key={i} href="#" onClick={ this.handleAction.bind(this, a) }>{a.title}</a>
                      )
                    )
                  }
                </div>
              </QuickReplies>}
              <span style={({ position: 'relative', top: '12px' })} ref="scrollToSpan"></span>
            </ContainerMessages>
            {!this.state.show && this.state.organization_entries && this.state.organization_entries.filter(e => e.facebook_entry_id).map(entry => <HelloBar show={this.state.showHelloBar}>
              <MessengerPlugin
                appId="343312956038024"
                pageId={entry.facebook_entry_id}
                color="white"
                type="message-us"
              />
              <p>on Facebook Messenger</p>
            </HelloBar>)}
            <Input
              organizationName={this.state.organization_name}
              submit={this.submit.bind(this)}
            />
          </ContainerContent>
        </div>
        {this.state.hinting && !this.state.openConversation && <div style={({
          background: '#FFF',
          borderRadius: '4px',
          margin: '12px',
          boxShadow: '0 1px 8px rgba(0, 0, 50, 0.05)',
          fontSize: '13px',
          textAlign: 'left',
          color: '#6e7a89',
          cursor: 'pointer',
        })} onClick={() => this.showConversation()}>
          <div style={({
            position: 'absolute',
            top: '1px',
            right: '1px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#5d6c80',
            objectFit: 'scale-down',
            boxShadow: '0 1px 2px rgba(0, 0, 50, 0.6)',
            padding: '7px',
            justifyContent: 'center',
            alignItems: 'center',
          })} onClick={() => this.hideHint()}>
            <img src="close-white.svg" style={({ height: '100%', width: '100%' })}/>
          </div>
          <div style={({
            fontSize: '10px',
            padding: '20px 20px 5px',
          })}>
            <span style={({ fontWeight: '500', color: '#263238' })}>Chatbot</span><span> for {this.state.organization_name}</span>
          </div>
          <div style={({
            padding: '5px 20px 25px',
            lineHeight: '150%',
          })}>
            <p style={({ marginBottom: '6px' })}>Looking for something? I can help you find it.</p>
            <p>Ask me anything about Jersey City!</p>
          </div>
        </div>}
        <div style={({
          position: 'fixed',
          bottom: '4px',
          right: '4px',
          height: this.state.openConversation ? '0px' : '58px',
          width: this.state.openConversation ? '0px' : '58px',
          background: '#3C3EFF',
          borderRadius: '50%',
          boxShadow: '0 1px 6px rgba(0, 0, 50, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: this.state.openConversation ? '0' : '15px',
        })} onClick={() => this.showConversation()}>
          <div style={({
            position: 'absolute',
            top: '-1px',
            right: '-1px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#2F3099',
            objectFit: 'scale-down',
            boxShadow: '0 1px 2px rgba(0, 0, 50, 0.6)',
            padding: '3px',
            fontSize: '9px',
            fontWeight: '500',
            display: this.state.openConversation ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#FFF',
          })}>
            <img src="charge.svg" style={({ height: '100%', width: '100%' })}/>
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
