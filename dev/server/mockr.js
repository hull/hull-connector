import Minihull from "minihull";
import Hull from "hull";
import nock from "nock";
import jwt from "jwt-simple";

const noop = () => {};

module.exports = function bootstrap({
  server,
  beforeEach,
  afterEach,
  port,
  segments
}) {
  const mocks = {};
  mocks.nock = nock;
  const response = { logs: [], batch: [] };

  const logger = (level, message, data) => {
    response.logs.push({ level, message, data });
  };

  Hull.logger.on("logged", logger);

  beforeEach(done => {
    response.logs = [];
    response.batch = [];

    const minihull = new Minihull();
    mocks.minihull = minihull;
    minihull.listen(8001);
    minihull.stubSegments(segments);
    const perform = async ({ connector, messages, channel }) => {
      mocks.minihull.on("incoming.request@/api/v1/firehose", req => {
        response.batch.push(
          ...req.body.batch.map(r => ({
            ...r,
            claims: jwt.decode(r.headers["Hull-Access-Token"], "", true)
          }))
        );
      });
      const res = await minihull.smartNotifyConnector(
        connector,
        `http://localhost:${port}${manifest.subscriptions[0].url}`,
        channel,
        messages
      );
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(res);
        }, 500);
      });
    };

    minihull.accountUpdate = async payload =>
      perform({ ...payload, channel: "account:update" });
    minihull.userUpdate = async payload =>
      perform({ ...payload, channel: "user:update" });

    mocks.server = server(
      {
        hostSecret: "1234",
        skipSignatureValidation: true,
        Hull,
        port,
        clientConfig: {
          flushAt: 1,
          protocol: "http",
          firehoseUrl: "http://localhost:8001/api/v1/firehose"
        }
      },
      done
    );
  });

  afterEach(() => {
    mocks.minihull.close();
    mocks.server.close();
    mocks.nock.cleanAll();
  });

  return mocks;
};
