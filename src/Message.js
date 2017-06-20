import React, { Component } from 'react';

class Message extends Component {
  render() {
    return (
      <div className={`message ${this.props.message.local ? 'local' : ''}`}>
        {this.props.message.local ? null : <div className="icon" src="logo.svg"/>}
        <div className="body">{this.state.displayed_body}</div>
        {this.props.message.local ? <div className="icon red" src="logo.svg"/> : null}

      </div>
    );
  };

  componentDidMount() {
    const self = this;
    setTimeout(()=>{
      self.setState({ displayed_body : self.props.message.content })
    }, 0);
  };

  state = {
    displayed_body: ''
  }
}

export default Message;
