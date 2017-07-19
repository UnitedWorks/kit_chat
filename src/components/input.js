import React, { Component } from 'react';

class Input extends Component {
  render() {
    return <input
      placeholder="Hello!"
      type="text"
      onKeyPress={this._handleKeyPress.bind(this, this.props.submit)}
      style={({
        position: 'fixed',
        bottom: 0,
        width: '100vw',
        padding: '16px 12px',
        fontSize: '15px',
        border: 'none',
        boxShadow: '0 4px 32px rgba(140, 147, 179, 0.4)',
      })}
    />;
  }

  _handleKeyPress(submit, e) {
    if (e.key === 'Enter') {
      submit(e);
    }
  }
};

export default Input;
