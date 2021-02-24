"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const raise = e => {
  console.log(e);
};

function electrode(Server, port = 8082, hullPort = 8001) {
  process.env.NODE_REPL_HISTORY = `${process.cwd()}/.hull_repl`;

  (0, _parseQueryString2.default)({ port }).then(_parsePrompt2.default).then(config => {
    const hull = new _hull2.default({
      id: config.HULL_ID,
      secret: config.HULL_SECRET,
      organization: config.HULL_ORG
    });
    return Promise.all([hull.get(config.HULL_ID), hull.get("/segments")]).then(([connector, segments]) => ({
      connector,
      segments,
      hull,
      config
    }));
  }).then(({ hull, connector, config, segments }) => {
    Server({
      hostSecret: "1234",
      skipSignatureValidation: true,
      Hull: _hull2.default,
      port: config.port,
      clientConfig: {
        flushAt: 1,
        protocol: "http",
        firehoseUrl: `http://localhost:${hullPort}/api/v1/firehose`
      }
    });
    console.log((0, _jsonColorizer2.default)(JSON.stringify(connector, null, 2)));
    console.log((0, _boxen2.default)(`
Connector Started on port ${config.port} with instance ${connector.id}
Organization: ${config.HULL_ORG}
`, { padding: 1, margin: 1, borderStyle: "double" }));

    const { manifest } = connector;
    const { subscriptions } = manifest;
    const endpoint = subscriptions[0].url;

    try {
      const minihull = (0, _minihull2.default)({
        port: config.port,
        segments,
        connector,
        hullPort,
        endpoint
      });

      const replServer = _repl2.default.start({
        prompt: "hull ❯ ",
        useColors: true,
        eval(cmd, context, filename, callback) {
          const result = _vm2.default.runInContext(cmd, context);
          if (result && result.then instanceof Function) {
            return result.then(res => callback(null, res), err => callback(null, err));
          }
          callback(null, result);
          return null;
        }
      });

      (0, _initializeContext2.default)({
        context: replServer.context,
        minihull,
        hull,
        config,
        connector,
        segments
      });

      replServer.on("exit", () => process.exit());

      replServer.defineCommand("load", {
        help: "Load a file from the filesystem as a variable",
        action(params) {
          const [file, variable] = params.replace(/\s+/, " ").split(" ");
          if (!file) return console.log("You need to have a file as argument");

          if (!_fs2.default.existsSync(file)) {
            console.log(`${file} doesn't exist in ${process.cwd()}`);
            return false;
          }

          if (!variable) return console.log("You need to give a variable name to use");

          try {
            const payload = JSON.parse(_fs2.default.readFileSync(file));
            replServer.context[variable] = payload;
            console.log((0, _boxen2.default)(`Parsed file "${file}" into variable "${variable}"`, {
              padding: 1
            }));
            console.log((0, _jsonColorizer2.default)(JSON.stringify(payload, null, 2)));
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
  }).catch(raise);
}