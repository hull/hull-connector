"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _minihull = require("minihull");

var _minihull2 = _interopRequireDefault(_minihull);

var _hull = require("hull");

var _hull2 = _interopRequireDefault(_hull);

var _nock = require("nock");

var _nock2 = _interopRequireDefault(_nock);

var _jwtSimple = require("jwt-simple");

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const noop = () => {};

module.exports = function bootstrap({
  server,
  beforeEach,
  afterEach,
  port,
  segments
}) {
  const mocks = {};
  mocks.nock = _nock2.default;
  const response = { logs: [], batch: [] };

  const logger = (level, message, data) => {
    response.logs.push({ level, message, data });
  };
  _hull2.default.logger.on("logged", logger);

  beforeEach(done => {
    response.logs = [];
    response.batch = [];

    const minihull = new _minihull2.default();
    mocks.minihull = minihull;
    minihull.listen(8001).then(done);
    minihull.stubSegments(segments);
    minihull.userUpdate = ({ connector, messages }, callback = noop) => {
      const t = setTimeout(() => {
        callback(response);
      }, 1800);

      const send = res => {
        clearTimeout(t);
        callback(res);
      };

      mocks.minihull.on("incoming.request@/api/v1/firehose", req => {
        response.batch.push(...req.body.batch.map(r => (0, _extends3.default)({}, r, {
          claims: _jwtSimple2.default.decode(r.headers["Hull-Access-Token"], "", true)
        })));
      });
      minihull.smartNotifyConnector(connector, `http://localhost:${port}/smart-notifier`, "user:update", messages).then(() => {
        send(response);
        // console.log('response came', res)
      });
    };
    mocks.server = server({
      hostSecret: "1234",
      skipSignatureValidation: true,
      Hull: _hull2.default,
      port,
      clientConfig: {
        flushAt: 1,
        protocol: "http",
        firehoseUrl: "http://localhost:8001/api/v1/firehose"
      }
    });
  });

  afterEach(() => {
    mocks.minihull.close();
    mocks.server.close();
    mocks.nock.cleanAll();
  });

  return mocks;
};