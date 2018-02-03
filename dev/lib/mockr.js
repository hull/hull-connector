"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _minihull = require("minihull");

var _minihull2 = _interopRequireDefault(_minihull);

var _hull = require("hull");

var _hull2 = _interopRequireDefault(_hull);

var _nock = require("nock");

var _nock2 = _interopRequireDefault(_nock);

var _jwtSimple = require("jwt-simple");

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var noop = function noop() {};

module.exports = function bootstrap(_ref) {
  var server = _ref.server,
    beforeEach = _ref.beforeEach,
    afterEach = _ref.afterEach,
    port = _ref.port,
    segments = _ref.segments;

  var mocks = {};
  mocks.nock = _nock2.default;
  var response = { logs: [], batch: [] };

  var logger = function logger(level, message, data) {
    response.logs.push({ level: level, message: message, data: data });
  };
  _hull2.default.logger.on("logged", logger);

  beforeEach(function(done) {
    response.logs = [];
    response.batch = [];

    var minihull = new _minihull2.default();
    minihull.listen(8001).then(done);
    minihull.stubSegments(segments);
    minihull.userUpdate = function(_ref2) {
      var connector = _ref2.connector,
        messages = _ref2.messages;
      var callback =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : noop;

      var t = setTimeout(function() {
        callback(response);
      }, 1800);

      var send = function send(res) {
        clearTimeout(t);
        callback(res);
      };

      mocks.minihull.on("incoming.request@/api/v1/firehose", function(req) {
        var _response$batch;

        (_response$batch = response.batch).push.apply(
          _response$batch,
          (0, _toConsumableArray3.default)(
            req.body.batch.map(function(r) {
              return (0, _extends3.default)({}, r, {
                claims: _jwtSimple2.default.decode(
                  r.headers["Hull-Access-Token"],
                  "",
                  true
                )
              });
            })
          )
        );
      });
      minihull
        .smartNotifyConnector(
          connector,
          "http://localhost:" + port + "/smart-notifier",
          "user:update",
          messages
        )
        .then(function() {
          send(response);
          // console.log('response came', res)
        });
    };
    mocks.minihull = minihull;
    mocks.server = server({
      hostSecret: "1234",
      skipSignatureValidation: true,
      Hull: _hull2.default,
      port: port,
      clientConfig: {
        flushAt: 1,
        protocol: "http",
        firehoseUrl: "http://localhost:8001/api/v1/firehose"
      }
    });
  });

  afterEach(function() {
    mocks.minihull.close();
    mocks.server.close();
    mocks.nock.cleanAll();
  });

  return mocks;
};
