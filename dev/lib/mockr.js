"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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
  var _this = this;

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
    mocks.minihull = minihull;
    minihull.listen(8001);
    minihull.stubSegments(segments);
    var perform = (function() {
      var _ref2 = (0, _asyncToGenerator3.default)(
        /*#__PURE__*/ _regenerator2.default.mark(function _callee(_ref3) {
          var connector = _ref3.connector,
            messages = _ref3.messages,
            channel = _ref3.channel;
          var res;
          return _regenerator2.default.wrap(
            function _callee$(_context) {
              while (1) {
                switch ((_context.prev = _context.next)) {
                  case 0:
                    mocks.minihull.on(
                      "incoming.request@/api/v1/firehose",
                      function(req) {
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
                      }
                    );
                    _context.next = 3;
                    return minihull.smartNotifyConnector(
                      connector,
                      "http://localhost:" +
                        port +
                        manifest.subscriptions[0].url,
                      channel,
                      messages
                    );

                  case 3:
                    res = _context.sent;
                    return _context.abrupt(
                      "return",
                      new Promise(function(resolve) {
                        setTimeout(function() {
                          resolve(res);
                        }, 500);
                      })
                    );

                  case 5:
                  case "end":
                    return _context.stop();
                }
              }
            },
            _callee,
            _this
          );
        })
      );

      return function perform(_x) {
        return _ref2.apply(this, arguments);
      };
    })();

    minihull.accountUpdate = (function() {
      var _ref4 = (0, _asyncToGenerator3.default)(
        /*#__PURE__*/ _regenerator2.default.mark(function _callee2(payload) {
          return _regenerator2.default.wrap(
            function _callee2$(_context2) {
              while (1) {
                switch ((_context2.prev = _context2.next)) {
                  case 0:
                    return _context2.abrupt(
                      "return",
                      perform(
                        (0, _extends3.default)({}, payload, {
                          channel: "account:update"
                        })
                      )
                    );

                  case 1:
                  case "end":
                    return _context2.stop();
                }
              }
            },
            _callee2,
            _this
          );
        })
      );

      return function(_x2) {
        return _ref4.apply(this, arguments);
      };
    })();
    minihull.userUpdate = (function() {
      var _ref5 = (0, _asyncToGenerator3.default)(
        /*#__PURE__*/ _regenerator2.default.mark(function _callee3(payload) {
          return _regenerator2.default.wrap(
            function _callee3$(_context3) {
              while (1) {
                switch ((_context3.prev = _context3.next)) {
                  case 0:
                    return _context3.abrupt(
                      "return",
                      perform(
                        (0, _extends3.default)({}, payload, {
                          channel: "user:update"
                        })
                      )
                    );

                  case 1:
                  case "end":
                    return _context3.stop();
                }
              }
            },
            _callee3,
            _this
          );
        })
      );

      return function(_x3) {
        return _ref5.apply(this, arguments);
      };
    })();

    mocks.server = server(
      {
        hostSecret: "1234",
        skipSignatureValidation: true,
        Hull: _hull2.default,
        port: port,
        clientConfig: {
          flushAt: 1,
          protocol: "http",
          firehoseUrl: "http://localhost:8001/api/v1/firehose"
        }
      },
      done
    );
  });

  afterEach(function() {
    mocks.minihull.close();
    mocks.server.close();
    mocks.nock.cleanAll();
  });

  return mocks;
};
