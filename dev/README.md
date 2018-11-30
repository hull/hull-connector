# Hull Connector Generator

Think of this connector generator is a kind of [create-react-app](https://github.com/facebook/create-react-app) for Hull connectors. It helps you go from 0 to fully setup environment in about 30 seconds.

It generates a fully working connector setup that you can immediately boot and use to receive Hull data streams and process them. It has sane defaults, with 

- prettier
- eslint
- babel
- webpack
- flow
- mocha / sinon / chai / nock (for server testing)
- jest (for client testing)

Plus a bunch of hull-specific tooling to make it easy to simulate traffic: 

At the same time, it doesn't force you into any specific setup. It's _just an `express` app_ at the core.

If you need to build a Dashboard UI, React hot-reload and Webpack are pre-configured, you just have to start writing your code.

## Installing

We use [builder-Init](https://github.com/FormidableLabs/builder-init) to generate the boilerplate app. Installing and generating a connector takes 2 lines:

```
~/test ❯❯❯ yarn global add builder builder-init
~/test ❯❯❯ builder-init hull-connector;
```

![preview](README.png)

```

hull-connector-1.0.44.tgz
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
 - [....]

[builder-init] New hull-connector project is ready at: hull-test
```

## Usage

```
~/test ❯❯❯ cd hull-test
~/test ❯❯❯ yarn
~/test ❯❯❯ yarn dev   //Start development server
~/test ❯❯❯ yarn build //Build project
~/test ❯❯❯ yarn start //Start production server
```

When your connector is ready (as soon as you have ran `yarn` in it's folder), you can start using it as follows:

| command | description | Notes |
| -- |--- |-- |-- |
| yarn dev  | Start in development mode  |  
| yarn ngrok  | Start a [ngrok](http://ngrok.com/) server | be sure to have your account setup to choose the subdomain  
| yarn build  | Build client and server assets  |  
| yarn start  | Start in production mode  |  
| yarn build:client  | Build Client-files from `src` to `dist` |  Uses Webpack & Babel 
| yarn build:server  | Build Server assets from `server` to  `lib` | Uses Babel
| yarn clean  | Remove build files |  
| yarn prettier  | Prettifies source files |  
| yarn flow  | Checks `Flow` annotations  |  
| yarn lint  | Lint and surface errors  |  
| yarn test:electrode  | Starts Hull's Repl, [**Electrode**](#electrode)  |  
| yarn test  |  Run Server & Client tests |  
| yarn test:client  | Jest client tests  |  
| yarn test:units  |  Unit Tests |  
| yarn test:units:watch  |  Starts a `mocha --watch` server | so you can quickly work on unit tests |  
| yarn test:specs  |  Runs integration tests | Use [`minihull`](#minihull) | 
| yarn test:specs:watch  |  Starts a `mocha --watch` server | so you can quickly work on unit tests |  

---

## Electrode
### Simulating real traffic on connectors.
Electrode is an easy-to-use REPL you can use to send any kind of traffic to connectors, while being in a `real` hull environment, and see what the connector sends to Hull in response.

- It takes a real connector ID & Secret to boot
- It fetches the actual settings for this ID & Secret and uses them on the connector.
- It accepts User or Account notification payloads,
- It displays what the connetor sends back to Hull

Getting an example payload is very easy: just install a Processor connector, search for the User you want and copy the payload on the left column.

```sh
~/hull-test ❯❯❯ yarn test:electrode --port 8083
# yarn run v1.3.2
# $ node ./tests/electrode
? SHIP_ID my-ship-id
? SHIP_SECRET my-ship-secret
? SHIP_ORG my-org.hullapp.io

  [...]
  "schedules": [
    {
      "url": "/status",
      "type": "interval",
      "value": "5",
      "next_run_time": 1517693700,
      "last_run_time": null
    }
  ]
  },
  "resources": {}
}

╔═════════════════════════════════════════════════════════════╗
║                                                             ║
║                                                             ║
║   Connector Started on port 8083 with instance my-ship-id   ║
║   Organization: my-org.hullapp.io                           ║
║                                                             ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝

{"port":8083,"level":"info","message":"connector.server.listen"}

hull ❯ _
hull ❯ .load file.json user # loads `file.json` as `user`
hull ❯ send(user) # sends user as a User Notification

# What's available out of the box : 
# colorize -> colorize console dumps with console.log(colorize(object));
# segments -> segments on currently booted Hull organization
# minihull -> hull server
# hull -> hull client
# connector -> connector object
# organization -> org name
# moment -> moment.js
# lo -> lodash (renamed to avoid conflicts)
# urijs
# 
# Of course you can require your own modules:
hull ❯ const boxen = require('boxen');
```

---

# Writing tests

## mockr
### Integration-testing for logs and connector responses 
Mockr is a testing addition to make it easy to simulate calls and settings and write assertions on the connector's responses to Hull

### Testing environment

Boilerplate comes with `mocha/chai/sinon/nock` already setup for server tests.

You can then simply require `hull-connector-dev/lib/mockr` package and start writing assertions.

It sets up some mocks and `minihull`, which is a stripped down version of hull that's able to send messages to connectors and offer expectations on what the connector should send to the Firehose.

##### Here's how:

```js
import { expect } from "chai";
import mockr from "hull-connector-dev/lib/mockr";

// Your server's entry point, with the same format as the one `hull-connector` bundles.
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

  it("should behave properly", async () => {
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

    // Send a `user:update` call to the connector.
    const { batch, logs } = await mocks.minihull.userUpdate(
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
      }
    );
    // const { batch, logs } = await mocks.minihull.accountUpdate is supported too
    // This is what the Firehose receives.
    const [first, second, third, fourth] = batch;
    expect(batch.length).to.equal(4);
    expect(logs[1].message).to.equal("outgoing.user.start");
    myNock.done();
  });
});
```

If you use Atom, i strongly recommend you install [`mocha-test-runner`](https://atom.io/packages/mocha-test-runner)
which will let you run test by hitting `ctrl-alt-m`

---

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
