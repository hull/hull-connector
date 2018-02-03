import fs from "fs";
import vm from "vm";
import repl from "repl";
import boxen from "boxen";
import Hull from "hull";
import colorize from "json-colorizer";
import Minihull from "./minihull";
import initializeContext from "./initialize-context";
import parsePrompt from "./parse-prompt";
import parseQueryString from "./parse-query-string";

const raise = e => {
  console.log(e);
};

export default function electrode(Server, port = 8082, hullPort = 8001) {
  process.env.NODE_REPL_HISTORY = `${process.cwd()}/.hull_repl`;

  parseQueryString({ port })
    .then(parsePrompt)
    .then(config => {
      const hull = new Hull({
        id: config.HULL_ID,
        secret: config.HULL_SECRET,
        organization: config.HULL_ORG
      });
      return Promise.all([
        hull.get(config.HULL_ID),
        hull.get("/segments")
      ]).then(([connector, segments]) => ({
        connector,
        segments,
        hull,
        config
      }));
    })
    .then(({ hull, connector, config, segments }) => {
      Server({
        hostSecret: "1234",
        skipSignatureValidation: true,
        Hull,
        port: config.port,
        clientConfig: {
          flushAt: 1,
          protocol: "http",
          firehoseUrl: `http://localhost:${hullPort}/api/v1/firehose`
        }
      });
      console.log(colorize(JSON.stringify(connector, null, 2)));
      console.log(
        boxen(
          `
Connector Started on port ${config.port} with instance ${connector.id}
Organization: ${config.HULL_ORG}
`,
          { padding: 1, margin: 1, borderStyle: "double" }
        )
      );

      const { manifest } = connector;
      const { subscriptions } = manifest;
      const endpoint = subscriptions[0].url;

      try {
        const minihull = Minihull({
          port: config.port,
          segments,
          connector,
          hullPort,
          endpoint
        });

        const replServer = repl.start({
          prompt: "hull ❯ ",
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

        initializeContext({
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
            if (!file)
              return console.log("You need to have a file as argument");

            if (!fs.existsSync(file)) {
              console.log(`${file} doesn't exist in ${process.cwd()}`);
              return false;
            }

            if (!variable)
              return console.log("You need to give a variable name to use");

            try {
              const payload = JSON.parse(fs.readFileSync(file));
              replServer.context[variable] = payload;
              console.log(
                boxen(`Parsed file "${file}" into variable "${variable}"`, {
                  padding: 1
                })
              );
              console.log(colorize(JSON.stringify(payload, null, 2)));
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
