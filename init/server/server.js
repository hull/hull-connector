import express from 'express';
import { devMode, errorHandler } from 'hull-connector/server';
import { statusHandler, notifyHandler } from './handlers';

export default function Server(options = {}) {
  const app = express();
  const { Hull } = options;

  const connector = new Hull.Connector(options);

  if (options.devMode) devMode(app, options);
  connector.setupApp(app);

  app.post('/batch', notifyHandler);
  app.post('/notify', notifyHandler);
  app.all('/status', statusHandler);

  // Error Handler
  app.use(errorHandler);
  connector.startApp(app);
  return app;
}
