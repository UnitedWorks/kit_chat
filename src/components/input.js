import React, { Component } from 'react';
import styled from 'styled-components';

const Input = styled.input`
  border-top: 1px solid #DDD;
  padding: 10px;
  width: 100%;
  position: fixed;
  bottom: 0;
  width: 100vw;
  padding: 16px 16px 32px;
  font-size: 16px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
  outline: none;
  &:focus {
    border-top: 1px solid #3C3EFF;
  }
`;


class InputComponent extends Component {
  render() {
    return <Input
      type="text"
      placeholder="Hello!"
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
