import React, { Component } from 'react';

class Message extends Component {
  render() {
    let message = this.props.message;
    let self = this;

    console.log(message);
    return {
      message() {
        return (
          <div className={`message ${message.local ? 'local' : ''}`}>
            { self.props.newSender &&  <span className="sender">{ message.local ? 'You' : 'Mayor'  }</span> }
            <div className="body">{message.content}</div>
          </div>
        );
      },
      template() {
        return (<div className='template'>{
          message.content.elements.map((element) => {
            return <div className="card">
              <img src={element.image_url}/>
              <div className="info">
                <h3>{element.title}</h3> 
                <p>{element.subtitle}</p>
              </div>
              <div className="buttons">
                {
                  element.buttons.map((button) => {
                    if (button.type === 'postback') {
                      return <a href="#" onClick={ self.props.templateButton.bind(self, button) }>{button.title}</a>;
                    } else if (button.type === 'element_share') {
                      return <a href="#">Share</a>;
                    }
                  })
                }
              </div>
            </div>;
          })
        }</div>);
      }
    }[message.content.type || 'message']();
  };

  state = {
    displayed_body: ''
  };
}

export default Message;
