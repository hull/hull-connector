// @flow

import { combineReducers } from 'redux';

const DEFAULT_STATE = {
  isOpen: false
};

const nullReducer = function(state = DEFAULT_STATE, action = {}) {
  switch (action.type) {
    case 'ERROR':
      return action.error;
    default:
      return state;
  }
};
export default combineReducers({ nullReducer });
