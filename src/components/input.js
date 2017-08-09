import React, { Component } from 'react';
import styled from 'styled-components';

const Input = styled.input`
  border-top: 1px solid #EEE;
  padding: 10px;
  width: 100%;
  position: fixed;
  bottom: 0;
  width: 100vw;
  padding: 20px 24px 40px;
  font-size: 16px;
  font-weight: 300;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
  outline: none;
  min-height: 80px;
  &:focus {
    border-top: 1px solid #3C3EFF;
  }
  &::placeholder {
    color: #9A9A9A;
  }
`;


class InputComponent extends Component {
  _handleKeyPress(submit, e) {
    if (e.key === 'Enter') {
      submit(e);
    }
  }
  render() {
    return <Input
      type="text"
      placeholder={`Ask ${this.props.organizationName} a Question`}
      onKeyPress={this._handleKeyPress.bind(this, this.props.submit)}
    />;
  }
};

export default InputComponent;
