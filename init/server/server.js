const express = require("express");
const { errorHandler } = require("hull-connector");
const { statusHandler, notifyHandler } = require("./handlers");

function server(options = {}) {
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

  connector.startApp(app);

  // Error Handler
  app.use(errorHandler);

  return app;
}

module.exports = server;
