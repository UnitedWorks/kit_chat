import React, { Component } from 'react';
import styled from 'styled-components';

const Input = styled.input`
  border: 1px solid #DDD;
  padding: 10px;
  width: 100%;
  position: fixed;
  bottom: 0;
  width: 100vw;
  padding: 16px 12px;
  fontSize: 15px;
  border: none;
  boxShadow: 0 4px 32px rgba(140, 147, 179, 0.4);
`;


class InputComponent extends Component {
  render() {
    return <Input
      placeholder="Hello!"
      type="text"
      onKeyPress={this._handleKeyPress.bind(this, this.props.submit)}
    />;
  }

  _handleKeyPress(submit, e) {
    if (e.key === 'Enter') {
      submit(e);
    }
  }
};

export default InputComponent;
