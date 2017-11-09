import express from 'express';
import { errorHandler } from 'hull-connector';
import { statusHandler, notifyHandler } from './handlers';

export default function Server(options = {}) {
  const app = express();
  const { Hull } = options;

  const connector = new Hull.Connector(options);

  if (options.devMode) {
    const { devMode } = require('hull-connector');
    devMode(app, options);
  }
  connector.setupApp(app);

  app.post('/batch', notifyHandler);
  app.post('/smart-notifier', notifyHandler);
  app.all('/status', statusHandler);

  // Error Handler
  app.use(errorHandler);
  connector.startApp(app);
  return app;
}
