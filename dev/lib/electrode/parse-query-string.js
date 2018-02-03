"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.default = parseQueryString;

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function parseQueryString(config) {
  var argv = (0, _minimist2.default)(process.argv.slice(2));
  if (!argv.url) return Promise.resolve({});

  var _ref = _url2.default.parse(argv.url, true).query || {},
    HULL_ID = _ref.ship,
    HULL_SECRET = _ref.secret,
    HULL_ORG = _ref.organization;

  var port = argv.port || config.port;
  if (HULL_ID && HULL_SECRET && HULL_ORG) {
    return Promise.resolve(
      (0, _extends3.default)({}, config, {
        port: port,
        HULL_ID: HULL_ID,
        HULL_SECRET: HULL_SECRET,
        HULL_ORG: HULL_ORG
      })
    );
  }
  return Promise.resolve((0, _extends3.default)({}, config, { port: port }));
}
