import minimist from "minimist";
import url from "url";

export default function parseQueryString(config) {
  const argv = minimist(process.argv.slice(2));
  if (!argv.url) return Promise.resolve({});

  const { ship: HULL_ID, secret: HULL_SECRET, organization: HULL_ORG } =
    url.parse(argv.url, true).query || {};
  const port = argv.port || config.port;
  if (HULL_ID && HULL_SECRET && HULL_ORG) {
    return Promise.resolve({
      ...config,
      port,
      HULL_ID,
      HULL_SECRET,
      HULL_ORG
    });
  }
  return Promise.resolve({ ...config, port });
}
