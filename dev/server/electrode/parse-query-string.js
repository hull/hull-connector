import minimist from 'minimist';

export default function parseQueryString() {
  const argv = minimist(process.argv.slice(2));
  if (!argv.url) return Promise.resolve({});

  const passedUrl = url.parse(argv.url, true);
  const {
    query: { ship: HULL_ID, secret: HULL_SECRET, organization: HULL_ORG } = {}
  } = passedUrl.query;
  if (HULL_ID && HULL_SECRET && HULL_ORG) {
    return Promise.resolve({
      HULL_ID,
      HULL_SECRET,
      HULL_ORG
    });
  }
  return Promise.resolve({});
}
