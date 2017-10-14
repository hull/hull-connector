import express from 'express';
import devMode from './dev-mode';
import errorHandler from './error';

export default function Server(connector, options = {}) {
  const app = express();
  // const { Hull, hostSecret } = options;

  if (options.devMode) devMode(app);
  connector.setupApp(app);

  app.post('/batch', function(req, res) {});
  app.post('/notify', function(req, res) {});
  app.all('/status', function(req, res) {});

  // Error Handler
  app.use(errorHandler);
  return app;
}
