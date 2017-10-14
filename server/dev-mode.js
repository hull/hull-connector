import _ from 'lodash';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import AssetsWebpackPlugin from 'assets-webpack-plugin';
import config from '../webpack.config';

const entry = _.reduce(
  config.entry,
  (m, v, k) => {
    m[k] = [
      'babel-polyfill',
      'react-hot-loader/patch',
      'webpack-hot-middleware/client',
      v
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
  new AssetsWebpackPlugin()
];

export default function devMode(app) {
  const compiler = webpack({ ...config, entry, plugins });
  app.use(
    webpackDevMiddleware(compiler, {
      stats: { colors: true },
      noInfo: false,
      lazy: false,
      headers: { 'Access-Control-Allow-Origin': 'http://localhost' },
      publicPath: config.output.publicPath
    })
  );
  app.use(webpackHotMiddleware(compiler));
}
