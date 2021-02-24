'use strict';

require('babel-register')({ presets: ['env', 'stage-0'] });
const electrode = require('./electrode');
module.exports = electrode;