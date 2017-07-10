import React, { Component } from 'react';

class Message extends Component {
  render() {
    let message = this.props.message;
    let self = this;

    console.log(message);
    return {
      message() {
        return (
          <div className={`message ${message.local ? 'local' : ''} ${self.props.newSender ? '' : 'series'}`}>
            { self.props.newSender &&  <span className="sender">{ message.local ? 'You' : 'Mayor'  }</span> }
            <div className="body">{message.content}</div>
          </div>
        );
      },
      template() {
        return { 
          generic() {
            return (
              <div className='template generic'>{
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
              }</div>
            );
          },

          list() {
            return (
              <div className='template list'>
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
              </div>
            );
          },

          button() {
            return (
              <div className='template button'> {
                message.content.buttons.map(self.buttonTemplate.bind(self))
              }</div>
            );
          }
        }[message.content.templateType || 'generic']();
      }
    }[message.content.type || 'message']();
  };

  buttonTemplate(button) {
    let self = this;
    if (button.type === 'postback') {
      return <a href="#" onClick={ self.props.templateButton.bind(self, button) }>{button.title}</a>;
    } else if (button.type === 'element_share') {
      return <a href="#">Share</a>;
    } else if (button.type === "web_url") {
      return <a href={button.url}>{ button.title}</a>;
    }
  }

  state = {
    displayed_body: ''
  };
}

export default Message;
