import React, { Component } from 'react';
import styled from 'styled-components';

const Section = styled.div`
  display: flex;
  width: 100%;
  min-height: 80px;
  border-top: 1px solid #EEE;
  &:hover {
    border-top: 1px solid #3C3EFF;
  }
  input {
    width: 100%;
    padding: 20px 20px 20px 24px;
    background: none transparent;
    width: 100%;
    outline: none;
    font-size: 17px;
    font-weight: 300;
    &::placeholder {
      color: #9A9A9A;
    }
  }
  span {
    display: flex;
    padding: 8px 16px;
    margin: 18px 20px 18px 12px;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    border: ${props => props.valid ? '1px solid #3C3EFF' : '1px solid #CCC'};
    color: ${props => props.valid ? '#3C3EFF' : '#CCC' };
    font-size: 18px;
    font-weight: 500;
    &:hover {
      cursor: pointer;
      color: #FFF;
      border: 1px solid #3C3EFF;
      background: #3C3EFF;
    }
  }
`;


class InputComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { text: '' };
  }
  _handleKeyPress(submit, e) {
    if (e.key === 'Enter') {
      submit(e.target.value);
      this.setState({ text: '' });
    }
  }
  pressSend() {
    this.props.submit(this.state.text);
    this.setState({ text: '' });
  }
  render() {
    return <Section valid={this.state.text.length > 0}>
      <input
        type="text"
        value={this.state.text}
        placeholder={`Ask ${this.props.organizationName} a Question`}
        onChange={(e) => this.setState({ text: e.target.value })}
        onKeyPress={this._handleKeyPress.bind(this, this.props.submit)}
      />
    <span onClick={this.pressSend.bind(this)}>→</span>
  </Section>
  }
};

export default InputComponent;
