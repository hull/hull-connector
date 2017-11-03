export default function devMode(app, options) {
  const _ = require('lodash');
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const ProgressBarPlugin = require('progress-bar-webpack-plugin');
  const config = require('hull-connector/config/webpack.config');

  const entry = _.reduce(
    config.entry,
    (m, v, k) => {
      m[k] = [
        require.resolve('babel-polyfill'),
        require.resolve('react-hot-loader/patch'),
        require.resolve('webpack-hot-middleware/client'),
        v,
      ];
      return m;
    },
    {}
  );

  const plugins = [
    new webpack.HotModuleReplacementPlugin(),
    ...config.plugins,
    new webpack.NamedModulesPlugin(),
    new ProgressBarPlugin({ clear: false }),
    new webpack.NoEmitOnErrorsPlugin(),
  ];

  const compiler = webpack({ ...config, entry, plugins });

  app.use(
    webpackDevMiddleware(compiler, {
      hot: true,
      quiet: false,
      overlay: false,
      noInfo: false,
      lazy: false,
      clientLogLevel: 'none',
      watchContentBase: true,
      stats: { colors: true },
      watchOptions: {
        ignored: /node_modules/,
      },
      historyApiFallback: {
        disableDotRule: true,
      },

      headers: { 'Access-Control-Allow-Origin': 'http://localhost' },
      publicPath: config.output.publicPath,
    })
  );
  app.use(webpackHotMiddleware(compiler));

  if (options.ngrok) {
    const ngrok = require('ngrok');
    const boxen = require('boxen');
    const chalk = require('chalk');
    const exitHook = require('exit-hook');

    exitHook(() => {
      console.log('Disconnecting Ngrok');
      ngrok.disconnect();
      ngrok.kill();
    });

    ngrok.connect(
      {
        addr: options.port,
        subdomain: options.ngrok.subdomain,
      },
      (err, url) => {
        if (err) {
          console.log(err);
          if (err.code === 'ECONNREFUSED') {
            console.log(
              chalk.red(`Connection refused at ${err.address}:${err.port}`)
            );
            process.exit(1);
          }
          console.log(chalk.yellow(`ngrok reported an error: ${err.msg}`));
          console.log(
            boxen(err.details.err.trim(), {
              padding: {
                top: 0,
                right: 2,
                bottom: 0,
                left: 2,
              },
            })
          );
        }
        console.log(
          boxen(chalk.yellow(`Public URL for setting up connector: ${url}`), {
            padding: {
              dimBorder: true,
              borderStyle: 'double',
              top: 0,
              right: 2,
              bottom: 0,
              left: 2,
            },
          })
        );
      }
    );
  }
}
