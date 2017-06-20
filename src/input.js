import React, { Component } from 'react';

class Input extends Component {
  render() {
    return <input type="text" onKeyPress={this._handleKeyPress.bind(this, this.props.submit)} />;
  }

  _handleKeyPress(submit, e) {
    if (e.key === 'Enter') {
      submit(e);
    }
  }
};

export default Input;