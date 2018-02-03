"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = electrode;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _vm = require("vm");

var _vm2 = _interopRequireDefault(_vm);

var _repl = require("repl");

var _repl2 = _interopRequireDefault(_repl);

var _boxen = require("boxen");

var _boxen2 = _interopRequireDefault(_boxen);

var _hull = require("hull");

var _hull2 = _interopRequireDefault(_hull);

var _jsonColorizer = require("json-colorizer");

var _jsonColorizer2 = _interopRequireDefault(_jsonColorizer);

var _minihull = require("./minihull");

var _minihull2 = _interopRequireDefault(_minihull);

var _initializeContext = require("./initialize-context");

var _initializeContext2 = _interopRequireDefault(_initializeContext);

var _parsePrompt = require("./parse-prompt");

var _parsePrompt2 = _interopRequireDefault(_parsePrompt);

var _parseQueryString = require("./parse-query-string");

var _parseQueryString2 = _interopRequireDefault(_parseQueryString);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var raise = function raise(e) {
  console.log(e);
};

function electrode(Server) {
  var port =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8082;
  var hullPort =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 8001;

  process.env.NODE_REPL_HISTORY = process.cwd() + "/.hull_repl";

  (0, _parseQueryString2.default)({ port: port })
    .then(_parsePrompt2.default)
    .then(function(config) {
      var hull = new _hull2.default({
        id: config.HULL_ID,
        secret: config.HULL_SECRET,
        organization: config.HULL_ORG
      });
      return Promise.all([
        hull.get(config.HULL_ID),
        hull.get("/segments")
      ]).then(function(_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
          connector = _ref2[0],
          segments = _ref2[1];

        return {
          connector: connector,
          segments: segments,
          hull: hull,
          config: config
        };
      });
    })
    .then(function(_ref3) {
      var hull = _ref3.hull,
        connector = _ref3.connector,
        config = _ref3.config,
        segments = _ref3.segments;

      Server({
        hostSecret: "1234",
        skipSignatureValidation: true,
        Hull: _hull2.default,
        port: config.port,
        clientConfig: {
          flushAt: 1,
          protocol: "http",
          firehoseUrl: "http://localhost:" + hullPort + "/api/v1/firehose"
        }
      });
      console.log(
        (0, _jsonColorizer2.default)(JSON.stringify(connector, null, 2))
      );
      console.log(
        (0, _boxen2.default)(
          "\nConnector Started on port " +
            config.port +
            " with instance " +
            connector.id +
            "\nOrganization: " +
            config.HULL_ORG +
            "\n",
          { padding: 1, margin: 1, borderStyle: "double" }
        )
      );

      var manifest = connector.manifest;
      var subscriptions = manifest.subscriptions;

      var endpoint = subscriptions[0].url;

      try {
        var minihull = (0, _minihull2.default)({
          port: config.port,
          segments: segments,
          connector: connector,
          hullPort: hullPort,
          endpoint: endpoint
        });

        var replServer = _repl2.default.start({
          prompt: "hull ❯ ",
          useColors: true,
          eval: function _eval(cmd, context, filename, callback) {
            var result = _vm2.default.runInContext(cmd, context);
            if (result && result.then instanceof Function) {
              return result.then(
                function(res) {
                  return callback(null, res);
                },
                function(err) {
                  return callback(null, err);
                }
              );
            }
            callback(null, result);
            return null;
          }
        });

        (0, _initializeContext2.default)({
          context: replServer.context,
          minihull: minihull,
          hull: hull,
          config: config,
          connector: connector,
          segments: segments
        });

        replServer.on("exit", function() {
          return process.exit();
        });

        replServer.defineCommand("load", {
          help: "Load a file from the filesystem as a variable",
          action: function action(params) {
            var _params$replace$split = params.replace(/\s+/, " ").split(" "),
              _params$replace$split2 = (0, _slicedToArray3.default)(
                _params$replace$split,
                2
              ),
              file = _params$replace$split2[0],
              variable = _params$replace$split2[1];

            if (!file)
              return console.log("You need to have a file as argument");

            if (!_fs2.default.existsSync(file)) {
              console.log(file + " doesn't exist in " + process.cwd());
              return false;
            }

            if (!variable)
              return console.log("You need to give a variable name to use");

            try {
              var payload = JSON.parse(_fs2.default.readFileSync(file));
              replServer.context[variable] = payload;
              console.log(
                (0, _boxen2.default)(
                  'Parsed file "' + file + '" into variable "' + variable + '"',
                  {
                    padding: 1
                  }
                )
              );
              console.log(
                (0, _jsonColorizer2.default)(JSON.stringify(payload, null, 2))
              );
            } catch (e) {
              console.log(e);
              throw e;
            }

            return true;
          }
        });
      } catch (e) {
        console.log(e);
        throw e;
      }
    })
    .catch(raise);
}
