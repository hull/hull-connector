# Hull Connector Generator

We use [Builder](http://formidable.com/open-source/builder/)

## Installing

```
~/test ❯❯❯ npm i -g builder-init;
~/test ❯❯❯ builder-init hull-connector;

hull-connector-1.0.0.tgz
[builder-init] Preparing templates for: hull-connector
? Human-readable Name (e.g., 'Intercom') Email
? Package / GitHub project name hull-email
? GitHub organization name hull-ships
? Package description Synchronize Data with Email
? License organization (e.g., you or your company) hull-ships
? Destination directory to write hull-email

[builder-init] Wrote files:
 - hull-email/.babelrc
 - hull-email/.builderrc
 - hull-email/.editorconfig
 - hull-email/.eslintrc
 - hull-email/.flowconfig
 - hull-email/manifest.json
 - hull-email/package.json
 - hull-email/.gitignore
 - hull-email/.npmignore
 - hull-email/assets/README.md
 - hull-email/assets/admin.html
 - hull-email/server/index.js
 - hull-email/server/server.js
 - hull-email/src/index.js
 - hull-email/src/ship.js
 - hull-email/server/handlers/index.js
 - hull-email/server/handlers/notify.js
 - hull-email/server/handlers/status.js
 - hull-email/src/app/App.jsx
 - hull-email/src/app/index.js
 - hull-email/src/app/middleware.js
 - hull-email/src/app/store.js
 - hull-email/src/css/index.scss
 - hull-email/src/app/reducers/example.js
 - hull-email/src/app/reducers/index.js

[builder-init] New hull-connector project is ready at: hull-email
~/test ❯❯❯ cd hull-email
~/test ❯❯❯ yarn
~/test ❯❯❯ yarn dev
```

## Usage

Available tasks (via `yarn xxx`)

- build:client: `NODE_ENV=production webpack --config ./webpack.config.js --progress --profile --colors -p`
- build:server: `NODE_ENV=production babel server --copy-files -d lib`
- test:client: `NODE_ENV=test jest --env=jsdom --config=jest.config.json`
- test:coverage: `NODE_ENV=test jest --env=jsdom --config=jest.config.json --coverage`
- test:lint: `eslint server`
- test:modules: `npm outdated --depth=0`
- test:specs: `NODE_ENV=test mocha --require babel-register -R spec ./tests/integration/*.js`
- test:units: `NODE_ENV=test mocha --require babel-register -R spec ./tests/unit/*.js`
- build: `builder run clean && builder run build:server && builder run build:client`
- clean: `rimraf dist; rimraf lib`
- dev: `NODE_ENV=development LOG_LEVEL=debug builder run nodemon`
- flow: `flow`
- lint: `eslint src server`
- nodemon: `NODE_ENV=development nodemon server/index.js --exec babel-node --watch server`
- precommit: `lint-staged`
- prettier: `prettier --single-quote --trailing-comma es5 --write "(server|src)/**/*.js"`
- start: `NODE_ENV=production node -r newrelic ./lib`
- test: `builder run test:lint && builder run test:units && builder run test:specs`
- update: `updtr`

## Developing the Archetype

```
yarn builder:gen-dev;
npm link ; cd dev ; npm link
```

## Using the Archetype
