// @flow

import { createStore, compose } from 'redux';
import Reactotron from 'hull-connector-dev/reactotron';

import reducer from './reducers';
import middleware from './middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = Reactotron.createStore(reducer, composeEnhancers(middleware));

export default store;
