"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initializeContext;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _urijs = require("urijs");

var _urijs2 = _interopRequireDefault(_urijs);

var _jsonColorizer = require("json-colorizer");

var _jsonColorizer2 = _interopRequireDefault(_jsonColorizer);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function initializeContext(_ref) {
  var context = _ref.context,
    minihull = _ref.minihull,
    hull = _ref.hull,
    config = _ref.config,
    connector = _ref.connector,
    segments = _ref.segments;
  var HULL_ORG = config.HULL_ORG;

  context.send = function(p) {
    return minihull.userUpdate(_lodash2.default.isArray(p) ? p : [p]);
  };
  context.colorize = _jsonColorizer2.default;
  context.segments = segments;
  context.minihull = minihull;
  context.hull = hull;
  context.hullClient = hull;
  context.connector = connector;
  context.organization = HULL_ORG;
  context.moment = _moment2.default;
  context.lo = _lodash2.default;
  context.urijs = _urijs2.default;
}
