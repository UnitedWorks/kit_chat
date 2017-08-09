import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
// import registerServiceWorker from './registerServiceWorker';
import { injectGlobal } from 'styled-components';

injectGlobal`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
  *, :after, :before {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0;
  }
`;

ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();
