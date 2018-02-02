import fs from 'fs';
import vm from 'vm';
import repl from 'repl';
import boxen from 'boxen';
import colorize from 'json-colorizer';
import mockr from '../mockr';
import initializeContext from './initialize-context';
import parsePrompt from './parse-prompt';
import parseQueryString from './parse-query-string';

export default function electrode(server) {
  const noop = () => {};
  process.env.NODE_REPL_HISTORY = `${process.cwd()}/.hull_repl`;

  parsePrompt()
    .then(parseQueryString)
    .then(config => {
      const hull = new Hull({
        id: config.HULL_ID,
        secret: config.HULL_SECRET,
        organization: config.HULL_ORG
      });
      return Promise.all(
        hull.api(config.HULL_ID),
        hull.api('/segments')
      ).then(([ship, segments]) => ({ ship, segments, hull, config }));
    })
    .then(({ hull, ship, config, segments }) => {
      const beforeEach = fn => fn(noop);
      const afterEach = fn => fn(noop);
      const mocks = mockr({
        server,
        segments,
        beforeEach,
        afterEach,
        port: 8000
      });

      const replServer = repl.start({
        prompt: 'hull > ',
        useColors: true,
        eval(cmd, context, filename, callback) {
          const result = vm.runInContext(cmd, context);
          if (result && result.then instanceof Function) {
            return result.then(
              res => callback(null, res),
              err => callback(null, err)
            );
          }
          callback(null, result);
          return null;
        }
      });

      initializeContext(replServer.context, hull, config);

      replServer.on('exit', () => process.exit());

      replServer.defineCommand('user:update', {
        help: "Send a user:update payload to Connector's endpoint",
        action(file) {
          beforeEach();
          const payload = JSON.parse(fs.readFileSync(file));
          console.log(payload);
          this.lineParser.reset();
          this.bufferedCommand = '';
          mocks.minihull.userUpdate(
            { connector: ship, messages: [payload] },
            ({ batch, logs }) => {
              console.log(boxen('LOGS'));
              console.log(colorize(logs));
              console.log(boxen('RESPONSE'));
              console.log(colorize(batch));
              afterEach();
            }
          );
        }
      });
    });
}
