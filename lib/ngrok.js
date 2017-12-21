const ngrok = require('ngrok');
const boxen = require('boxen');
const chalk = require('chalk');
const exitHook = require('exit-hook');
const pkg = require('../package.json');

const { SECRET = '1234', NODE_ENV, PORT = 8082 } = process.env;

if (NODE_ENV === 'development') {
  exitHook(() => {
    console.log('Disconnecting Ngrok');
    ngrok.disconnect();
    ngrok.kill();
  });

  ngrok.connect(
    {
      addr: PORT,
      subdomain: pkg.name
    },
    (err, url) => {
      if (err) {
        console.log(err);
        if (err.code === 'ECONNREFUSED') {
          console.log(
            chalk.red(`Connection refused at ${err.address}:${err.port}`)
          );
          process.exit(1);
        }
        console.log(chalk.yellow(`ngrok reported an error: ${err.msg}`));
        console.log(
          boxen(err.details.err.trim(), {
            padding: {
              top: 0,
              right: 2,
              bottom: 0,
              left: 2
            }
          })
        );
      }
      console.log(
        boxen(chalk.yellow(`Public URL for setting up connector: ${url}`), {
          padding: {
            dimBorder: true,
            borderStyle: 'double',
            top: 0,
            right: 2,
            bottom: 0,
            left: 2
          }
        })
      );
    }
  );
}
