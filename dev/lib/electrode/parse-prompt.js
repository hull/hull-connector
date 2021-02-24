"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.default = parsePrompt;

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parsePrompt(config = {}) {
  const { HULL_ID, HULL_ORG, HULL_SECRET } = config;
  if (HULL_ID && HULL_SECRET && HULL_ORG) return config;
  return _inquirer2.default.prompt([{
    type: "input",
    name: "HULL_ID",
    message: "SHIP_ID"
  }, {
    type: "input",
    name: "HULL_SECRET",
    message: "SHIP_SECRET"
  }, {
    type: "input",
    name: "HULL_ORG",
    message: "SHIP_ORG"
  }]).then(conf => (0, _extends3.default)({}, config, conf));
}