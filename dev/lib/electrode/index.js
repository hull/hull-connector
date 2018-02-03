"use strict";

require("babel-register")({ presets: ["env", "stage-0"] });
var electrode = require("./electrode");
module.exports = electrode;
