import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
// import registerServiceWorker from './registerServiceWorker';
import { injectGlobal } from 'styled-components';

injectGlobal`
  @font-face {
    font-family: 'BentonSans';
    src: url('BentonSans-Book.otf') format('opentype');
    font-weight: 200;
    font-style: normal;
  }
  @font-face {
    font-family: 'BentonSans';
    src: url('BentonSans-Regular.otf') format('opentype');
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'BentonSans';
    src: url('BentonSans-Medium.otf') format('opentype');
    font-weight: 400;
    font-style: normal;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: BentonSans, sans-serif;
    font-weight: 200;
  }
  *, :after, :before {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0;
  }
`;

// For now, throttle how many people we show this to. If they've seen it, they will keep seeing it though
if (localStorage.getItem('state') && JSON.parse(localStorage.getItem('state')).constituent_id) {
  ReactDOM.render(<App />, document.getElementById('root'));
} else {
  if (Math.floor(Math.random() * 100) < 3) {
    ReactDOM.render(<App />, document.getElementById('root'));
  }
}
