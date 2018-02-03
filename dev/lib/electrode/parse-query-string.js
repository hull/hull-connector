"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseQueryString;

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function parseQueryString() {
  var argv = (0, _minimist2.default)(process.argv.slice(2));
  if (!argv.url) return Promise.resolve({});

  var passedUrl = url.parse(argv.url, true);
  var _passedUrl$query$quer = passedUrl.query.query;
  _passedUrl$query$quer =
    _passedUrl$query$quer === undefined ? {} : _passedUrl$query$quer;
  var HULL_ID = _passedUrl$query$quer.ship,
    HULL_SECRET = _passedUrl$query$quer.secret,
    HULL_ORG = _passedUrl$query$quer.organization;

  if (HULL_ID && HULL_SECRET && HULL_ORG) {
    return Promise.resolve({
      HULL_ID: HULL_ID,
      HULL_SECRET: HULL_SECRET,
      HULL_ORG: HULL_ORG
    });
  }
  return Promise.resolve({});
}
