const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HappyPack = require('happypack');
const moment = require('moment');

const isProduction = () => process.env.NODE_ENV === 'production';

let plugins = [
  new HappyPack({
    id: 'jsx',
    threads: 4,
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          babelrc: false,
          presets: [['env', { modules: false }], 'react', 'stage-0'],
          plugins: ['react-hot-loader/babel']
        }
      }
    ]
  }),
  new HappyPack({
    id: 'styles',
    threads: 2,
    loaders: [
      { loader: 'style-loader' },
      { loader: 'css-loader' },
      { loader: 'sass-loader' },
      {
        loader: 'postcss-loader',
        options: {
          indent: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'), // eslint-disable-line
            autoprefixer({
              browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 9' // React doesn't support IE8 anyway
              ],
              flexbox: 'no-2009'
            })
          ]
        }
      }
    ]
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      BUILD_DATE: JSON.stringify(moment().format('MMMM, DD, YYYY, HH:mm:ss')),
      GIT_COMMIT: JSON.stringify(process.env.CIRCLE_SHA1 || '')
    }
  })
];

if (isProduction()) {
  plugins = [
    ...plugins,
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false, screw_ie8: false }
    })
  ];
}

module.exports = {
  devtool: isProduction() ? 'source-map' : 'inline-source-map',

  performance: {
    hints: isProduction() ? 'warning' : false
  },

  entry: {
    index: path.join(__dirname, 'src/index.js'),
    ship: path.join(__dirname, 'src/ship.js')
  },

  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].js',
    publicPath: '/'
  },

  plugins,

  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['.js', '.jsx', '.css', '.scss']
  },

  module: {
    rules: [
      {
        test: /\.jsx|\.js$/,
        loader: 'happypack/loader?id=jsx',
        exclude: /node_modules/
      },
      // styles
      {
        test: /\.(css|scss)$/,
        loader: 'happypack/loader?id=styles'
      },
      // svg
      { test: /.svg$/, loader: 'svg-inline-loader' },
      // images & other files
      {
        test: /\.jpe?g$|\.gif$|\.png|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'file-loader'
      }
    ]
  }
};
