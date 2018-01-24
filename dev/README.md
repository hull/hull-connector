# Hull Connector Generator

We use [Builder](http://formidable.com/open-source/builder/)

## Installing

```
~/test ❯❯❯ yarn global add builder builder-init
~/test ❯❯❯ builder-init hull-connector;
```

![preview](README.png)

```
hull-connector-1.0.1.tgz
[builder-init] Preparing templates for: hull-connector
? Human-readable Name (e.g., 'Intercom') Test
? Package / GitHub project name hull-test
? GitHub organization name hull-ships
? Package description Synchronize Data with Test
? License organization (e.g., you or your company) hull-ships
? Destination directory to write hull-test

[builder-init] Wrote files:
 - hull-test/.babelrc
 - hull-test/.builderrc
 - hull-test/.editorconfig
 - hull-test/.eslintignore
 - hull-test/.flowconfig
 - hull-test/jest.config.json
 - hull-test/manifest.json
 - hull-test/newrelic.js
 - hull-test/package.json
 - hull-test/.gitignore
 - hull-test/.npmignore
 - hull-test/assets/README.md
 - hull-test/assets/admin.html
 - hull-test/server/index.js
 - hull-test/server/server.js
 - hull-test/src/index.js
 - hull-test/src/ship.js
 - hull-test/server/handlers/index.js
 - hull-test/server/handlers/notify.js
 - hull-test/server/handlers/status.js
 - hull-test/src/app/App.jsx
 - hull-test/src/app/index.jsx
 - hull-test/src/app/middleware.js
 - hull-test/src/app/store.js
 - hull-test/src/css/index.scss
 - hull-test/src/app/reducers/example.js
 - hull-test/src/app/reducers/index.js

[builder-init] New hull-connector project is ready at: hull-test
```

## Usage

```
~/test ❯❯❯ cd hull-test
~/test ❯❯❯ nvm use 8
~/test ❯❯❯ yarn
~/test ❯❯❯ yarn dev   //Start development server
~/test ❯❯❯ yarn build //Build project
~/test ❯❯❯ yarn start //Start production server
```

## Writing tests

We use `mocha + chai + sinon + nock` for server tests.

We offer an easy way to write integration tests by using the `hull-connector-dev/mockr` package. 

It sets up some mocks and `minihull`, which is a stripped down version of hull
that's able to send messages to connectors and offer expectations on what the connector should send to the Firehose.

##### Here's how:

```js
import { expect } from "chai";
import mockr from "hull-connector-dev/mockr";

// Your server's entry point, with the same format as the one Builder bundles.
// Options will be passed to it.
import server from "../../server/server";

describe("Test Group", () => {
  // Start the mocks. they will run `beforeEach` and `afterEach` cleanups for you,
  // Start a development server
  const mocks = mockr({
    server
    beforeEach,
    afterEach,
    port: 8000,
    segments: [{ id: "1", name: "A" }], // Segments that should exist on the server
  });

  it("should behave properly", done => {
    const myNock = mocks
      .nock("https://api.myremote.test.com")
      .get("/test")
      .query({ foo: "bar" })
      .reply(200, [{ email: "foo@foo.bar", id: "foobar" }]);

    // Optional, if you want to stub more things that your connector
    // will access during it's flow.
    mocks.minihull.stubApp("/api/v1/search/user_reports").respond({
      pagination: { total: 0 },
      aggregations: {
        without_email: { doc_count: 0 },
        by_source: { buckets: [] },
      },
    });

    // Sennd a `user:update` call to the connector.
    mocks.minihull.userUpdate(
      {
        // Connector Settings
        connector: {
          id: "123456789012345678901234",
          private_settings: {
            api_key: "123",
            handle_accounts: true,
            prospect_enabled: true,
            prospect_segments: ["1"],
            prospect_filter_titles: ["foo"],
            prospect_limit_count: 2,
          },
        },
        // Message payload
        messages: [
          {
            user: { id: "abc", "traits/clearbit/source": "reveal" },
            account: { id: "ACCOUNTID", domain: "domain.com" },
            segments: [{ id: "1" }],
          },
        ],
      },
      // This is what the Firehose receives.
      batch => {
        const [first, second, third, fourth] = batch;
        expect(batch.length).to.equal(4);
        myNock.done();
        done();
      }
    );
  });
});
```

If you use Atom, i strongly recommend you install [`mocha-test-runner`](https://atom.io/packages/mocha-test-runner)
which will let you run test by hitting `ctrl-alt-m`

## Developing the Archetype

```
yarn gen-dev;
npm link ; cd dev ; npm link
```

## Publishing the archetype

```
# Bump version in package.json
npm run publish:both
```

## Setup

* Will monitor, bundle and build all `.js` files in the `src` folder for Client-side code
* Will build the `server` folder as `lib` for Server-side code
