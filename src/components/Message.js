import React, { Component } from 'react';
import styled from 'styled-components';

const Message = styled.div`
  ${props => props.newSender ? 'margin-top: 12px;' : 'margin-top: 2px;'}
  display: flex;
  flex-flow: column;
  align-self: flex-start;
  align-items: flex-start;
  flex-shrink: 0;
  position: relative;
  animation: new-message 0.7s ease-out;
  transition: all 1s;
  span {
    font-size: 14px;
    padding: 5px 10px;
    color: #DDD;
  }
  div {
    background: #FFF;
    padding: 5px 10px 5px 10px;
    border-radius: 25px;
    background: #EFEFEF;
  }
`;

const TemplateBase = styled.div`
  display: flex;
  margin-top: 16px;
  .card {
    box-shadow: 0px 1px 4px #DDD;
    display: flex;
  }
  .buttons {
    display: flex;
    flex-flow: column;
    align-items: flex-end;

    padding: 5px;
    width: 100%;
    flex: auto 0 0;
    margin-top: auto;
    padding: 10px;
  }
  .buttons a {
    color: #3237ff;
    text-decoration: none;
    min-width: 100%;
  }
`;

const TemplateGeneric = TemplateBase.extend`
  margin-bottom: 10px;
  overflow-y: hidden;
  overflow-x: scroll;
  flex-flow: row nowrap;
  min-height: 400px;
  padding-bottom: 10px;
  &::-webkit-scrollbar {
    display: none;
  }
  .card {
    flex: 1 0 75%;
    max-width: 350px;
    margin: 0px 5px;
    flex-flow: column;
  }
  .card img {
    display: inline-block;
    width: 100%;
    max-height: 50%;
    overflow-y: hidden;
    object-fit: cover;
  }
  .card .info {
    padding: 5px;
  }
  .buttons a:not(:last-child) {
    border-bottom: 1px solid #EFEFEF;
  }
  .buttons a {
    text-align: right;
    padding: 5px 0px;
  }
`;

const TemplateList = TemplateBase.extend`
  flex-flow: column;
  display: flex;
  flex-shrink: 0;
  .card {
    width: 100%;
    display: flex;
    flex-flow: row;
    padding: 10px;
  }
  .info {
    display: flex;
    flex: 1 0 auto;
    flex-flow: column;
  }
  img {
    flex: 0 0 50px;
    height: 50px;
    margin-right: 10px;
    background: #fbfdff;
    background: linear-gradient(135deg, #fbfdff 0%,#f5faff 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#fbfdff', endColorstr='#f5faff',GradientType=1 );
  }
`;

const TemplateButton = TemplateBase.extend`
  padding: 20px;
  flex-flow: row;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  & > a {
    color: #3C3EFF;
    background: transparent;
    cursor: pointer;
    list-style: none;
    display: inline-block;
    margin: 0;
    padding: 15px 28px;
    line-height: 1;
    text-decoration: none;
    font-size: 18px;
    font-weight: 300;
    border: 2px solid #3C3EFF;
    border-radius: 100px;
  }
`;

class MessageComponent extends Component {
  render() {
    let message = this.props.message;
    let self = this;

    return {
      message() {
        return (
          <Message newSender={self.props.newSender}>
            {self.props.newSender && <span className="sender">{message.local ? 'You' : 'Bot'}</span>}
            <div>{message.content}</div>
          </Message>
        );
      },
      template() {
        return {
          generic() {
            return (
              <TemplateGeneric>
                {
                  message.content.elements.map((element) => {
                    return <div className="card">
                      <img src={element.image_url}/>
                      <div className="info">
                        <h3>{element.title}</h3>
                        { element.subtitle ? <p>{element.subtitle}</p> : '' }
                      </div>
                      <div className="buttons">
                        { element.buttons.map(self.buttonTemplate.bind(self)) }
                      </div>
                    </div>;
                  })
                }
              </TemplateGeneric>
            );
          },

          list() {
            return (
              <TemplateList>
                {
                  message.content.elements.map((element) => {
                    return <div className="card">
                      <img src={element.image_url}/>
                      <div className="info">
                        <h3>{element.title}</h3>
                        <p>{element.subtitle}</p>
                      </div>
                    </div>;
                  })
                }
                <div className="buttons">
                  { message.content.buttons.map(self.buttonTemplate.bind(self)) }
                </div>
              </TemplateList>
            );
          },

          button() {
            return (
              <TemplateButton>
                {message.content.buttons.map(self.buttonTemplate.bind(self))}
              </TemplateButton>
            );
          }
        }[message.content.templateType || 'generic']();
      }
    }[message.content.type || 'message']();
  };

  buttonTemplate(button) {
    let self = this;
    if (button.type === 'postback') {
      return <a onClick={ self.props.templateButton.bind(self, button) }>{button.title}</a>;
    } else if (button.type === "web_url") {
      return <a href={button.url} target="_blank" rel="noopener noreferrer">{ button.title}</a>;
    }
  }
}

export default MessageComponent;
