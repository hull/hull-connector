"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.default = Mini;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _minihull = require("minihull");

var _minihull2 = _interopRequireDefault(_minihull);

var _jsonColorizer = require("json-colorizer");

var _jsonColorizer2 = _interopRequireDefault(_jsonColorizer);

var _boxen = require("boxen");

var _boxen2 = _interopRequireDefault(_boxen);

var _jwtSimple = require("jwt-simple");

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function Mini(_ref) {
  var segments = _ref.segments,
    connector = _ref.connector,
    hullPort = _ref.hullPort,
    port = _ref.port,
    endpoint = _ref.endpoint;
  var callback =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : function() {};

  try {
    var minihull = new _minihull2.default();
    minihull.listen(hullPort, callback);
    minihull.stubSegments(segments);
    minihull.on("incoming.request@/api/v1/firehose", function(req) {
      var response = req.body.batch.map(function(r) {
        return (0, _extends3.default)({}, r, {
          claims: _jwtSimple2.default.decode(
            r.headers["Hull-Access-Token"],
            "",
            true
          )
        });
      });
      console.log((0, _boxen2.default)("Received Firehose Payload"));
      console.log((0, _jsonColorizer2.default)(JSON.stringify(response)));
    });

    minihull.userUpdate = function() {
      var messages =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      console.log((0, _boxen2.default)("Sending update"));
      if (!_lodash2.default.isArray(messages)) {
        throw new Error(
          "The messages in userUpdate was not an array of users."
        );
      }
      console.log(
        (0, _jsonColorizer2.default)(JSON.stringify(messages, null, 2))
      );
      minihull
        .smartNotifyConnector(
          connector,
          "http://localhost:" + port + endpoint,
          "user:update",
          messages
        )
        .catch(function(e) {
          console.log(e);
          throw e;
        });
    };
    return minihull;
  } catch (e) {
    console.log(e);
  }
}
