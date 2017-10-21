// @flow

import { compose } from 'redux';
// import { createStore } from './reactotron';
import reducer from './reducers';
import middleware from './middleware';

const createStore =
  process.env.NODE_ENV !== 'production'
    ? require('redux').createStore
    : require('reactotron').createStore;

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(middleware));

export default store;
