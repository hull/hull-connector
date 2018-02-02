'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = electrode;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

var _repl = require('repl');

var _repl2 = _interopRequireDefault(_repl);

var _boxen = require('boxen');

var _boxen2 = _interopRequireDefault(_boxen);

var _jsonColorizer = require('json-colorizer');

var _jsonColorizer2 = _interopRequireDefault(_jsonColorizer);

var _mockr = require('../mockr');

var _mockr2 = _interopRequireDefault(_mockr);

var _initializeContext = require('./initialize-context');

var _initializeContext2 = _interopRequireDefault(_initializeContext);

var _parsePrompt = require('./parse-prompt');

var _parsePrompt2 = _interopRequireDefault(_parsePrompt);

var _parseQueryString = require('./parse-query-string');

var _parseQueryString2 = _interopRequireDefault(_parseQueryString);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function electrode(server) {
  var noop = function noop() {};
  process.env.NODE_REPL_HISTORY = process.cwd() + '/.hull_repl';

  (0, _parsePrompt2.default)()
    .then(_parseQueryString2.default)
    .then(function(config) {
      var hull = new Hull({
        id: config.HULL_ID,
        secret: config.HULL_SECRET,
        organization: config.HULL_ORG
      });
      return Promise.all(
        hull.api(config.HULL_ID),
        hull.api('/segments')
      ).then(function(_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
          ship = _ref2[0],
          segments = _ref2[1];

        return { ship: ship, segments: segments, hull: hull, config: config };
      });
    })
    .then(function(_ref3) {
      var hull = _ref3.hull,
        ship = _ref3.ship,
        config = _ref3.config,
        segments = _ref3.segments;

      var beforeEach = function beforeEach(fn) {
        return fn(noop);
      };
      var afterEach = function afterEach(fn) {
        return fn(noop);
      };
      var mocks = (0, _mockr2.default)({
        server: server,
        segments: segments,
        beforeEach: beforeEach,
        afterEach: afterEach,
        port: 8000
      });

      var replServer = _repl2.default.start({
        prompt: 'hull > ',
        useColors: true,
        eval: function _eval(cmd, context, filename, callback) {
          var result = _vm2.default.runInContext(cmd, context);
          if (result && result.then instanceof Function) {
            return result.then(
              function(res) {
                return callback(null, res);
              },
              function(err) {
                return callback(null, err);
              }
            );
          }
          callback(null, result);
          return null;
        }
      });

      (0, _initializeContext2.default)(replServer.context, hull, config);

      replServer.on('exit', function() {
        return process.exit();
      });

      replServer.defineCommand('user:update', {
        help: "Send a user:update payload to Connector's endpoint",
        action: function action(file) {
          beforeEach();
          var payload = JSON.parse(_fs2.default.readFileSync(file));
          console.log(payload);
          this.lineParser.reset();
          this.bufferedCommand = '';
          mocks.minihull.userUpdate(
            { connector: ship, messages: [payload] },
            function(_ref4) {
              var batch = _ref4.batch,
                logs = _ref4.logs;

              console.log((0, _boxen2.default)('LOGS'));
              console.log((0, _jsonColorizer2.default)(logs));
              console.log((0, _boxen2.default)('RESPONSE'));
              console.log((0, _jsonColorizer2.default)(batch));
              afterEach();
            }
          );
        }
      });
    });
}
