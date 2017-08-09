import React, { Component } from 'react';
import styled, { css } from 'styled-components';

const Message = styled.div`
  ${props => props.newSender ? 'margin-top: 12px;' : 'margin-top: 2px;'}
  display: flex;
  flex-flow: column;
  align-self: flex-start;
  align-items: flex-start;
  flex-shrink: 0;
  position: relative;
  span {
    font-size: 11px;
    padding: 5px 10px;
    color: #9A9A9A;
  }
  div {
    font-size: 15px;
    padding: 12px 12px 10px;
    border-radius: 20px;
    background: #F8F8F8;
  }
  ${props => {
    if (props.localMessage) {
      return css`
        align-self: flex-end;
        align-items: flex-end;
        div {
          color: #FFF;
          background: #3C3EFF;
        }
      `;
    }
  }}
`;

const TemplateBase = styled.div`
  display: flex;
  margin: 8px 0;
  max-height: 480px;
  .card {
    display: flex;
    border-radius: 3px;
    box-shadow: 0px 1px 4px #DDD;
  }
  .card .info {
    padding: 16px;
    h4, h5 {
      margin-bottom: 8px;
    }
    p {
      font-size: 13px;
      line-height: 125%;
    }
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
    a {
      color: #3237ff;
      text-decoration: none;
      min-width: 100%;
      text-align: right;
      padding: 8px 5px;
      font-weight: 300;
      &:hover {
        cursor: pointer;
      }
    }
    a:not(:last-child) {
      border-bottom: 1px solid #FAFAFA;
    }
  }
`;

const TemplateGeneric = TemplateBase.extend`
  flex-flow: row nowrap;
  min-height: 400px;
  padding-bottom: 24px;
  overflow-y: hidden;
  overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  .card {
    flex: 1 0 75%;
    height: 400px;
    max-width: 350px;
    margin: 0px 5px;
    flex-flow: column;
  }
  .card object, .card img {
    display: inline-block;
    width: 100%;
    max-height: 50%;
    overflow-y: hidden;
  }
`;

const TemplateList = TemplateBase.extend`
  .card {
    display: flex;
    width: 100%;
    flex-flow: column;
  }
  .title {
    padding: 24px 16px 16px;
    border-bottom: 1px solid #F0F0F0;
    h3 {
      margin-bottom: 10px;
    }
  }
`;

const TemplateButton = TemplateBase.extend`
  margin-top: 10px;
  flex-flow: row;
  & > a {
    color: #3C3EFF;
    background: transparent;
    cursor: pointer;
    list-style: none;
    display: inline-block;
    margin: 0;
    padding: 12px 14px 8px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 300;
    border: 1px solid #3C3EFF;
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
          <Message newSender={self.props.newSender} localMessage={message.local}>
            {self.props.newSender && <span className="sender">{message.local ? 'You' : 'Local Gov Bot'}</span>}
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
                  message.content.elements.map((element, index) => {
                    return <div key={index} className="card">
                      <object data={element.image_url} type="image/png">
                        <img src={self.props.organization.picture || 'https://scontent.xx.fbcdn.net/v/t31.0-8/18589000_245329029282188_201697997574538644_o.png?oh=3c0896d62bc013dc7a520cd8aef2ec7d&oe=59B0D211'} />
                      </object>
                      <div className="info">
                        <h4>{element.title}</h4>
                        {element.subtitle ? <p>{element.subtitle}</p> : ''}
                      </div>
                      <div className="buttons">
                        {element.buttons.map(self.buttonTemplate.bind(self))}
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
                <div className="card">
                  {
                    message.content.elements.map((element, index) => {
                      return (
                        <div key={index}>
                          {element.image_url && <div className="title">
                            <h3>{element.title}</h3>
                            <p>{element.subtitle}</p>
                          </div>}
                          {!element.image_url && <div className="info">
                            <h5>{element.title}</h5>
                            <p>{element.subtitle}</p>
                          </div>}
                        </div>
                      );
                    })
                  }
                  <div className="buttons">
                    {message.content.buttons.map(self.buttonTemplate.bind(self))}
                  </div>
                </div>
              </TemplateList>
            );
          },

          button() {
            return (
              <div>
                <Message newSender={self.props.newSender}>
                  <span className="sender">Local Gov Bot</span>
                  <div>{message.content.text}</div>
                </Message>
                <TemplateButton>
                  {message.content.buttons.map(self.buttonTemplate.bind(self))}
                </TemplateButton>
              </div>
            );
          }
        }[message.content.templateType || 'generic']();
      }
    }[message.content.type || 'message']();
  };

  buttonTemplate(button, index) {
    let self = this;
    if (button.type === 'postback') {
      return <a key={index} onClick={self.props.templateButton.bind(self, button)}>{button.title}</a>;
    } else if (button.type === "web_url") {
      return <a key={index} href={button.url} target="_blank" rel="noopener noreferrer">{ button.title}</a>;
    }
  }
}

export default MessageComponent;
