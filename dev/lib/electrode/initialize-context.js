"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initializeContext;

var _hull = require("hull");

var _hull2 = _interopRequireDefault(_hull);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function initializeContext(context, hull, _ref) {
  var HULL_ID = _ref.HULL_ID,
    HULL_ORG = _ref.HULL_ORG;

  context.hull = hull;
  context.hullClient = hull;
  context.connector = HULL_ID;
  context.organization = HULL_ORG;
  context.moment = require("moment");
  context.lo = _;
}
