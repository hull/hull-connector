// @flow

import { applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

// import createRavenMiddleware from 'raven-for-redux';
// import { createLogger } from 'redux-logger';
// import { trackFSAction } from './lib/tracking/trackAction';

// const loggerMiddleware = createLogger({
//   predicate() {
//     try {
//       const { email } = window.Hull.currentUser();
//       return /hull\.io/.test(email);
//     } catch (err) {
//       return false;
//     }
//   }
// });

// const trackingMiddleware = () => next => action => {
//   trackFSAction(action);
//   return next(action);
// };

export default applyMiddleware(thunkMiddleware);
