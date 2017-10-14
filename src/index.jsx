/* global document */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { AppContainer } from 'react-hot-loader';
import store from './app/store';
import style from './css/index';

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <App store={store} />
    </AppContainer>,
    document.getElementById('root')
  );
};

render(App);

if (module.hot) module.hot.accept('./app', () => render());
